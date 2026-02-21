# VERP - E-Commerce Platform

A full-stack **VERP** e-commerce platform built with **React**, **Vite**, **Node.js/Express**, **Supabase**, and **TailwindCSS**. Features admin dashboard, order tracking, chat support, and product management.

---

## 📁 Project Structure

```
Verp/
├── backend/                          # Node.js/Express API Server
│   ├── server.js                     # Main Express server with email & admin endpoints
│   ├── package.json                  # Backend dependencies
│   ├── vercel.json                   # Vercel deployment config for backend
│   ├── .env                          # Environment variables (GMAIL_USER, GMAIL_PASS, admin/assistant passwords)
│   └── node_modules/                 # Installed backend dependencies
│
├── frontend/                         # React + Vite frontend application
│   ├── src/
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # React entry point
│   │   ├── App.css                   # Global app styles
│   │   ├── index.css                 # Global index styles
│   │   │
│   │   ├── MercComponents/           # Core application components
│   │   │   ├── Paths.jsx             # Main routing configuration (React Router)
│   │   │   ├── supabaseClient.js     # Supabase database client
│   │   │   │
│   │   │   ├── Homepage/             # Landing page & main store pages
│   │   │   │   ├── Homepage.jsx      # Main homepage component
│   │   │   │   ├── Hero.jsx          # Hero section with marketing visuals
│   │   │   │   ├── Navbar.jsx        # Navigation bar with cart & user menu
│   │   │   │   ├── Footer.jsx        # Footer with links & info
│   │   │   │   ├── AllCategoriesPage.jsx # Browse all product categories
│   │   │   │   ├── CategoriesGrid.jsx    # Category grid display
│   │   │   │   ├── Bestsellers.jsx   # Best-selling products section
│   │   │   │   ├── BrandNarrative.jsx   # Brand story/info
│   │   │   │   ├── Newsletter.jsx    # Email newsletter signup
│   │   │   │   └── SearchOverlay.jsx # Search functionality overlay
│   │   │   │
│   │   │   ├── Cartpages/            # Product detail & shopping cart pages
│   │   │   │   ├── Checkout.jsx      # Checkout/payment page
│   │   │   │   ├── CategoryTemplate.jsx # Template for category pages
│   │   │   │   ├── BoxerPage.jsx     # Boxer shorts category
│   │   │   │   ├── ShirtPage.jsx     # T-shirt category
│   │   │   │   ├── ShoePages.jsx     # Shoes category
│   │   │   │   ├── SlidesPage.jsx    # Slides category
│   │   │   │   ├── CapPage.jsx       # Caps category
│   │   │   │   ├── HoodiePage.jsx    # Hoodies category
│   │   │   │   ├── SweatshirtPage.jsx # Sweatshirts category
│   │   │   │   └── BagPage.jsx       # Bags category
│   │   │   │
│   │   │   ├── Cartoptions/          # Shopping cart logic & context
│   │   │   │   ├── Cart.jsx          # Cart display component
│   │   │   │   └── CartContext.jsx   # Cart state management (React Context)
│   │   │   │
│   │   │   ├── Administration/       # Admin dashboard & management
│   │   │   │   ├── AdminDashBoard.jsx # Main admin dashboard
│   │   │   │   ├── AdminLayout.jsx   # Admin layout wrapper
│   │   │   │   ├── AdminSidebar.jsx  # Admin navigation sidebar
│   │   │   │   ├── AddProduct.jsx    # Add new products to inventory
│   │   │   │   ├── Inventory.jsx     # Manage product inventory
│   │   │   │   ├── Analytics.jsx     # Sales & traffic analytics
│   │   │   │   ├── AdminChannel.jsx  # Admin messaging channel
│   │   │   │   ├── AdminInbox.jsx    # Message inbox for admins
│   │   │   │   ├── InboxPage.jsx     # Inbox page component
│   │   │   │   ├── ClientMessages.jsx    # View client messages
│   │   │   │   ├── ClientRequests.jsx    # View client requests
│   │   │   │   ├── AssistantChannelWriter.jsx # Assistant message interface
│   │   │   │   └── (service staff tools)
│   │   │   │
│   │   │   ├── Navoptions/           # User account & info pages
│   │   │   │   ├── OrderPage.jsx     # User orders history
│   │   │   │   ├── StatusTracker.jsx # Order status tracking
│   │   │   │   ├── About.jsx         # About page
│   │   │   │   ├── Reviews.jsx       # Product reviews & ratings
│   │   │   │   └── Support.jsx       # Support page
│   │   │   │
│   │   │   ├── Messages/             # Customer support messaging
│   │   │   │   ├── SupportPage.jsx   # Support/help page
│   │   │   │   ├── ChatBot.jsx       # Automated chatbot
│   │   │   │   └── LiveAssistantChat.jsx # Live chat with support staff
│   │   │   │
│   │   │   ├── Assistant/            # Staff assistant interface
│   │   │   │   ├── AssistantTerminal.jsx # Terminal for staff assistance
│   │   │   │   └── Assistantinbox.jsx    # Assistant inbox
│   │   │   │
│   │   │   └── SecurityLogics/       # Authentication & security
│   │   │       ├── AuthPage.jsx      # Login/signup page
│   │   │       ├── NotFoundPage.jsx  # 404 page
│   │   │       └── PremiumLoader.jsx # Loading animation component
│   │   │
│   │   ├── assets/                   # Static images & media files
│   │   └── public/                   # Public static files
│   │
│   ├── package.json                  # Frontend dependencies & scripts
│   ├── vite.config.js                # Vite bundler configuration
│   ├── tailwind.config.js            # TailwindCSS theme & styling config
│   ├── postcss.config.js             # PostCSS configuration for Tailwind
│   ├── eslint.config.js              # ESLint rules for code quality
│   ├── vercel.json                   # Vercel deployment config for frontend
│   ├── index.html                    # HTML entry point
│   ├── README.md                     # Frontend-specific documentation
│   ├── node_modules/                 # Installed frontend dependencies
│   └── public/                       # Static files directory
│
└── .git/                             # Git repository & version control

```

