from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from api.models import Contact, Task
from django.contrib.auth.models import User



class ContactAPITest(TestCase):
    """Test suite for the Contact API endpoints."""

    def setUp(self):
        """Create a test user and contact to use across all contact tests."""
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.client.force_authenticate(user=self.user)
        self.contact = Contact.objects.create(
            full_name="Test User",
            phone="+962799000000",
            email="test@example.com",
            status="active"
        )

    # --- Contact CRUD ---

    def test_list_contacts(self):
        """GET /api/contacts/ should return 200 and a list of contacts."""
        response = self.client.get('/api/contacts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_contact(self):
        """POST /api/contacts/ with valid data should create a new contact and return 201."""
        data = {"full_name": "New Contact", "phone": "0799999999", "email": "new@test.com", "status": "active"}
        response = self.client.post('/api/contacts/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Contact.objects.count(), 2)

    def test_get_contact_detail(self):
        """GET /api/contacts/<id>/ should return the specific contact's data."""
        response = self.client.get(f'/api/contacts/{self.contact.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Test User')

    def test_update_contact(self):
        """PATCH /api/contacts/<id>/ should partially update the contact."""
        data = {"full_name": "Updated Name"}
        response = self.client.patch(f'/api/contacts/{self.contact.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.contact.refresh_from_db()
        self.assertEqual(self.contact.full_name, 'Updated Name')

    def test_delete_contact(self):
        """DELETE /api/contacts/<id>/ should remove the contact and return 204."""
        response = self.client.delete(f'/api/contacts/{self.contact.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Contact.objects.count(), 0)

    # --- Contact Validation ---

    def test_create_contact_short_name_fails(self):
        """POST with name shorter than 3 characters should return 400."""
        data = {"full_name": "AB", "status": "active"}
        response = self.client.post('/api/contacts/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_contact_invalid_phone_fails(self):
        """POST with non-numeric phone should return 400."""
        data = {"full_name": "Valid Name", "phone": "abc123", "status": "active"}
        response = self.client.post('/api/contacts/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_contact_invalid_email_fails(self):
        """POST with invalid email format should return 400."""
        data = {"full_name": "Valid Name", "email": "not-an-email", "status": "active"}
        response = self.client.post('/api/contacts/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # --- Contact Filtering ---

    def test_search_contacts(self):
        """GET /api/contacts/?search=Test should return only matching contacts."""
        response = self.client.get('/api/contacts/?search=Test')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_filter_by_status(self):
        """GET /api/contacts/?status=active should return only active contacts."""
        Contact.objects.create(full_name="Inactive User", status="inactive")
        response = self.client.get('/api/contacts/?status=active')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_ordering_contacts(self):
        """GET /api/contacts/?ordering=full_name should return contacts sorted alphabetically."""
        Contact.objects.create(full_name="Alpha User", status="active")
        response = self.client.get('/api/contacts/?ordering=full_name')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['results'][0]['full_name'], 'Alpha User')

    # --- Open Tasks Count ---

    def test_contact_detail_has_open_tasks_count(self):
        """Contact detail should include open_tasks_count showing only incomplete tasks."""
        Task.objects.create(contact=self.contact, title="Open Task", priority="high", is_done=False)
        Task.objects.create(contact=self.contact, title="Done Task", priority="low", is_done=True)
        response = self.client.get(f'/api/contacts/{self.contact.id}/')
        self.assertEqual(response.data['open_tasks_count'], 1)


class TaskAPITest(TestCase):
    """Test suite for the Task API endpoints."""

    def setUp(self):
        """Create a test user, contact and task to use across all task tests."""
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', password='testpass123')
        self.client.force_authenticate(user=self.user)
        self.contact = Contact.objects.create(
            full_name="Task Owner",
            status="active"
        )
        self.task = Task.objects.create(
            contact=self.contact,
            title="Test Task",
            priority="medium",
            is_done=False
        )

    # --- Task CRUD ---

    def test_list_tasks(self):
        """GET /api/tasks/ should return 200 and a list of tasks."""
        response = self.client.get('/api/tasks/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_task(self):
        """POST /api/tasks/ with valid data should create a new task and return 201."""
        data = {"contact": self.contact.id, "title": "New Task", "priority": "high"}
        response = self.client.post('/api/tasks/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Task.objects.count(), 2)

    def test_toggle_task_done(self):
        """PATCH /api/tasks/<id>/ with is_done=True should mark the task as completed."""
        response = self.client.patch(f'/api/tasks/{self.task.id}/', {"is_done": True}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertTrue(self.task.is_done)

    def test_delete_task(self):
        """DELETE /api/tasks/<id>/ should remove the task and return 204."""
        response = self.client.delete(f'/api/tasks/{self.task.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Task.objects.count(), 0)

    # --- Task Validation ---

    def test_create_task_short_title_fails(self):
        """POST with title shorter than 3 characters should return 400."""
        data = {"contact": self.contact.id, "title": "AB", "priority": "low"}
        response = self.client.post('/api/tasks/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_task_invalid_contact_fails(self):
        """POST with non-existent contact ID should return 400."""
        data = {"contact": 9999, "title": "Valid Title", "priority": "low"}
        response = self.client.post('/api/tasks/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_task_past_due_date_fails(self):
        """POST with due_date in the past should return 400."""
        data = {"contact": self.contact.id, "title": "Valid Title", "priority": "low", "due_date": "2020-01-01"}
        response = self.client.post('/api/tasks/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    # --- Task Filtering ---

    def test_filter_tasks_by_contact(self):
        """GET /api/tasks/?contact_id=<id> should return only that contact's tasks."""
        response = self.client.get(f'/api/tasks/?contact_id={self.contact.id}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_filter_tasks_by_done_status(self):
        """GET /api/tasks/?is_done=true should return only completed tasks."""
        Task.objects.create(contact=self.contact, title="Done Task", priority="low", is_done=True)
        response = self.client.get('/api/tasks/?is_done=true')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_filter_tasks_by_priority(self):
        """GET /api/tasks/?priority=medium should return only medium priority tasks."""
        response = self.client.get('/api/tasks/?priority=medium')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)