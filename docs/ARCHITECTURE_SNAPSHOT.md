# 📚 TBOI Codex - Architecture Snapshot

> **Date:** Generated automatically before major refactor
> **Purpose:** Document current state to ensure zero regressions during refactoring

---

## 🏗️ Project Structure Overview

```
tboi/
├── frontend/                # React + Vite application
├── backend/                 # Express.js API server
├── docs/                    # Documentation (NEW)
├── scripts/                 # ⚠️ One-time scripts (TO DELETE)
├── sprites/                 # Asset folders for images
├── supabase/                # Supabase edge functions
└── [root files]             # ⚠️ Many unused extraction scripts (TO DELETE)
```

---

## 🎨 Frontend Architecture

### Tech Stack
- **Framework:** React 19.0.0
- **Build Tool:** Vite 6.2.0
- **Styling:** Tailwind CSS 3.4.17 + Custom Design Tokens
- **State Management:** React Query (TanStack Query) 5.90.17
- **Animation:** Framer Motion 12.27.0
- **Routing:** React Router DOM 7.2.0
- **Internationalization:** i18next 25.2.1

### Directory Structure
```
frontend/src/
├── app/                     # Empty - reserved for app config
├── assets/                  # Static assets
├── components/              # Reusable UI components
│   ├── account/             # User account components
│   ├── achivements/         # Achievement display (note: typo in folder name)
│   ├── banner/              # Banner components
│   ├── character/           # Character-related components
│   ├── header/              # App header + navigation
│   ├── home/                # Homepage sections
│   ├── items/               # Item display components
│   ├── layout/              # Layout wrappers (AppLayout, Footer)
│   ├── LoginLayout/         # Login page components
│   ├── logo/                # Logo component
│   ├── mapa/                # Map display
│   ├── navbar/              # Navigation bar
│   ├── parser/              # Item text parser
│   ├── rss-feed/            # RSS feed display
│   └── ui/                  # Generic UI primitives
├── contexts/                # React Context providers
│   └── AuthContext.jsx      # Authentication state
├── features/                # Feature-specific hooks/logic
│   ├── bosses/              # Boss-related hooks
│   ├── builds/              # Build-related hooks
│   ├── characters/          # Character hooks
│   ├── favorites/           # Favorites functionality
│   └── items/               # Items hooks
├── hooks/                   # Global custom hooks
│   ├── useAdmin.js          # Admin functionality
│   └── useAuth.js           # Authentication hook
├── lib/                     # Utilities and clients
│   ├── api.js               # API helper functions
│   ├── supabaseClient.js    # Supabase initialization
│   └── utils.js             # General utilities
├── locales/                 # Translation files
├── pages/                   # Route page components
│   ├── account/             # Account pages
│   ├── admin/               # Admin panel pages
│   ├── auth/                # Authentication pages
│   ├── bosses/              # Boss pages
│   ├── builds/              # Build pages
│   ├── characters/          # Character pages
│   ├── comments/            # Comment pages
│   ├── favorites/           # Favorites pages
│   ├── home/                # Homepage
│   ├── items/               # Items pages
│   └── rss/                 # RSS pages
├── services/                # Data services
│   ├── achievementsData.js  # Achievements data
│   ├── admin.js             # Admin API calls
│   ├── authService.js       # Auth API calls
│   ├── itemsData.js         # Items data
│   └── updates.js           # Updates service
├── styles/                  # Global styles
│   ├── globals.css          # Global CSS
│   └── tokens.css           # Design tokens
├── App.jsx                  # Main App component
├── i18n.js                  # i18n configuration
└── main.jsx                 # Entry point
```

### Design System Tokens
Located in `frontend/src/styles/tokens.css`:
- `--bg-floor`: Main background color
- `--bg-paper`: Paper/card background
- `--accent-blood`: Red accent color
- `--accent-gold`: Gold/yellow accent
- `--text-ink`: Primary text color

### Key Components

#### AppLayout (layout/AppLayout.jsx)
- Main layout wrapper with torn paper effect
- Contains Header, Footer, and page content
- DustParticles background effect
- Clip-path for torn edges

#### Header (header/Header.jsx)
- Hamburger menu for mobile
- Desktop navigation
- Logo and user menu

