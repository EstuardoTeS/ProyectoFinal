from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.serializers import CustomTokenSerializer

class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer

def health_check(request):
    return JsonResponse({
        'status': 'ok',
        'app': 'TechSolutions API',
        'version': 'chat-enabled',
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health'),
    path('api/auth/login/',   CustomTokenView.as_view(),  name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('api/users/',    include('users.urls')),
    path('api/clients/',  include('clients.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/tasks/',    include('tasks.urls')),
    path('api/chat/',     include('chat.urls')),
]
