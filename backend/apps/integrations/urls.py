from django.urls import path

from .views import onec_exchange

app_name = "integrations"

urlpatterns = [
    path("1c-exchange/", onec_exchange, name="onec-exchange"),
]
