# DevFlow Backend - Phase 1

DevFlow is a premium project management and collaboration platform designed for modern development workflows. This backend serves as the core engine, handling everything from secure authentication to workspace-level organization and real-time activity tracking.

## 🚀 Vision
DevFlow aims to bridge the gap between chaotic task lists and structured delivery. Phase 1 focuses on a robust, modular foundation using Node.js and PostgreSQL.

## 🛠 Tech Stack
- **Runtime**: Node.js (ES Modules)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with `pg` pool
- **Security**: [Helmet](https://helmetjs.github.io/), [CORS](https://github.com/expressjs/cors), [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit)
- **Auth**: JWT (Access & Refresh Tokens) with [bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- **Logging**: [Pino](https://github.com/pinojs/pino) & [Pino-Pretty](https://github.com/pinojs/pino-pretty)
- **Validation**: [Joi](https://joi.dev/)

## 🏗 Modular Architecture
The project follows a modular structure for high maintainability:

- **src/modules/auth**: Complete registration, login, and token refresh flow.
- **src/modules/workspaces**: Multi-tenant workspace management and member invitations.
- **src/modules/projects**: Nested project organization within workspaces.
- **src/modules/tasks**: Granular task management with status, priority, and assignments.
- **src/modules/activities**: Global activity feed for tracking workspace changes.
- **src/middleware**: Centralized auth, error handling, and rate limiting.

## 📁 Project Structure
```text
backend/
├── src/
│   ├── config/          # Application configuration
│   ├── db/              # Database connection & migrations
│   ├── middleware/      # Global Express middlewares
│   ├── modules/         # Feature-based logic (Controller/Service/Route)
│   ├── utils/           # Shared utility functions (Logger, Activity Log)
│   └── app.js           # Express app setup
├── .env                 # Environment variables
├── server.js            # Entry point
└── README.md
```

## 🚦 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL

### 2. Setup
Clone the repo and install dependencies:
```bash
npm install
```

### 3. Environment Variables
Create a `.env` file in the root:
```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=devflow
DB_USER=your_user
DB_PASSWORD=your_password

JWT_SECRET=your_secret
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d
```

### 4. Database Migrations
Run the migration script to set up your tables:
```bash
npm run migrate
```

### 5. Running the App
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🛣 Roadmap
- [ ] **Phase 2**: Redis integration for caching and session management.
- [ ] **Phase 3**: Dockerization for unified environments.
- [ ] **Phase 4**: Real-time notifications with Socket.io.
- [ ] **Phase 5**: Complex Analytics & Reporting modules.
