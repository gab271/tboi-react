# 🎮 TBOI Codex

> **The Binding of Isaac** fan-made item encyclopedia and codex.

A modern web application for exploring items, characters, bosses, and builds from The Binding of Isaac.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)

## ✨ Features

- 📖 **Complete Item Codex** - Browse 700+ items with detailed descriptions, quality ratings, and synergies
- 👾 **Characters** - Explore all playable characters with game-style carousel
- 👹 **Bosses** - Boss information and strategies
- 🔧 **Builds** - Community build sharing
- ⭐ **Favorites** - Save your favorite items
- 🌐 **Multi-language** - i18n support
- 📱 **Responsive Design** - Mobile-first with torn paper visual theme

## 🛠️ Tech Stack

### Frontend
- **React 19** + **Vite 6**
- **Tailwind CSS** with custom design tokens
- **React Query** (TanStack Query) for server state
- **Framer Motion** for animations
- **React Router DOM** for routing
- **i18next** for internationalization

### Backend
- **Express.js** REST API
- **Supabase** (PostgreSQL + Auth + Storage)
- **Rate Limiting** and **JWT Authentication**

## 📦 Prerequisites

- Node.js 18+
- npm 9+
- Supabase account (for database)

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/tboi-codex.git
   cd tboi-codex
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example files and fill in your values:
   
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts both frontend (http://localhost:5173) and backend (http://localhost:3000).

## 📁 Project Structure

```
tboi-codex/
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── contexts/   # React Context providers
│   │   ├── features/   # Feature-specific hooks
│   │   ├── hooks/      # Global custom hooks
│   │   ├── lib/        # Utilities and clients
│   │   ├── pages/      # Route page components
│   │   ├── services/   # Data services
│   │   └── styles/     # Global CSS & tokens
│   └── public/         # Static assets
├── backend/            # Express.js API
│   ├── src/
│   │   ├── lib/        # Supabase client
│   │   ├── middleware/ # Auth & rate limiting
│   │   └── routes/     # API routes
│   └── data/           # Seed data
├── sprites/            # Game sprite assets
├── docs/               # Documentation
└── supabase/           # Edge functions
```

## 📜 Available Scripts

### Root (Monorepo)
| Script | Description |
|--------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run dev:frontend` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `npm run build` | Build frontend for production |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

### Frontend
| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview build |

## 🔐 Environment Variables

### Backend (`backend/.env`)
```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
```

### Frontend (`frontend/.env`)
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_BACKEND_URL=http://localhost:3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is for educational and fan-community purposes. The Binding of Isaac is © Edmund McMillen.

---

Made with ❤️ for the TBOI community


- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:3000](http://localhost:3000)

## Features

- **Auth**: Register, Login, Protected Routes (Supabase Auth).
- **Data Proxy**: Backend proxies requests to generic Isaac APIs, handling caching and rate limiting.
- **Favorites**: Mark items/bosses/characters as favorites (stored in Supabase).
- **Builds**: (UI Stub) Create and share builds.
- **Search**: Multi-source search via Backend.

## Testing Flows

1.  **Register**: Go to `/register`, create an account. Check `profiles` table in Supabase.
2.  **Login**: Login with the new account.
3.  **Favorites**: Go to Items/Bosses (once lists are integrated with `FavoriteButton`), click heart. Check `favorites` table or `/favorites` page.
4.  **Backend**: Visit `http://localhost:3000/health` or `http://localhost:3000/api/isaac/bosses`.

## Security

- **RLS**: Row Level Security is enabled on all tables. Users can only edit their own data.
- **Backend Security**: Rate Limiting, CORS restricted to frontend origin.
