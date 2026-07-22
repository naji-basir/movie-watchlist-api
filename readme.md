# Movie Watchlist API

A REST API for tracking movies you want to watch, are watching, or have finished — built as a hands-on learning project to practice production-grade backend patterns with a modern TypeScript stack.

> **Status:** actively developed. Auth, RBAC, validation, and core resources (movies, watchlist) are implemented. Tests, Docker, and deployment are in progress.

## Why this project exists

This isn't a tutorial clone — it started as a course project and was deliberately leveled up to demonstrate real engineering practices: layered architecture, input validation, role-based access control, and defensive error handling. Along the way it surfaced (and fixed) a genuine authorization bug, documented below, which was more valuable than any tutorial exercise.

## Tech Stack

| Layer           | Choice                                                           |
| --------------- | ---------------------------------------------------------------- |
| Runtime         | Node.js 24, TypeScript 7 (native `tsx` execution, no build step) |
| Framework       | Express 5                                                        |
| Database        | PostgreSQL                                                       |
| ORM             | Prisma 7                                                         |
| Validation      | Zod 4                                                            |
| Auth            | JWT (httpOnly cookies) + bcryptjs                                |
| Package manager | pnpm                                                             |
| Cloud           | Neon                                                             |

**Why `noEmit: true`?** TypeScript is run directly via `tsx` (Node's native type-stripping in dev, and in prod alike) rather than pre-compiled — a deliberate choice to keep the project aligned with TypeScript 7's new type-stripping-first model, using `erasableSyntaxOnly` and `rewriteRelativeImportExtensions` to stay compatible.

## Architecture

Each resource follows a strict layered structure:

```
Route → Middleware (authenticate, authorize, validate) → Controller → Service → Repository → Database
```

- **Routes** — wire up HTTP verbs, middleware, and controllers. No logic.
- **Controllers** — translate HTTP req/res into service calls. No business rules, no direct DB access.
- **Services** — all business logic and orchestration (ownership checks, filtering rules, pagination math). Framework-agnostic — could be called from a script or test with no Express involved.
- **Repositories** — the only layer that talks to Prisma. Pure data access, no business rules.

This separation means the ORM or the web framework could be swapped without touching business logic — and business logic is unit-testable without mocking HTTP.

## Features

- **Auth** — register/login/logout with JWT stored in an httpOnly cookie; passwords hashed with bcrypt
- **RBAC** — `USER` / `ADMIN` roles via a Prisma enum, enforced with `authenticate` + `authorize` middleware
- **Validation** — every request body/query/params validated with Zod 4 (`strictObject`, coercion, custom refinements) before it reaches a controller
- **Movies** — admin-curated catalog; public reads, admin-only writes; unique on `(title, releaseYear)` to allow legitimate remakes while blocking true duplicates
- **Watchlist** — personal, per-user list of movies with status (`PLANNED` / `WATCHING` / `COMPLETED` / `DROPPED`), rating, and notes
- **Pagination, sorting, filtering** — on both list endpoints (`page`, `limit`, `sortBy`, `order`, plus resource-specific filters like `genre`, `status`, `search`)
- **Centralized error handling** — a single `AppError` class + global error handler that maps Prisma errors (`P2002`, `P2025`), JWT errors, and unexpected exceptions into consistent JSON responses, with stack traces only exposed in development

## A bug worth mentioning

Early RBAC design allowed admins to update or delete **any** user's watchlist items via a role-override check. On review, this was identified as a real authorization flaw for this domain: a personal watchlist is private user data, not admin-moderated public content (unlike the movie catalog, which admins are meant to curate). The fix removed the role override entirely — watchlist ownership is now absolute, and any future admin-support tooling would need its own explicit, separately-audited route rather than a silent bypass in the user-facing endpoint.

This is intentionally left in the README rather than quietly fixed and forgotten — recognizing and correcting an over-broad permission model is a core part of building secure systems.

## API Overview

All routes are prefixed with `/api/v1`.

### Auth

| Method | Route            | Access        |
| ------ | ---------------- | ------------- |
| POST   | `/auth/register` | Public        |
| POST   | `/auth/login`    | Public        |
| POST   | `/auth/logout`   | Authenticated |

### Movies

| Method | Route         | Access |
| ------ | ------------- | ------ |
| GET    | `/movies`     | Public |
| GET    | `/movies/:id` | Public |
| POST   | `/movies`     | Admin  |
| PATCH  | `/movies/:id` | Admin  |
| DELETE | `/movies/:id` | Admin  |

### Watchlist

| Method | Route            | Access        |
| ------ | ---------------- | ------------- |
| GET    | `/watchlist`     | Owner only    |
| GET    | `/watchlist/:id` | Owner only    |
| POST   | `/watchlist`     | Authenticated |
| PATCH  | `/watchlist/:id` | Owner only    |
| DELETE | `/watchlist/:id` | Owner only    |

## Getting Started

### Prerequisites

- Node.js 24+
- pnpm
- PostgreSQL (local or via Docker)
- Neon

### Setup

```bash
git clone <repo-url>
cd backend-course
pnpm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, etc.
pnpm prisma migrate dev
pnpm prisma db seed    # creates a default admin user
pnpm run dev
```

### Environment variables

```
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=5002
```

### Scripts

```bash
pnpm run dev     # start with hot reload (tsx + nodemon)
pnpm run start   # start without hot reload
pnpm run lint    # lint with ESLint (TypeScript-aware)
```

## What I'd do differently at scale

- **Refresh tokens** — current auth uses a single long-lived JWT; a production system should split short-lived access tokens from rotated refresh tokens.
- **Rate limiting** — auth routes now have brute-force protection via a stricter auth limiter; additional per-user or IP-based throttling could still be useful for high-volume login endpoints.
- **Caching** — the movie catalog is a natural candidate for a Redis-backed read cache, since it's public and changes infrequently.
- **Structured logging** — `morgan` is fine for dev; a production deployment would benefit from structured JSON logs (e.g. `pino`) for real observability.
- **Automated tests** — the layered architecture was built specifically to make this easy; test coverage is the current priority.

## License

ISC
