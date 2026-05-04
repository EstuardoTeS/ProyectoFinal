from django.db import models
from projects.models import Project
from django.conf import settings

class Task(models.Model):
    PRIORITY = [('low','Baja'), ('medium','Media'), ('high','Alta')]
    STATUS   = [
        ('pending',     'Pendiente'),
        ('in_progress', 'En progreso'),
        ('completed',   'Finalizada'),
        ('cancelled',   'Cancelada'),
    ]

    title       = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    project     = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    created_by  = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                    null=True, blank=True, related_name='created_tasks')
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL,
                                    null=True, blank=True, related_name='tasks')
    priority    = models.CharField(max_length=10, choices=PRIORITY, default='medium')
    status      = models.CharField(max_length=20, choices=STATUS,   default='pending')
    progress    = models.PositiveSmallIntegerField(default=0)
    progress_note = models.TextField(blank=True)
    due_date    = models.DateField(null=True, blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
