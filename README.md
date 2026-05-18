# Smart Leads CRM

Smart Leads is a production-grade Customer Relationship Management (CRM) platform designed to streamline lead acquisition and sales tracking. Built as a MERN monorepo, it offers a secure, role-based ecosystem where sales agents track their own pipelines while administrators oversee the entire dataset. Features include CSV export, intelligent filtering, pagination, and responsive dark mode.

<p align="center">
  <a href="https://smart-leads-client.vercel.app"><strong>View Live Demo</strong></a>
</p>

---

## Features

- **JWT Authentication** — Secure stateless auth with token persistence in localStorage
- **Role-Based Access Control** — Admin and Sales role hierarchy enforced on both frontend and backend
- **Lead Management** — Full CRUD: create, view, edit, update status, and delete leads
- **Search & Filtering** — Debounced search, filter by status and source, sort by date
- **Pagination** — Server-side pagination with configurable page size
- **CSV Export** — One-click download of filtered leads
- **Dark Mode** — System-synced light/dark toggle, preference persisted across sessions
- **Dockerized** — Multi-stage Docker builds with Nginx for the frontend and MongoDB for the database

---

## Tech Stack

### Frontend
- React 18 + Vite
- TypeScript
- Tailwind CSS
- React Router v7
- Axios

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT + bcryptjs
- express-validator

---

## Architecture

```
React (Vercel) → Express API (Vercel) → MongoDB Atlas
```

- Frontend calls the API via Axios using `VITE_API_URL`
- API authenticates requests via JWT middleware
- RBAC enforced per route — sales users are scoped to their own leads via `createdBy` filter
- Admin users have unrestricted access including delete

---

## Getting Started

### Prerequisites
- Node.js v18+
- Docker and Docker Compose (for containerised setup)

### Option 1: Docker

```bash
git clone https://github.com/oki-dokii/Smart-Leads.git
cd smart-leads
docker compose up --build
```

Access the app at `http://localhost:80` and the API at `http://localhost:5001`.

### Option 2: Local Development

**Terminal 1 — Backend**
```bash
cd server
cp .env.example .env   # fill in MONGODB_URI, JWT_SECRET
npm install
npm run dev
```

**Terminal 2 — Frontend**
```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`.

---

## Environment Variables

### Server (`server/.env`)

| Key | Description | Example |
|---|---|---|
| `PORT` | API port | `5001` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/smart-leads` |
| `JWT_SECRET` | JWT signing secret | `your_secret_key` |
| `JWT_EXPIRES_IN` | Token lifespan | `7d` |
| `CLIENT_URL` | Allowed CORS origin | `http://localhost:5173` |

### Client (`client/.env`)

| Key | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend base URL | `http://localhost:5001/api` |

---

## API Reference

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Route | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/auth/register` | No | — | Register a new user |
| `POST` | `/auth/login` | No | — | Login and receive JWT |
| `GET` | `/auth/me` | Yes | Any | Get current user |
| `GET` | `/leads` | Yes | Any | List leads (paginated, filtered) |
| `POST` | `/leads` | Yes | Any | Create a lead |
| `GET` | `/leads/export` | Yes | Any | Export leads as JSON for CSV |
| `GET` | `/leads/:id` | Yes | Any | Get lead by ID |
| `PATCH` | `/leads/:id` | Yes | Any | Update lead fields |
| `PATCH` | `/leads/:id/status` | Yes | Any | Update lead status only |
| `DELETE` | `/leads/:id` | Yes | Admin | Delete a lead |

Sales users are automatically scoped — they can only read, update, and export their own leads.

---

## Folder Structure

```
smart-leads/
├── docker-compose.yml
├── package.json
├── client/
│   ├── src/
│   │   ├── api/          # Axios instance and endpoint functions
│   │   ├── components/   # UI components (LeadTable, LeadForm, Pagination...)
│   │   ├── context/      # AuthContext, ThemeContext
│   │   ├── hooks/        # useDebounce
│   │   ├── pages/        # LoginPage, RegisterPage, DashboardPage, LeadDetailPage
│   │   ├── types/        # Shared TypeScript interfaces
│   │   └── utils/        # CSV export helper
│   └── ...
└── server/
    └── src/
        ├── controllers/  # Auth and Lead controllers
        ├── middleware/    # verifyToken, requireRole, errorHandler
        ├── models/        # User, Lead Mongoose schemas
        ├── routes/        # Auth and Lead routes
        ├── types/         # Shared TypeScript interfaces
        └── utils/         # JWT helper, query builder
```

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | https://smart-leads-client.vercel.app |
| Backend API | Vercel | https://smart-leads-server-git-main-kakolibanerjee986-9644s-projects.vercel.app |
| Database | MongoDB Atlas | M0 Free Cluster |
