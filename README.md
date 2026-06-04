# 🏠 RentIt — Peer-to-Peer Item Rental Platform

> A modern, full-stack peer-to-peer rental platform built with Next.js, TypeScript, and Tailwind CSS. Users can list items for rent, browse available items, chat with owners, and get AI-powered support via Gemini AI.

---

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [System Architecture](#system-architecture)
5. [Database Schema](#database-schema)
6. [Project Structure](#project-structure)
7. [Page & Route Planning](#page--route-planning)
8. [API Routes](#api-routes)
9. [Component Architecture](#component-architecture)
10. [State Management](#state-management)
11. [Authentication Flow](#authentication-flow)
12. [Item Rental Flow](#item-rental-flow)
13. [Chat System Design](#chat-system-design)
14. [AI Customer Support (Gemini)](#ai-customer-support-gemini)
15. [Image Upload Strategy](#image-upload-strategy)
16. [Environment Variables](#environment-variables)
17. [Installation & Setup](#installation--setup)
18. [Development Workflow](#development-workflow)
19. [Deployment](#deployment)
20. [Known Constraints & Decisions](#known-constraints--decisions)

---

## Project Overview

**RentIt** is a community-driven item rental platform where individuals can:

- **List items** they own and are willing to lend out for a defined period.
- **Browse and request** items listed by other users.
- **Chat directly** with item owners to negotiate rental terms, ask questions, or review item condition.
- **Get instant AI help** through a Gemini-powered support assistant.

There is **no integrated payment gateway**. All financial transactions happen in person between the renter and the owner when the item is physically handed over.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 14 (App Router) | Full-stack React framework |
| Language | TypeScript | Type safety across the entire codebase |
| Styling | Tailwind CSS + shadcn/ui | Modern, utility-first UI |
| Database | PostgreSQL (via Supabase) | Relational data storage |
| ORM | Prisma | Type-safe database access |
| Auth | NextAuth.js v5 | Session management & OAuth |
| Real-time | Supabase Realtime | Live chat and notifications |
| File Storage | Supabase Storage | Item image hosting |
| AI Support | Google Gemini API | AI customer support chatbot |
| Deployment | Vercel | Production hosting |
| Validation | Zod | Schema validation for API and forms |
| Forms | React Hook Form | Form management |

---

## Features

### Core Features

- **User Registration & Authentication** — Sign up with email/password or Google OAuth.
- **Item Listing** — Upload items with name, images, description, tags, rental price, and availability period.
- **Item Browse & Search** — Filter by tags, search by name, and sort by availability, price, or date.
- **Rental Request System** — Renters submit requests specifying their desired rental period; owners approve or decline.
- **Owner Approval Gate** — An item can only be rented if the owner has explicitly set it as available.
- **Direct Messaging / Chat** — Conversation threads between renter and owner per item listing.
- **AI Customer Support** — Gemini-powered chatbot for help with platform usage.
- **User Profiles** — Each user has a profile showing their listings and rental history.
- **Availability Toggle** — Owners can mark items as available or unavailable at any time.

### UI/UX Features

- Fully responsive (mobile-first)
- Dark mode support
- Toast notifications for all user actions
- Loading skeletons for async content
- Image preview before upload
- Tag-based filtering with multi-select
- Optimistic UI updates in chat

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        CLIENT                           │
│         Next.js App Router (React Server Components)    │
│   Pages / Layouts / Client Components / Server Actions  │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼──────────────────────────────────┐
│                    NEXT.JS SERVER                        │
│         API Routes (/api/*)  +  Server Actions           │
│              NextAuth.js Session Layer                   │
└──────┬──────────────────────────────┬───────────────────┘
       │                              │
┌──────▼──────┐               ┌───────▼────────┐
│   Prisma    │               │  Supabase SDK  │
│  (ORM)      │               │  (Realtime +   │
└──────┬──────┘               │   Storage)     │
       │                      └───────┬────────┘
┌──────▼──────────────────────────────▼────────┐
│              Supabase (PostgreSQL)             │
│   Tables: users, items, rental_requests,      │
│           conversations, messages             │
└───────────────────────────────────────────────┘

External Services:
  ┌──────────────────┐    ┌─────────────────────┐
  │  Google Gemini   │    │  Supabase Storage   │
  │  API (AI Chat)   │    │  (Item Images)      │
  └──────────────────┘    └─────────────────────┘
```

---

## Database Schema

### `users`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
name          TEXT NOT NULL
email         TEXT UNIQUE NOT NULL
email_verified TIMESTAMPTZ
image         TEXT
password_hash TEXT          -- null for OAuth users
created_at    TIMESTAMPTZ DEFAULT now()
updated_at    TIMESTAMPTZ DEFAULT now()
```

### `items`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
owner_id      UUID REFERENCES users(id) ON DELETE CASCADE
name          TEXT NOT NULL
description   TEXT NOT NULL
image_url     TEXT NOT NULL
tags          TEXT[]          -- e.g. ['electronics', 'camera']
is_available  BOOLEAN DEFAULT true
rent_per_day  NUMERIC(10, 2) NOT NULL
available_from DATE
available_until DATE
created_at    TIMESTAMPTZ DEFAULT now()
updated_at    TIMESTAMPTZ DEFAULT now()
```

### `rental_requests`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
item_id       UUID REFERENCES items(id) ON DELETE CASCADE
requester_id  UUID REFERENCES users(id) ON DELETE CASCADE
start_date    DATE NOT NULL
end_date      DATE NOT NULL
status        TEXT CHECK (status IN ('pending', 'approved', 'declined', 'returned')) DEFAULT 'pending'
note          TEXT           -- optional message from requester
created_at    TIMESTAMPTZ DEFAULT now()
updated_at    TIMESTAMPTZ DEFAULT now()
```

### `conversations`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
item_id       UUID REFERENCES items(id) ON DELETE CASCADE
owner_id      UUID REFERENCES users(id) ON DELETE CASCADE
renter_id     UUID REFERENCES users(id) ON DELETE CASCADE
created_at    TIMESTAMPTZ DEFAULT now()

UNIQUE(item_id, renter_id)  -- one conversation per item per renter
```

### `messages`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE
sender_id       UUID REFERENCES users(id) ON DELETE CASCADE
content         TEXT NOT NULL
created_at      TIMESTAMPTZ DEFAULT now()
```

### Prisma Schema Location
All models are defined in `/prisma/schema.prisma` and kept in sync with the Supabase PostgreSQL instance via `prisma db push`.

---

## Project Structure

```
rentit/
├── prisma/
│   └── schema.prisma               # Database models
├── public/
│   └── images/                     # Static assets
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── (main)/
│   │   │   ├── layout.tsx          # Shared layout with Navbar
│   │   │   ├── page.tsx            # Home / Browse items
│   │   │   ├── items/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx    # Item detail page
│   │   │   │   └── new/
│   │   │   │       └── page.tsx    # Create new listing
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx        # Owner dashboard
│   │   │   ├── profile/
│   │   │   │   └── [userId]/
│   │   │   │       └── page.tsx    # User public profile
│   │   │   ├── messages/
│   │   │   │   ├── page.tsx        # All conversations
│   │   │   │   └── [conversationId]/
│   │   │   │       └── page.tsx    # Single chat thread
│   │   │   └── requests/
│   │   │       └── page.tsx        # Rental requests (owner view)
│   │   └── api/
│   │       ├── auth/
│   │       │   └── [...nextauth]/
│   │       │       └── route.ts
│   │       ├── items/
│   │       │   ├── route.ts        # GET (list), POST (create)
│   │       │   └── [id]/
│   │       │       └── route.ts    # GET, PATCH, DELETE
│   │       ├── rental-requests/
│   │       │   ├── route.ts        # POST (create request)
│   │       │   └── [id]/
│   │       │       └── route.ts    # PATCH (approve/decline/return)
│   │       ├── conversations/
│   │       │   ├── route.ts        # GET (list), POST (create/get)
│   │       │   └── [id]/
│   │       │       └── route.ts    # GET messages
│   │       ├── messages/
│   │       │   └── route.ts        # POST (send message)
│   │       ├── upload/
│   │       │   └── route.ts        # POST (signed URL for Supabase Storage)
│   │       └── ai-support/
│   │           └── route.ts        # POST (Gemini chat)
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   ├── layout/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   ├── items/
│   │   │   ├── ItemCard.tsx
│   │   │   ├── ItemGrid.tsx
│   │   │   ├── ItemForm.tsx
│   │   │   ├── ItemDetail.tsx
│   │   │   ├── ImageUploader.tsx
│   │   │   └── TagSelector.tsx
│   │   ├── rental/
│   │   │   ├── RentalRequestForm.tsx
│   │   │   ├── RentalRequestCard.tsx
│   │   │   └── AvailabilityToggle.tsx
│   │   ├── chat/
│   │   │   ├── ConversationList.tsx
│   │   │   ├── MessageThread.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── MessageInput.tsx
│   │   ├── ai-support/
│   │   │   ├── AISupportButton.tsx  # Floating button
│   │   │   └── AISupportPanel.tsx   # Slide-over chat panel
│   │   └── common/
│   │       ├── LoadingSkeleton.tsx
│   │       ├── EmptyState.tsx
│   │       ├── UserAvatar.tsx
│   │       └── SearchBar.tsx
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── supabase.ts             # Supabase client (browser + server)
│   │   ├── auth.ts                 # NextAuth config
│   │   ├── gemini.ts               # Gemini API client
│   │   ├── validations/
│   │   │   ├── item.ts             # Zod schemas for item forms
│   │   │   ├── rental.ts           # Zod schemas for rental requests
│   │   │   └── message.ts          # Zod schemas for messages
│   │   └── utils.ts                # Shared helpers (cn, formatDate, etc.)
│   ├── hooks/
│   │   ├── useRealtimeMessages.ts  # Supabase realtime subscription
│   │   ├── useConversations.ts
│   │   └── useItemFilters.ts
│   └── types/
│       └── index.ts                # Global TypeScript types
├── .env.local                      # Environment variables (never commit)
├── .env.example                    # Template for environment variables
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

---

## Page & Route Planning

### `/` — Home / Browse Items (Public)
- Displays a grid of all available items.
- Search bar at the top to filter by name.
- Tag filter chips below the search bar (multi-select).
- Sort options: Newest, Price (Low→High), Price (High→Low).
- Each `ItemCard` shows: image, name, tags, price/day, owner avatar, availability badge.
- Clicking a card navigates to `/items/[id]`.

### `/items/[id]` — Item Detail (Public / Auth-gated for actions)
- Full item image, name, description, tags.
- Owner info with a link to their profile.
- Availability dates and price per day.
- **If authenticated and not the owner:** "Request to Rent" button opens a date-picker form.
- **If authenticated and is the owner:** Edit, Delete, and Availability Toggle controls.
- A "Message Owner" button starts or continues a conversation.
- Existing rental request status shown if the current user has already submitted one.

### `/items/new` — Create Listing (Auth required)
- Image upload with drag-and-drop preview.
- Fields: name, description, tags (multi-select with create-new), price per day, available from, available until.
- Form validated client-side with React Hook Form + Zod before submission.

### `/dashboard` — Owner Dashboard (Auth required)
- Tabs: **My Listings**, **Incoming Requests**, **Active Rentals**.
- My Listings: edit/delete/toggle availability for each item.
- Incoming Requests: approve or decline pending requests.
- Active Rentals: mark as returned.

### `/requests` — Rental Requests (Auth required)
- Shows requests the current user has made as a renter.
- Displays status: pending / approved / declined / returned.

### `/messages` — All Conversations (Auth required)
- List of all conversations for the current user (both as owner and renter).
- Shows item thumbnail, other party's name, last message preview, timestamp.

### `/messages/[conversationId]` — Chat Thread (Auth required)
- Real-time message thread using Supabase Realtime.
- Displays item context at the top (image, name).
- Message bubbles: own messages right-aligned, other party's left-aligned.
- Timestamps shown per message.
- Input bar at the bottom with send button.

### `/profile/[userId]` — User Profile (Public)
- User name, avatar, join date.
- Grid of all active listings by this user.

### `/login` and `/register` — Auth Pages
- Clean, centered card layout.
- Login: email + password, Google OAuth button, link to register.
- Register: name, email, password, confirm password, link to login.

---

## API Routes

All API routes validate the session using `getServerSession(authOptions)` where authentication is required. Responses follow a consistent `{ data, error }` shape.

### Items
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/items` | No | List items (supports `?search=`, `?tags=`, `?sort=`) |
| POST | `/api/items` | Yes | Create a new item listing |
| GET | `/api/items/[id]` | No | Get a single item by ID |
| PATCH | `/api/items/[id]` | Yes (owner) | Update item details or toggle availability |
| DELETE | `/api/items/[id]` | Yes (owner) | Delete an item |

### Rental Requests
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/rental-requests` | Yes | Get requests for the current user |
| POST | `/api/rental-requests` | Yes | Create a rental request |
| PATCH | `/api/rental-requests/[id]` | Yes (owner) | Approve, decline, or mark as returned |

### Conversations & Messages
| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/conversations` | Yes | List all conversations for current user |
| POST | `/api/conversations` | Yes | Get or create a conversation (idempotent) |
| GET | `/api/conversations/[id]` | Yes (participant) | Get conversation with messages |
| POST | `/api/messages` | Yes (participant) | Send a message to a conversation |

### Upload
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/upload` | Yes | Returns a signed Supabase Storage URL for direct client upload |

### AI Support
| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/ai-support` | No | Send a message to Gemini AI; returns AI response |

---

## Component Architecture

### `ItemCard`
```typescript
interface ItemCardProps {
  id: string;
  name: string;
  imageUrl: string;
  tags: string[];
  rentPerDay: number;
  isAvailable: boolean;
  owner: { name: string; image: string };
}
```
Renders a card with hover shadow and a colored availability badge. Clicking navigates to the detail page.

### `ItemForm`
Used for both creating and editing listings. Accepts an optional `initialData` prop. On submit, calls either `POST /api/items` or `PATCH /api/items/[id]`. Manages image upload state separately through `ImageUploader`.

### `ImageUploader`
- Accepts `onUploadComplete(url: string)` callback.
- Shows a drop zone, generates a local preview using `URL.createObjectURL`.
- On confirm, calls `POST /api/upload` to get a signed URL, then `PUT`s the file directly to Supabase Storage.
- Displays upload progress via a progress bar.

### `MessageThread`
- Uses the `useRealtimeMessages` hook to subscribe to new messages in real time.
- Renders a list of `MessageBubble` components.
- Auto-scrolls to the bottom when a new message arrives.
- Sends via `POST /api/messages` optimistically (adds the message to local state before the server confirms).

### `AISupportButton` + `AISupportPanel`
- A fixed bottom-right floating action button (the `AISupportButton`).
- Clicking opens a slide-over panel (`AISupportPanel`) from the right edge.
- Maintains local conversation history in component state (not persisted in the database).
- Sends the full history to `POST /api/ai-support` on each new user message to maintain context.

---

## State Management

This application uses **React built-in state** and **server-side data fetching** rather than a global state library. The rationale:

- Next.js App Router + Server Components handle most data-fetching at the server level.
- `useState` and `useReducer` handle local UI state (form inputs, modals, toggles).
- `useRealtimeMessages` (custom hook) uses Supabase's realtime client to manage live message state.
- No Redux or Zustand required for this scope.

For real-time chat, the pattern is:
1. Initial messages fetched server-side on page load.
2. `useRealtimeMessages` subscribes to `INSERT` events on the `messages` table filtered by `conversation_id`.
3. New messages append to local state without a full page reload.

---

## Authentication Flow

NextAuth.js v5 is used with two providers:

1. **Credentials Provider** — email and bcrypt-hashed password stored in the `users` table.
2. **Google Provider** — OAuth 2.0 via Google Cloud Console credentials.

### Session Strategy
- JWT sessions (stored in a secure cookie, not a database session).
- The JWT payload includes `{ id, name, email, image }`.
- Middleware (`middleware.ts`) at the root protects all routes under `/(main)/dashboard`, `/(main)/messages`, `/(main)/requests`, and `/(main)/items/new` by redirecting unauthenticated users to `/login`.

### Register Flow
1. User submits name, email, password.
2. `POST /api/auth/register` (custom route) hashes the password with bcrypt and creates the user via Prisma.
3. Redirects to `/login` with a success toast.

---

## Item Rental Flow

```
Renter views item (/items/[id])
        │
        ▼
Renter clicks "Request to Rent"
        │
        ▼
Date picker modal opens (start date, end date, optional note)
        │
        ▼
POST /api/rental-requests
  → Creates request with status: 'pending'
  → Creates or retrieves a conversation between renter and owner
        │
        ▼
Owner sees new request in /dashboard (Incoming Requests tab)
        │
   ┌────┴────┐
   ▼         ▼
Approve    Decline
   │
   ▼
Status → 'approved'
Item is_available remains true until owner manually
sets it to false (no automatic availability blocking;
owner manages scheduling manually)
   │
   ▼
In-person exchange happens (renter pays owner directly)
   │
   ▼
Owner marks as 'returned' in dashboard
```

**Key design decision:** Items do not automatically become unavailable when a request is approved. The owner is responsible for toggling the availability switch. This is intentional — the owner may have multiple units of an item or prefers to manage availability manually.

---

## Chat System Design

### Creating a Conversation
- Conversations are unique per `(item_id, renter_id)` pair — enforced by a database unique constraint.
- Clicking "Message Owner" on an item detail page calls `POST /api/conversations` with `{ itemId }`.
- The API either creates a new conversation or returns the existing one.
- The user is then navigated to `/messages/[conversationId]`.

### Real-time Messaging
```typescript
// hooks/useRealtimeMessages.ts
const useRealtimeMessages = (conversationId: string, initialMessages: Message[]) => {
  const [messages, setMessages] = useState(initialMessages);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  return messages;
};
```

Messages sent by the current user are added optimistically and confirmed once the server responds.

---

## AI Customer Support (Gemini)

The floating AI Support button is available on every page. It opens a slide-over panel that connects to the Gemini API via the backend.

### System Prompt
The backend route sets a system prompt to scope the AI's knowledge:

```
You are a helpful customer support assistant for RentIt, a peer-to-peer item rental platform.
You help users with questions about:
- How to list an item for rent
- How to request to rent an item
- How the approval and return process works
- How to use the chat feature
- How payments work (in-person only, no online payment)
- Account and profile questions
Be concise, friendly, and only answer questions related to the RentIt platform.
If asked about unrelated topics, politely redirect to RentIt-related questions.
```

### API Route Implementation

```typescript
// app/api/ai-support/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  const { messages } = await req.json();
  // messages: Array<{ role: 'user' | 'model'; parts: string }>

  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: SYSTEM_PROMPT,
  });

  const chat = model.startChat({ history: messages.slice(0, -1) });
  const result = await chat.sendMessage(messages.at(-1).parts);
  const text = result.response.text();

  return Response.json({ reply: text });
}
```

### Frontend State
The conversation history is kept entirely in component state (not persisted to the database). Each message is appended as the user/model turns, and the full history is sent with every request to maintain context.

---

## Image Upload Strategy

Direct-to-storage upload (client → Supabase Storage) is used to avoid routing large binary files through the Next.js server.

### Flow
1. User selects or drops an image in `ImageUploader`.
2. Client calls `POST /api/upload` with `{ filename, contentType }`.
3. The server validates the session and generates a **signed upload URL** using the Supabase Admin SDK.
4. The client uses `fetch` to `PUT` the file directly to the signed URL.
5. On success, the client receives the **public URL** and stores it in form state.
6. The public URL is submitted as part of the item creation form.

### Storage Rules (Supabase)
- Bucket: `item-images` (public read, authenticated write)
- Files are namespaced by user ID: `{userId}/{timestamp}-{filename}`
- Max file size: 5 MB
- Allowed types: `image/jpeg`, `image/png`, `image/webp`

---

## Environment Variables

Create a `.env.local` file at the root. Never commit this file.

```bash
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret-here"  # generate with: openssl rand -base64 32

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT_REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Gemini AI
GEMINI_API_KEY="your-gemini-api-key"
```

See `.env.example` for a template with descriptions.

---

## Installation & Setup

### Prerequisites
- Node.js 18.17 or later
- npm 9+ or pnpm
- A Supabase account and project
- A Google Cloud project with OAuth 2.0 credentials
- A Google AI Studio account for the Gemini API key

### Step-by-Step

```bash
# 1. Clone the repository
git clone https://github.com/your-username/rentit.git
cd rentit

# 2. Install dependencies
npm install

# 3. Copy environment variable template
cp .env.example .env.local
# Fill in all values in .env.local

# 4. Push the database schema to Supabase
npx prisma db push

# 5. (Optional) Seed the database with sample data
npx prisma db seed

# 6. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Supabase Setup Checklist
- [ ] Create a new Supabase project.
- [ ] Copy the Project URL and anon key to `.env.local`.
- [ ] Copy the Service Role key (kept server-side only) to `.env.local`.
- [ ] Create a storage bucket named `item-images` and set it to **public**.
- [ ] Enable the **Realtime** feature on the `messages` table in the Supabase dashboard (Table Editor → Realtime toggle).
- [ ] Run `npx prisma db push` to create all tables.

### Google OAuth Setup Checklist
- [ ] Create a project in [Google Cloud Console](https://console.cloud.google.com).
- [ ] Enable the **Google+ API** (or **Google Identity** API).
- [ ] Create OAuth 2.0 credentials (Web Application type).
- [ ] Add `http://localhost:3000/api/auth/callback/google` to Authorized Redirect URIs (add your production URL too).
- [ ] Copy Client ID and Secret to `.env.local`.

---

## Development Workflow

```bash
# Development
npm run dev          # Start dev server with hot reload on port 3000

# Type checking
npm run type-check   # Run tsc --noEmit to check for TypeScript errors

# Linting
npm run lint         # Run ESLint

# Database
npx prisma studio    # Open Prisma Studio GUI to inspect data
npx prisma db push   # Push schema changes to database
npx prisma generate  # Regenerate Prisma client after schema changes

# Build
npm run build        # Production build
npm run start        # Start production server locally
```

### Recommended VS Code Extensions
- Prisma (syntax highlighting for `.prisma` files)
- Tailwind CSS IntelliSense
- ESLint
- TypeScript and JavaScript Language Features (built-in)

---

## Deployment

### Vercel (Recommended)

1. Push the repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Add all environment variables from `.env.local` in the Vercel project settings.
4. Update `NEXTAUTH_URL` to your production URL (e.g., `https://rentit.vercel.app`).
5. Add the production callback URL to Google OAuth in Google Cloud Console.
6. Deploy. Vercel automatically runs `npm run build` on each push to `main`.

### Post-Deployment
- Verify Supabase Realtime is working by opening two browsers and sending a chat message.
- Verify image uploads succeed by creating a test listing.
- Verify the Gemini AI support chat responds correctly.

---

## Known Constraints & Decisions

| Decision | Reasoning |
|---|---|
| No payment integration | Out of scope; transactions are handled in person |
| No automatic availability blocking | Owners may have multiple units; manual control is simpler and more flexible |
| JWT sessions (not database sessions) | Simpler setup, no session table needed, scales better |
| Supabase as both database and realtime | Eliminates need for a separate WebSocket server (e.g., Socket.io) |
| AI chat history not persisted | Support conversations are transient; persisting them would require more schema and UI complexity without clear benefit |
| Single image per listing | Keeps upload logic simple; multi-image can be added later by changing `image_url TEXT` to `image_urls TEXT[]` |
| Gemini Flash model | Cost-effective for support chat; can be upgraded to Gemini Pro for higher accuracy if needed |
| Zod validation on both client and server | Client-side for fast UX feedback; server-side as the authoritative check (never trust the client alone) |

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`.
3. Commit your changes: `git commit -m 'feat: add your feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Open a pull request against `main`.

Use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## License

MIT License. See `LICENSE` for details.
