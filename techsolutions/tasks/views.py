from rest_framework import viewsets, permissions
from rest_framework.exceptions import PermissionDenied
from django.db.models import Count, Q
from .models import Task
from .serializers import TaskSerializer
from users.models import User

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Task.objects.all().order_by('-created_at')
        project_id = self.request.query_params.get('project')
        if project_id:
            qs = qs.filter(project_id=project_id)
        if self.request.user.role == 'employee':
            qs = qs.filter(assigned_to=self.request.user)
        elif self.request.user.role == 'client':
            qs = qs.filter(created_by=self.request.user)
        return qs

    def get_auto_assigned_employee(self):
        return (
            User.objects
            .filter(role='employee', is_active=True)
            .annotate(active_tasks=Count(
                'tasks',
                filter=Q(tasks__status__in=['pending', 'in_progress', 'review'])
            ))
            .order_by('active_tasks', 'id')
            .first()
        )

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'client':
            employee = self.get_auto_assigned_employee()
            serializer.save(created_by=user, assigned_to=employee)
            return
        if user.role == 'admin':
            serializer.save(created_by=user)
            return
        raise PermissionDenied('Los empleados no pueden crear tareas.')

    def perform_update(self, serializer):
        user = self.request.user
        task = self.get_object()
        if user.role == 'admin':
            serializer.save()
            return
        if user.role == 'employee' and task.assigned_to_id == user.id:
            serializer.save(
                title=task.title,
                description=task.description,
                project=task.project,
                created_by=task.created_by,
                assigned_to=task.assigned_to,
                priority=task.priority,
                due_date=task.due_date,
            )
            return
        if user.role == 'client' and task.created_by_id == user.id:
            serializer.save(
                created_by=task.created_by,
                assigned_to=task.assigned_to,
                status=task.status,
                progress=task.progress,
                progress_note=task.progress_note,
            )
            return
        raise PermissionDenied('No tienes permiso para modificar esta tarea.')

    def perform_destroy(self, instance):
        if self.request.user.role != 'admin':
            raise PermissionDenied('Solo el administrador puede eliminar tareas.')
        instance.delete()
