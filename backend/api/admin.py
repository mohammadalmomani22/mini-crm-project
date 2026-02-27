from django.contrib import admin
from .models import Contact, Task

@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone', 'email', 'status', 'created_at')
    search_fields = ('full_name', 'phone', 'email')
    list_filter = ('status',)
    ordering = ('-created_at',)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'contact', 'due_date', 'priority', 'is_done', 'created_at')
    search_fields = ('title', 'contact')
    list_filter = ('priority', 'is_done')
    ordering = ('-created_at',)