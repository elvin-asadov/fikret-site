from django.contrib import admin

from .models import OneCExchangeLog


@admin.register(OneCExchangeLog)
class OneCExchangeLogAdmin(admin.ModelAdmin):
    list_display = ("created_at", "kind", "filename", "success", "created", "updated")
    list_filter = ("kind", "success")
    search_fields = ("filename", "message")
    readonly_fields = ("kind", "filename", "success", "message", "created", "updated", "created_at")

    def has_add_permission(self, request):
        return False
