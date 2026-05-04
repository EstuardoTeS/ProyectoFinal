from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from django.db.models import Count, Q
from .models import Task
from .serializers import EmployeeTaskStatusSerializer, TaskSerializer
from users.models import User

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Task.objects.select_related('project', 'project__client', 'assigned_to', 'created_by').order_by('-created_at')
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        if self.request.user.role == 'employee':
            qs = qs.filter(assigned_to=self.request.user)
        elif self.request.user.role == 'client':
            qs = qs.filter(project__client__user=self.request.user)
        return qs

    def get_serializer_class(self):
        if self.request.user.role == 'employee' and self.action in ['partial_update', 'update']:
            return EmployeeTaskStatusSerializer
        return TaskSerializer

    def get_auto_assigned_employee(self):
        return (
            User.objects
            .filter(role='employee', is_active=True)
            .annotate(active_tasks=Count(
                'tasks',
                filter=Q(tasks__status__in=['pending', 'in_progress'])
            ))
            .order_by('active_tasks', 'id')
            .first()
        )

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'admin':
            serializer.save(created_by=user)
            return
        raise PermissionDenied('Solo el administrador puede crear tareas.')

    def perform_update(self, serializer):
        user = self.request.user
        task = self.get_object()
        if user.role == 'admin':
            serializer.save()
            return
        if user.role == 'employee' and task.assigned_to_id == user.id:
            serializer.save()
            return
        raise PermissionDenied('No tienes permiso para modificar esta tarea.')

    def perform_destroy(self, instance):
        if self.request.user.role != 'admin':
            raise PermissionDenied('Solo el administrador puede eliminar tareas.')
        instance.delete()
