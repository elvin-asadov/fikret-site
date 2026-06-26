"""
CommerceML 2.x parser — maps 1C "Обмен с сайтом" XML onto our catalog/inventory models.

1C exports two relevant documents:
  * import.xml  — Классификатор (groups/categories) + Каталог (products)
  * offers.xml  — ПакетПредложений (prices + stock per offer)

Products and categories are matched to ours by the 1C GUID stored in `onec_id`.
An offer Ид is either ``<productGuid>`` or ``<productGuid>#<characteristicGuid>``;
each maps to one ProductVariant.
"""

from decimal import Decimal, InvalidOperation

from django.db import transaction
from django.utils.text import slugify

try:  # safer XML parsing when available, stdlib fallback otherwise
    from defusedxml.ElementTree import fromstring
except ImportError:  # pragma: no cover
    from xml.etree.ElementTree import fromstring

from apps.catalog.models import Category, Product, ProductVariant
from apps.inventory.models import Stock


# --------------------------------------------------------------------------
# XML helpers (CommerceML 2.x is namespace-free in practice, but stay safe)
# --------------------------------------------------------------------------
def _local(tag):
    return tag.rsplit("}", 1)[-1]


def _find(elem, name):
    for child in elem:
        if _local(child.tag) == name:
            return child
    return None


def _findall(elem, name):
    return [child for child in elem if _local(child.tag) == name]


def _text(elem, name, default=""):
    child = _find(elem, name)
    if child is not None and child.text:
        return child.text.strip()
    return default


def _to_decimal(value):
    try:
        return Decimal(str(value).replace(",", ".").strip())
    except (InvalidOperation, AttributeError, ValueError):
        return None


def _unique_slug(model, base, instance_pk=None):
    base = slugify(base) or "item"
    slug = base
    i = 2
    qs = model.objects.all()
    if instance_pk:
        qs = qs.exclude(pk=instance_pk)
    while qs.filter(slug=slug).exists():
        slug = f"{base}-{i}"
        i += 1
    return slug


def _root(xml_bytes):
    """Return the <КоммерческаяИнформация> root element from raw file bytes."""
    if isinstance(xml_bytes, str):
        xml_bytes = xml_bytes.encode("utf-8")
    return fromstring(xml_bytes)


# --------------------------------------------------------------------------
# import.xml — categories + products
# --------------------------------------------------------------------------
@transaction.atomic
def parse_catalog(xml_bytes):
    root = _root(xml_bytes)
    stats = {"created": 0, "updated": 0}

    classifier = _find(root, "Классификатор")
    if classifier is not None:
        groups = _find(classifier, "Группы")
        if groups is not None:
            for group in _findall(groups, "Группа"):
                _import_group(group, parent=None, stats=stats)

    for catalog in _findall(root, "Каталог"):
        products = _find(catalog, "Товары")
        if products is not None:
            for product in _findall(products, "Товар"):
                _import_product(product, stats=stats)

    return stats


def _import_group(group, parent, stats):
    guid = _text(group, "Ид")
    name = _text(group, "Наименование") or guid
    if not guid:
        return

    category, created = Category.objects.get_or_create(
        onec_id=guid,
        defaults={"name_az": name, "parent": parent, "slug": _unique_slug(Category, name)},
    )
    if created:
        stats["created"] += 1
    else:
        category.name_az = name
        category.parent = parent
        category.save(update_fields=["name_az", "parent"])
        stats["updated"] += 1

    nested = _find(group, "Группы")
    if nested is not None:
        for child in _findall(nested, "Группа"):
            _import_group(child, parent=category, stats=stats)


