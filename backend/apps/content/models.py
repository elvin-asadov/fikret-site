from django.db import models


class Banner(models.Model):
    title = models.CharField(max_length=255, blank=True)
    image = models.ImageField(upload_to="banners/")
    link_url = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return self.title or f"Banner #{self.pk}"


class Page(models.Model):
    """Static CMS pages — e.g. 'Haqqımızda', 'Çatdırılma şərtləri'."""

    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=280, unique=True)
    content = models.TextField()
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title
