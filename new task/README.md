# Task Management System — Redesigned

A modern SaaS-style redesign of the original Task Management System, rebuilt
on the Bolt-inspired design system while preserving all original business
logic, API routes, and MySQL schema.

## Structure

```
├── server/           Express + MySQL backend (unchanged logic from the
│                      original back.js / db.js — same routes, same field
│                      names, same schema expectations)
├── src/
│   ├── components/
│   │   ├── layout/    Sidebar, Topbar, Layout, ProtectedRoute
│   │   └── ui/         Reusable design-system components (Button, Card,
│   │                    Modal, Badge, Pagination, Skeleton, etc.)
│   ├── context/        AuthContext, ThemeContext (dark mode), ToastContext
│   ├── pages/           
│   │   ├── admin/       Admin-only pages
│   │   └── employee/    Employee-only pages
│   ├── routes/          AppRoutes.jsx (lazy-loaded, role-protected)
│   ├── services/        API layer — 1:1 mapping to backend routes
│   └── utils/           Shared helpers
```

## Setup

### 1. Backend

```bash
cd server
npm install
```

Edit the MySQL credentials in `server/back.js` (host/user/password/database)
to match your local setup — same as the original project. Then:

```bash
npm start
```

The server runs on `http://localhost:5000`, exactly as before.

### 2. Frontend

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## What changed vs. the original

- **UI**: Full redesign — sidebar/topbar shell, cards, tables, forms, modals,
  loading/empty/error states, dark mode, toasts instead of `alert()`,
  confirmation dialogs instead of `window.confirm()`.
- **Structure**: Flat file dump → organized `components/ui`, `pages/admin`,
  `pages/employee`, `services`, `context`.
- **Routing**: Now role-protected (`/admin/*` requires an Admin session,
  `/employee/*` requires an Employee session) and lazy-loaded per page.
- **Session**: Login now persists to `localStorage` so a page refresh
  doesn't drop you back to the sign-in screen (the original had no
  persistence at all).

## What did NOT change

- Every backend route, request/response shape, and MySQL field name
  (`emp_id`, `emp_name`, `attendance_id`, `task_name`, `assign_to`, etc.)
  is identical to the original `back.js`. No schema migration needed.
- All original business logic: employee add/edit/delete/search, attendance
  filtering by date range and name, task assignment and filtering, login
  role-branching, password reset.
