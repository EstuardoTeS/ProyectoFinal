from django.db import models
from django.conf import settings

class Client(models.Model):
    STATUS = [('active', 'Activo'), ('inactive', 'Inactivo')]

    user    = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE,
                                   null=True, blank=True, related_name='client_profile')
    name    = models.CharField(max_length=200)
    email   = models.EmailField(unique=True)
    phone   = models.CharField(max_length=20, blank=True)
    company = models.CharField(max_length=200, blank=True)
    status  = models.CharField(max_length=10, choices=STATUS, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
