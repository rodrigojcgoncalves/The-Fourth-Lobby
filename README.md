# The Fourth Lobby

Event ticketing and management platform for electronic music events, built as a final course project. The system supports the full lifecycle of an event — from creation and ticket sales to attendee check-in and financial tracking.

---

## Architecture Overview

The project follows a client-server architecture with a React SPA on the frontend and a custom Node.js/Express API on the backend. Both communicate with a Supabase (PostgreSQL) database. Authentication is handled via JWT tokens issued by the backend, not the Supabase client directly, allowing for fine-grained role-based access control.

```
Frontend (React/Vite) → REST API (Node.js/Express) → Supabase (PostgreSQL)
```

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 + TypeScript | UI framework |
| Vite | Build tool and dev server |
| React Router v6 | Client-side routing |
| Zustand | Global state management |
| qrcode.react | QR code generation for tickets |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API server |
| Supabase JS SDK | Database client (PostgreSQL) |
| Supabase Storage | Image file uploads |
| JSON Web Tokens | Authentication |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with the appropriate tables and storage buckets configured

### 1. Install dependencies

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 2. Configure environment variables

**Frontend** — create `.env` in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend** — create `.env` inside the `/backend` directory:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret
PORT=5000
```

> The backend uses the service role key to bypass Supabase RLS where needed. Keep it secret and never expose it on the frontend.

### 3. Run the development servers

```bash
# Start the frontend (port 5173)
npm run dev

# Start the backend (port 5000)
cd backend
node server.js
```

---

## Project Structure

```
the-fourth-lobby/
├── backend/
│   ├── middleware/
│   │   └── auth.js            # JWT verification, role enforcement
│   ├── routes/
│   │   ├── auth.js            # Login, register
│   │   ├── events.js          # Event CRUD + image upload
│   │   ├── artists.js         # Artist management
│   │   ├── tickets.js         # Ticket purchase and validation
│   │   ├── expenses.js        # Event expense tracking
│   │   ├── orders.js          # Order management
│   │   └── organizer.js       # Organizer-specific statistics
│   └── server.js
├── src/
│   ├── components/
│   │   └── layout/            # Header, OrganizerLayout (sidebar)
│   ├── pages/                 # One file per route/view
│   ├── services/              # API communication layer
│   ├── store/                 # Zustand global state (auth)
│   ├── types/                 # Shared TypeScript interfaces
│   └── index.css              # Global design system (CSS variables)
└── public/
    └── img/                   # Static brand assets
```

---

## User Roles

Access control is enforced on the backend via middleware. Three roles are supported:

| Role | Permissions |
|---|---|
| `customer` | Browse events, purchase tickets, view own tickets |
| `promoter` | View sales metrics for events they are linked to |
| `organizer` | Full event management, artist management, expense tracking, statistics |

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Authenticate, receive JWT |
| GET | `/api/events` | — | List published events |
| POST | `/api/events` | Organizer | Create event |
| POST | `/api/events/:id/upload-image` | Organizer | Upload event cover |
| GET | `/api/tickets/my` | Customer | Fetch own tickets |
| POST | `/api/tickets/purchase` | Customer | Purchase a ticket |
| GET | `/api/expenses/event/:id` | Organizer | List expenses for event |
| POST | `/api/expenses/event/:id` | Organizer | Add expense |
| PATCH | `/api/expenses/:id/toggle-paid` | Organizer | Toggle paid/pending status |
| DELETE | `/api/expenses/:id` | Organizer | Delete expense |

---

## Supabase Storage

Images are stored in the `event-images` bucket, organised into subfolders:

- `event-images/events/` — event cover photos
- `event-images/artists/` — artist profile photos

---

## Notes

- This project was developed as a final course project (Projeto Final de Curso) for a web development programme.
- The codebase evolved from an early static HTML/CSS/JS prototype into a full SPA. The original prototype is archived in `_old_prototype/` for reference.
- There is no production deployment currently configured. All services run locally during development.
