from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User

class CustomTokenSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['role']     = self.user.role
        data['username'] = self.user.username
        return data

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    company = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'password', 'role', 'phone',
            'company', 'is_active', 'is_protected_admin',
        ]
        read_only_fields = ['is_protected_admin']

    def create(self, validated_data):
        password = validated_data.pop('password')
        company = validated_data.pop('company', '')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        if user.role == 'client':
            from clients.models import Client
            client, _ = Client.objects.get_or_create(
                email=user.email,
                defaults={
                    'user': user,
                    'name': user.username,
                    'phone': user.phone,
                    'company': company,
                    'status': 'active',
                },
            )
            if client.user_id is None:
                client.user = user
                client.save(update_fields=['user'])
        return user

    def validate_role(self, value):
        request = self.context.get('request')
        if request and request.method == 'POST' and not request.user.is_authenticated:
            return 'client'
        if request and request.method == 'POST' and value == 'admin':
            raise serializers.ValidationError('El administrador principal ya viene registrado en el sistema.')
        if request and getattr(request.user, 'role', None) != 'admin':
            return getattr(self.instance, 'role', 'client')
        return value

    def validate(self, attrs):
        if self.instance and self.instance.is_protected_admin:
            if attrs.get('is_active') is False:
                raise serializers.ValidationError('El administrador principal no puede ser bloqueado.')
            if attrs.get('role') and attrs['role'] != 'admin':
                raise serializers.ValidationError('El administrador principal no puede cambiar de rol.')
        if self.instance is None and not attrs.get('password'):
            raise serializers.ValidationError({'password': 'La contraseña es obligatoria.'})
        if self.instance is None and attrs.get('role') == 'client':
            from clients.models import Client
            email = attrs.get('email')
            if email and Client.objects.filter(email=email, user__isnull=False).exists():
                raise serializers.ValidationError({'email': 'Ya existe un cliente registrado con este correo.'})
        return attrs
