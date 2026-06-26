from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    parent = models.ForeignKey(
        "self", on_delete=models.CASCADE, null=True, blank=True, related_name="children"
    )
    onec_id = models.CharField("1C Ид", max_length=64, blank=True, db_index=True)
    name_az = models.CharField(max_length=150)
    name_ru = models.CharField(max_length=150, blank=True)
    slug = models.SlugField(max_length=170, unique=True)
    image = models.ImageField(upload_to="categories/", blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name_plural = "Categories"
        ordering = ["order", "name_az"]

    def __str__(self):
        return self.name_az

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name_az)
        super().save(*args, **kwargs)


class Brand(models.Model):
    name = models.CharField(max_length=120)
    slug = models.SlugField(max_length=140, unique=True)
    logo = models.ImageField(upload_to="brands/", blank=True, null=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name="products")
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, related_name="products")
    onec_id = models.CharField("1C Ид", max_length=64, blank=True, db_index=True)
    name_az = models.CharField(max_length=255)
    name_ru = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(max_length=280, unique=True)
    description = models.TextField(blank=True)
    sku = models.CharField(max_length=64, unique=True)
    is_active = models.BooleanField(default=True)
    meta_title = models.CharField(max_length=255, blank=True)
    meta_description = models.CharField(max_length=320, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name_az

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name_az)
        super().save(*args, **kwargs)


class Attribute(models.Model):
    """Defines a characteristic type, e.g. 'həcm' (volume) or 'rəng' (color)."""

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=50, default="text")

    def __str__(self):
        return self.name


class ProductAttributeValue(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="attribute_values")
    attribute = models.ForeignKey(Attribute, on_delete=models.CASCADE)
    value = models.CharField(max_length=255)

    class Meta:
        unique_together = ("product", "attribute")

    def __str__(self):
        return f"{self.attribute}: {self.value}"


class ProductVariant(models.Model):
    """A sellable unit of a product — e.g. the 1L vs 5L version of the same shampoo."""

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="variants")
    onec_id = models.CharField("1C Ид", max_length=130, blank=True, db_index=True)
    name = models.CharField(max_length=100)  # e.g. "5L"
    sku = models.CharField(max_length=64, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    old_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    attributes = models.JSONField(default=dict, blank=True)
    barcode = models.CharField(max_length=64, blank=True)
    weight = models.DecimalField(max_digits=8, decimal_places=3, null=True, blank=True)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.product.name_az} — {self.name}"


class ProductImage(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="products/")
    alt = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order"]
