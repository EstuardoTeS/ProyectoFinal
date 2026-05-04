from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.serializers import CustomTokenSerializer

class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenSerializer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/login/',   CustomTokenView.as_view(),  name='login'),
    path('api/auth/refresh/', TokenRefreshView.as_view(), name='refresh'),
    path('api/users/',    include('users.urls')),
    path('api/clients/',  include('clients.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/tasks/',    include('tasks.urls')),
]