# Verp — The Verp

A full-stack e-commerce and client-support platform (“Verp”) with OTP-based authentication, Paystack payments, live assistant/admin chat, and staff dashboards. Built with React (Vite) and Node.js (Express), backed by Supabase.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)
- [Running Locally](#running-locally)
- [Backend API](#backend-api)
- [Frontend Routes & Features](#frontend-routes--features)
- [Database (Supabase)](#database-supabase)
- [Security](#security)
- [Deployment](#deployment)
- [Scripts Reference](#scripts-reference)

---

## Overview

**Verp** is a modern e-commerce and support system that includes:

- **Customer-facing store**: Product categories (shirts, shoes, hoodies, jewelry, etc.), cart, checkout, and order tracking.
- **OTP-based auth**: Email one-time codes for login, signup, and password reset (no traditional passwords for verification step).
- **Paystack integration**: Payments in GHS with server-side verification and charge calculation.
- **Live support**: Client chat with optional escalation to assistant and admin.
- **Staff roles**: **Admin** (full dashboard, return requests, broadcasts, assistant inbox) and **Assistant** (terminal for live chat, queue, orders).
- **Email notifications**: OTP delivery and staff alerts (new chat, escalation, new order, broadcast confirmation) via Gmail SMTP with branded “Vault” HTML templates.

The backend exposes a single Express app with rate limiting, CORS, and internal/admin guards; the frontend is a React SPA with route guards and optional Vite proxy to the API.

---

## Tech Stack

| Layer      | Technologies |
|-----------|--------------|
| **Frontend** | React 19, Vite 6, React Router 7, TanStack Query & Router, Tailwind CSS, Lucide React, SweetAlert2, Embla Carousel |
| **Backend**  | Node.js, Express 5, Supabase (PostgreSQL + JS client), Nodemailer (Gmail SMTP), bcrypt, express-rate-limit |
| **Payments** | Paystack (GHS) |
| **Auth**     | Custom OTP flow + bcrypt password hashes, staff login via env credentials |
| **Deploy**   | Vercel (backend + frontend) |

---

## Project Structure

```
Verp/
├── backend/
│   ├── server.js          # Express app: auth, OTP, Paystack, alerts, admin API
│   ├── package.json
│   ├── .env                # Not committed; see Environment Variables
│   ├── .gitignore
│   └── vercel.json         # Vercel serverless config for API
├── frontend/
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── config.js       # API base URL (VITE_SERVER_URL)
│   │   ├── MercComponents/
│   │   │   ├── Paths.jsx             # Route definitions, guards, ScrollToTop, CartProvider
│   │   │   ├── supabaseClient.js     # Supabase client (if used from frontend)
│   │   │   ├── Homepage/             # Homepage.jsx, Navbar.jsx, Footer.jsx, FloatingSupport.jsx, AllCategoriesPage.jsx
│   │   │   ├── Cartoptions/          # CartContext.jsx, Cart.jsx
│   │   │   ├── Cartpages/            # CategoryTemplate.jsx, Checkout.jsx; category pages: BoxerPage, ShoePages, ShirtPage, SlidesPage, CapPage, HoodiePage, SweatshirtPage, BagPage, Sockspage, WatchesPage, SneakersPage, JewelryPage, JacketPages, GlassesPage, BeltsPage
│   │   │   ├── Navoptions/           # OrderPage.jsx (orders), StatusTracker.jsx, About.jsx, Reviews.jsx, Support.jsx
│   │   │   ├── Messages/             # SupportPage.jsx, LiveAssistantChat.jsx, ChatBot.jsx
│   │   │   ├── SecurityLogics/       # AuthPage.jsx, StaffLogin.jsx, ProfilePages.jsx, NotFoundPage.jsx, PremiumLoader.jsx, PremiumLoader2.jsx, PremmiumLoader3.jsx, RandomLoader.jsx
│   │   │   ├── Administration/       # AdminDashBoard.jsx, InboxPage.jsx, AddProduct.jsx, ClientMessages.jsx
│   │   │   └── Assistant/            # AssistantTerminal.jsx, InboxTabs.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js      # React plugin, /api proxy to backend
│   ├── tailwind.config.js
│   ├── package.json
│   └── vercel.json         # Rewrites: /api → backend; SPA fallback
└── README.md               # This file
```

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (or yarn/pnpm)
- **Supabase** project ([supabase.com](https://supabase.com))
- **Gmail** account (for SMTP; App Password recommended)
- **Paystack** account (for GHS payments)
- **Vercel** account (optional; for deployment)

---

## Environment Variables

### Backend (`backend/.env`)

Create `backend/.env` with:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only; never expose to frontend) |
| `GMAIL_USER` | Gmail address used as sender (e.g. `your-app@gmail.com`) |
| `GMAIL_PASS` | Gmail App Password (not main account password) |
| `ADMIN_EMAIL` | Admin staff login email |
| `ADMIN_PASS` | Admin staff login password |
| `ASSISTANT_EMAIL` | (Optional) Assistant staff email |
| `ASSISTANT_PASS` | (Optional) Assistant staff password |
| `PAYSTACK_SECRET_KEY` | Paystack secret key for server-side verification |
| `INTERNAL_SECRET` | Shared secret for `/api/alert-staff` (e.g. `verpvault2026secretkey`) |
| `PORT` | Server port (default `5000`) |

Startup logs print which of these are set (values are not printed).

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SERVER_URL` | Backend base URL (e.g. `http://localhost:5000` for dev, or `https://verps-sever.vercel.app` for prod) |
| `VITE_INTERNAL_SECRET` | Same value as backend `INTERNAL_SECRET` (used in `x-internal-secret` for alert-staff calls) |
| `VITE_SUPABASE_URL` | Supabase project URL (if used from frontend) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon key (if used from frontend) |

---

## Installation & Setup

1. **Clone and enter the project**
   ```bash
   cd Verp
   ```

2. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # if you have one; otherwise create .env from the table above
   # Edit .env with your Supabase, Gmail, Paystack, and admin/assistant credentials
   ```

3. **Frontend**
   ```bash
   cd ../frontend
   npm install
   # Create .env with VITE_SERVER_URL (and optionally VITE_INTERNAL_SECRET, Supabase vars)
   ```

4. **Supabase**
   - Create tables and RLS policies as required by the app (e.g. `verp_users`, `verp_return_requests`).
   - For OTP rate limiting, ensure these columns exist on `verp_users`:
     ```sql
     ALTER TABLE verp_users ADD COLUMN IF NOT EXISTS otp_attempts    integer     DEFAULT 0;
     ALTER TABLE verp_users ADD COLUMN IF NOT EXISTS otp_last_sent   timestamptz;
     ALTER TABLE verp_users ADD COLUMN IF NOT EXISTS otp_send_count  integer     DEFAULT 0;
     ALTER TABLE verp_users ADD COLUMN IF NOT EXISTS otp_locked_until timestamptz;
     ```

---

## Running Locally

1. **Start the backend**
   ```bash
   cd backend
   npm start
   ```
   Server runs at `http://localhost:5000` (or your `PORT`). Root `GET /` returns a health JSON.

2. **Start the frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   App runs at `http://localhost:5173`. Vite proxies `/api/*` to `http://localhost:5000`, so set `VITE_SERVER_URL` to `http://localhost:5000` or leave unset to use the proxy.

3. **Staff login**
   - Admin: `http://localhost:5173/sys/console/login` → use `ADMIN_EMAIL` / `ADMIN_PASS`.
   - Assistant: same URL with `ASSISTANT_EMAIL` / `ASSISTANT_PASS` (if configured).

---

## Backend API

Base URL: `http://localhost:5000` (dev) or your backend deployment (e.g. `https://verps-sever.vercel.app`).

| Method | Endpoint | Protection | Description |
|--------|----------|------------|-------------|
| GET | `/` | — | Health check; returns `{ status, server, time }`. |
| POST | `/api/staff-login` | `staffLoginLimiter` (10/15 min) | Body: `{ email, password }`. Returns `{ success, role, message }` (role: `admin` or `assistant`). |
| POST | `/api/send-otp` | `otpSendLimiter` (3/10 min) + DB cooldown/lock | Body: `{ email, type? }`. Sends 6-digit OTP email; stores in `verp_users` with expiry and rate-limit fields. |
| POST | `/api/verify-otp` | `otpVerifyLimiter` (10/10 min) + 5 attempts/user | Body: `{ email, otp }`. Verifies OTP and resets attempt counter. |
| POST | `/api/reset-password` | `resetLimiter` (5/15 min) | Body: `{ email, password }`. Requires valid recent OTP session; hashes password and clears OTP. |
| POST | `/api/verify-payment` | — | Body: `{ reference, expectedEmail?, expectedAmount? }`. Verifies with Paystack and optionally checks email/amount. |
| POST | `/api/paystack-charge` | — | Body: `{ amountGHS }`. Returns `chargeGHS`, `feeGHS`, `chargePesewas` (1.95% fee formula). |
| POST | `/api/alert-staff` | `requireInternalSecret` | Body: `type`, `clientId`, `note`, etc. Sends staff notification emails (new chat, escalation, new order, broadcast, etc.). Requires header `x-internal-secret`. |
| GET | `/api/admin/return-requests` | `requireAdminHeader` | Returns list of return requests. Auth: `Authorization: Basic base64(ADMIN_EMAIL:ADMIN_PASS)`. |
| POST | `/api/update-order-status` | `requireAdminHeader` | Body: `{ orderId, status }`. Valid `status`: `ordered`, `pending`, `processing`, `shipped`, `delivered`, `returned`, `cancelled`. Sets `delivered_at` when status is `delivered`. Auth: `Authorization: Basic base64(ADMIN_EMAIL:ADMIN_PASS)`. |

All relevant routes are also behind a **global rate limiter** (120 requests per IP per minute).

---

## Frontend Routes & Features

- **Public**: `/`, `/about`, `/categories`, `/reviews`, and category pages (see below).
- **Auth (guest only)**: `/login`, `/signup`, `/verify-otp`, `/forgot-password`, `/reset-password`, `/loading` (RandomLoader).
- **Staff**: `/sys/console/login`, `/sys/console/admin` (admin only), `/sys/console/terminal` (assistant only).
- **Protected (logged-in user)**: `/orderpage`, `/cart`, `/checkout`, `/orderStatus`, `/inbox`, `/support`, `/reviews`, `/profile`.
- **Support**: `/support` — support page with live chat; **FloatingSupport** widget appears on other pages when logged in (except homepage, support, auth, and staff routes).
- **Category routes** (each has its own page component): `/category/boxers`, `/category/shoes`, `/category/slides`, `/category/shirts`, `/category/caps`, `/category/jewelry`, `/category/jackets`, `/category/glasses`, `/category/Belts`, `/category/watches`, `/category/sneakers`, `/category/socks`, `/category/hoodies`, `/category/sweatshirts`, `/category/bags`.
- **404**: Unknown paths render `NotFoundPage`.

Route guards: `ProtectedRoute` (redirects to `/login` if no `userEmail` in localStorage), `StaffAdminRoute`, `StaffAssistantRoute`, `GuestRoute` for auth pages. Shell (Navbar + Footer) and floating support visibility are toggled by route.

---

## Database (Supabase)

The backend expects at least:

- **`verp_users`**: User accounts; columns include `email`, `password_hash`, `otp_code`, `otp_expiry`, `otp_attempts`, `otp_last_sent`, `otp_send_count`, `otp_locked_until` (see server comments and migration above).
- **`verp_return_requests`**: Return requests listed in the admin “return requests” API.
- **`verp_orders`**: Orders; used by `POST /api/update-order-status`. Columns include `id`, `status`, `delivered_at` (set when status becomes `delivered`). Valid statuses: `ordered`, `pending`, `processing`, `shipped`, `delivered`, `returned`, `cancelled`.

Other tables may be used by the frontend (e.g. products, messages) via Supabase client; configure RLS and schema to match the app.

---

## Security

- **Rate limiting**: Global (120 req/min), OTP send (3/10 min), OTP verify (10/10 min), staff login (10/15 min), password reset (5/15 min).
- **OTP**: 6-digit code, 10-minute expiry; per-user 60s cooldown, max 3 sends per 10 min, 30-minute lock after exceeding; max 5 failed verify attempts before requiring a new code.
- **Staff**: Admin endpoints use `Authorization: Basic` (never credentials in URL). Alert-staff uses `x-internal-secret`; keep `INTERNAL_SECRET` and `VITE_INTERNAL_SECRET` in sync and private.
- **Paystack**: Server-side verification; optional `expectedEmail` and `expectedAmount` to prevent replay or spoofing.
- **CORS**: Allowed origins are explicit (e.g. localhost:3000, 5173, 5000, and production frontend URL).

---

## Deployment

- **Backend**: Deploy `backend/` to Vercel with `vercel.json` that builds `server.js` via `@vercel/node` and routes `/(.*)` to it. Set all backend env vars in the Vercel project. The server sets `trust proxy` to `1` so rate limiting works correctly behind Vercel’s reverse proxy.
- **Frontend**: Deploy `frontend/` to Vercel with `vercel.json` that rewrites `/api/*` to the backend URL and `/(.*)` to `/index.html` for SPA routing. Set `VITE_SERVER_URL` (and other `VITE_*`) in the frontend project.
- Production frontend URL is in backend CORS `allowedOrigins` (e.g. `https://verps-chi.vercel.app`); add or change as needed in `server.js`.

---

## Scripts Reference

**Backend**
- `npm start` — run `node server.js` (production).
- For development with auto-restart you can use `nodemon server.js` if installed.

**Frontend**
- `npm run dev` — Vite dev server (default port 5173).
- `npm run build` — production build.
- `npm run preview` — preview production build locally.

---

## License

ISC (see `backend/package.json`). Use and modify as needed for your project.
