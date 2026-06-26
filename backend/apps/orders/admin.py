from django.contrib import admin

from .models import Order, OrderItem, OrderStatusHistory


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ("number", "user", "status", "payment_status", "total", "created_at")
    list_filter = ("status", "payment_status")
    search_fields = ("number", "phone")
    inlines = [OrderItemInline, OrderStatusHistoryInline]
