# DevFlow API

> Production-grade REST API for a full-stack engineering collaboration platform

## Overview
The DevFlow API serves as the robust, secure, and highly-performant backend for the DevFlow collaboration platform. It manages user authentication, role-based workspace grouping, advanced task management (Kanban style), real-time activity tracking, and full-text search. This API is built to handle complex relational data with strict data integrity, utilizing caching and background processing to maintain high availability and speed.

## Tech Stack
- **Node.js 22 & Express 5**: Fast, minimalist web framework chosen for its massive ecosystem and non-blocking I/O.
- **PostgreSQL 16**: Primary relational database. Chosen for its strict ACID compliance, complex join capability, and powerful `tsvector` features for advanced full-text search.
- **Redis 7**: In-memory data store used for sub-millisecond data caching (workspaces, projects) and distributed rate limiting to protect endpoints against abuse.
- **BullMQ**: High-performance, reliable message queue running on Redis. Offloads heavy synchronous tasks (like dispatching email notifications) to background worker processes.
- **Bcrypt & JWT**: Used for secure password hashing and stateless, rotating authentication strategies (Short-lived Access Tokens + HttpOnly Refresh Tokens).
- **Pino**: Extremely fast Node.js logger utilized for structured, machine-readable JSON logging in production.
- **Zod & Joi**: Used for strict payload validation to ensuring API contracts are met before hitting the service layer.

## Architecture
This project follows a modular, feature-based architecture pattern. Rather than grouping files by type (e.g., all controllers in one folder, all models in another), code is grouped by domain (e.g., `modules/workspaces`, `modules/tasks`).

Inside each generic module, the pattern is:
- **`*.controller.js`**: Handles incoming HTTP requests, extracts parameters, coordinates responses, and delegates business logic to the service.
- **`*.service.js`**: Pure business logic. Interacts with the database, implements caching, performs complex data transformations, and queues background jobs.
- **`*.routes.js`**: Defines the endpoints and attaches necessary middleware (Authentication, validation schemas).

**Why this pattern?** It promotes isolation and scalability. Features can be developed, tested, and modified independently. If the application grows large enough to transition into microservices in the future, domain boundaries are already well-defined.

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Installation

1. Clone the repository and navigate to the backend directory:
   ```bash
   git clone <repo-url>
   cd devflow/backend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Set up the local PostgreSQL database and run the migration script to apply the schema and triggers:
   ```bash
   npm run migrate
   ```
4. Start the development server (uses `nodemon` for hot-reloading):
   ```bash
   npm run dev
   ```

### Environment Variables

| Variable | Purpose | Example / Default |
|----------|---------|---------|
| `PORT` | The port the Express server will listen on | `3000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `DATABASE_URL` | Full connection string for PostgreSQL | `postgres://user:pass@localhost:5432/devflow` |
| `REDIS_URL` | Redis connection URL for caching and BullMQ | `redis://localhost:6379` |
| `JWT_SECRET` | Secret key for signing short-lived Access Tokens | `super-secret-key` |
| `JWT_EXPIRES_IN` | Access Token lifespan | `15m` |
| `JWT_REFRESH_SECRET` | Secret key for signing Refresh Tokens | `super-refresh-secret-key` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh Token lifespan | `7d` |
| `EMAIL_HOST` | SMTP server host for Nodemailer | `smtp.mailtrap.io` |
| `EMAIL_PORT` | SMTP port | `2525` |
| `EMAIL_USER` | SMTP username | `your-user` |
| `EMAIL_PASS` | SMTP password | `your-pass` |

*Reference the `.env.example` file in the root for a boilerplate configuration.*

## API Documentation

*All API endpoints (except Login/Register) require a valid JWT Access Token passed in the `Authorization: Bearer <token>` header.*

### Authentication

**Register**
- **Method**: `POST /api/v1/auth/register`
- **Body**: `{ "name": "John Doe", "email": "john@example.com", "password": "securepass123" }`
- **Response**: `{ "status": "success", "data": { "id": "uuid", "name": "John Doe", "email": "john@example.com" } }`

**Login**
- **Method**: `POST /api/v1/auth/login`
- **Body**: `{ "email": "john@example.com", "password": "securepass123" }`
- **Response**: `{ "status": "success", "data": { "accessToken": "ey...", "user": { ... } } }`
- *Note: The Refresh Token is automatically set via an `HttpOnly` cookie.*

**Refresh Token**
- **Method**: `POST /api/v1/auth/refresh`
- **Response**: `{ "status": "success", "data": { "accessToken": "ey..." } }`

**Logout**
- **Method**: `POST /api/v1/auth/logout`
- **Response**: `{ "status": "success", "message": "Logged out successfully" }`

### Workspaces

**Create Workspace**
- **Method**: `POST /api/v1/workspaces`
- **Body**: `{ "name": "Engineering", "description": "Core software team" }`
- **Response**: Returns the created Workspace object. The creator is automatically assigned "owner" role.

