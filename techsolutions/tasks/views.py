from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from django.db.models import Count, Q
from .models import Task, TaskHistory
from .serializers import EmployeeTaskStatusSerializer, TaskSerializer
from .serializers import TaskHistorySerializer
from users.models import User

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = (
            Task.objects
            .select_related('project', 'project__client', 'assigned_to', 'created_by')
            .prefetch_related('history', 'history__changed_by')
            .order_by('-created_at')
        )
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
        project = serializer.validated_data.get('project')

        if user.role == 'admin':
            assigned_to = serializer.validated_data.get('assigned_to') or self.get_auto_assigned_employee()
            task = serializer.save(created_by=user, assigned_to=assigned_to)
            self._create_created_history(task, user)
            return

        if user.role == 'client':
            if not project or project.client.user_id != user.id:
                raise PermissionDenied('No puedes crear tareas en proyectos de otro cliente.')
            task = serializer.save(
                created_by=user,
                assigned_to=self.get_auto_assigned_employee(),
                status='pending',
            )
            self._create_created_history(task, user)
            return

        raise PermissionDenied('Solo el administrador o el cliente del proyecto pueden crear tareas.')

    def _create_created_history(self, task, user):
        TaskHistory.objects.create(
            task=task,
            action='created',
            new_status=task.status,
            changed_by=user,
            note='Tarea creada en el sistema.',
        )

    def perform_update(self, serializer):
        user = self.request.user
        task = self.get_object()
        previous_status = task.status
        if user.role == 'admin':
            updated_task = serializer.save()
            self._create_history_entry(updated_task, previous_status, user)
            return
        if user.role == 'employee' and task.assigned_to_id == user.id:
            updated_task = serializer.save()
            self._create_history_entry(updated_task, previous_status, user)
            return
        raise PermissionDenied('No tienes permiso para modificar esta tarea.')

    def _create_history_entry(self, task, previous_status, user):
        if previous_status != task.status:
            TaskHistory.objects.create(
                task=task,
                action='status_changed',
                previous_status=previous_status,
                new_status=task.status,
                changed_by=user,
                note=task.progress_note or '',
            )
            return

        TaskHistory.objects.create(
            task=task,
            action='updated',
            previous_status=task.status,
            new_status=task.status,
            changed_by=user,
            note=task.progress_note or 'Tarea actualizada.',
        )

    def perform_destroy(self, instance):
        if self.request.user.role != 'admin':
            raise PermissionDenied('Solo el administrador puede eliminar tareas.')
        instance.delete()

    @action(detail=False, methods=['get'], url_path='history')
    def history(self, request):
        if request.user.role != 'admin':
            raise PermissionDenied('Solo el administrador puede consultar el historial general.')
        history = (
            TaskHistory.objects
            .select_related('task', 'task__project', 'task__project__client', 'task__assigned_to', 'changed_by')
            .order_by('-created_at')
        )
        return Response(TaskHistorySerializer(history, many=True, context={'request': request}).data)
