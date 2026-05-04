from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLES = [
        ('admin', 'Administrador'),
        ('employee', 'Empleado'),
        ('client', 'Cliente'),
    ]
    role  = models.CharField(max_length=10, choices=ROLES, default='employee')
    phone = models.CharField(max_length=20, blank=True)
    is_protected_admin = models.BooleanField(default=False)

    # Estas dos líneas corrigen el error
    groups = models.ManyToManyField(
        'auth.Group',
        blank=True,
        related_name='custom_user_set'
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        blank=True,
        related_name='custom_user_set'
    )

    def __str__(self):
        return f"{self.username} ({self.role})"
