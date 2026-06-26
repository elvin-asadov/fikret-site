from django.db import models


class Coupon(models.Model):
    class Type(models.TextChoices):
        PERCENT = "percent", "Faiz"
        FIXED = "fixed", "Məbləğ"

    code = models.CharField(max_length=40, unique=True)
    type = models.CharField(max_length=10, choices=Type.choices)
    value = models.DecimalField(max_digits=10, decimal_places=2)
    min_order = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    valid_until = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.code
