from django.contrib import admin

from .models import (
    Attribute,
    Brand,
    Category,
    Product,
    ProductAttributeValue,
    ProductImage,
    ProductVariant,
)


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductAttributeValueInline(admin.TabularInline):
    model = ProductAttributeValue
    extra = 1


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("name_az", "parent", "order", "is_active")
    list_filter = ("is_active",)
    prepopulated_fields = {"slug": ("name_az",)}


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("name_az", "category", "brand", "sku", "is_active", "created_at")
    list_filter = ("category", "brand", "is_active")
    search_fields = ("name_az", "name_ru", "sku")
    prepopulated_fields = {"slug": ("name_az",)}
    inlines = [ProductVariantInline, ProductImageInline, ProductAttributeValueInline]


@admin.register(Attribute)
class AttributeAdmin(admin.ModelAdmin):
    list_display = ("name", "type")