def _import_product(product, stats):
    guid = _text(product, "Ид")
    if not guid:
        return
    name = _text(product, "Наименование") or guid
    sku = _text(product, "Артикул") or guid
    description = _text(product, "Описание")

    category = None
    groups = _find(product, "Группы")
    if groups is not None:
        group_id = _text(groups, "Ид")
        if group_id:
            category = Category.objects.filter(onec_id=group_id).first()
    if category is None:
        category = _ensure_uncategorized()

    obj, created = Product.objects.get_or_create(
        onec_id=guid,
        defaults={
            "name_az": name,
            "sku": sku,
            "description": description,
            "category": category,
            "slug": _unique_slug(Product, name),
        },
    )
    if created:
        stats["created"] += 1
    else:
        obj.name_az = name
        obj.description = description
        obj.category = category
        obj.save(update_fields=["name_az", "description", "category"])
        stats["updated"] += 1

    # Guarantee a default variant keyed by the product GUID so plain offers
    # (those without a characteristic GUID) have something to attach to.
    ProductVariant.objects.get_or_create(
        onec_id=guid,
        defaults={
            "product": obj,
            "name": "Standart",
            "sku": sku,
            "price": Decimal("0"),
            "is_default": True,
        },
    )


def _ensure_uncategorized():
    category, _ = Category.objects.get_or_create(
        onec_id="__uncategorized__",
        defaults={"name_az": "Kateqoriyasız", "slug": _unique_slug(Category, "kateqoriyasiz")},
    )
    return category


# --------------------------------------------------------------------------
# offers.xml — prices + stock
# --------------------------------------------------------------------------
@transaction.atomic
def parse_offers(xml_bytes, price_type=None):
    root = _root(xml_bytes)
    stats = {"created": 0, "updated": 0, "skipped": 0}

    for package in _findall(root, "ПакетПредложений"):
        offers = _find(package, "Предложения")
        if offers is None:
            continue
        for offer in _findall(offers, "Предложение"):
            _import_offer(offer, price_type=price_type, stats=stats)

    return stats


def _import_offer(offer, price_type, stats):
    offer_id = _text(offer, "Ид")
    if not offer_id:
        stats["skipped"] += 1
        return

    product_guid = offer_id.split("#", 1)[0]
    variant = _resolve_variant(offer_id, product_guid, offer)
    if variant is None:
        stats["skipped"] += 1
        return

    price = _extract_price(offer, price_type)
    quantity = _extract_quantity(offer)

    fields = []
    if price is not None:
        variant.price = price
        fields.append("price")
    if fields:
        variant.save(update_fields=fields)

    if quantity is not None:
        Stock.objects.update_or_create(variant=variant, defaults={"quantity": quantity})

    stats["updated"] += 1


def _resolve_variant(offer_id, product_guid, offer):
    # Exact match on the full offer id (covers characteristics).
    variant = ProductVariant.objects.filter(onec_id=offer_id).first()
    if variant:
        return variant

    product = Product.objects.filter(onec_id=product_guid).first()
    if product is None:
        return None

    # Characteristic offer arrived but its variant was never created in catalog
    # import — create it on the fly.
    name = _text(offer, "Наименование") or product.name_az
    sku = _text(offer, "Артикул") or offer_id
    variant, _ = ProductVariant.objects.get_or_create(
        onec_id=offer_id,
        defaults={
            "product": product,
            "name": name[:100],
            "sku": sku[:64],
            "price": Decimal("0"),
            "is_default": not product.variants.exists(),
        },
    )
    return variant


def _extract_price(offer, price_type):
    prices = _find(offer, "Цены")
    if prices is None:
        return None
    price_nodes = _findall(prices, "Цена")
    chosen = None
    for node in price_nodes:
        if price_type and _text(node, "ИдТипаЦены") == price_type:
            chosen = node
            break
    if chosen is None and price_nodes:
        chosen = price_nodes[0]
    if chosen is None:
        return None
    return _to_decimal(_text(chosen, "ЦенаЗаЕдиницу"))


def _extract_quantity(offer):
    # CommerceML 2.04 uses <Количество>; newer exports use <Остатки>/<Остаток>.
    direct = _text(offer, "Количество")
    if direct:
        qty = _to_decimal(direct)
        return int(qty) if qty is not None else None

    stocks = _find(offer, "Остатки")
    if stocks is not None:
        total = 0
        found = False
        for stock in _findall(stocks, "Остаток"):
            qty = _to_decimal(_text(stock, "Количество"))
            if qty is not None:
                total += int(qty)
                found = True
        if found:
            return total
    return None
