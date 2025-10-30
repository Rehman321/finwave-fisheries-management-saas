<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * RoleMiddleware
 *
 * Usage in route: ->middleware('role:admin') or ->middleware('role:admin|manager')
 */
class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|null  $roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $roles = null)
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        if ($roles) {
            // allow multiple roles separated by | or ,
            $rolesArr = preg_split('/[|,]/', (string) $roles, -1, PREG_SPLIT_NO_EMPTY);
            if (! empty($rolesArr)) {
                $has = $user->roles()->whereIn('name', $rolesArr)->exists();
                if (! $has) {
                    return response()->json(['message' => 'Forbidden.'], 403);
                }
            }
        }

        return $next($request);
    }
}
