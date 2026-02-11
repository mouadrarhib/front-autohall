# Autohall Frontend

React 18 + TypeScript + Vite single-page app for the Autohall network. It covers authentication/authorization, dashboards, user and permission management, site management (filiales/succursales), catalog data (marques/modele/versions), objectives and periods, and sales (ventes). UI is built with MUI (including X DataGrid), state and auth with Zustand, forms with React Hook Form, notifications with React Toastify, and routing with React Router.

## Recent updates (Feb 2026)
- CI/CD pipeline upgraded in GitHub Actions: PR/push verification and Docker image publishing to GHCR on `main`.
- Login page redesigned with a more professional AutoHall-branded layout (desktop split panel + responsive mobile form).
- Docker build now supports runtime API injection through `VITE_API_BASE_URL` build arg (used by infra compose).
- Added global success toasts for create/update/delete API flows.
- Added a global `ErrorBoundary` with a friendly fallback screen and reload action.
- Added CSV export actions for key tables:
  - ventes
  - objectifs
  - users
- Added period KPI cards on dashboard (active period + objectifs/ventes counts by period).
- Added frontend unit tests (Vitest + Testing Library) for critical utilities/components.
- Hardened env handling:
  - `.env` is no longer tracked
  - `.env.example` added
  - dev server/proxy config now supports env defaults

## Quick start
- Prerequisites: Node.js 18+ and npm.
- Install deps: `npm install`
- Start dev server: `npm run dev`
- Type-check + build: `npm run build`
- Preview production build: `npm run preview`
- Lint: `npm run lint`
- Test: `npm test`

## Environment
Create a local `.env` from `.env.example` with at least:
```
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Autohall
VITE_APP_VERSION=1.0.0
VITE_ENABLE_DEVTOOLS=true
VITE_DEV_SERVER_PORT=5173
VITE_DEV_API_PROXY_TARGET=http://localhost:3000
```
`VITE_API_BASE_URL` is required at startup and is used by all Axios clients (cookies enabled via `withCredentials`).

## Docker build and run
Build the frontend image with explicit API base URL:

```bash
docker build --build-arg VITE_API_BASE_URL=http://localhost:3001 -t autohall-frontend:local .
docker run --rm -p 5173:80 autohall-frontend:local
```

When running through backend infra compose (`autohall-backend/infra/docker-compose.yml`), this build arg is set automatically.

## Project layout (src/)
- `api/` Axios client + endpoints per domain (`auth`, `permissions`, `filiale`, `succursale`, `usersite`, `marque`, `modele`, `version`, `objectif`, `periode`, `typeobjectif`, `typevente`, `ventes`, etc.). Response interceptor logs out on 401 and shows toasts for 401/403.
- `components/` shared UI: auth (`LoginForm`), layout (`DashboardLayout`, `Navbar`, `Sidebar`), guards (`ProtectedRoute`, `RoleGuard`), common form helpers (`FormInput`, `FormSelect`), and `DataTable` wrapping MUI DataGrid.
- `features/` domain screens:
  - `dashboard/` admin vs site dashboards (`AdminDashboard`, `SiteDashboard`, `DashboardContent`).
  - `users/` list, detail dialog, create/edit, roles & permissions management.
  - `permissions/` list/create/edit permissions, view users of a permission, manage user permissions.
  - `sites/` tabbed management for filiales and succursales (create/edit/activate/deactivate), plus marque listing per filiale.
  - `filiales/`, `succursales/` dedicated create/edit flows.
  - `usersites/` assignments between users and sites (list/create/edit, view users of a user-site).
  - `marques/`, `modeles/`, `versions/` catalog CRUD with filters, dialogs, and details.
  - `periodes/` manage active periods.
  - `objectifs/` objectives per site/groupement/type vente/type objectif with filtering by periode, pricing/margin computations, and detail dialog; scopes to user sites unless admin.
  - `ventes/` sales management with site scoping, price/CA/margin calculations, dialogs, detail view.
