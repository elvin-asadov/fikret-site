from django.db import models

from apps.catalog.models import ProductVariant


class Stock(models.Model):
    variant = models.OneToOneField(ProductVariant, on_delete=models.CASCADE, related_name="stock")
    quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)

    def __str__(self):
        return f"{self.variant} — {self.quantity}"


class StockMovement(models.Model):
    class Reason(models.TextChoices):
        PURCHASE = "purchase", "Anbara giriş"
        SALE = "sale", "Satış"
        RETURN = "return", "Geri qaytarma"
        ADJUSTMENT = "adjustment", "Düzəliş"

    variant = models.ForeignKey(ProductVariant, on_delete=models.CASCADE, related_name="movements")
    quantity_delta = models.IntegerField()
    reason = models.CharField(max_length=20, choices=Reason.choices)
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
