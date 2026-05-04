from rest_framework import viewsets, permissions
from .models import Client
from .serializers import ClientSerializer

# Permiso personalizado: solo admin puede gestionar clientes empresariales
class IsAdminOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'

class ClientViewSet(viewsets.ModelViewSet):
    queryset = Client.objects.all().order_by('-created_at')
    serializer_class = ClientSerializer
    permission_classes = [IsAdminOnly]

    
