# VERP - Deviant Ipseictic Embodiments

![Verp Logo](./frontend/public/icons/icon-512x512.png)

**VERP is a lifestyle merchandise brand designed for people who want to express their identity boldly.** We create distinctive apparel and products that help individuals stand out rather than blend in. Our mission is to empower people to wear their uniqueness with confidence.

## Table of Contents

- [Overview](#overview)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Features](#features)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Overview

VERP is a full-stack e-commerce platform built as a Progressive Web App (PWA) that allows users to browse, purchase, and track distinctive lifestyle merchandise. The platform emphasizes user authentication, personalized shopping experiences, and secure payment processing.

### Key Characteristics

- **Modern UI/UX**: Built with React 19 and styled with Tailwind CSS
- **Progressive Web App**: Works online and can be installed as an app
- **Secure Authentication**: OTP-based verification and password management
- **Real-time Data Sync**: TanStack React Query for server state management
- **Responsive Design**: Fully responsive across all devices
- **Performance Optimized**: Vite for fast development and production builds

## Technology Stack

### Frontend
- **React 19**: Modern UI library with concurrent features
- **Vite 6.0**: Lightning-fast build tool and dev server
- **React Router DOM 7.13**: Client-side routing
- **TanStack React Router 1.159**: Advanced routing
- **TanStack React Query 5.90**: Server state management & data synchronization
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **PostCSS 8.5**: CSS processing
- **Supabase JS 2.95**: Real-time database & authentication
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel component for product showcases
- **SweetAlert2**: User-friendly alert dialogs
- **bcryptjs**: Password hashing for frontend verification

### Backend
- **Node.js**: JavaScript runtime
- **Express.js 5.2**: Web framework
- **Supabase**: Backend-as-a-Service for database and authentication
- **Nodemailer**: Email service for OTP and notifications
- **bcrypt**: Password hashing (SALT_ROUNDS: 12)
- **CORS**: Cross-Origin Resource Sharing middleware
- **Rate Limiting**: Protection against abuse with multiple limiters
- **dotenv**: Environment variable management

### Database & Services
- **Supabase**: PostgreSQL database with real-time features
- **Email Service**: Nodemailer for OTP delivery and communications

### Development Tools
- **ESLint**: Code quality and style enforcement
- **Autoprefixer**: CSS vendor prefixes
- **Vite Plugin React**: React fast refresh for HMR

## Project Structure

```
Verp/
├── README.md                          # Project documentation
├── backend/                           # Express.js backend
│   ├── package.json
│   ├── server.js                      # Main server entry point
│   └── vercel.json                    # Vercel deployment config
│
└── frontend/                          # React Vite application
    ├── package.json
    ├── vite.config.js                 # Vite configuration
    ├── tailwind.config.js             # Tailwind CSS config
    ├── postcss.config.js              # PostCSS config
    ├── eslint.config.js               # ESLint config
    ├── vercel.json                    # Vercel deployment config
    ├── index.html                     # Main HTML file
    ├── public/
    │   ├── manifest.json              # PWA manifest
    │   ├── sw.js                      # Service Worker
    │   ├── icons/                     # PWA icons (72px-512px)
    │   └── screenshots/               # PWA screenshots
    └── src/
        ├── main.jsx                   # React entry point
        ├── App.jsx                    # Main App component
        ├── App.css                    # Global styles
        ├── index.css                  # Base styles
        ├── config.js                  # API configuration
        ├── assets/                    # Static assets
        ├── MercComponents/            # Application components
        │   ├── Paths.jsx              # Route definitions
        │   ├── supabaseClient.js      # Supabase client setup
        │   ├── Administration/        # Admin features
        │   ├── Assistant/             # AI/Assistant features
        │   ├── Cartoptions/           # Shopping cart components
        │   ├── Cartpages/             # Cart & checkout pages
        │   ├── Homepage/              # Landing page components
        │   ├── Messages/              # Messaging system
        │   ├── Navoptions/            # Navigation components
        │   ├── SecurityLogics/        # Authentication & security
        │   └── Shared/                # Shared/reusable components
        └── Database-Server/           # (Optional) Database client
            └── Superbase-client.js
```

## Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v16+) - [Download](https://nodejs.org/)
- **npm** (v8+) - Included with Node.js
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up](https://supabase.com/)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/verp.git
cd Verp
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

## Configuration

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Create required tables:
   - `users` - User accounts and profiles
   - `products` - Product catalog
   - `orders` - Customer orders
   - `order_items` - Line items for orders
   - `reviews` - Product reviews
   - `notifications` - User notifications
   - `messages` - Messaging system

3. Set up authentication policies and row-level security (RLS)

### Email Configuration (Nodemailer)

1. Configure your email provider (Gmail, SendGrid, etc.)
2. Update server-side email settings in environment variables

## Running the Application

### Development Mode

#### Start Backend Server

```bash
cd backend
npm start
# Server runs on http://localhost:5000
```

#### Start Frontend Dev Server

```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

#### For PWA Testing

```bash
cd frontend
npm run build
npm run preview
# Build runs on http://localhost:4173
```

### Production Build

```bash
# Frontend
cd frontend
npm run build
# Creates optimized build in dist/

# Backend is ready for deployment to Vercel or similar
```

## API Documentation

### Base URL
- Development: `http://localhost:5000`
- Production: `https://api.verpembodiments.com`

### Rate Limiting

Different endpoints have different rate limits:
- **Global**: 120 requests per 60 seconds
- **OTP Send**: 3 attempts per 10 minutes
- **OTP Verify**: 10 attempts per 10 minutes
- **Staff Login**: 10 attempts per 15 minutes
- **Password Reset**: 5 attempts per 15 minutes
- **Registration**: 5 attempts per hour

### Authentication Endpoints

#### Send OTP
```
POST /api/auth/send-otp
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### Verify OTP
```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456"
}
```

#### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "hashedPassword",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Password Reset
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "newPassword": "hashedPassword"
}
```

