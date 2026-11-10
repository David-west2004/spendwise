# SpendWise REST API & SDK Integration Guide

This document defines the API specifications, environment variables, authentication protocols, request/response envelopes, and a ready-to-use JavaScript/TypeScript SDK for the SpendWise backend.

---

## 1. System Overview & Configuration

### Base URL
- **Local Development:** `http://localhost:5000`
- **Prefix:** `/api`

### Environment Variables & Keys
The backend reads the following configuration keys (with secure default fallbacks for local development):

| Key | Type | Description | Default Fallback |
| :--- | :--- | :--- | :--- |
| `PORT` | Number | Express HTTP port | `5000` |
| `JWT_SECRET` | String | Secret key for signing and verifying tokens | `'spendwise-dev-jwt-secret-key-change-in-production'` |
| `JWT_EXPIRES_IN` | String | Expiry timeframe for issued tokens | `'7d'` |
| `DB_HOST` | String | MySQL database host address | `'localhost'` |
| `DB_PORT` | Number | MySQL connection port | `3306` |
| `DB_USER` | String | MySQL username | `'root'` |
| `DB_PASSWORD` | String | MySQL password | `''` |
| `DB_NAME` | String | MySQL database name | `'spendwise'` |
| `DATABASE_URL` | String | (Optional) Full connection string | `undefined` |

---

## 2. Standard Response Envelopes & Error Handling

Every endpoint in SpendWise responds with a unified JSON envelope.

### Success Response (`HTTP 200 / 201`)
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response (`HTTP 400 / 401 / 403 / 404 / 500`)
```json
{
  "success": false,
  "message": "Human-readable explanation of error."
}
```

### HTTP Status Code Conventions
- `200 OK`: Request succeeded.
- `201 Created`: Resource (user, transaction) successfully created.
- `400 Bad Request`: Input validation failed, malformed body, or duplicate record.
- `401 Unauthorized`: Token missing, invalid, or credentials incorrect.
- `403 Forbidden`: Authenticated user lacks permission.
- `404 Not Found`: Resource does not exist or belongs to another tenant.
- `500 Internal Server Error`: Unhandled server/database error.

---

## 3. Authentication Protocol

All endpoints outside `/api/auth/register`, `/api/auth/login`, and `/api/health` require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 4. Complete API Reference

### Health Check

#### `GET /api/health`
Checks server availability.
- **Auth Required:** No
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "status": "healthy",
      "timestamp": "2026-09-22T17:00:00.000Z"
    }
  }
  ```

---

### Authentication Module

#### `POST /api/auth/register`
Creates a new account, generates default student categories in an atomic transaction, and issues a JWT.
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "fullname": "Alex Johnson",
    "email": "alex@university.edu",
    "password": "securePassword123",
    "currency": "NGN"
  }
  ```
- **Validation Rules:**
  - `fullname`: string, required, non-empty.
  - `email`: string, valid email address format, unique across users.
  - `password`: string, minimum 6 characters.
  - `currency`: optional string (defaults to `"NGN"`).
- **Auto-Provisioned Categories:**
  - Expense: *Food & Cafeteria*, *Hostel & Rent*, *Course Handouts & Books*, *Transport & Shuttle*, *Data & Airtime*, *Entertainment & Snacks*
  - Income: *Monthly Allowance*, *Side Hustle*, *Scholarship/Stipend*, *Gift*
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "e8574c8b-68d2-45e3-9993-9d41d15dbd4e",
        "fullname": "Alex Johnson",
        "email": "alex@university.edu",
        "currency": "NGN"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

#### `POST /api/auth/login`
Validates user credentials and issues a fresh JWT.
- **Auth Required:** No
- **Request Body:**
  ```json
  {
    "email": "alex@university.edu",
    "password": "securePassword123"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "e8574c8b-68d2-45e3-9993-9d41d15dbd4e",
        "fullname": "Alex Johnson",
        "email": "alex@university.edu",
        "currency": "NGN"
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
  ```

