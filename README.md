# Patent Application Portal

A simple patent submission and approval workflow with RBAC.

**Repo:** [github.com/brianmbewe75/Patent-App](https://github.com/brianmbewe75/Patent-App)

## Stack

- **Backend:** Node.js, Express, Prisma, **SQLite**, JWT, Zod
- **Frontend:** React, Vite, Tailwind CSS

## Quick Start

### Backend

```bash
cd backend
cp .env.example .env   # Windows: copy .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

Runs on http://localhost:4000

### Frontend (new terminal)

```bash
cd frontend
cp .env.example .env   # Windows: copy .env.example .env
npm install
npm run dev
```

Runs on http://localhost:5173

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Applicant | applicant@patent.demo | Apply1234! |
| Examiner | examiner@patent.demo | Examine1234! |
| Admin | admin@patent.demo | Admin1234! |

## Roles

- **APPLICANT** — create/submit applications, track status, resubmit after amendments
- **EXAMINER** — review queue, approve/reject/request amendment
- **ADMIN** — manage user roles, view all audit logs

## Workflow

```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED
                                → REJECTED
                                → AMENDMENT_REQUESTED → SUBMITTED
```
