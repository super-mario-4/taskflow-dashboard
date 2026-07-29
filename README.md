# TaskFlow — Team Task Management Dashboard

A task management application where users can view, create, organize, and track tasks across projects. Built as a frontend test task demonstrating routing, state management, form validation, and API integration patterns.

## 🚀 Live Demo

> _Live Demo Link._

[Live Demo](https://taskflow-dashboardv1.netlify.app)

## 🛠 Tech Stack

| Category | Choice | Reasoning |
|---|---|---|
| Build tool | Vite | Fast dev server, instant HMR, minimal config compared to CRA |
| Framework | React 18 | Required by task spec |
| Routing | React Router v6 | Standard for SPA route protection, nested routes, dynamic `/tasks/:id` |
| State management | Redux Toolkit | Predictable global state for auth + tasks, built-in `createSlice`/`createAsyncThunk` reduces boilerplate vs classic Redux, good devtools for debugging async flows |
| Backend / data | json-server + custom `db.json` | Gives real HTTP requests (GET/POST/PUT/DELETE) without needing a real backend, matches Option A from the task spec |
| HTTP client | Axios / fetch (specify which you used) | Simple wrapper isolated in `src/api/` layer |
| Charts | Recharts | Lightweight, composable chart library for the dashboard summary chart |
| Drag & drop | dnd-kit | Kanban view — dragging tasks between status columns |
| Theming | Custom dark mode toggle | Persists user preference, switches CSS variables/theme tokens |
| Styling | | Tailwind |
| Forms & validation | | React Hook Form |

## 📦 Setup & Run

```bash
# 1. Clone the repo
https://github.com/super-mario-4/taskflow-dashboard.git
cd taskflow

# 2. Install dependencies
npm install

# 3. Start the mock backend (json-server)
npm run server
# runs json-server on db.json, usually http://localhost:3001

# 4. Start the frontend dev server (in a separate terminal)
npm run dev
# runs on http://localhost:5173
```

> No environment variables are required — the app works out of the box with `npm install && npm run dev`.

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run server` | Start json-server on `db.json` |
| `npm run build` | Production build |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## 🔑 Demo Credentials

```
email: demo@taskflow.com
password: demo1234
```

## ✅ What Was Completed

- [x] Mocked authentication (login form, validation, protected routes, logout, redirect)
- [x] Dashboard with summary cards (total / in progress / completed / overdue)
- [x] Dashboard chart (tasks by status) via Recharts
- [x] Recent tasks list (5 latest)
- [x] Tasks page: pagination, filtering (status/priority), debounced search, sorting
- [x] Create/edit task modal with validation (title required, min 3 chars, etc.)
- [x] Delete task with confirmation dialog
- [x] Task detail page `/tasks/:id` with "not found" handling
- [x] Loading states (skeletons/spinners) on all fetches
- [x] Error states with retry option
- [x] Empty states for no-data scenarios
- [x] Responsive layout (mobile ≥360px, tablet, desktop)
- [x] API abstraction layer in `src/services/`
- [x] Kanban view with drag-and-drop between status columns (dnd-kit) — bonus
- [x] Dark mode toggle — bonus

## ⏭ What Was Skipped / Partially Done

- [ ] TypeScript migration — not applied, project uses plain JS
- [ ] Unit tests — not covered, prioritized core functionality and bonus features (Kanban, dark mode) within the time frame
- [ ] Deployment — not deployed; run locally per setup instructions above
- [ ] Docker — not added

## 📁 Project Structure

```
src/
├── assets/         # Images, icons, static assets
├── common/         # Shared UI elements/utilities used across features
├── components/     # Reusable UI components
├── hooks/          # Custom hooks (e.g. useDebounce)
├── layouts/         # Page layouts (e.g. main layout with sidebar/header)
├── lib/            # Helper functions/utilities
├── pages/          # Route-level pages (Login, Dashboard, Tasks, TaskDetail, NotFound)
├── routes/         # Route protection (PrivateRoute) and route definitions
├── services/       # API abstraction layer (json-server requests)
├── store/          # Redux Toolkit store, slices (auth, tasks)
├── App.jsx
└── main.jsx
```

## 📝 Notes

- All data operations go through `src/services/`, not hardcoded inside components.
- No environment variables are used in this project.
- Commit history reflects incremental development (auth → dashboard → tasks CRUD → Kanban → dark mode → polish).
