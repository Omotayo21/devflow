# DevFlow Client

> The highly responsive, dark-themed frontend for the DevFlow platform.

This directory contains the React-based web application for DevFlow. Engineered for performance and aesthetics, the client provides a seamless, App-like experience for managing engineering projects and tracking assigned tasks.

## Tech Stack

- **React 19 & Vite**: Ultra-fast development server and optimized production builds.
- **React Router v7**: Modern routing with data-loading capabilities.
- **TanStack Query (React Query) v5**: Robust asynchronous state management, caching, and background data synchronization.
- **Zustand v5**: Minimalist, unopinionated global state management (used for Authentication state).
- **Tailwind CSS v4**: Utility-first CSS framework configured with a custom dark theme and glassmorphic premium design tokens.
- **React Hook Form & Zod**: Performant, flexible, and extensible forms with strong schema validation.
- **Axios**: Promise-based HTTP client for API communication, configured with automatic JWT refresh interceptors.
- **Framer Motion**: Production-ready animation library for smooth UI transitions and micro-interactions.
- **Lucide React**: Beautiful, consistent icon set.

## Project Structure

```text
src/
├── api/          # Axios instances and API utility functions (e.g., authInterceptor)
├── components/   # Reusable UI components (Buttons, Inputs, Modals, Spinners)
├── layouts/      # Dashboard and Main Application layouts (Sidebar, Topbar)
├── pages/        # Route components (Auth, Dashboard, Workspaces, Projects)
├── stores/       # Global Zustand stores (e.g., useAuthStore)
├── utils/        # Helper functions and utilities (e.g., cn for Tailwind class merging)
├── App.jsx       # Root component and Router provider
└── index.css     # Global CSS and Tailwind directives/theme configuration
```

## Getting Started

### Prerequisites

- Node.js 20+
- The backend API running locally (defaults to port `3000`).

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables (if required). Currently, the API URL is defined centrally in `src/api/axios.js`.
3. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

To create an optimized production build:
```bash
npm run build
```
To preview the production build locally:
```bash
npm run preview
```

## Design System

The DevFlow client utilizes a strict design system defined via Tailwind v4's `@theme` directive in `index.css`.

- **Colors**: Deep dark backgrounds (`#0a0a0a`, `#111111`) accented with vibrant primary violet/purple colors (`#7c3aed`, `#8b5cf6`).
- **Typography**: Inter / system fonts styled cleanly with distinct font weights for hierarchy.
- **Effects**: Extensive use of subtle borders, dark overlays, and glassmorphism (translucent backgrounds with blur).
