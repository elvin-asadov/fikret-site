from rest_framework.routers import DefaultRouter

from .views import AttributeViewSet, BrandViewSet, CategoryViewSet, ProductViewSet

app_name = "catalog"

router = DefaultRouter()
router.register("categories", CategoryViewSet, basename="category")
router.register("brands", BrandViewSet, basename="brand")
router.register("attributes", AttributeViewSet, basename="attribute")
router.register("products", ProductViewSet, basename="product")

urlpatterns = router.urls
