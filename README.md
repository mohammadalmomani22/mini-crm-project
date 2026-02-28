# Mini CRM

A full-stack CRM application for managing contacts and their associated tasks. Built with Django REST Framework and React.

## How to Run (Docker)

```bash
git clone https://github.com/mohammadalmomani22/mini-crm-project.git
cd mini-crm-project
docker-compose up --build
```

Then visit:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000/api/contacts/
- **Admin:** http://localhost:8000/admin/

### Create Admin User

```bash
docker-compose exec backend python manage.py createsuperuser
```

### Seed Sample Data

```bash
docker-compose exec backend python manage.py seed
```

## Manual Setup (Without Docker)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows
pip install -r requirements.txt
```

Create a `.env` file in the `backend/` directory:

```
SECRET_KEY=your-secret-key-here
DJANGO_SETTINGS_MODULE=config.settings.development
```

Update `config/settings/development.py` database HOST to `localhost` if not using Docker.

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py seed              # optional: load sample data
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/token/` | Obtain JWT access + refresh tokens |
| POST | `/api/token/refresh/` | Refresh access token |

### Contacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts/` | List contacts (supports `?search=`, `?status=`, `?ordering=`, pagination) |
| POST | `/api/contacts/` | Create contact |
| GET | `/api/contacts/<id>/` | Contact detail (includes `open_tasks_count`) |
| PATCH | `/api/contacts/<id>/` | Partial update |
| DELETE | `/api/contacts/<id>/` | Delete contact |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks/` | List tasks (supports `?contact_id=`, `?is_done=`, `?priority=`, `?due_from=`, `?due_to=`, `?page_size=`) |
| POST | `/api/tasks/` | Create task |
| PATCH | `/api/tasks/<id>/` | Update task (toggle `is_done`) |
| DELETE | `/api/tasks/<id>/` | Delete task |

## Validation Rules

- `full_name`: minimum 3 characters, required
- `title`: minimum 3 characters, required, unique per contact
- `phone`: numeric only with optional leading `+`, unique if provided
- `email`: valid email format, unique if provided
- `due_date`: cannot be in the past

## Running Tests

```bash
# With Docker
docker-compose exec backend python manage.py test

# Without Docker
cd backend
python manage.py test
```

22 tests covering CRUD operations, validation, filtering, and edge cases.

## CI/CD

GitHub Actions runs all backend tests automatically on every push to `main`. See `.github/workflows/ci.yml`.

## Project Structure

```
mini-crm-project/
├── backend/
│   ├── api/
│   │   ├── models.py          # Contact & Task models
│   │   ├── serializers.py     # DRF serializers with validation
│   │   ├── views.py           # ViewSets with filtering
│   │   ├── filters.py         # Custom task filters
│   │   ├── urls.py            # Router configuration
│   │   ├── tests.py           # 22 API tests
│   │   └── management/
│   │       └── commands/
│   │           └── seed.py    # Database seeder
│   ├── config/
│   │   └── settings/
│   │       ├── base.py        # Shared settings
│   │       ├── development.py # Docker development
│   │       ├── ci.py          # GitHub Actions
│   │       └── deployment.py  # Production (future)
│   ├── Dockerfile
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api.js             # Auth fetch helper
│   │   ├── App.jsx            # Router + Toast + Auth
│   │   ├── components/
│   │   │   ├── Navbar.jsx     # Shared navigation bar
│   │   │   └── ConfirmModal.jsx # Delete confirmation modal
│   │   └── pages/
│   │       ├── LoginPage.jsx
│   │       ├── ContactsPage.jsx
│   │       └── ContactDetailsPage.jsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | Set in `.env` |
| `DJANGO_SETTINGS_MODULE` | Settings file path | `config.settings.development` |