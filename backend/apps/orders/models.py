from django.conf import settings
from django.db import models

from apps.catalog.models import ProductVariant
from apps.promotions.models import Coupon
from apps.shipping.models import ShippingZone


class Order(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Gözləyir"
        PAID = "paid", "Ödənilib"
        PROCESSING = "processing", "Hazırlanır"
        SHIPPED = "shipped", "Göndərilib"
        DELIVERED = "delivered", "Çatdırılıb"
        COMPLETED = "completed", "Tamamlanıb"
        CANCELLED = "cancelled", "Ləğv edilib"
        REFUNDED = "refunded", "Geri qaytarılıb"

    class PaymentStatus(models.TextChoices):
        UNPAID = "unpaid", "Ödənilməyib"
        PAID = "paid", "Ödənilib"
        FAILED = "failed", "Uğursuz"
        REFUNDED = "refunded", "Geri qaytarılıb"

    number = models.CharField(max_length=32, unique=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders"
    )
    shipping_zone = models.ForeignKey(ShippingZone, on_delete=models.SET_NULL, null=True)
    coupon = models.ForeignKey(Coupon, on_delete=models.SET_NULL, null=True, blank=True)

    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    payment_status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.UNPAID)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    shipping_address = models.JSONField(default=dict)
    phone = models.CharField(max_length=20)
    payment_method = models.CharField(max_length=30, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.number


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True)
    product_name = models.CharField(max_length=255)  # snapshot at purchase time
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="status_history")
    status = models.CharField(max_length=20, choices=Order.Status.choices)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
