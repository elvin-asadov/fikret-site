from django.contrib import admin

from .models import Review


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ("product", "user", "rating", "is_approved", "created_at")
    list_filter = ("is_approved", "rating")
    actions = ["approve_reviews"]

    @admin.action(description="Seçilmiş rəyləri təsdiqlə")
    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
