# AI Deck Presenter

A full-stack web application for managing and presenting AI-generated HTML slide decks. Upload self-contained HTML presentations, organize them in a dashboard, and share them via unique URLs.

## Features

- **Authentication** — Email/password sign-in powered by Supabase Auth
- **Dashboard** — Upload, view, delete, and manage your presentations
- **Presentation Viewer** — Fullscreen-capable viewer with floating controls and shareable links
- **Prompt Builder** — Generate structured AI prompts for creating new presentations with customizable topic, audience, language, visual style, and more
- **File Upload** — Drag-and-drop HTML file upload with slug-based routing (max 10 MB)
- **Public & Private** — Control visibility of each presentation

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Framework | [Astro](https://astro.build) (server-rendered) |
| UI | [React](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Animations | [Framer Motion](https://www.framer.com/motion) |
| Icons | [Lucide React](https://lucide.dev) |
| Backend / Database | [Supabase](https://supabase.com) (Auth, Database, Storage) |
| Deployment | [Vercel](https://vercel.com) via `@astrojs/vercel` |
| Package Manager | [Bun](https://bun.sh) |

## Project Structure

```text
/
├── public/
├── src/
│   ├── assets/                    # Static assets (SVGs)
│   ├── components/
│   │   ├── dashboard/             # Dashboard React components
│   │   │   ├── BasicPromptModal.tsx
│   │   │   ├── DashboardApp.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── PresentationGrid.tsx
│   │   │   └── UploadModal.tsx
│   │   └── viewer/                # Presentation viewer components
│   │       └── FloatingControls.tsx
│   ├── layouts/
│   │   └── Layout.astro           # Base HTML layout
│   ├── lib/
│   │   ├── prompt-generator.ts    # AI prompt generation logic
│   │   └── supabase.ts            # Supabase client initialization
│   ├── pages/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login.ts       # POST /api/auth/login
│   │   │   │   └── signout.ts     # GET /api/auth/signout
│   │   │   └── presentations/
│   │   │       ├── index.ts       # GET & POST /api/presentations
│   │   │       ├── [id].ts        # DELETE /api/presentations/:id
│   │   │       └── [slug]/
│   │   │           └── serve.ts   # GET /api/presentations/:slug/serve
│   │   ├── dashboard.astro        # Dashboard page (auth-gated)
│   │   ├── index.astro            # Root redirect to /login
│   │   ├── login.astro            # Login page
│   │   └── p/
│   │       └── [slug].astro       # Dynamic presentation viewer
│   └── styles/
│       └── global.css             # Global styles & CSS custom properties
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

## Getting Started

### Prerequisites

- **Node.js** >= 22.12.0
- **[Bun](https://bun.sh)** (recommended package manager)
- A **[Supabase](https://supabase.com)** project with Auth, a `presentations` table, and a `decks` storage bucket

### Environment Variables

Create a `.env` file in the project root:

| Variable | Description |
| :--- | :--- |
| `PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous/public API key |

### Install & Run

```sh
# Install dependencies
bun install

# Start the development server
bun dev
```

The app will be available at `http://localhost:4321`.

## Commands

All commands are run from the root of the project, from a terminal:

| Command | Action |
| :--- | :--- |
| `bun install` | Installs dependencies |
| `bun dev` | Starts local dev server at `localhost:4321` |
| `bun build` | Build your production site to `./dist/` |
| `bun preview` | Preview your build locally, before deploying |
| `bun astro ...` | Run CLI commands like `astro add`, `astro check` |
| `bun astro -- --help` | Get help using the Astro CLI |

## Deployment

This project is configured for [Vercel](https://vercel.com) with server-side rendering via `@astrojs/vercel`. Push to your connected Git repository or run `bun build` and deploy the output with the Vercel CLI.