**Get User Workspaces**
- **Method**: `GET /api/v1/workspaces`
- **Response**: Array of workspaces the authenticated user belongs to.

**Invite Member**
- **Method**: `POST /api/v1/workspaces/:workspaceId/members`
- **Body**: `{ "email": "jane@example.com", "role": "admin" }`
- **Response**: `{ "status": "success", "message": "Member invited successfully" }`

**Get Members**
- **Method**: `GET /api/v1/workspaces/:workspaceId/members`
- **Response**: Array of users with their roles and join dates.

### Projects

**Create Project**
- **Method**: `POST /api/v1/workspaces/:workspaceId/projects`
- **Body**: `{ "name": "Frontend Redesign", "description": "V2 components" }`
- **Response**: Returns the new Project object.

**Get Workspace Projects**
- **Method**: `GET /api/v1/workspaces/:workspaceId/projects`
- **Response**: Array of projects belonging to the workspace, including a `task_count` aggregate.

**Update Project**
- **Method**: `PATCH /api/v1/workspaces/:workspaceId/projects/:projectId`
- **Body**: `{ "status": "archived" }`
- **Response**: The updated Project object.

### Tasks

**Create Task**
- **Method**: `POST /api/v1/projects/:projectId/tasks`
- **Body**: `{ "title": "Implement Login UI", "description": "...", "priority": "high", "assigneeId": "uuid" }`
- **Response**: The created Task object.

**Get Project Tasks**
- **Method**: `GET /api/v1/projects/:projectId/tasks`
- **Response**: Array of all tasks in the project.

**Update Task**
- **Method**: `PATCH /api/v1/projects/:projectId/tasks/:taskId`
- **Body**: `{ "status": "in_progress", "assigneeId": "uuid" }`
- **Response**: The updated Task. Triggers email notification if assigned to a new user.

**Delete Task**
- **Method**: `DELETE /api/v1/projects/:projectId/tasks/:taskId`
- **Response**: `{ "status": "success", "message": "Task deleted successfully" }`

### Comments

**Create Comment**
- **Method**: `POST /api/v1/projects/:projectId/tasks/:taskId/comments`
- **Body**: `{ "content": "I'll take a look at this today." }`
- **Response**: The created Comment object.

**Get Task Comments**
- **Method**: `GET /api/v1/projects/:projectId/tasks/:taskId/comments`
- **Response**: Array of comments for the specified task.

### Activity

**Get Workspace Activity**
- **Method**: `GET /api/v1/workspaces/:workspaceId/activities`
- **Response**: Array of chronological activity log records (e.g., Task Created, Member Invited) with attached JSON metadata.

### Search

**Global Search**
- **Method**: `GET /api/v1/workspaces/:workspaceId/search?q=queryTerm`
- **Response**: `{ "status": "success", "data": { "tasks": [...], "projects": [...], "total": 5 } }`
- *Note: Search results are ranked by relevance using PostgreSQL `ts_rank` algorithm natively.*

## Database Schema
The database uses `uuid-ossp` for primary keys. Automatic PostgreSQL triggers manage all `updated_at` synchronization to prevent application-layer desynchronization. Triggers also manage `search_vector` updates.

- **users**: Core authentication logic (`email`, `password_hash`).
- **refresh_tokens**: Tracks active JWT sessions.
- **workspaces**: High-level groupings.
- **workspace_members**: Junction table managing user<->workspace many-to-many relationship along with RBAC (`role`).
- **projects**: Groupings of tasks, belonging to a single workspace.
- **tasks**: The core data unit with `status` (Kanban column) and `priority`.
- **comments**: Threaded discussions attached to a specific task.
- **activities**: Immutable log of events generated across the platform.

## Key Features
- JWT Authentication with refresh token rotation (stateless, highly secure).
- Redis caching with strategic granular cache invalidation on mutations (cache-aside pattern).
- Background job queues with BullMQ (email dispatching decoupled from request loop).
- Next-Gen Full-text search utilizing optimized PostgreSQL GIN indexes and `tsvectors`.
- Stringent error boundary and global asynchronous error handling middleware.
- Distributed Rate limiting persisting limits to Redis Store.
- Structured, low-overhead logging using Pino.

## Docker
A `docker-compose.yml` file is provided for running the entire stack (Postgres, Redis, API).
```bash
docker-compose --env-file .env.docker up --build
```
*Make sure to configure `.env.docker` using `.env.example`.*

## Deployment
This API is designed to be easily deployable on modern PaaS platforms like Railway or Render.
1. Connect the GitHub repository.
2. Add a PostgreSQL & Redis plugin to the environment.
3. Map the provisioned `DATABASE_URL` and `REDIS_URL` to your environment variables.
4. Provide the SMTP details and JWT Secret hashes in the provider dashboard.
5. Setup the start command: `node server.js`.

## License
MIT
