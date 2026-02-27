from rest_framework.routers import DefaultRouter
from api.views import ContactViewSet, TaskViewSet

router = DefaultRouter()
router.register('contacts', ContactViewSet)
router.register('tasks', TaskViewSet)

urlpatterns = router.urls