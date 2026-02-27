from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from api.filters import TaskFilter
from .models import Contact, Task
from api.serializers import ContactSerializer, TaskSerializer
from django.db.models import Count, Q

class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.annotate(
        open_tasks_count=Count('tasks', filter=Q(tasks__is_done=False))
    )
    serializer_class = ContactSerializer

    search_fields = ['full_name', 'phone', 'email']

    filterset_fields = ['status']

    ordering_fields = ['full_name', 'created_at']
    ordering = ['-created_at']

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    filterset_class = TaskFilter
    ordering = ['-created_at']