from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project
from .serializers import ProjectSerializer

class IsAdminOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'admin'

class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        qs = (
            Project.objects
            .select_related('client', 'client__user')
            .prefetch_related('tasks', 'tasks__assigned_to')
            .order_by('-created_at')
        )
        user = self.request.user
        if user.role == 'admin':
            return qs
        if user.role == 'client':
            return qs.filter(client__user=user)
        return qs.filter(tasks__assigned_to=user).distinct()

    def perform_create(self, serializer):
        serializer.save()

    def perform_update(self, serializer):
        serializer.save()

    @action(detail=True, methods=['get'], url_path='report')
    def report(self, request, pk=None):
        project = self.get_object()
        tasks = project.tasks.select_related('assigned_to').order_by('id')
        total = tasks.count()
        completed = tasks.filter(status='completed').count()
        progress = round((completed / total) * 100, 2) if total else 0
        return Response({
            'project': ProjectSerializer(project).data,
            'summary': {
                'total_tasks': total,
                'completed_tasks': completed,
                'progress_percent': progress,
            },
        })