#### GameCharacterCarousel (character/GameCharacterCarousel.jsx)
- Game-style character selection
- 3-card display (prev, current, next)
- Keyboard navigation
- Framer Motion animations

---

## ⚙️ Backend Architecture

### Tech Stack
- **Runtime:** Node.js
- **Framework:** Express 4.22.1
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth + JWT

### Directory Structure
```
backend/src/
├── lib/
│   └── supabaseAdmin.js     # Supabase admin client
├── middleware/
│   ├── authMiddleware.js    # JWT verification
│   └── rateLimiter.js       # Rate limiting
├── routes/
│   ├── admin-items.js       # Admin item management
│   ├── auth-admin.js        # Admin authentication
│   ├── bosses.js            # Boss API endpoints
│   ├── items.js             # Items API endpoints
│   └── search.js            # Search functionality
└── server.js                # Express server setup
```

---

## 🗄️ Database Schema (Supabase)

### Main Tables
- `items` - Game items (id, name, description, type, quality, etc.)
- `bosses` - Boss information
- `characters` - Playable characters
- `users` - User accounts
- `favorites` - User favorites
- `builds` - User builds

---

## 📦 Dependencies Summary

### Frontend (package.json)
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "react-router-dom": "^7.2.0",
  "@tanstack/react-query": "^5.90.17",
  "framer-motion": "^12.27.0",
  "@supabase/supabase-js": "^2.90.1",
  "tailwindcss": "^3.4.17",
  "i18next": "^25.2.1",
  "react-icons": "^5.5.0"
}
```

### Backend (package.json)
```json
{
  "express": "^4.22.1",
  "@supabase/supabase-js": "^2.90.1",
  "cors": "^2.8.5",
  "dotenv": "^16.5.0",
  "express-rate-limit": "^7.5.0"
}
```

---

## ⚠️ Files Identified for Deletion

### Root Directory (One-time extraction scripts)
- `ADDITIONAL_QUALITY_WIKI_EXTRACTED.js`
- `analyze_extracted_items.js`
- `compare_items.js`
- `COMPLETE_TBOI_ITEMS_EXTRACTED.js`
- `COMPLETE_TBOI_QUALITY_EXTRACTED.js`
- `extract_all_items_tboi.js`
- `fix_characters_images.js`
- `items_ab_plus.lua`
- `items_base.lua`
- `items_rep.lua`
- `items_temp.json`
- `MASSIVE_QUALITY_DATABASE.js`
- `NEW_ITEMS_TO_ADD.js`
- `OFFICIAL_QUALITY_VALUES.js`
- `REPENTANCE_HIGHLIGHTS.js`
- `*.sql` files (supabase_*.sql)
- `EXTRACTION_REPORT.md`
- `ITEMS_*.md` reports
- `REPORTE_FINAL_VERIFICACION.md`
- `SETUP_ADMIN.md`

### scripts/ Directory (23 one-time scripts)
All files - database manipulation scripts no longer needed

### backend/scripts/ Directory (85+ scripts)
All files - database seeders and fixers no longer needed

### backend/data/ Directory
All backup JSON files (items.seed.BACKUP_*.json)

---

## 🎯 Current Features

1. **Items Codex** - Browse all TBOI items with filters
2. **Characters** - View all characters with game-style carousel
3. **Bosses** - Boss information
4. **Builds** - User build sharing
5. **Favorites** - Save favorite items
6. **User Accounts** - Authentication via Supabase
7. **Admin Panel** - Item management
8. **i18n** - Multi-language support
9. **Responsive Design** - Mobile hamburger menu

---

## 🔧 NPM Scripts

### Root (Monorepo)
- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start frontend only
- `npm run dev:backend` - Start backend only

### Frontend
- `npm run dev` - Vite dev server
- `npm run build` - Production build
- `npm run preview` - Preview build

### Backend
- `npm run dev` - Nodemon dev server
- `npm start` - Production server

---

## ✅ Verification Checklist

Before completing refactor, verify:
- [ ] Torn paper effect visible on header/footer
- [ ] Mobile hamburger menu works
- [ ] Character carousel matches game
- [ ] All pages load correctly
- [ ] Items display with filters
- [ ] User authentication works
- [ ] Admin panel accessible
- [ ] Build/production works
