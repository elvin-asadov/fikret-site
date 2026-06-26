from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import Address, B2BProfile, User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ("username", "phone", "email", "is_b2b", "is_staff")
    fieldsets = BaseUserAdmin.fieldsets + (("Əlavə", {"fields": ("phone", "is_b2b")}),)


@admin.register(B2BProfile)
class B2BProfileAdmin(admin.ModelAdmin):
    list_display = ("company_name", "voen", "discount_tier", "user")


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ("user", "city", "address_line", "is_default")
