# TalentPerformer

Full-stack demo app with two independent services:

- `backend/` — Express + TypeScript API (in-memory stores for users, chat rooms, dashboard). Runs on port `4000`, routes under `/api` (`/api/auth`, `/api/chat`, `/api/dashboard`).
- `frontend/` — Next.js 14 (App Router) + Tailwind UI. Runs on port `3000`, talks to the backend via `NEXT_PUBLIC_API_URL`.

## Cursor Cloud specific instructions

### Running the services
- Backend dev server: `npm run dev` in `backend/` (uses `ts-node-dev`, hot-reloads on save). Serves on `http://localhost:4000`.
- Frontend dev server: `npm run dev` in `frontend/` (Next.js). Serves on `http://localhost:3000`.
- Start each in its own long-lived shell (e.g. tmux); both are foreground watchers.

### Environment files (required, git-ignored)
- `backend/.env` (copy from `backend/.env.example`) — sets `PORT`, `JWT_SECRET`, `NODE_ENV`. Without `JWT_SECRET` the API falls back to an insecure `dev-secret` and logs a warning (still works).
- `frontend/.env.local` (copy from `frontend/.env.local.example`) — sets `NEXT_PUBLIC_API_URL=http://localhost:4000/api`.
- The update script creates these from the examples if missing.

### Build / typecheck / lint
- Backend has no test or lint script; typecheck with `npx tsc --noEmit` in `backend/`. `npm run build` emits to `dist/`.
- The `backend/src/test-*.ts` files are standalone manual API smoke servers (not an automated test suite) and are excluded from the build.
- Frontend `npm run lint` is NOT runnable out of the box: there is no ESLint config committed and `eslint-config-next` is not a dependency, so `next lint` drops into an interactive setup prompt. Avoid running it unattended.

### Non-obvious gotchas (pre-existing app bugs, not env issues)
- The frontend↔backend response contract is mismatched in places, so some UI happy-paths fail even though the backend is correct:
  - `AuthForm` reads `data.token`, but the API returns `{ data: { token, user } }`, so register/login shows "No token received from server." (the account IS still created on the backend).
  - `dashboard/page.tsx` reads `localStorage('token')` while auth stores `auth_token`.
  - `chat/page.tsx` uses room id `general`, but seeded room ids are `1` (General) and `2` (Random).
- The backend API itself is fully functional — verify end-to-end with `curl` against `:4000/api/...` (register → login → `/me` → `POST /chat/rooms/1/messages`).
