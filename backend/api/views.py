from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from api.filters import TaskFilter
from .models import Contact, Task
from api.serializers import ContactSerializer, TaskSerializer
from django.db.models import Count, Q
from rest_framework.pagination import PageNumberPagination


class TaskPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

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
    queryset = Task.objects.select_related('contact').all()
    serializer_class = TaskSerializer
    filterset_class = TaskFilter
    pagination_class = TaskPagination
    ordering = ['-created_at']