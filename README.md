# SpendWise 🎓💰
> **Smart Student Budgeting & Expense Tracking System**

SpendWise is a responsive full-stack financial ledger and budgeting platform tailored specifically for students. It helps university and college students understand their burn rate, pace pocket allowances, eliminate mid-semester cash shortages, and steadily save towards educational milestones and gadget funds.

---

## 🚀 Key Features

- **🔐 True Multi-User Database Authentication:** Secure account registration and login powered by MySQL and `bcryptjs` password hashing, capturing student credentials and institutions/schools.
- **⚡ Dynamic Global Currency Dynamics:** Switch currencies (e.g., Nigerian Naira `₦`, US Dollar `$`, British Pound `£`) in Settings with instant cross-page reactivity and local storage persistence.
- **📊 Real-time Dashboard & Health Pacing:**
  - **Total Available Balance:** Hero visualizer with balance privacy toggle (`••••••••`).
  - **Daily Safe-to-Spend:** Intelligent burn rate calculator based on days remaining and reserved obligations.
  - **Overview Split Cards:** Instant comparison between allowances received and funds spent.
  - **Recent Transactions Feed:** Chronological ledger of recent expenses and income.
- **💸 Expense & Money Logging:** Fast category-tagged transaction recording (Food, Transport, Books & Handouts, Data/Airtime, Rent, and custom tags).
- **📈 Spending Analytics & Category Breakdown:**
  - Monthly spending distribution with visual progress bars.
  - Identification of highest-spending categories and average transaction cost.
  - Actionable student budget pacing tips.
- **🎯 Budget Planning & Commitments:**
  - Set monthly spending ceilings and category allocations.
  - Separate upcoming fixed commitments (Hostel Rent, course dues) from discretionary cash.
- **🐖 Savings Goals:** Target goal portfolios (e.g., Laptop Fund, Gadget Stash) with interactive contribution modals and progress milestone tracking.
- **🌓 High-Contrast Dark Mode:** Full dual-theme light and dark mode compatibility across all screens, modals, and navigation components.

---

## 🛠 Tech Stack

### Frontend (`client/`)
- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing:** [React Router v6](https://reactrouter.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (with custom color tokens & Dark Mode)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Context API (`AuthContext`, `FinanceContext`) + LocalStorage persistence

### Backend (`backend/`)
- **Runtime:** [Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/)
- **Database:** [MySQL](https://www.mysql.com/) with connection pooling (`mysql2/promise`)
- **Security:** `bcryptjs` (salted password hashing), `jsonwebtoken` (JWT bearer auth), `cors`
- **Migrations:** Native Node.js migration runner (`scripts/migrate.js`)

---

## 📁 Project Structure

```text
Spendwise/
├── backend/
│   ├── scripts/
│   │   └── migrate.js              # Database schema migrations & category seeding
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # MySQL connection pool
│   │   ├── controllers/
│   │   │   ├── analyticsController.js
│   │   │   ├── authController.js
│   │   │   └── transactionController.js
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js   # JWT validation middleware
│   │   ├── routes/
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── authRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   └── transactionRoutes.js
│   │   ├── utils/
│   │   │   └── safeSpend.js        # Safe-to-Spend burn calculation logic
│   │   └── app.js                  # Express app setup & CORS configuration
│   ├── tests/                      # Auth and transaction unit tests
│   ├── server.js                   # Backend entry point
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── api/                    # Native fetch API client with JWT interceptor
│   │   ├── components/             # Reusable UI widgets, modals, layout & navigation
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # User authentication state
│   │   │   └── FinanceContext.jsx  # Ledger, currency, and notifications state
│   │   ├── pages/                  # Route views (Dashboard, Expenses, Budget, etc.)
│   │   ├── utils/
│   │   │   └── formatters.js       # Dynamic currency and date helpers
│   │   ├── App.jsx                 # Routing configuration
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Getting Started

### 1. Prerequisites
- **Node.js** (v18 or higher recommended)
- **MySQL Server** (local installation or hosted cloud database)
- **Git**

---

### 2. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the `backend/` directory using the following placeholder template:
   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=spendwise
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   ```

4. Run the database migrations (creates tables and seeds default categories):
   ```bash
   npm run migrate
   ```

5. Start the backend server:
   ```bash
   npm run dev
   # or
   npm start
   ```
   The backend server runs on `http://localhost:5000`.

---

### 3. Frontend Client Setup

1. Open a new terminal and navigate to the client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure frontend environment (optional):
   Create a `.env` file in the `client/` directory if connecting to a non-default backend port:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

5. To generate a production build:
   ```bash
   npm run build
   ```

---

## 🧪 Testing

Run backend authentication and logic unit tests:
```bash
cd backend
node tests/auth.test.js
```

---

## 🛡 Disclaimer

SpendWise is a personal expense tracker and student budgeting calculator. It only records and paces financial activity logged by the student. **It does not process banking transactions, initiate wire transfers, or connect to external bank accounts.** No banking • No transfers.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
