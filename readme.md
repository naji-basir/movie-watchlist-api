# Movie Watchlist API

A REST API for tracking movies you want to watch, are watching, or have finished — built as a hands-on learning project to practice production-grade backend patterns with a modern TypeScript stack.

> **Status:** actively developed. Auth, RBAC, validation, rate limiting, structured logging, API documentation, and core resources (movies, watchlist) are implemented. Tests, Docker, and deployment are in progress.

## Why this project exists

The main gola to developing this project is to demonstrate real engineering practices: layered architecture, input validation, role-based access control, rate limiting, structured logging, OpenAPI documentation, and defensive error handling. Along the way it surfaced (and fixed) a genuine authorization bug, documented below, which was more valuable than any tutorial exercise.

## Tech Stack

| Layer           | Choice                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------- |
| Runtime         | Node.js 24, TypeScript 7 (native `tsx` execution, no build step)                            |
| Framework       | Express 5                                                                                   |
| Database        | PostgreSQL                                                                                  |
| ORM             | Prisma 7                                                                                    |
| Validation      | Zod 4                                                                                       |
| Auth            | JWT (httpOnly cookies) + bcryptjs                                                           |
| Rate limiting   | `express-rate-limit` (global + stricter auth-route limiter)                                 |
| Logging         | `pino` + `pino-http` (structured JSON in prod, pretty-printed in dev)                       |
| API Docs        | OpenAPI 3.1, generated from Zod schemas via `zod-openapi`, served with `swagger-ui-express` |
| Package manager | pnpm                                                                                        |
| Cloud           | Neon                                                                                        |