---

## 🛠 Tech Stack

### **Backend**
- **Express.js** - REST API framework
- **Node.js** - JavaScript runtime
- **Nodemailer** - Email delivery (Gmail SMTP)
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management

### **Frontend**
- **React 19** - UI framework
- **Vite** - Modern build tool & dev server
- **TailwindCSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Supabase** - Backend-as-a-Service (database & auth)
- **React Query** - Data fetching & caching
- **React Query DevTools** - Debug data queries
- **Bcryptjs** - Password hashing
- **SweetAlert2** - Beautiful alerts
- **Lucide React** - Icon library

---

## 📂 File Descriptions

### **Backend Files**

#### `backend/server.js` (252 lines)
Main Express server handling:
- **Endpoints:**
  - `POST /api/verify-staff` - Verify admin/assistant credentials
  - `POST /api/send-otp` - Send one-time password via email
  - Other email-based authentication flows
- **Email Service:** Nodemailer integration with Gmail SMTP
- **CORS:** Allows requests from localhost and production URLs
- **Styled Emails:** HTML email templates for "The Vault" brand

#### `backend/package.json`
Lists all backend dependencies:
- Express, Nodemailer, CORS, Dotenv, Body-parser, etc.

#### `backend/vercel.json`
Defines Vercel deployment configuration:
- Uses Node.js runtime
- Routes all requests to `server.js`

#### `backend/.env`
Environment variables (NOT in repo for security):
- `GMAIL_USER` - Gmail account for emails
- `GMAIL_PASS` - Gmail app password
- `ADMIN_PASS` - Admin login password
- `ASSISTANT_PASS` - Staff password

---

### **Frontend Files**

#### `src/App.jsx`
Main application component - imports and renders Routes

#### `src/main.jsx`
React entry point - mounts App to DOM with React Query provider

