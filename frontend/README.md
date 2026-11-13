# Employee Directory: Frontend

A responsive employee management interface built with **React**, **TypeScript**, **Vite** and **Tailwind CSS**. It talks to the Laravel REST API in the `backend/` folder to create, read, update and delete employee records.

## Features

- Employee list with name, email, job role and date added
- Add and edit employees through an accessible modal form
- Delete with a confirmation prompt
- Debounced search by name or email (300 ms)
- Sorting by date added, name, email or job role, ascending or descending
- Server-side pagination with a selectable page size (5, 10, 25, 50)
- Loading, empty, error and retry states
- Success and error notifications
- Friendly error messages, including Laravel validation errors
- Responsive layout for mobile, tablet and desktop

## Tech Stack

| Area        | Technology                 |
| ----------- | -------------------------- |
| UI library  | React 19                   |
| Language    | TypeScript                 |
| Build tool  | Vite 8                     |
| Styling     | Tailwind CSS 4             |
| HTTP client | Axios                      |
| Icons       | lucide-react               |
| Linting     | ESLint + typescript-eslint |
| Production  | Nginx (inside Docker)      |

## Prerequisites

- **Node.js 20.19+ or 22.12+** (required by Vite 8)
- **npm**
- The backend API running (see the backend README)

## Getting Started

```bash
# 1. Go to the frontend folder
cd frontend

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env

# 4. Start the dev server
npm run dev
```

The app runs at **http://localhost:5173**.

## Environment Variables

| Variable       | Description                 | Example                     |
| -------------- | --------------------------- | --------------------------- |
| `VITE_API_URL` | Base URL of the Laravel API | `http://localhost:8000/api` |

Notes:

- `VITE_API_URL` is used **by the browser**, so it must be a URL the browser can reach (for example `localhost:8000`), not a Docker service name.
- Vite embeds `VITE_*` values into the bundle at **build time**. If you change the value, restart the dev server or rebuild the app.
- Never put secrets in `VITE_*` variables, because they are public in the compiled JavaScript.

## Available Scripts

| Command           | Description                                         |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Start the development server with hot reload        |
| `npm run build`   | Type-check with `tsc -b`, then build for production |
| `npm run preview` | Preview the production build locally                |
| `npm run lint`    | Run ESLint                                          |

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── services/
│   │   └── employeeService.ts   # Axios instance and API calls
│   ├── types/
│   │   └── employee.ts          # Shared TypeScript interfaces
│   ├── App.tsx                  # Main page, table and employee modal
│   ├── index.css                # Tailwind import and global styles
│   └── main.tsx                 # App entry point
├── .env.example
├── Dockerfile
├── nginx.conf
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## API Contract

All requests go through `src/services/employeeService.ts` using the base URL from `VITE_API_URL`.

| Method   | Endpoint          | Purpose                    |
| -------- | ----------------- | -------------------------- |
| `GET`    | `/employees`      | List employees (paginated) |
| `POST`   | `/employees`      | Create an employee         |
| `PUT`    | `/employees/{id}` | Update an employee         |
| `DELETE` | `/employees/{id}` | Delete an employee         |

### List query parameters

| Parameter  | Type                                        | Description           |
| ---------- | ------------------------------------------- | --------------------- |
| `page`     | number                                      | Page number           |
| `per_page` | number                                      | Records per page      |
| `search`   | string                                      | Matches name or email |
| `sort_by`  | `name` \| `email` \| `role` \| `created_at` | Column to sort by     |
| `sort_dir` | `asc` \| `desc`                             | Sort direction        |

### Expected list response

The frontend expects Laravel's standard paginator shape:

```json
{
	"data": [
		{
			"id": 1,
			"name": "Priya Sharma",
			"email": "priya@company.com",
			"role": "Software Engineer",
			"created_at": "2026-01-15T09:30:00.000000Z",
			"updated_at": "2026-01-15T09:30:00.000000Z"
		}
	],
	"current_page": 1,
	"last_page": 5,
	"per_page": 10,
	"total": 48,
	"from": 1,
	"to": 10
}
```

### Create / update payload

```json
{
	"name": "Priya Sharma",
	"email": "priya@company.com",
	"role": "Software Engineer"
}
```

Validation errors from Laravel (HTTP 422) are read from `response.data.errors` and the first message is shown in the form.

## Docker

The frontend uses a multi-stage build: Node compiles the app, then Nginx serves the static files.

```bash
# From the repository root
docker compose up --build -d frontend
```

The app is served at **http://localhost:3000**.

To point the build at a different API, set the build argument in `docker-compose.yml`:

```yaml
frontend:
  build:
    context: ./frontend
    args:
      VITE_API_URL: http://localhost:8000/api
```

Or build the image on its own:

```bash
docker build --build-arg VITE_API_URL=http://localhost:8000/api -t employee-directory-frontend ./frontend
docker run -p 3000:80 employee-directory-frontend
```

`nginx.conf` includes a fallback to `index.html` so page refreshes work with client-side routing, and long-term caching for hashed build assets.

## Troubleshooting

**CORS error in the browser console**
Add your frontend origin to the backend's allowed origins (`CORS_ALLOWED_ORIGINS`), for example `http://localhost:5173` for local dev and `http://localhost:3000` for Docker.

**"Unable to connect to the server"**
Check that the backend is running and that `VITE_API_URL` is correct. After changing it, restart `npm run dev` or rebuild the Docker image.

**`npm run build` fails on Node errors**
Make sure you are on Node 20.19+ or 22.12+.

**`npm ci` fails in Docker**
Commit `package-lock.json` to the repository.

## Contributing

1. Create a feature branch: `git checkout -b feature/my-change`
2. Run `npm run lint` and `npm run build` before committing
3. Open a pull request

## License

This project is for internal use by Agaetis Technologies. Add a license here if you plan to open-source it.
