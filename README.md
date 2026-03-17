# Verp

Verp is a premium fashion and lifestyle store built for a high-end shopping experience. Customers browse a curated catalog of clothing and accessories, check out with secure payments, and get real support when they need it. Behind the scenes, a staff console gives the team full control over inventory, orders, promotions, and customer communication.

---

## What the store offers

- A cinematic homepage with a full-screen hero, curated category sections, and a brand story.
- A multi-category product catalog covering Boxers, Shoes, Slides, Shirts, Caps, Jewelry, Jackets, Glasses, Belts, Watches, Sneakers, Socks, Hoodies, Sweatshirts, and Bags.
- Secure checkout powered by Paystack, with choices between showroom pickup and door delivery.
- A customer support flow that starts with an automated assistant and escalates to a real team member if needed.
- A product review system — customers review orders they've received, staff moderate what goes live.
- A promotional banner system — the admin creates banners that appear between homepage sections, with optional countdowns, featured products, and flash sale strips.
- A full staff console split between an Admin dashboard and an Assistant terminal.

---

## How the project is organised

The project has two parts that work together:

- **`backend/`** — the server that handles emails, payments, and secure staff operations.
- **`frontend/`** — the customer-facing store and staff console, built as a web app.

```
Verp/
  backend/
    server.js          ← the server
    package.json
    .env               ← your private keys (never share this)
    vercel.json        ← deployment config
  frontend/
    src/
      main.jsx
      App.jsx
      config.js
      MercComponents/
        Paths.jsx          ← all page routes
        supabaseClient.js  ← database connection
    vite.config.js
    vercel.json
```

---

## What you need before starting

- **Node.js 18 or newer** — download from nodejs.org if you don't have it.
- **npm** — comes bundled with Node automatically.
- A **Supabase** project (free tier works) with the tables listed at the bottom of this file.
- A **Gmail account** set up with an App Password for sending emails.
- A **Paystack** account with your secret key (only needed for payment processing).

---

## Running the project locally

You'll need two terminal windows open at the same time — one for the server, one for the store.

### Terminal 1 — start the server

```bash
cd backend
npm install
npm start
```

The server runs at `http://localhost:5000`.

### Terminal 2 — start the store

```bash
cd frontend
npm install
npm run dev
```

The store runs at `http://localhost:5173`. During development, any request the store makes to `/api/...` is automatically forwarded to the server — you don't need to configure this.

---

## Setting up your private keys

You need two `.env` files — one for each part of the project. These hold sensitive information and should **never** be committed to GitHub.

### `frontend/.env`

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional — only needed if you're calling the server directly from the frontend
VITE_SERVER_URL=http://localhost:5000
```

If either Supabase value is missing the app will fail to start and tell you clearly.

### `backend/.env`

```bash
# Supabase — server side (this key has full database access, keep it secret)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# A secret passphrase for internal communication between the store and server
INTERNAL_SECRET=make_this_long_and_random

# Staff login credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASS=strong_password
ASSISTANT_EMAIL=assistant@example.com
ASSISTANT_PASS=strong_password

# Email sending (Gmail)
GMAIL_USER=your_gmail_address@gmail.com
GMAIL_PASS=your_gmail_app_password

# Payments
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Server port
PORT=5000
```

> ⚠️ The `SUPABASE_SERVICE_ROLE_KEY` gives unrestricted access to your database. It lives only in the backend `.env` and must never appear in the frontend or be pushed to version control.

---

## Pages in the store

### Public — anyone can visit

| Path | What it is |
|------|-----------|
| `/` | Homepage |
| `/about` | About page |
| `/categories` | All categories |
| `/category/boxers` `/category/shoes` etc. | Individual category pages |

### Account screens

| Path | What it is |
|------|-----------|
| `/login` | Sign in |
| `/signup` | Create account |
| `/verify-otp` | Email verification |
| `/forgot-password` | Request a reset |
| `/reset-password` | Set a new password |

### Logged-in customers only

| Path | What it is |
|------|-----------|
| `/cart` | Shopping cart |
| `/checkout` | Place an order |
| `/orderpage` | View orders |
| `/orderStatus` | Track a specific order |
| `/inbox` | Messages from staff |
| `/support` | Contact support |
| `/reviews` | Leave a product review |
| `/profile` | Account settings |

### Staff console

| Path | Who it's for |
|------|-------------|
| `/sys/console/login` | Staff sign-in |
| `/sys/console/admin` | Admin only |
| `/sys/console/terminal` | Assistant only |

---

## Server endpoints (for developers)

All server routes start with `/api/`.

### Customer auth & OTP

- `POST /api/send-otp` — send a one-time code by email
- `POST /api/verify-otp` — confirm the code
- `POST /api/reset-password` — set a new password
- `POST /api/register` — create a new account

### Payments

- `POST /api/verify-payment` — confirm a Paystack transaction
- `POST /api/paystack-charge` — initiate a charge

### Internal (requires `x-internal-secret` header)

- `POST /api/alert-staff` — notify the team of a new event
- `POST /api/send-email` — send a transactional email
- `POST /api/update-return-status` — update a return request

### Staff login & admin actions (requires staff credentials)

- `POST /api/staff-login`
- `GET /api/admin/return-requests`
- `POST /api/update-order-status`

### Health check

- `GET /` — returns server status and timestamp

---

## Database tables (Supabase)

These tables need to exist in your Supabase project. The app will not work without them.

| Table | Purpose |
|-------|---------|
| `verp_users` | Customer accounts, OTPs, verification status |
| `verp_products` | All products across all categories |
| `verp_orders` | Customer orders and their status |
| `verp_return_requests` | Return requests and their progress |
| `verp_ads` | Promotional banners managed from the admin panel |
| `verp_product_reviews` | Customer reviews, moderation status, and staff notes |

You'll also need a **Supabase Storage bucket** called `verp-products` for product images and ad banner images.

---

## Deploying to Vercel

The project deploys as two separate Vercel apps from the same repository.

**Backend:** `backend/vercel.json` deploys the server as a serverless Node function.

**Frontend:** `frontend/vercel.json` serves the store as a single-page app and rewrites any `/api/*` request to your deployed backend URL. Update that URL in the config if your backend address ever changes.

---

## Common problems

**"Missing Supabase environment variables!"**
You haven't created `frontend/.env` or the values are wrong. Add them and restart the dev server.

**Store can't reach the server**
Your frontend origin isn't in the server's allowed list. Open `backend/server.js`, find the origins array, and add your frontend URL.

**Emails aren't sending**
Gmail requires an App Password — your regular Gmail password won't work. Generate one in your Google account security settings, then put it in `GMAIL_PASS`.

**Payments failing**
Double-check that `PAYSTACK_SECRET_KEY` is set in `backend/.env` and that the payment reference you're verifying matches what Paystack sent back.

---

## License

Add a `LICENSE` file to the root of the `Verp/` folder if you'd like to specify usage terms.