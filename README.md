# DevFlow

> A Full-Stack Engineering Collaboration Platform

DevFlow is a premium project management and collaboration tool designed for engineering teams. It combines the structured workflow of tools like Linear with the flexibility of Notion, providing a unified workspace for managing projects, tracking tasks, and communicating with team members.

## Project Structure

This repository is organized as a monorepo containing both the frontend client and the backend API service.

- `/client` - The frontend web application built with React 19, Vite, Tailwind CSS v4, and Zustand.
- `/backend` - The REST API service built with Node.js, Express, PostgreSQL, Redis, and BullMQ.

## Features

- **Workspaces & Projects**: Organize your team's work into dedicated workspaces and modular projects.
- **Kanban Task Management**: Create, assign, and track tasks visually using intuitive drag-and-drop boards.
- **Real-time Collaboration**: Stay up to date with activity feeds and task comments.
- **Full-Text Search**: Instantly locate tasks and projects across your workspaces.
- **Role-Based Access Control**: Manage permissions securely within workspaces (Owner, Admin, Member).
- **Background Processing**: Reliable email notifications and activity logging powered by background task queues.
- **Premium User Interface**: Dark-themed, glassmorphic design inspired by modern developer tools.

## Getting Started

To run the full stack locally, you need to set up both the backend and frontend separately.

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+

### Running the Backend

Detailed instructions can be found in the [Backend README](./backend/README.md).

```bash
cd backend
npm install
npm run migrate
```
Ensure your `.env` is configured, then start the server:
```bash
npm run dev
```

### Running the Client

Detailed instructions can be found in the [Client README](./client/README.md).

```bash
cd client
npm install
npm run dev
```
The application will be accessible at `http://localhost:5173`.

## License

This project is licensed under the MIT License.
