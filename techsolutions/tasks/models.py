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


class TaskHistory(models.Model):
    ACTIONS = [
        ('created', 'Creada'),
        ('status_changed', 'Cambio de estado'),
        ('updated', 'Actualizada'),
    ]

    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='history')
    action = models.CharField(max_length=20, choices=ACTIONS)
    previous_status = models.CharField(max_length=20, choices=Task.STATUS, blank=True)
    new_status = models.CharField(max_length=20, choices=Task.STATUS, blank=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='task_history_entries',
    )
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.task} - {self.get_action_display()}'
