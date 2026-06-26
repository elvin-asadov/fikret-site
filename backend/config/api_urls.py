from django.urls import include, path

urlpatterns = [
    path("auth/", include("apps.accounts.urls")),
    path("catalog/", include("apps.catalog.urls")),
    path("cart/", include("apps.cart.urls")),
    path("orders/", include("apps.orders.urls")),
    path("payments/", include("apps.payments.urls")),
    path("shipping/", include("apps.shipping.urls")),
    path("promotions/", include("apps.promotions.urls")),
    path("reviews/", include("apps.reviews.urls")),
    path("content/", include("apps.content.urls")),
    path("search/", include("apps.search.urls")),
]
