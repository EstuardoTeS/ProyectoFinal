from django.db import models
from clients.models import Client

class Project(models.Model):
    STATUS = [
        ('planning',  'Planificación'),
        ('active',    'Activo'),
        ('paused',    'Pausado'),
        ('completed', 'Completado'),
        ('cancelled', 'Cancelado'),
    ]

    name        = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    client      = models.ForeignKey(Client, on_delete=models.CASCADE, related_name='projects')
    start_date  = models.DateField()
    end_date    = models.DateField()
    status      = models.CharField(max_length=20, choices=STATUS, default='planning')
    created_at  = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name