#### `src/MercComponents/Paths.jsx` (190 lines)
**Core routing configuration:**
- All route definitions using React Router
- Protected routes (require login for admin)
- Guest routes (redirect if already logged in)
- Route guards for auth paths
- Scroll-to-top handler on navigation

**Routes Include:**
- `/` - Homepage
- `/boxers`, `/shirts`, `/shoes`, `/slides`, etc. - Product categories
- `/cart` - Shopping cart
- `/checkout` - Payment processing
- `/orders` - User order history  
- `/track-order` - Order tracking
- `/admin/*` - Admin dashboard (protected)
- `/assistant/*` - Staff assistant terminal (protected)
- `/login`, `/signup`, `/verify-otp` - Authentication
- `/support` - Customer support
- `/about`, `/reviews` - Info pages

#### `src/MercComponents/supabaseClient.js`
Supabase client initialization for:
- Database operations
- User authentication
- Real-time data sync

#### **Homepage Components** (`Homepage/`)
- `Homepage.jsx` - Main landing page layout
- `Navbar.jsx` - Top navigation with cart button & user menu
- `Footer.jsx` - Footer with links & company info
- `Hero.jsx` - Hero banner section
- `AllCategoriesPage.jsx` - Browse all product types
- `CategoriesGrid.jsx` - Grid display of categories
- `Bestsellers.jsx` - Top-selling products showcase
- `BrandNarrative.jsx` - Company story & brand info
- `Newsletter.jsx` - Email signup form
- `SearchOverlay.jsx` - Search product overlay

#### **Product Pages** (`Cartpages/`)
Category-specific product listings:
- `BoxerPage.jsx`, `ShirtPage.jsx`, `ShoePages.jsx`
- `SlidesPage.jsx`, `CapPage.jsx`, `HoodiePage.jsx`
- `SweatshirtPage.jsx`, `BagPage.jsx`
- `CategoryTemplate.jsx` - Reusable template for category pages
- `Checkout.jsx` - Checkout & payment form

#### **Cart & Commerce** (`Cartoptions/`)
- `Cart.jsx` - Shopping cart display & management
- `CartContext.jsx` - Global cart state using React Context

#### **Admin Dashboard** (`Administration/`)
- `AdminDashBoard.jsx` - Main admin overview
- `AdminLayout.jsx` - Admin page layout wrapper
- `AdminSidebar.jsx` - Left navigation for admin
- `Inventory.jsx` - Product inventory management
- `AddProduct.jsx` - Add new products to catalog
- `Analytics.jsx` - Sales & traffic reports
- `AdminChannel.jsx` - Communication center
- `AdminInbox.jsx` - Message management
- `InboxPage.jsx` - Inbox display
- `ClientMessages.jsx` - View all client messages
- `ClientRequests.jsx` - Support requests queue
- `AssistantChannelWriter.jsx` - Compose messages

#### **User Pages** (`Navoptions/`)
- `OrderPage.jsx` - User's order history
- `StatusTracker.jsx` - Live order tracking
- `About.jsx` - Company information
- `Reviews.jsx` - Product reviews & rating system
- `Support.jsx` - Support information

#### **Messaging System** (`Messages/`)
- `SupportPage.jsx` - Support interface
- `ChatBot.jsx` - AI-powered chatbot responses
- `LiveAssistantChat.jsx` - Real-time support chat

#### **Staff Features** (`Assistant/`)
- `AssistantTerminal.jsx` - Staff command interface
- `Assistantinbox.jsx` - Inbox for staff messages

#### **Security & Auth** (`SecurityLogics/`)
- `AuthPage.jsx` - Login/signup form
- `NotFoundPage.jsx` - 404 error page
- `PremiumLoader.jsx` - Loading animation

---

### **Configuration Files**

#### `frontend/package.json`
Frontend dependencies & scripts:
- `npm run dev` - Start dev server (port 5173)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

#### `frontend/vite.config.js`
Vite configuration:
- React plugin enabled
- **Dev proxy:** `/api` → `http://localhost:5000` (backend)
- This enables API calls from `http://localhost:5173/api/...`

