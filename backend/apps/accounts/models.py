from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """Custom user — phone is the primary login identifier in the AZ market."""

    phone = models.CharField(max_length=20, unique=True)
    is_b2b = models.BooleanField(default=False)

    def __str__(self):
        return self.phone or self.username


class B2BProfile(models.Model):
    class DiscountTier(models.TextChoices):
        BRONZE = "bronze", "Bronze"
        SILVER = "silver", "Silver"
        GOLD = "gold", "Gold"

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="b2b_profile")
    company_name = models.CharField(max_length=255)
    voen = models.CharField("VÖEN", max_length=20)
    discount_tier = models.CharField(max_length=10, choices=DiscountTier.choices, default=DiscountTier.BRONZE)

    def __str__(self):
        return self.company_name


class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="addresses")
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100, blank=True)
    address_line = models.CharField(max_length=255)
    is_default = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.city}, {self.address_line}"
