from rest_framework import serializers

from .models import Attribute, Brand, Category, Product, ProductAttributeValue, ProductImage, ProductVariant


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ("id", "parent", "name_az", "name_ru", "slug", "image", "order", "is_active")


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ("id", "name", "slug", "logo", "description")


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ("id", "image", "alt", "order")


class ProductVariantSerializer(serializers.ModelSerializer):
    stock_quantity = serializers.SerializerMethodField()

    class Meta:
        model = ProductVariant
        fields = (
            "id",
            "name",
            "sku",
            "price",
            "old_price",
            "attributes",
            "barcode",
            "weight",
            "is_default",
            "stock_quantity",
        )

    def get_stock_quantity(self, obj):
        stock = getattr(obj, "stock", None)
        return stock.quantity if stock else 0


class ProductAttributeValueSerializer(serializers.ModelSerializer):
    attribute_name = serializers.CharField(source="attribute.name", read_only=True)

    class Meta:
        model = ProductAttributeValue
        fields = ("id", "attribute", "attribute_name", "value")


class AttributeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attribute
        fields = ("id", "name", "type")


class ProductListSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    default_variant = serializers.SerializerMethodField()
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = (
            "id",
            "category",
            "brand",
            "name_az",
            "name_ru",
            "slug",
            "sku",
            "is_active",
            "default_variant",
            "primary_image",
        )

    def get_default_variant(self, obj):
        variant = next((v for v in obj.variants.all() if v.is_default), None) or next(
            iter(obj.variants.all()), None
        )
        return ProductVariantSerializer(variant).data if variant else None

    def get_primary_image(self, obj):
        image = next(iter(obj.images.all()), None)
        return ProductImageSerializer(image).data if image else None


class ProductDetailSerializer(serializers.ModelSerializer):
    category = CategorySerializer(read_only=True)
    brand = BrandSerializer(read_only=True)
    variants = ProductVariantSerializer(many=True, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    attribute_values = ProductAttributeValueSerializer(many=True, read_only=True)

    class Meta:
        model = Product
        fields = (
            "id",
            "category",
            "brand",
            "name_az",
            "name_ru",
            "slug",
            "description",
            "sku",
            "is_active",
            "meta_title",
            "meta_description",
            "created_at",
            "variants",
            "images",
            "attribute_values",
        )
