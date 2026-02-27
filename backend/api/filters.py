# api/filters.py
import django_filters
from .models import Task


class TaskFilter(django_filters.FilterSet):
    contact_id = django_filters.NumberFilter(field_name='contact__id')
    due_from = django_filters.DateFilter(field_name='due_date', lookup_expr='gte')
    due_to = django_filters.DateFilter(field_name='due_date', lookup_expr='lte')

    class Meta:
        model = Task
        fields = ['contact_id', 'is_done', 'priority', 'due_from', 'due_to']