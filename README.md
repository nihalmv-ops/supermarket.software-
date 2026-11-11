# Silver Business Suite (TypeScript Edition)

> **Modern Commercial Invoice & Quotation Management SaaS**  
> Architected for Multi-Business Enterprise, Web, Android (Capacitor), and Windows Desktop (Electron) in **100% Full-Stack TypeScript**.

---

## 🚀 Overview

**Silver Business Suite** is an enterprise-grade SaaS platform built with strict TypeScript typing to empower businesses with automated GST invoicing, professional quotation generation, 1-click quotation-to-invoice conversion, client management, product catalogs, interactive PDF template styling, and multi-tenant subscription tiers.

---

## 🛠️ Technology Stack (Full-Stack TypeScript)

| Tier | Technologies |
| :--- | :--- |
| **Frontend Web** | TypeScript, React 18, Vite 5, Tailwind CSS, React Router v6, Axios, Lucide React, Recharts |
| **Backend API** | TypeScript, Node.js (ESM), Express.js, `tsx` (High-speed TS runner), CORS, Morgan, Dotenv |
| **Database & ODM** *(Phase 2+)* | MongoDB Atlas, Mongoose with typed models & documents |
| **Auth & Security** *(Phase 2+)* | Typed JWT payloads, bcrypt password hashing, tenant data isolation middleware |
| **Multi-Platform** *(Planned)* | Android (Capacitor), Windows Desktop (Electron), Installable PWA |
| **Document Engine** *(Phase 3+)* | jsPDF, Cloudinary for branding & asset storage |

---

## 📁 Project Architecture (TypeScript)

```text
c:\bussinus-project\
├── backend\
│   ├── src\
│   │   ├── config\                 # Database, Cloudinary, & Payment configs
│   │   ├── controllers\            # Request handlers (Phase 2+)
│   │   ├── middlewares\
│   │   │   └── errorHandler.ts     # Typed error middleware & 404 handler
│   │   ├── models\                 # Typed Mongoose schemas
│   │   ├── routes\
│   │   │   └── healthRoutes.ts     # Health diagnostics endpoint
│   │   ├── utils\                  # Server-side utilities
│   │   ├── app.ts                  # Express application setup (TypeScript)
│   │   └── server.ts               # HTTP bootstrap with tsx watch
│   ├── dist\                       # Compiled production JavaScript & declaration files (.d.ts)
│   ├── .env                        # Port 5000, Dev mode, Allowed Client URL
│   ├── .env.example                # Template for environment variables
│   ├── tsconfig.json               # Backend TypeScript configuration (NodeNext, ES2022)
│   └── package.json                # Express, TypeScript, TSX, @types/node, @types/express
│
├── frontend\
│   ├── public\                     # Static web assets
│   ├── src\
│   │   ├── assets\                 # Vector icons & branding illustrations
│   │   ├── components\
│   │   │   ├── dashboard\
│   │   │   │   ├── MetricCard.tsx           # Typed KPI stats card
│   │   │   │   ├── RevenueChart.tsx         # Typed Recharts Area Chart
│   │   │   │   ├── InvoiceStatusDonut.tsx   # Typed Recharts Donut Chart
│   │   │   │   ├── RecentInvoicesTable.tsx  # Invoices table with typed status pills
│   │   │   │   ├── RecentQuotationsList.tsx # Quotations with 1-click invoice convert
│   │   │   │   └── QuickActions.tsx         # 4-card quick creation shortcuts
│   │   │   └── layout\
│   │   │       ├── Sidebar.tsx              # Multi-tenant business switcher & nav links
│   │   │       ├── Navbar.tsx               # Search (⌘K), API health ping, notification bell
│   │   │       └── AppLayout.tsx            # Shell wrapper with responsive layout & footer
│   │   ├── pages\
│   │   │   ├── Dashboard.tsx       # Executive SaaS dashboard (TypeScript)
│   │   │   └── PlaceholderPage.tsx # Route placeholders for scheduled phases
│   │   ├── services\
│   │   │   └── api.ts              # Typed Axios client with tenant & auth interceptors
│   │   ├── types\
│   │   │   └── index.ts            # Global TypeScript interfaces (Business, Invoice, Quote)
│   │   ├── utils\
│   │   │   └── formatters.ts       # Typed INR (₹) / USD currency, dates, and status styling
│   │   ├── App.tsx                 # Client-side router hierarchy & route guards
│   │   ├── index.css               # Tailwind CSS directives & custom sleek scrollbars
│   │   ├── main.tsx                # React 18 createRoot bootstrap
│   │   └── vite-env.d.ts           # Vite client environment typing
│   ├── .env                        # Frontend environment variables (VITE_API_BASE_URL)
│   ├── .env.example                # Template for frontend env
│   ├── index.html                  # HTML5 base document pointing to /src/main.tsx
│   ├── postcss.config.js           # PostCSS configuration
│   ├── tailwind.config.js          # Brand purple (`#7c3aed`), surface scales, card shadows
│   ├── tsconfig.json               # Frontend TypeScript configuration
│   ├── tsconfig.node.json          # Vite node tooling TypeScript configuration
│   ├── vite.config.ts              # Vite configuration (TypeScript)
│   └── package.json                # React, Vite, Lucide, Recharts, Axios, Tailwind, TypeScript
│
├── .gitignore                      # Excludes node_modules, .env, dist, and OS cache
├── package.json                    # Root monorepo workspace scripts
└── README.md                       # Complete documentation & Phase roadmap
```

---

## ⚡ Quick Start

### 1. Installation
All packages are already installed. For a clean setup:
```bash
# Backend dependencies:
cd backend
npm install

# Frontend dependencies:
cd ../frontend
npm install
```

### 2. Running in Development Mode

**Terminal 1 — Backend (TypeScript with instant hot-reload via `tsx`):**
```bash
cd backend
npm run dev
# Starts at http://localhost:5000 (Health Check: http://localhost:5000/api/v1/health)
```

**Terminal 2 — Frontend (Vite + React with TypeScript):**
```bash
cd frontend
npm run dev
# Starts at http://localhost:5173
```

### 3. Production Compilation & Verification

- **Backend:** `cd backend && npm run build` compiles `src/*.ts` into `dist/*.js` with `.d.ts` declaration maps.
- **Frontend:** `cd frontend && npm run build` executes `tsc && vite build` for complete type safety verification and minified bundling.
