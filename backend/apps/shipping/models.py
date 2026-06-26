from django.db import models


class ShippingZone(models.Model):
    name = models.CharField(max_length=100)  # e.g. "Bakı", "Region"
    cost = models.DecimalField(max_digits=8, decimal_places=2)
    free_threshold = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)

    def __str__(self):
        return self.name
