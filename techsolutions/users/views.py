from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from .models import User
from .serializers import UserSerializer

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by('id')
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return User.objects.all().order_by('id')
        if user.role == 'employee':
            return User.objects.filter(role='employee', is_active=True).order_by('username')
        return User.objects.filter(id=user.id)

    def perform_create(self, serializer):
        request_user = self.request.user
        if request_user.is_authenticated and request_user.role == 'admin':
            serializer.save()
        else:
            serializer.save(role='client', is_active=True)

    def perform_update(self, serializer):
        if self.request.user.role != 'admin' and serializer.instance.id != self.request.user.id:
            raise PermissionDenied('No puedes modificar otros usuarios.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != 'admin':
            raise PermissionDenied('Solo el administrador puede eliminar usuarios.')
        if instance.is_protected_admin:
            raise PermissionDenied('El administrador principal no puede ser eliminado.')
        instance.delete()
