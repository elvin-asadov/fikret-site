"""
1C "Обмен с сайтом" (CommerceML) HTTP endpoint.

This single endpoint implements the standard handshake 1C drives:

    ?type=catalog&mode=checkauth   -> Basic-Auth handshake, returns a session cookie
    ?type=catalog&mode=init        -> announces zip support + max upload size
    ?type=catalog&mode=file        -> 1C POSTs an XML/image file (possibly chunked)
    ?type=catalog&mode=import      -> parse a previously uploaded file into the DB
    ?type=sale&mode=query          -> export orders to 1C as CommerceML
    ?type=sale&mode=success        -> 1C acknowledges receipt of the orders

Responses are plain text — the first line is always ``success`` / ``failure`` /
``progress`` as 1C expects, never JSON.
"""

import base64
import shutil
from pathlib import Path
from xml.etree.ElementTree import Element, SubElement, tostring

from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from apps.orders.models import Order

from .models import OneCExchangeLog
from .onec import parser

FILE_LIMIT = 50 * 1024 * 1024  # 50 MB per upload chunk


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------
def _text_response(body, status=200):
    return HttpResponse(body, status=status, content_type="text/plain; charset=utf-8")


def _credentials():
    return (
        getattr(settings, "ONEC_EXCHANGE_LOGIN", ""),
        getattr(settings, "ONEC_EXCHANGE_PASSWORD", ""),
    )


def _basic_auth_ok(request):
    header = request.META.get("HTTP_AUTHORIZATION", "")
    if not header.startswith("Basic "):
        return False
    try:
        decoded = base64.b64decode(header[6:]).decode("utf-8")
        login, _, password = decoded.partition(":")
    except (ValueError, UnicodeDecodeError):
        return False
    exp_login, exp_password = _credentials()
    return bool(exp_login) and login == exp_login and password == exp_password


def _authorized(request):
    return request.session.get("onec_authed") or _basic_auth_ok(request)


def _exchange_dir(request):
    base = Path(getattr(settings, "ONEC_EXCHANGE_DIR", settings.BASE_DIR / "onec_exchange"))
    key = request.session.session_key or "anon"
    return base / key


def _safe_path(directory, filename):
    """Resolve *filename* inside *directory*, refusing path-traversal."""
    target = (directory / filename).resolve()
    directory = directory.resolve()
    if directory not in target.parents and target != directory:
        return None
    return target


# --------------------------------------------------------------------------
# entry point
# --------------------------------------------------------------------------
@csrf_exempt
def onec_exchange(request):
    exchange_type = request.GET.get("type", "")
    mode = request.GET.get("mode", "")

    if mode == "checkauth":
        return _checkauth(request)

    if not _authorized(request):
        return _text_response("failure\nNot authorized", status=401)

    if mode == "init":
        return _init(request)
    if mode == "file":
        return _file(request)
    if mode == "import":
        return _import(request)
    if exchange_type == "sale" and mode == "query":
        return _sale_query(request)
    if exchange_type == "sale" and mode == "success":
        return _text_response("success")

    return _text_response("failure\nUnknown mode", status=400)


# --------------------------------------------------------------------------
# handshake stages
# --------------------------------------------------------------------------
def _checkauth(request):
    if not _basic_auth_ok(request):
        return _text_response("failure\nInvalid credentials", status=401)

    request.session["onec_authed"] = True
    request.session.save()
    cookie_name = settings.SESSION_COOKIE_NAME
    cookie_value = request.session.session_key
    return _text_response(f"success\n{cookie_name}\n{cookie_value}")


def _init(request):
    # Fresh exchange: drop any half-uploaded files from a previous run.
    directory = _exchange_dir(request)
    if directory.exists():
        shutil.rmtree(directory, ignore_errors=True)
    directory.mkdir(parents=True, exist_ok=True)
    return _text_response(f"zip=no\nfile_limit={FILE_LIMIT}")


def _file(request):
    filename = request.GET.get("filename", "")
    if not filename:
        return _text_response("failure\nMissing filename", status=400)

    directory = _exchange_dir(request)
    directory.mkdir(parents=True, exist_ok=True)
    target = _safe_path(directory, filename)
    if target is None:
        return _text_response("failure\nInvalid filename", status=400)

    target.parent.mkdir(parents=True, exist_ok=True)
    # 1C may stream a large file across several POSTs — append each chunk.
    with open(target, "ab") as fh:
        fh.write(request.body)
    return _text_response("success")


def _import(request):
    filename = request.GET.get("filename", "")
    directory = _exchange_dir(request)
    target = _safe_path(directory, filename) if filename else None
    if target is None or not target.exists():
        return _text_response("failure\nFile not found", status=400)

    name = filename.lower()
    if not name.endswith(".xml"):
        # Image and other binary assets are uploaded the same way but need no parsing.
        return _text_response("success")

    xml_bytes = target.read_bytes()
    try:
        if "offers" in name or "prices" in name or "rests" in name:
            kind = OneCExchangeLog.Kind.OFFERS
            stats = parser.parse_offers(
                xml_bytes, price_type=getattr(settings, "ONEC_PRICE_TYPE", None)
            )
        else:
            kind = OneCExchangeLog.Kind.CATALOG
            stats = parser.parse_catalog(xml_bytes)
    except Exception as exc:  # noqa: BLE001 — report parse failures back to 1C
        OneCExchangeLog.objects.create(
            kind=OneCExchangeLog.Kind.OTHER, filename=filename, success=False, message=str(exc)
        )
        return _text_response(f"failure\n{exc}", status=500)

    OneCExchangeLog.objects.create(
        kind=kind,
        filename=filename,
        success=True,
        created=stats.get("created", 0),
        updated=stats.get("updated", 0),
        message=str(stats),
    )
    return _text_response("success")


# --------------------------------------------------------------------------
# order export (site -> 1C)
# --------------------------------------------------------------------------
def _sale_query(request):
    root = Element("КоммерческаяИнформация", {
        "ВерсияСхемы": "2.05",
        "ДатаФормирования": timezone.now().strftime("%Y-%m-%dT%H:%M:%S"),
    })

    orders = (
        Order.objects.filter(payment_status=Order.PaymentStatus.PAID)
        .order_by("-created_at")[:100]
        .prefetch_related("items", "items__variant")
    )
    for order in orders:
        _order_to_xml(root, order)

    xml = b'<?xml version="1.0" encoding="UTF-8"?>\n' + tostring(root, encoding="utf-8")
    return HttpResponse(xml, content_type="application/xml; charset=utf-8")


def _order_to_xml(root, order):
    doc = SubElement(root, "Документ")
    SubElement(doc, "Ид").text = order.number
    SubElement(doc, "Номер").text = order.number
    SubElement(doc, "Дата").text = order.created_at.strftime("%Y-%m-%d")
    SubElement(doc, "Время").text = order.created_at.strftime("%H:%M:%S")
    SubElement(doc, "ХозОперация").text = "Заказ товара"
    SubElement(doc, "Роль").text = "Продавец"
    SubElement(doc, "Валюта").text = "AZN"
    SubElement(doc, "Сумма").text = str(order.total)

    goods = SubElement(doc, "Товары")
    for item in order.items.all():
        good = SubElement(goods, "Товар")
        if item.variant and item.variant.onec_id:
            SubElement(good, "Ид").text = item.variant.onec_id
        SubElement(good, "Наименование").text = item.product_name
        SubElement(good, "ЦенаЗаЕдиницу").text = str(item.price)
        SubElement(good, "Количество").text = str(item.quantity)
        SubElement(good, "Сумма").text = str(item.price * item.quantity)
