from django.contrib import admin

from .models import Coupon


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ("code", "type", "value", "min_order", "valid_until", "is_active")
    list_filter = ("type", "is_active")
