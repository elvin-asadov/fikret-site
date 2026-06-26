from django.contrib import admin

from .models import Stock, StockMovement


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ("variant", "quantity", "low_stock_threshold")


@admin.register(StockMovement)
class StockMovementAdmin(admin.ModelAdmin):
    list_display = ("variant", "quantity_delta", "reason", "created_at")
    list_filter = ("reason",)