**Why `noEmit: true`?** TypeScript is run directly via `tsx` (Node's native type-stripping in dev, and in prod alike) rather than pre-compiled — a deliberate choice to keep the project aligned with TypeScript 7's new type-stripping-first model, using `erasableSyntaxOnly` and `rewriteRelativeImportExtensions` to stay compatible.

## Architecture

Each resource follows a strict layered structure:

```
Route → Middleware (authenticate, authorize, validate, rate limit) → Controller → Service → Repository → Database
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
- **Rate limiting** — a global limiter on all routes, plus a stricter limiter on auth routes (`skipSuccessfulRequests`) to slow down brute-force login/register attempts
- **Structured logging** — every request logged via `pino-http` with request IDs, response times, and log levels tied to status code (`info` for 2xx/3xx, `warn` for 4xx, `error` for 5xx); sensitive fields (cookies, auth headers, passwords) are redacted from logs
- **API documentation** — interactive OpenAPI 3.1 docs generated directly from the same Zod schemas used for request validation, so the docs and the validation logic can't drift out of sync
- **Movies** — admin-curated catalog; public reads, admin-only writes; unique on `(title, releaseYear)` to allow legitimate remakes while blocking true duplicates
- **Watchlist** — personal, per-user list of movies with status (`PLANNED` / `WATCHING` / `COMPLETED` / `DROPPED`), rating, and notes
- **Pagination, sorting, filtering** — on both list endpoints (`page`, `limit`, `sortBy`, `order`, plus resource-specific filters like `genre`, `status`, `search`)
- **Centralized error handling** — a single `AppError` class + global error handler that maps Prisma errors (`P2002`, `P2025`), JWT errors, and unexpected exceptions into consistent JSON responses, with stack traces only exposed in development

## A bug worth mentioning

Early RBAC design allowed admins to update or delete **any** user's watchlist items via a role-override check. On review, this was identified as a real authorization flaw for this domain: a personal watchlist is private user data, not admin-moderated public content (unlike the movie catalog, which admins are meant to curate). The fix removed the role override entirely — watchlist ownership is now absolute, and any future admin-support tooling would need its own explicit, separately-audited route rather than a silent bypass in the user-facing endpoint.

This is intentionally left in the README rather than quietly fixed and forgotten — recognizing and correcting an over-broad permission model is a core part of building secure systems.

## API Documentation

Interactive API docs are available once the server is running:

```
http://localhost:<PORT>/docs
```

The raw OpenAPI 3.1 spec (useful for generating a client SDK or importing into Postman/Insomnia) is served at:

```
http://localhost:<PORT>/openapi.json
```

The spec is generated from the same Zod schemas used to validate incoming requests (via `zod-openapi`), so request shapes shown in the docs are guaranteed to match what the API actually accepts — there's a single source of truth instead of hand-written docs that can go stale.

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

Once running, visit `http://localhost:<PORT>/docs` for interactive API documentation.

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
- **Caching** — the movie catalog is a natural candidate for a Redis-backed read cache, since it's public and changes infrequently.
- **Distributed rate limiting** — the current limiter uses in-memory storage, fine for a single instance; a multi-instance deployment would need a shared store (e.g. `rate-limit-redis`).
- **Log shipping** — logs are currently console-only; a production deployment would benefit from shipping structured JSON logs to an aggregator (e.g. Loki, Datadog, CloudWatch).
- **Automated tests** — the layered architecture was built specifically to make this easy; test coverage is the current priority.

## License

ISC# Movie Watchlist API

A REST API for tracking movies you want to watch, are watching, or have finished — built as a hands-on learning project to practice production-grade backend patterns with a modern TypeScript stack.

> **Status:** actively developed. Auth, RBAC, validation, rate limiting, structured logging, API documentation, and core resources (movies, watchlist) are implemented. Tests, Docker, and deployment are in progress.

## Why this project exists

This isn't a tutorial clone — it started as a course project and was deliberately leveled up to demonstrate real engineering practices: layered architecture, input validation, role-based access control, rate limiting, structured logging, OpenAPI documentation, and defensive error handling. Along the way it surfaced (and fixed) a genuine authorization bug, documented below, which was more valuable than any tutorial exercise.

## Tech Stack

| Layer           | Choice                                                                                      |
| --------------- | ------------------------------------------------------------------------------------------- |
| Runtime         | Node.js 24, TypeScript 7 (native `tsx` execution, no build step)                            |
| Framework       | Express 5                                                                                   |
| Database        | PostgreSQL                                                                                  |
| ORM             | Prisma 7                                                                                    |
| Validation      | Zod 4                                                                                       |
| Auth            | JWT (httpOnly cookies) + bcryptjs                                                           |
| Rate limiting   | `express-rate-limit` (global + stricter auth-route limiter)                                 |
| Logging         | `pino` + `pino-http` (structured JSON in prod, pretty-printed in dev)                       |
| API Docs        | OpenAPI 3.1, generated from Zod schemas via `zod-openapi`, served with `swagger-ui-express` |
| Package manager | pnpm                                                                                        |
| Cloud           | Neon                                                                                        |

**Why `noEmit: true`?** TypeScript is run directly via `tsx` (Node's native type-stripping in dev, and in prod alike) rather than pre-compiled — a deliberate choice to keep the project aligned with TypeScript 7's new type-stripping-first model, using `erasableSyntaxOnly` and `rewriteRelativeImportExtensions` to stay compatible.

## Architecture

Each resource follows a strict layered structure:

```
Route → Middleware (authenticate, authorize, validate, rate limit) → Controller → Service → Repository → Database
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
- **Rate limiting** — a global limiter on all routes, plus a stricter limiter on auth routes (`skipSuccessfulRequests`) to slow down brute-force login/register attempts
- **Structured logging** — every request logged via `pino-http` with request IDs, response times, and log levels tied to status code (`info` for 2xx/3xx, `warn` for 4xx, `error` for 5xx); sensitive fields (cookies, auth headers, passwords) are redacted from logs
- **API documentation** — interactive OpenAPI 3.1 docs generated directly from the same Zod schemas used for request validation, so the docs and the validation logic can't drift out of sync
- **Movies** — admin-curated catalog; public reads, admin-only writes; unique on `(title, releaseYear)` to allow legitimate remakes while blocking true duplicates
- **Watchlist** — personal, per-user list of movies with status (`PLANNED` / `WATCHING` / `COMPLETED` / `DROPPED`), rating, and notes
- **Pagination, sorting, filtering** — on both list endpoints (`page`, `limit`, `sortBy`, `order`, plus resource-specific filters like `genre`, `status`, `search`)
- **Centralized error handling** — a single `AppError` class + global error handler that maps Prisma errors (`P2002`, `P2025`), JWT errors, and unexpected exceptions into consistent JSON responses, with stack traces only exposed in development

## A bug worth mentioning

Early RBAC design allowed admins to update or delete **any** user's watchlist items via a role-override check. On review, this was identified as a real authorization flaw for this domain: a personal watchlist is private user data, not admin-moderated public content (unlike the movie catalog, which admins are meant to curate). The fix removed the role override entirely — watchlist ownership is now absolute, and any future admin-support tooling would need its own explicit, separately-audited route rather than a silent bypass in the user-facing endpoint.

This is intentionally left in the README rather than quietly fixed and forgotten — recognizing and correcting an over-broad permission model is a core part of building secure systems.

## API Documentation

Interactive API docs are available once the server is running:

```
http://localhost:<PORT>/docs
```

The raw OpenAPI 3.1 spec (useful for generating a client SDK or importing into Postman/Insomnia) is served at:

```
http://localhost:<PORT>/openapi.json
```

The spec is generated from the same Zod schemas used to validate incoming requests (via `zod-openapi`), so request shapes shown in the docs are guaranteed to match what the API actually accepts — there's a single source of truth instead of hand-written docs that can go stale.

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
git clone https://github.com/naji-basir/movie-watchlist-api.git
cd backend-course
pnpm install
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, etc.
pnpm prisma migrate dev
pnpm prisma db seed    # creates a default admin user
pnpm run dev
```

Once running, visit `http://localhost:<PORT>/docs` for interactive API documentation.

### Environment variables

```
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=
```

### Scripts

```bash
pnpm run dev     # start with hot reload (tsx + nodemon)
pnpm run start   # start without hot reload
pnpm run lint    # lint with ESLint (TypeScript-aware)
```

## What I'd do differently at scale

- **Refresh tokens** — current auth uses a single long-lived JWT; a production system should split short-lived access tokens from rotated refresh tokens.
- **Caching** — the movie catalog is a natural candidate for a Redis-backed read cache, since it's public and changes infrequently.
- **Distributed rate limiting** — the current limiter uses in-memory storage, fine for a single instance; a multi-instance deployment would need a shared store (e.g. `rate-limit-redis`).
- **Log shipping** — logs are currently console-only; a production deployment would benefit from shipping structured JSON logs to an aggregator (e.g. Loki, Datadog, CloudWatch).
- **Automated tests** — the layered architecture was built specifically to make this easy; test coverage is the current priority.

## License

ISC
