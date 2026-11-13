# Employee Directory

A full-stack Employee Management application built with **React, TypeScript, Laravel and MySQL**. The application provides a responsive interface to manage employee records, with server-side search, sorting and pagination through a RESTful API.

The project is organized as a monorepo containing a React frontend and a Laravel backend. Both applications and the MySQL database can be run together using Docker Compose.

## Features

- **Employee Management:** Create, view, update and delete employee records.
- **Search:** Search employees by name or email with debounced input.
- **Sorting:** Sort by name, email, job role or date added.
- **Pagination:** Server-side pagination with selectable page sizes.
- **Validation:** Backend validation with unique email enforcement.
- **Responsive UI:** Optimized for desktop, tablet and mobile.
- **User Feedback:** Loading states, error handling, retry actions and success notifications.
- **Docker Support:** Run the complete application stack using Docker Compose.

## Tech Stack

| Layer           | Technology             |
| --------------- | ---------------------- |
| Frontend        | React 19, TypeScript   |
| Build Tool      | Vite 8                 |
| Styling         | Tailwind CSS 4         |
| HTTP Client     | Axios                  |
| Icons           | lucide-react           |
| Backend         | Laravel 13             |
| Language        | PHP 8.4                |
| Database        | MySQL 8.4              |
| Web Server      | Apache                 |
| Frontend Server | Nginx                  |
| Containers      | Docker, Docker Compose |

## Project Structure

```text
employee-directory/
├── frontend/                  # React + TypeScript application
│   ├── src/
│   ├── public/
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── backend/                   # Laravel REST API
│   ├── app/
│   ├── config/
│   ├── database/
│   ├── routes/
│   ├── .env.example
│   ├── .dockerignore
│   ├── Dockerfile
│   └── composer.json
│
├── docker-compose.yml
└── README.md
```

## Getting Started

### Option 1: Run the complete application using Docker (Recommended)

**Prerequisites**

- Docker
- Docker Compose

**1. Clone the repository**

```bash
git clone <your-github-repository-url>
cd employee-directory
```

**2. Configure environment files**

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
```

Create the frontend environment file:

```bash
cp frontend/.env.example frontend/.env
```

Configure the backend environment in `backend/.env`. Generate an application key using Laravel's `php artisan key:generate` command from the backend directory with its dependencies installed.

Docker Compose overrides the database host and other container-specific settings. The database host inside Docker is `db`, not `127.0.0.1`.

**3. Build and start the application**

```bash
docker compose up --build -d
```

**4. Run database migrations**

```bash
docker compose exec backend php artisan migrate --force
```

**5. Access the application**

| Service      | URL                                 |
| ------------ | ----------------------------------- |
| Frontend     | http://localhost:3000               |
| Backend API  | http://localhost:8000/api           |
| Employee API | http://localhost:8000/api/employees |

### Useful Docker Commands

```bash
# View running containers
docker compose ps

# View application logs
docker compose logs -f

# View backend logs
docker compose logs -f backend

# Execute Laravel commands
docker compose exec backend php artisan

# Run database migrations
docker compose exec backend php artisan migrate --force

# Clear Laravel caches
docker compose exec backend php artisan optimize:clear

# Stop containers
docker compose down

# Stop containers and remove database data
docker compose down -v
```

**Note:** The `db_data` Docker volume persists database records when containers are stopped. Using `docker compose down -v` permanently removes that volume and its data.

## Option 2: Run Frontend and Backend Locally

For local development, the frontend and backend can also run independently.

### Backend Setup

**Prerequisites**

- PHP 8.4+
- Composer 2
- MySQL 8.0+

```bash
cd backend

# Install dependencies
composer install

# Create environment file
cp .env.example .env

# Generate application key
php artisan key:generate

# Configure database credentials in .env
# Create the employee_directory database in MySQL

# Run migrations
php artisan migrate

# Start Laravel development server
php artisan serve
```

Backend API: `http://localhost:8000`

### Frontend Setup

**Prerequisites**

- Node.js 20.19+ or 22.12+
- npm

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

Frontend: `http://localhost:5173`

Make sure `VITE_API_URL` in `frontend/.env` points to the locally running backend:

```env
VITE_API_URL=http://localhost:8000/api
```

## API Reference

**Base URL:** `http://localhost:8000/api`

| Method | Endpoint          | Description                        |
| ------ | ----------------- | ---------------------------------- |
| GET    | `/employees`      | Retrieve employees with pagination |
| POST   | `/employees`      | Create a new employee              |
| PUT    | `/employees/{id}` | Update an employee                 |
| DELETE | `/employees/{id}` | Delete an employee                 |

### Employee List Query Parameters

| Parameter  | Description                           | Default      |
| ---------- | ------------------------------------- | ------------ |
| `page`     | Page number                           | `1`          |
| `per_page` | Records per page (5–100)              | `10`         |
| `search`   | Search by name or email               | None         |
| `sort_by`  | `name`, `email`, `role`, `created_at` | `created_at` |
| `sort_dir` | `asc` or `desc`                       | `desc`       |

Example:

```http
GET /api/employees?search=priya&sort_by=name&sort_dir=asc&per_page=10
```

### Create / Update Employee

Request body:

```json
{
	"name": "Priya Sharma",
	"email": "priya@company.com",
	"role": "Software Engineer"
}
```

The API validates required fields and enforces unique email addresses.

### Response Codes

| Status | Description           |
| ------ | --------------------- |
| `200`  | Request successful    |
| `201`  | Employee created      |
| `404`  | Employee not found    |
| `422`  | Validation error      |
| `500`  | Internal server error |

## Environment Configuration

Environment files are maintained separately for each application:

- `backend/.env` — Laravel application and database configuration.
- `frontend/.env` — Frontend API URL configuration.

**Never commit real `.env` files, application keys, database passwords or other secrets.** Only `.env.example` files should be included in the repository.

The frontend's `VITE_API_URL` is embedded into the production bundle at build time. It must use an address accessible from the user's browser, not an internal Docker service name.

## Additional Documentation

For more detailed information, see:

- [Frontend Documentation](frontend/README.md)
- [Backend API Documentation](backend/README.md)

## Known Limitations

- The API currently does not implement authentication or authorization.
- Employee data is accessible to anyone who can reach the API.
- The application is intended as an employee management demonstration project and should be secured before production use.

## License

This project is intended for demonstration and evaluation purposes. Add an appropriate license before distributing or open-sourcing it.