### Product Endpoints

#### Get All Products
```
GET /api/products
Query Parameters:
  - category: string (optional)
  - limit: number (optional, default: 20)
  - offset: number (optional, default: 0)
```

#### Get Product by ID
```
GET /api/products/:id
```

#### Search Products
```
GET /api/products/search
Query Parameters:
  - q: string (search query)
```

### Order Endpoints

#### Create Order
```
POST /api/orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "items": [
    { "productId": "123", "quantity": 2, "size": "M", "color": "black" }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "San Francisco",
    "state": "CA",
    "zip": "94105",
    "country": "USA"
  }
}
```

#### Get Order History
```
GET /api/orders
Authorization: Bearer <token>

Query Parameters:
  - status: string (optional)
  - limit: number (optional)
  - offset: number (optional)
```

#### Track Order
```
GET /api/orders/:orderId/track
Authorization: Bearer <token>
```

### Review Endpoints

#### Submit Review
```
POST /api/reviews
Content-Type: application/json
Authorization: Bearer <token>

{
  "productId": "123",
  "orderId": "456",
  "rating": 5,
  "comment": "Great product!",
  "images": ["url1", "url2"]
}
```

#### Get Product Reviews
```
GET /api/products/:productId/reviews

Query Parameters:
  - limit: number (optional)
  - offset: number (optional)
  - sort: string (optional, values: "helpful", "recent", "rating-high", "rating-low")
```

## Features

### User Features
✅ **Authentication & Security**
- OTP-based email verification
- Password hashing with bcrypt (12 rounds)
- Session management
- Password reset functionality

✅ **Shopping Experience**
- Browse products by category
- Product search and filtering
- Shopping cart management
- Wishlist/favorites
- Product reviews and ratings

✅ **Ordering & Checkout**
- Secure checkout process
- Multiple payment methods
- Order tracking
- Order history

✅ **Notifications**
- Email notifications for orders
- Real-time order updates
- Messages and communications

✅ **User Profile**
- Account management
- Address book
- Order history
- Reviews and ratings
- Settings & preferences

### Admin Features
✅ **Administration Panel**
- Product management (CRUD)
- User management
- Order management
- Dashboard analytics

✅ **Security**
- Rate limiting on all endpoints
- CORS protection
- Input validation
- SQL injection prevention (via Supabase)

### Progressive Web App (PWA)
✅ **Offline Support**
- Service Worker for offline access
- Installable as native app
- App icons and splash screens
- Fast loading times

## Environment Variables

### Backend (.env)

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Application
NODE_ENV=development
PORT=5000

# CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://verpembodiments.com

