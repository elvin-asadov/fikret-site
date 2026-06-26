from django.db import models


class OneCExchangeLog(models.Model):
    """Audit trail of every 1C (CommerceML) exchange session, for debugging syncs."""

    class Kind(models.TextChoices):
        CATALOG = "catalog", "Kataloq (import.xml)"
        OFFERS = "offers", "Təkliflər / qiymət-stok (offers.xml)"
        SALE = "sale", "Sifarişlər"
        OTHER = "other", "Digər"

    kind = models.CharField(max_length=20, choices=Kind.choices, default=Kind.OTHER)
    filename = models.CharField(max_length=255, blank=True)
    success = models.BooleanField(default=False)
    message = models.TextField(blank=True)
    created = models.PositiveIntegerField(default=0)
    updated = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "1C exchange log"
        verbose_name_plural = "1C exchange logs"

    def __str__(self):
        return f"{self.get_kind_display()} — {self.filename} ({self.created_at:%Y-%m-%d %H:%M})"
