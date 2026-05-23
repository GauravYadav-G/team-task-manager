# TaskFlow — Team Task Manager

A full-stack collaborative Team Task Management web application built with React, Node.js, Express, PostgreSQL, and Prisma. Features project management, Kanban-style task boards, role-based access control, and real-time dashboards.

## 🚀 Live Demo

**Live URL:** [https://team-task-manager-g5hn.vercel.app/]

## ✨ Features

- **User Authentication** — Signup/login with JWT-based secure authentication
- **Project Management** — Create projects, invite team members by email
- **Kanban Task Board** — Drag-and-drop tasks between To Do, In Progress, and Done columns
- **Role-Based Access Control** — Admin (full control) and Member (view + update own tasks) roles
- **Dashboard Analytics** — Task stats, charts (status distribution, tasks per user), and recent activity
- **Responsive Design** — Premium dark theme with glassmorphism, animations, and mobile support

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Styling | Vanilla CSS (custom properties, glassmorphism) |
| Backend | Node.js + Express |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Charts | Chart.js + react-chartjs-2 |
| Deployment | Railway |

## 📁 Project Structure

```
├── client/                    # React frontend
│   ├── src/
│   │   ├── api/              # Axios instance
│   │   ├── components/       # Reusable components
│   │   ├── context/          # Auth context
│   │   ├── pages/            # Page components
│   │   └── utils/            # Helper functions
│   └── vite.config.js
├── server/                    # Express backend
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   └── src/
│       ├── config/           # Database config
│       ├── controllers/      # Route handlers
│       ├── middleware/        # Auth, RBAC, errors
│       ├── routes/           # API routes
│       └── utils/            # JWT utilities
└── package.json              # Root monorepo config
```

## 🛠️ Local Setup

### Prerequisites

- **Node.js** v18+
- **PostgreSQL** database (local or cloud)

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd team-task-manager
```

### 2. Configure environment variables

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and set your PostgreSQL connection string:

```
DATABASE_URL="postgresql://username:password@localhost:5432/team_task_manager"
JWT_SECRET="your-secure-random-secret"
```

### 3. Install dependencies

```bash
npm install
```

This installs both client and server dependencies and generates the Prisma client.

### 4. Run database migrations

```bash
cd server
npx prisma migrate dev --name init
cd ..
```

### 5. Start development servers

```bash
npm run dev
```

This starts both:
- **Backend** at `http://localhost:5000`
- **Frontend** at `http://localhost:5173`

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List user's projects |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project (Admin) |
| DELETE | `/api/projects/:id` | Delete project (Admin) |
| POST | `/api/projects/:id/members` | Add member (Admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (Admin) |

### Tasks
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/projects/:id/tasks` | Create task (Admin) |
| GET | `/api/projects/:id/tasks` | List project tasks |
| PUT | `/api/projects/:id/tasks/:taskId` | Update task |
| DELETE | `/api/projects/:id/tasks/:taskId` | Delete task (Admin) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Overall dashboard stats |
| GET | `/api/dashboard/projects/:id` | Project dashboard stats |

## 🚢 Railway Deployment

### 1. Create a Railway account at [railway.app](https://railway.app)

### 2. Create a new project and add a PostgreSQL database

### 3. Add a new service from your GitHub repo

### 4. Set environment variables in Railway:

```
DATABASE_URL     → (auto-linked from Railway Postgres)
JWT_SECRET       → your-production-secret
NODE_ENV         → production
```

### 5. Configure build & start commands:

- **Build Command:** `npm run build`
- **Start Command:** `npm start`

The server automatically serves the built React frontend in production.

## 🔺 Vercel Deployment

Since the project uses a monorepo setup, you can deploy it to Vercel as a single application with Serverless Functions for the Express API.

### 1. Create a Vercel Project
- Go to [vercel.com](https://vercel.com) and click **Add New** → **Project**.
- Import your `team-task-manager` repository.

### 2. Configure Settings
- **Framework Preset**: Select `Other` (or let it auto-detect).
- **Build and Output Settings**:
  - Keep **Build Command** empty (Vercel will run `npm run vercel-build` automatically from `package.json`).
  - Set **Output Directory** to `client/dist`.

### 3. Add Environment Variables
Add the following keys in your Vercel Project Settings under Environment Variables:
- `DATABASE_URL` → Your PostgreSQL database connection URL (e.g. from Neon, Supabase, Aiven, or Railway).
- `JWT_SECRET` → A secure random string for signing JWT tokens.
- `NODE_ENV` → `production`

### 4. Deploy
- Click **Deploy**. Vercel will install dependencies, generate the Prisma client, push your DB schema migrations, build the React frontend, and deploy the Express serverless functions automatically!

## 👥 Role-Based Access

| Action | Admin | Member |
|--------|-------|--------|
| Create/delete project | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Edit any task field | ✅ | ❌ |
| Update own task status | ✅ | ✅ |
| View project & tasks | ✅ | ✅ |

## 📄 License

