# Laravel Sanctum Setup Instructions

This document provides the necessary steps to install and configure Laravel Sanctum for API authentication. Please run these commands in your local development environment from the `backend` directory.

## 1. Install Laravel Sanctum

First, require the Sanctum package using Composer:

```bash
composer require laravel/sanctum
```

## 2. Publish Sanctum Configuration and Migration

Publish the Sanctum configuration file and migration file using the `vendor:publish` Artisan command:

```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

This will create `config/sanctum.php` and a migration file for the `personal_access_tokens` table.

## 3. Run the Database Migration

Run the database migrations to create the `personal_access_tokens` table:

```bash
php artisan migrate
```

## 4. Configure Environment Variables

In your `.env` file, you must configure the `SANCTUM_STATEFUL_DOMAINS` variable to include the domain of your frontend application. This is necessary for cookie-based SPA authentication.

```env
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

## 5. Configure Middleware for SPA Authentication

To allow your frontend to make authenticated requests, you must add Sanctum's middleware to your `api` middleware group in `app/Http/Kernel.php`.

Open `backend/app/Http/Kernel.php` and add the `EnsureFrontendRequestsAreStateful` middleware to the `api` group. It's important to place it first in the list.

```php
// in app/Http/Kernel.php

protected $middlewareGroups = [
    // ...
    'api' => [
        \Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful::class,
        'throttle:api',
        \Illuminate\Routing\Middleware\SubstituteBindings::class,
    ],
];
```
