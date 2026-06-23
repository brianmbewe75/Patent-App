# Patent Application Portal

A simple patent submission and approval workflow with RBAC.

**Repo:** [github.com/brianmbewe75/Patent-App](https://github.com/brianmbewe75/Patent-App)

## Stack

- **Backend:** Node.js, Express, Prisma, SQLite, JWT, Zod (`server/`)
- **Frontend:** React, Vite, Tailwind CSS (`client/`)
- **Single repo** — one `npm install`, one `npm run dev`

## Project layout

```
patent-workflow/
├── server/          # Express API
├── client/          # React UI
├── prisma/          # Database schema + seed
├── package.json     # All dependencies here
└── .env
```

## Quick Start

```bash
cp .env.example .env          # Windows: copy .env.example .env
npm install
npm run db:push
npm run db:seed
npm run dev
```

- **UI:** http://localhost:5173 (proxies `/api` to backend)
- **API:** http://localhost:4000/api

### Production (single server)

```bash
npm run build
npm start
```

Serves both API and built React app on one port (default 4000).

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
