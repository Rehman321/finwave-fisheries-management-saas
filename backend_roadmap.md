# Backend Analysis and Roadmap

This document provides a static analysis of the backend codebase and a prioritized roadmap to guide its development to a production-ready V1.

## 1. Static Analysis Findings

The following analysis is based on a review of the repository's code without command execution.

*   **Repo Setup & Sanity:**
    *   **Frameworks:** The backend is a standard **Laravel 12** application, requiring **PHP 8.2**. The frontend is a **Next.js** application.
    *   **Dependencies:** `composer.json` includes `laravel/sanctum` for API authentication and `laravel/sail` for a Docker-based local development environment.
    *   **Documentation:** There is no `README.md` in the `backend` directory with setup instructions. The `.env.example` file is standard and lacks specific guidance on required services or keys.
    *   **Orphaned Scaffolding:** A `middleware.ts` file in the Next.js frontend handles route protection. This is separate from the backend's Sanctum authentication and will need to be integrated.

*   **Authentication & Onboarding:**
    *   **Package:** Laravel Sanctum is implemented for SPA authentication, which is appropriate for the Next.js frontend.
    *   **User Model:** The `User` model exists and has a many-to-many relationship with a `Role` model.
    *   **Multi-Tenancy:** There is **no tenant relationship** on the User model or in the database schema. This is a critical missing piece for a multi-customer SaaS application.

*   **Database & Migrations:**
    *   **Existing Migrations:** Migrations for `users`, `roles`, `customers`, and several booking-related tables are present.
    *   **Missing Migrations:** There is a significant gap in the schema. Migrations for `products`, `suppliers`, `invoices` (and related tables like `invoice_items`), `ledger`, `pdc`, and the entire `payroll` module are missing.
    *   **Seeders:** No seeders for roles, permissions, or demo data were found.

*   **API Coverage vs. Frontend:**
    *   **Frontend Routes:** The frontend has routes for `/customers`, `/suppliers`, `/sales`, `/purchase`, `/ledger`, `/pdc`, `/employees`, etc.
    *   **Backend API Endpoints:** The backend only provides API endpoints for `customers`, `roles`, and booking-related resources. There is a major disconnect, with most frontend pages lacking the necessary backend APIs.

## 2. Backend V1 Roadmap

### P0: Foundational Features

| Task | Description | Estimate (Hours) | Acceptance Criteria |
|---|---|---|---|
| **Implement Multi-tenancy** | Create a `tenants` table and add a `tenant_id` foreign key to all tenant-scoped tables (users, customers, products, etc.). Update user registration and authentication to be tenant-aware. | 24 | - Migrations for `tenants` and `tenant_user` tables are created. - A global scope is applied to all relevant models to ensure data isolation between tenants. - Users are associated with a tenant upon registration. |
| **Implement Roles & Permissions** | Create `permissions` and `permission_role` tables. Seed baseline roles (e.g., Admin, User) and attach permissions. Implement middleware to protect routes based on roles/permissions. | 16 | - Migrations for permissions are created. - Seeders for default roles and permissions are created. - A `RoleMiddleware` or similar gate is implemented and applied to protected routes. |
| **Create Product Module** | Create the `Product` model, migration (with columns for name, description, price, SKU, etc.), and API resource controller (GET, POST, PUT, DELETE). | 12 | - `products` table migration is created. - `Product` model with fillable attributes and relationships is defined. - API endpoints for CRUD operations on products are created and return data in a consistent JSON format. |
| **Create Supplier Module** | Create the `Supplier` model, migration, and API resource controller. | 8 | - `suppliers` table migration is created. - `Supplier` model with fillable attributes is defined. - API endpoints for CRUD operations on suppliers are created. |
| **Create Sales/Invoice Module** | Create models and migrations for `invoices`, `invoice_items`. Develop API endpoints to create, view, and list invoices. | 20 | - `invoices` and `invoice_items` table migrations are created. - Models with correct relationships (`Invoice` has many `InvoiceItem`) are defined. - API endpoints for creating and retrieving invoices are implemented. |

### P1: Core Business Logic

| Task | Description | Estimate (Hours) | Acceptance Criteria |
|---|---|---|---|
| **Create Ledger Module** | Design and implement the core accounting ledger tables (`accounts`, `journal_entries`). Create API endpoints for recording transactions. | 24 | - Migrations for `accounts` and `journal_entries` are created, following double-entry accounting principles. - API endpoints to post transactions to the journal are created. |
| **Create PDC Module** | Create `post_dated_checks` model and migration. Implement API endpoints for managing PDCs. | 12 | - `post_dated_checks` table migration is created. - API endpoints for CRUD operations on PDCs are implemented. |
| **Implement Demo Seeders** | Create seeders for a demo tenant with sample customers, products, and invoices. | 8 | - A main seeder class is created to populate a new installation with realistic demo data. |
| **Create Backend `README.md`** | Document the backend setup process, including environment variables and how to run the application using Sail. | 4 | - A `backend/README.md` file is created with clear, step-by-step instructions. |

### P2: Payroll & Reporting

| Task | Description | Estimate (Hours) | Acceptance Criteria |
|---|---|---|---|
| **Implement Payroll Module** | Create models and migrations for `employees`, `payrolls`, and `salary_slips`. Develop API endpoints to manage employees and run payroll. | 40 | - Migrations for all payroll-related tables are created. - API endpoints for managing employees and generating payroll runs are implemented. |
| **Implement Reports Module** | Develop API endpoints to generate key business reports (e.g., Sales by Customer, Profit & Loss). | 32 | - API endpoints for at least three key reports are created. - The endpoints perform the necessary aggregations and return structured JSON data. |

---

## 3. Missing API Endpoint Contracts

_(This section provides sample JSON contracts for the highest-priority missing endpoints.)_

### Products (`/api/products`)

**GET Response:**
```json
{
  "data": [
    { "id": 1, "name": "Product A", "price": 100.00, "sku": "P001" }
  ]
}
```

**POST Request:**
```json
{
  "name": "Product B",
  "description": "A new product.",
  "price": 150.00,
  "sku": "P002"
}
```

### Suppliers (`/api/suppliers`)

**GET Response:**
```json
{
  "data": [
    { "id": 1, "name": "Supplier X", "email": "contact@supplierx.com" }
  ]
}
```

**POST Request:**
```json
{
  "name": "Supplier Y",
  "email": "hello@suppliery.com",
  "phone": "123-456-7890"
}
```

### Invoices (`/api/invoices`)

**POST Request:**
```json
{
  "customer_id": 1,
  "due_date": "2025-12-31",
  "items": [
    { "product_id": 1, "quantity": 2, "unit_price": 100.00 },
    { "product_id": 2, "quantity": 1, "unit_price": 150.00 }
  ]
}
```