#### `GET /api/auth/me`
Retrieves current profile details for the authenticated user.
- **Auth Required:** Yes (`Bearer <token>`)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "e8574c8b-68d2-45e3-9993-9d41d15dbd4e",
        "fullname": "Alex Johnson",
        "email": "alex@university.edu",
        "currency": "NGN",
        "created_at": "2026-09-22T17:00:00.000Z"
      }
    }
  }
  ```

---

### Transactions Module

All database operations strictly enforce tenant isolation (`WHERE user_id = req.user.id`).

#### `POST /api/transactions`
Creates an income or expense transaction.
- **Auth Required:** Yes (`Bearer <token>`)
- **Request Body:**
  ```json
  {
    "amount": 3500.00,
    "category_id": 1,
    "type": "expense",
    "transaction_date": "2026-09-22",
    "description": "Lunch at Faculty Cafeteria"
  }
  ```
- **Field Constraints:**
  - `amount`: number, strictly `> 0`, formatted to 2 decimals.
  - `category_id`: integer, must be accessible to user (`user_id = req.user.id OR user_id IS NULL`).
  - `type`: `"income"` or `"expense"`. Must match the category's configured type.
  - `transaction_date`: `YYYY-MM-DD` string (defaults to today if omitted).
  - `description`: optional string (max 255 chars).
- **Response `201 Created`:**
  ```json
  {
    "success": true,
    "data": {
      "transaction": {
        "id": 14,
        "user_id": "e8574c8b-68d2-45e3-9993-9d41d15dbd4e",
        "category_id": 1,
        "amount": 3500.00,
        "type": "expense",
        "description": "Lunch at Faculty Cafeteria",
        "transaction_date": "2026-09-22",
        "created_at": "2026-09-22T17:05:00.000Z",
        "category_name": "Food & Cafeteria",
        "category_icon": "utensils",
        "category_color": "#ef4444"
      }
    }
  }
  ```

#### `GET /api/transactions`
Retrieves a paginated list of transactions filtered by tenant and optional criteria.
- **Auth Required:** Yes (`Bearer <token>`)
- **Query Parameters:**
  - `month`: `YYYY-MM` (e.g., `2026-09`)
  - `category_id`: number
  - `type`: `"income"` or `"expense"`
  - `page`: integer (default: `1`)
  - `limit`: integer (default: `20`, maximum: `100`)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "transactions": [
        {
          "id": 14,
          "user_id": "e8574c8b-68d2-45e3-9993-9d41d15dbd4e",
          "category_id": 1,
          "amount": 3500.00,
          "type": "expense",
          "description": "Lunch at Faculty Cafeteria",
          "transaction_date": "2026-09-22",
          "created_at": "2026-09-22T17:05:00.000Z",
          "category_name": "Food & Cafeteria",
          "category_icon": "utensils",
          "category_color": "#ef4444"
        }
      ],
      "pagination": {
        "total": 1,
        "page": 1,
        "limit": 20,
        "totalPages": 1
      }
    }
  }
  ```

#### `GET /api/transactions/:id`
Retrieves a single transaction by ID.
- **Auth Required:** Yes (`Bearer <token>`)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "transaction": {
        "id": 14,
        "user_id": "e8574c8b-68d2-45e3-9993-9d41d15dbd4e",
        "category_id": 1,
        "amount": 3500.00,
        "type": "expense",
        "description": "Lunch at Faculty Cafeteria",
        "transaction_date": "2026-09-22",
        "created_at": "2026-09-22T17:05:00.000Z",
        "category_name": "Food & Cafeteria",
        "category_icon": "utensils",
        "category_color": "#ef4444"
      }
    }
  }
  ```
- **Error `404 Not Found`:** Returned if ID does not exist or belongs to another user.

#### `PUT /api/transactions/:id`
Updates an existing transaction.
- **Auth Required:** Yes (`Bearer <token>`)
- **Request Body (Partial updates allowed):**
  ```json
  {
    "amount": 4000.00,
    "description": "Updated cafeteria lunch expense"
  }
  ```
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "transaction": { ... }
    }
  }
  ```

