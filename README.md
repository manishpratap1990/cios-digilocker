# College Result Portal

A full-stack College Result Portal built with Next.js 16, TypeScript, Tailwind CSS, PostgreSQL, and Prisma ORM.

## Features

- **Student Portal** — Simple roll number lookup, result display with QR code, PDF download
- **Admin Panel** — Secure login, Excel/CSV import, manual entry, edit/delete/revoke, search
- **QR Verification** — Each result has a unique ID and scannable QR code

## Setup

### 1. Prerequisites

- Node.js 18+
- PostgreSQL database

### 2. Configure Environment

Edit `.env.local` and set your database URL:

```
DATABASE_URL="postgresql://username:password@localhost:5432/college_result_portal"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Database

```bash
npm run db:push
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## Default Admin Credentials

- Username: `admin`
- Password: `admin123`

## Sample Roll Numbers (after seeding)

- 1001 — Rahul Kumar (Class 10)
- 1002 — Priya Sharma (Class 12 Science)
- 1003 — Amit Singh (Class 8)

## Routes

- `/` — Homepage
- `/result/[rollNumber]` — Student result page
- `/verify/[resultId]` — QR verification page
- `/admin/login` — Admin login
- `/admin/dashboard` — Admin dashboard
- `/admin/students` — All students
- `/admin/import` — Excel/CSV import
- `/admin/result/new` — Add result manually
- `/admin/result/[id]/edit` — Edit result
