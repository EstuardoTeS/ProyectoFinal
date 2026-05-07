from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response

from users.models import User
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer


class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'admin':
            return Conversation.objects.select_related('admin', 'employee').all()
        if user.role == 'employee':
            return Conversation.objects.select_related('admin', 'employee').filter(employee=user)
        return Conversation.objects.none()

    def create(self, request, *args, **kwargs):
        self._ensure_admin_or_employee()
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if request.user.role == 'admin':
            employee = serializer.validated_data.get('employee')
            if not employee:
                raise ValidationError({'employee': 'Selecciona un empleado.'})
            admin = request.user
        else:
            employee = request.user
            admin = User.objects.filter(role='admin', is_active=True).order_by('id').first()
            if not admin:
                raise ValidationError('No hay un administrador activo para iniciar el chat.')

        subject = serializer.validated_data.get('subject') or 'Indicaciones'
        conversation, created = Conversation.objects.get_or_create(
            admin=admin,
            employee=employee,
            defaults={'subject': subject},
        )
        if not created and subject and conversation.subject != subject:
            conversation.subject = subject
            conversation.save(update_fields=['subject', 'updated_at'])

        data = self.get_serializer(conversation).data
        return Response(data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def perform_update(self, serializer):
        self._ensure_admin_or_employee()
        conversation = self.get_object()
        if not self._is_participant(conversation):
            raise PermissionDenied('No tienes acceso a esta conversación.')
        serializer.save()

    def perform_destroy(self, instance):
        if self.request.user.role != 'admin':
            raise PermissionDenied('Solo el administrador puede eliminar conversaciones.')
        instance.delete()

    def _ensure_admin_or_employee(self):
        if self.request.user.role not in ('admin', 'employee'):
            raise PermissionDenied('El chat está disponible solo para administrador y empleados.')

    def _is_participant(self, conversation):
        user = self.request.user
        return conversation.admin_id == user.id or conversation.employee_id == user.id


class MessageViewSet(viewsets.ModelViewSet):
    serializer_class = MessageSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role not in ('admin', 'employee'):
            return Message.objects.none()

        queryset = Message.objects.select_related('sender', 'conversation').filter(
            Q(conversation__admin=user) | Q(conversation__employee=user)
        )
        conversation_id = self.request.query_params.get('conversation')
        if conversation_id:
            queryset = queryset.filter(conversation_id=conversation_id)
        return queryset.order_by('created_at')

    def list(self, request, *args, **kwargs):
        response = super().list(request, *args, **kwargs)
        conversation_id = request.query_params.get('conversation')
        if conversation_id:
            self.get_queryset().filter(conversation_id=conversation_id).exclude(sender=request.user).update(is_read=True)
        return response

    def perform_create(self, serializer):
        user = self.request.user
        if user.role not in ('admin', 'employee'):
            raise PermissionDenied('El chat está disponible solo para administrador y empleados.')

        conversation = serializer.validated_data['conversation']
        if conversation.admin_id != user.id and conversation.employee_id != user.id:
            raise PermissionDenied('No puedes enviar mensajes en esta conversación.')

        message = serializer.save(sender=user)
        Conversation.objects.filter(id=conversation.id).update(updated_at=message.created_at)
