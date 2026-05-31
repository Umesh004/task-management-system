# Task Management API

A multi-tenant team-based task management system built with Node.js, Express, TypeScript, PostgreSQL, Prisma, Redis, JWT Authentication, and Docker.

---

## Features

### Authentication & Authorization

- User Registration
- User Login
- Refresh Token Rotation
- JWT Access Tokens
- Protected Routes
- Role-Based Access Control (RBAC)

### Organization Management

- Multi-tenant architecture
- Users belong to organizations
- Complete organization-level data isolation

### User Management

- Create organization users
- Assign roles:
  - ADMIN
  - MANAGER
  - MEMBER

### Task Management

- Create Tasks
- Update Tasks
- Delete Tasks
- View Tasks
- Update Task Status
- Task Assignment
- Pagination
- Filtering
- Status Transition Validation

### Caching

- Redis integration
- Task list caching
- Automatic cache invalidation

### Infrastructure

- PostgreSQL
- Prisma ORM
- Docker
- Docker Compose

---

# Tech Stack

| Technology | Purpose          |
| ---------- | ---------------- |
| Node.js    | Runtime          |
| Express.js | Web Framework    |
| TypeScript | Type Safety      |
| PostgreSQL | Database         |
| Prisma     | ORM              |
| Redis      | Caching          |
| JWT        | Authentication   |
| Zod        | Validation       |
| Docker     | Containerization |

---

# Architecture

```mermaid
flowchart TD

Client --> API["Express API"]

API --> PostgreSQL["PostgreSQL (Prisma)"]

API --> Redis["Redis Cache"]
```

---

# Role-Based Access Control

## ADMIN

Permissions:

- Create Managers
- Create Members
- Create Tasks
- Update Tasks
- Delete Tasks
- View All Organization Tasks

Restrictions:

- Cannot update task status

---

## MANAGER

Permissions:

- Create Tasks
- Update Tasks
- Delete Tasks
- Assign Tasks
- View All Organization Tasks
- Update Task Status

---

## MEMBER

Permissions:

- View Assigned Tasks
- Update Status of Assigned Tasks

Restrictions:

- Cannot create tasks
- Cannot update tasks
- Cannot delete tasks
- Cannot view tasks assigned to others

---

# Task Status Workflow

Allowed transitions:

```text
TODO
  ↓
IN_PROGRESS
  ↓
IN_REVIEW
  ↓
DONE
```

Additional transition:

```text
TODO → BLOCKED
IN_PROGRESS → BLOCKED
IN_REVIEW → BLOCKED
BLOCKED → TODO
```

Invalid transitions are rejected.

Example:

```text
TODO → DONE ❌
DONE → TODO ❌
TODO → IN_REVIEW ❌
```

---

# Database Design

## Organization Isolation

Every query is scoped by:

```ts
organizationId;
```

This ensures users cannot access data belonging to another organization.

---

## Task Relationships

```text
Organization
    |
    ├── Users
    |
    └── Tasks
            |
            └── Assignee (User)
```

---

## Refresh Token Rotation

Refresh tokens are:

- Stored in database
- Rotated on every refresh request
- Invalidated after use

This prevents token replay attacks.

---

# Redis Cache Strategy

Task lists are cached using Redis.

Example cache key:

```text
tasks:<userId>
```

When a task is:

- Created
- Updated
- Deleted
- Reassigned
- Status Updated

The relevant cache entries are invalidated automatically.

---

# Environment Variables

Create a `.env` file:

```env
NODE_ENV=development

PORT=5000

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/task_management

JWT_ACCESS_SECRET=your_access_secret

JWT_REFRESH_SECRET=your_refresh_secret

ACCESS_TOKEN_EXPIRES_IN=15m

REFRESH_TOKEN_EXPIRES_IN=7d

REDIS_HOST=localhost
REDIS_PORT=6379
```

---

# Running Locally

## Install Dependencies

```bash
npm install
```

---

## Run Database Migrations

```bash
npx prisma migrate dev
```

---

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Start Development Server

```bash
npm run dev
```

---

# Running with Docker

Build and start all services:

```bash
docker compose up --build
```

Services:

| Service    | Port |
| ---------- | ---- |
| API        | 5000 |
| PostgreSQL | 5432 |
| Redis      | 6379 |

---

# API Endpoints

## Authentication

| Method | Endpoint           |
| ------ | ------------------ |
| POST   | /api/auth/register |
| POST   | /api/auth/login    |
| POST   | /api/auth/refresh  |
| GET    | /api/auth/me       |

---

## Users

| Method | Endpoint   |
| ------ | ---------- |
| POST   | /api/users |

---

## Tasks

| Method | Endpoint                  |
| ------ | ------------------------- |
| POST   | /api/tasks                |
| GET    | /api/tasks                |
| GET    | /api/tasks/:taskId        |
| PATCH  | /api/tasks/:taskId        |
| DELETE | /api/tasks/:taskId        |
| PATCH  | /api/tasks/:taskId/status |

---

# Validation

Request validation is implemented using Zod.

Examples:

- Email validation
- Password validation
- UUID validation
- Pagination validation
- Status validation
- Priority validation

---

# Author

Umesh Reddy

Built as part of a backend engineering using Node.js, TypeScript, Prisma, PostgreSQL, Redis, and Docker.
