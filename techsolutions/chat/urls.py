from rest_framework.routers import DefaultRouter

from .views import ConversationViewSet, MessageViewSet

router = DefaultRouter()
router.register('conversations', ConversationViewSet, basename='chat-conversation')
router.register('messages', MessageViewSet, basename='chat-message')

urlpatterns = router.urls
