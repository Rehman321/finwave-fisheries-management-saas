<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    protected function redirectTo($request)
    {
        // For API requests return null; framework will handle unauthenticated responses.
        if (! $request->expectsJson()) {
            return route('login');
        }
    }
}