- `hooks/` cross-cutting hooks: roles (`useRoles` with `ROLES` constants), permissions helpers, pagination, activity tracking, session timeout.
- `routes/AppRoutes.tsx` public login route plus protected routes nested in `DashboardLayout`; guards combine authentication and role checks.
- `store/authStore.ts` Zustand store (persisted) for auth state, permissions/roles, user profile enrichment, last-activity tracking, and auth helpers.
- `styles/` global styles and fonts.
- `types/` shared TypeScript contracts for auth, permissions, users, user sites, API pagination, etc.
- `utils/permissionGrouping.ts` helpers for grouping permissions.

## How to use (common flows)
- Login: go to `/login`, submit credentials (cookies-based auth). Session auto-refreshes on activity and expires after inactivity.
- Users: `/users` to list, view details (dialog), create, edit, and manage roles/permissions for a given user.
- Permissions: `/permissions` to create/edit permissions and see which users are attached.
- Sites: `/sites` to manage filiales/succursales, toggle active, and view marques for a filiale. Dedicated create/edit pages also exist under `/filiales` and `/succursales`.
- Catalog: `/marques`, `/modeles`, `/versions` for vehicle data; filters and dialogs are provided.
- Objectives: `/objectifs` to filter by periode, site/groupement, type vente, type objectif; create/edit entries with computed prices/margins.
- Sales: `/ventes` to browse sales scoped to the current site, view details, and (if role allows) create/update with auto-calculated price/CA/margin.
- Dashboard: `/dashboard` shows admin vs site cards/alerts depending on role.

## Routing, roles, and session
- Authentication flow: `LoginForm` -> `authStore.login` -> persisted Zustand state; profile/roles/permissions fetched from `authApi`.
- Guards: `ProtectedRoute` checks authentication (redirects to `/login`), optional permission checks; `RoleGuard` enforces role access or redirects to `/dashboard`.
- Roles: `useRoles` defines `administrateur fonctionnel`, `integrateur des objectifs`, `integrateur des ventes`, `administrateur system`, `OperationsManager`. Routes use these to gate modules (e.g., users/permissions/sites are admin-fonctionnel only; objectifs for admin-fonctionnel + integrateur objectifs; ventes for integrateur ventes/admin-fonctionnel read-only).
- Session handling: `useActivityTracker` updates last activity on user events; `useSessionTimeout` warns at 25 minutes idle and logs out at 30 minutes, redirecting to login.
- API interceptor auto-logs out on 401 and shows a toast, then redirects to `/login`.

## Feature highlights
- Dashboard: role-aware view (admin vs site) with KPI cards and alerts, including period quick KPIs for objectifs and ventes.
- Users: server-loaded table, active/total counts, detail dialog, create/edit, and roles/permissions management per user.
- Permissions: CRUD for permissions plus user assignment views.
- Sites: tabbed filiale/succursale CRUD, activation toggles, marque listing per filiale.
- User-site assignments: list/create/edit and user listing for a given assignment.
- Catalog: marque/modele/version management with filters, dialogs, and details.
- Periods: create/edit periods used by objectives.
- Objectives: create/edit by target type (marque/modele/version), scoped by site/groupement/type vente/type objectif and periode; auto-calculates sale price, CA, margins from catalog data; caching for dropdowns and objectives per site/period.
- Sales: scoped by user site context, server pagination, dynamic pricing/margin calculations based on catalog data and type vente (direct vs intergroupe), detail dialog; integrateur ventes can create/update.
- CSV export: one-click CSV export on users, objectifs, and ventes screens (with user feedback toasts).
- Reliability: global error boundary for unexpected UI exceptions.

## UI and data patterns
- Tables use `DataTable` (MUI DataGrid) with server pagination hooks and optional selection.
- Forms use React Hook Form for validation (login) and controlled state elsewhere with MUI dialogs/cards.
- Toasts via `react-toastify`; most copy is in French.
- Layout: `DashboardLayout` wraps `Navbar`, `Sidebar`, and nested routes; uses MUI theme defined in `App.tsx`.

## Development notes
- Keep HTTP calls inside `src/api/endpoints/*`; all requests share the same Axios instance and interceptors.
- Protect any new route with `ProtectedRoute` and, when relevant, `RoleGuard`.
- Add new permissions/roles through the auth store helpers (`usePermissions`, `useRoles`) for consistent checks.
- Default text and labels are French; keep wording consistent.
- Testing stack: Vitest + jsdom + Testing Library (`src/test/setup.ts`).