#### `frontend/tailwind.config.js`
TailwindCSS theming:
- Dark mode enabled with `class` strategy
- Custom colors: `primary`, `background-dark`, `neutral-dark`
- Custom font: Manrope for display text
- Border radius customization

#### `frontend/postcss.config.js`
PostCSS pipeline for Tailwind (typically contains autoprefixer + tailwindcss)

#### `frontend/eslint.config.js`
Code quality rules for JavaScript/JSX

#### `frontend/index.html`
HTML entry point - mounts React app to `#root` div

#### `frontend/vercel.json`
Vercel deployment config:
- Rewrites all routes to `index.html` (SPA routing)

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 16+ installed
- npm or yarn package manager
- Supabase project created
- Gmail account with app password

### **Backend Setup**

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
GMAIL_USER=your-email@gmail.com
GMAIL_PASS=your-app-password
ADMIN_PASS=admin-password-here
ASSISTANT_PASS=assistant-password
```

4. Start server:
```bash
npm start
# or
node server.js
```
Server runs on `http://localhost:5000`

### **Frontend Setup**

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-key
```

4. Start dev server:
```bash
npm run dev
```
Frontend runs on `http://localhost:5173`

The Vite proxy automatically routes `/api/*` calls to the backend at `http://localhost:5000`

---

## 🔐 Authentication Flow

1. **Login/Signup** → User submits credentials
2. **Email Verification** → OTP sent via email endpoint
3. **Token Storage** → `userEmail` stored in localStorage
4. **Protected Routes** → Redirect to login if not authenticated
5. **Guest Routes** → Redirect to home if already logged in

Admin/Staff credentials verified via `/api/verify-staff` endpoint

---

## 🛒 Shopping Flow

1. User browses product categories
2. Views product details
3. Adds items to cart (stored in CartContext)
4. Proceeds to checkout
5. Submits order
6. Receives order confirmation email
7. Can track order status in `/track-order`

---

## 👨‍💼 Admin Features

- **Dashboard** - View analytics & overview
- **Inventory** - Manage products & stock
- **Analytics** - Sales reports & metrics
- **Messaging** - Communicate with customers
- **Requests** - Handle customer inquiries

---

## 💬 Support System

- **ChatBot** - Automated responses
- **Live Chat** - Connect with support staff
- **Support Page** - FAQ & help resources

---

## 📊 Database (Supabase)

Connected via `supabaseClient.js`. Tables likely include:
- Users (authentication & profile)
- Products (catalog & inventory)
- Orders (transactions & history)
- Messages (customer support)

---

## 🌐 Deployment

### **Frontend (Vercel)**
```bash
npm run build
# Deploy `dist/` folder to Vercel
```

### **Backend (Vercel)**
- Uses Node.js runtime (`vercel.json`)
- Environment variables set in Vercel dashboard
- Auto-deploys on git push

---

## 📌 Key Features

✅ Product browsing & search  
✅ Shopping cart & checkout  
✅ Order tracking  
✅ Admin dashboard  
✅ Email notifications  
✅ Customer support (chat + assistant)  
✅ User authentication  
✅ Responsive design (TailwindCSS)  
✅ Real-time updates (Supabase)  

---

## 🐛 Troubleshooting

### **API calls failing?**
- Ensure backend is running on port 5000
- Check CORS settings in `server.js`
- Verify Vite proxy in `vite.config.js`

### **Email not sending?**
- Verify Gmail app password (not account password)
- Check `.env` credentials
- Ensure "Less secure apps" is enabled or use App Passwords

### **Components not importing?**
- Verify file paths in `Paths.jsx`
- Check that all components export `default`

---

## 📝 Notes

- This is full deployment-ready code
- Environment variables should never be committed to git
- Supabase handles database & real-time features
- TailwindCSS with dark mode support built-in
- Admin routes require authentication

---

**Project Status:** Active Development  
**Last Updated:** February 2026