# Secrets
JWT_SECRET=your_jwt_secret_key
INTERNAL_SECRET=your_internal_secret_key
```

### Frontend (.env)

```env
# API Configuration
VITE_SERVER_URL=http://localhost:5000

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key

# Application
VITE_APP_NAME=Verp
VITE_APP_VERSION=1.0.0
```

## Deployment

### Deploy Backend to Vercel

1. Create a Vercel account and connect your GitHub repository
2. Set environment variables in Vercel Project Settings
3. Deploy:
   ```bash
   cd backend
   vercel deploy
   ```

### Deploy Frontend to Vercel

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   cd frontend
   vercel deploy
   ```

### Alternative Deployment Options

- **AWS Amplify** - Frontend
- **Heroku** - Backend (note: free tier deprecated)
- **Railway** - Backend
- **Netlify** - Frontend
- **Firebase** - Full-stack

## Development

### Adding New Features

1. Create a new component in `frontend/src/MercComponents/`
2. Add routes in `frontend/src/MercComponents/Paths.jsx`
3. Create API endpoints in `backend/server.js` if needed
4. Add database tables/columns to Supabase
5. Test thoroughly in development mode

### Code Quality

Run ESLint to check code quality:

```bash
# Frontend
cd frontend
npm run lint

# Backend (if configured)
cd backend
npm run lint
```

### State Management

- **Server State**: TanStack React Query
- **Router State**: TanStack React Router
- **Local State**: React Context API (CartContext, etc.)
- **Real-time Updates**: Supabase Real-time subscriptions

### Styling

- **Framework**: Tailwind CSS
- **Utility Classes**: Used throughout components
- **Custom CSS**: Minimal, in component-specific `.css` files
- **Responsive**: Mobile-first approach

## Performance Optimization Tips

1. **Lazy Load Routes**: Use code splitting with React Router
2. **Image Optimization**: Use next-gen formats (WebP)
3. **Bundle Analysis**: `npm run build -- --analyze`
4. **Caching**: Leverage service worker for offline support
5. **Database Queries**: Optimize Supabase queries with proper indexes

## Troubleshooting

### CORS Errors
- Ensure frontend URL is in `allowedOrigins` in backend server.js
- Check CORS configuration in environment variables

### Database Connection Issues
- Verify Supabase credentials in .env
- Check database connection string
- Ensure Supabase project is active

### OTP Not Received
- Verify email configuration in backend
- Check Supabase logs for email delivery status
- Implement email retry logic

### PWA Not Installing
- Ensure manifest.json is properly configured
- Check that icons are in public/ directory
- Ensure site is served over HTTPS in production
- Check service worker registration in sw.js

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf dist && npm run build`
- Check Node.js version compatibility

## Security Best Practices

1. **Never commit `.env` files** - Use `.env.example` instead
2. **HTTPS Only** - Always use HTTPS in production
3. **Input Validation** - Validate and sanitize all user inputs
4. **Rate Limiting** - Enabled on all authentication endpoints
5. **Password Security** - Bcrypt with 12 salt rounds
6. **CORS Protection** - Whitelist trusted origins only
7. **Row-Level Security** - Configure RLS policies in Supabase
8. **API Keys** - Use service role key only on backend, anon key on frontend

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed
- Ensure all ESLint checks pass

## Performance Metrics

- **Frontend Build Time**: ~2-3 seconds (Vite)
- **First Contentful Paint**: <1.5s (optimized)
- **Lighthouse Score**: 90+
- **Bundle Size**: ~200KB (gzipped)

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Mobile browsers: iOS Safari 12+, Chrome Android 90+

## Future Roadmap

- [ ] Advanced analytics dashboard
- [ ] AI-powered product recommendations
- [ ] Live chat support integration
- [ ] Multi-language support (i18n)
- [ ] Advanced inventory management
- [ ] Social media integration
- [ ] Subscription/membership options
- [ ] Mobile apps (React Native)

## Resources

- [React Documentation](https://react.dev)
- [Vite Guide](https://vitejs.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Express.js Guide](https://expressjs.com)
- [TanStack Query](https://tanstack.com/query)
- [TanStack Router](https://tanstack.com/router)

## Support

For questions and support:
- Email: support@verpembodiments.com
- Website: https://verpembodiments.com
- Issues: GitHub Issues

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with modern web technologies
- Powered by Supabase
- Designed for the unique individual

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Status**: Active Development

Made with ❤️ by the Verp Team
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