#### `DELETE /api/transactions/:id`
Permanently deletes a transaction.
- **Auth Required:** Yes (`Bearer <token>`)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "message": "Transaction deleted successfully."
  }
  ```
- **Error `404 Not Found`:** Returned if ID is not found or belongs to another user.

---

### Analytics & Smart Ledger Module

#### `GET /api/analytics/summary`
Calculates total monthly income, expenses, net balance, and full category breakdown.
- **Auth Required:** Yes (`Bearer <token>`)
- **Query Parameters:**
  - `month`: `YYYY-MM` (defaults to current month)
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "month": "2026-09",
      "total_income": 120000.00,
      "total_expenses": 45000.00,
      "net_balance": 75000.00,
      "category_breakdown": [
        {
          "category_id": 1,
          "category_name": "Food & Cafeteria",
          "category_type": "expense",
          "category_icon": "utensils",
          "category_color": "#ef4444",
          "total_amount": 28000.00,
          "transaction_count": 8
        },
        {
          "category_id": 4,
          "category_name": "Transport & Shuttle",
          "category_type": "expense",
          "category_icon": "bus",
          "category_color": "#3b82f6",
          "total_amount": 17000.00,
          "transaction_count": 6
        }
      ]
    }
  }
  ```

#### `GET /api/analytics/safe-to-spend` (or `/safe-spend`)
Calculates the student burn rate and daily allowance limit for the remaining days of the current billing cycle.
- **Auth Required:** Yes (`Bearer <token>`)
- **Query Parameters:**
  - `month`: `YYYY-MM` (default: current month)
  - `date`: `YYYY-MM-DD` (default: current date)
  - `fixed_bills`: number (optional override for committed expenses)
- **Mathematical Formula:**
  - `currentBalance = totalIncome - totalExpenses`
  - `discretionaryPool = currentBalance - fixedBills`
  - `daysRemaining = max(totalDaysInMonth - currentDay + 1, 1)`
  - `dailySafeSpend = discretionaryPool > 0 ? (discretionaryPool / daysRemaining) : 0`
- **Health Status Rule Matrix:**
  - `'DEFICIT'`: if `currentBalance <= 0` OR `discretionaryPool <= 0`
  - `'CAUTION'`: if `dailySafeSpend < 1000` (threshold: 1,000 NGN)
  - `'ON_TRACK'`: otherwise
- **Response `200 OK`:**
  ```json
  {
    "success": true,
    "data": {
      "month": "2026-09",
      "calculation_date": "2026-09-22",
      "total_income": 120000.00,
      "total_expenses": 45000.00,
      "fixed_bills": 15000.00,
      "current_balance": 75000.00,
      "discretionary_pool": 60000.00,
      "days_remaining": 9,
      "daily_safe_spend": 6666.67,
      "health_status": "ON_TRACK"
    }
  }
  ```

---

## 5. Ready-to-Use JavaScript / TypeScript SDK

You can drop this lightweight client directly into your React, Next.js, or mobile frontend.

```typescript
/**
 * SpendWise Client SDK
 */
export class SpendWiseClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = 'http://localhost:5000/api') {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  /**
   * Set or update active JWT authentication token
   */
  public setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    const body = await response.json();

    if (!response.ok || body.success === false) {
      throw new Error(body.message || `Request failed with status ${response.status}`);
    }

    return body.data;
  }

  // ==========================================
  // Authentication API
  // ==========================================
  public auth = {
    register: async (payload: { fullname: string; email: string; password: string; currency?: string }) => {
      const data = await this.request<{ user: any; token: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      this.setToken(data.token);
      return data;
    },

    login: async (credentials: { email: string; password: string }) => {
      const data = await this.request<{ user: any; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      this.setToken(data.token);
      return data;
    },

    getMe: async () => {
      return this.request<{ user: any }>('/auth/me', {
        method: 'GET',
      });
    },

    logout: () => {
      this.setToken(null);
    },
  };

  // ==========================================
  // Transactions API
  // ==========================================
  public transactions = {
    list: async (params?: { month?: string; category_id?: number; type?: 'income' | 'expense'; page?: number; limit?: number }) => {
      const query = new URLSearchParams();
      if (params?.month) query.set('month', params.month);
      if (params?.category_id) query.set('category_id', String(params.category_id));
      if (params?.type) query.set('type', params.type);
      if (params?.page) query.set('page', String(params.page));
      if (params?.limit) query.set('limit', String(params.limit));

      const qs = query.toString() ? `?${query.toString()}` : '';
      return this.request<{ transactions: any[]; pagination: any }>(`/transactions${qs}`, {
        method: 'GET',
      });
    },

    get: async (id: number) => {
      return this.request<{ transaction: any }>(`/transactions/${id}`, {
        method: 'GET',
      });
    },

    create: async (data: { amount: number; category_id: number; type: 'income' | 'expense'; transaction_date?: string; description?: string }) => {
      return this.request<{ transaction: any }>('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    update: async (id: number, data: Partial<{ amount: number; category_id: number; type: 'income' | 'expense'; transaction_date?: string; description?: string }>) => {
      return this.request<{ transaction: any }>(`/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    delete: async (id: number) => {
      return this.request<{ success: boolean }>(`/transactions/${id}`, {
        method: 'DELETE',
      });
    },
  };

  // ==========================================
  // Analytics & Safe-to-Spend API
  // ==========================================
  public analytics = {
    getSummary: async (month?: string) => {
      const qs = month ? `?month=${month}` : '';
      return this.request<{
        month: string;
        total_income: number;
        total_expenses: number;
        net_balance: number;
        category_breakdown: any[];
      }>(`/analytics/summary${qs}`, {
        method: 'GET',
      });
    },

    getSafeToSpend: async (params?: { month?: string; date?: string; fixed_bills?: number }) => {
      const query = new URLSearchParams();
      if (params?.month) query.set('month', params.month);
      if (params?.date) query.set('date', params.date);
      if (params?.fixed_bills !== undefined) query.set('fixed_bills', String(params.fixed_bills));

      const qs = query.toString() ? `?${query.toString()}` : '';
      return this.request<{
        month: string;
        calculation_date: string;
        total_income: number;
        total_expenses: number;
        fixed_bills: number;
        current_balance: number;
        discretionary_pool: number;
        days_remaining: number;
        daily_safe_spend: number;
        health_status: 'ON_TRACK' | 'CAUTION' | 'DEFICIT';
      }>(`/analytics/safe-to-spend${qs}`, {
        method: 'GET',
      });
    },
  };
}
```

### Example Usage

```javascript
import { SpendWiseClient } from './SpendWiseClient';

const client = new SpendWiseClient('http://localhost:5000/api');

async function example() {
  // 1. Authenticate
  const { user, token } = await client.auth.login({
    email: 'alex@university.edu',
    password: 'securePassword123',
  });
  console.log(`Logged in as ${user.fullname}`);

  // 2. Record an expense
  const newTx = await client.transactions.create({
    amount: 1500,
    category_id: 1, // Food & Cafeteria
    type: 'expense',
    description: 'Dinner at tuck shop',
  });
  console.log('Transaction logged:', newTx);

  // 3. Compute Safe-to-Spend
  const safeSpend = await client.analytics.getSafeToSpend();
  console.log(`Daily Safe-to-Spend: ${safeSpend.daily_safe_spend} NGN (${safeSpend.health_status})`);
}
```
