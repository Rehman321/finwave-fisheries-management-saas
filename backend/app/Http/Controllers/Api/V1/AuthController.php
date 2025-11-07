<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Authenticate a user and return a token.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'expires_in' => 'nullable|integer|min:0',
            'abilities' => 'nullable|array',
            'abilities.*' => 'string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // Prepare abilities (scopes)
        $abilities = $request->input('abilities', ['*']);

        // Name the token (allow client to pass device_name or fallback)
        $name = $request->input('device_name', 'api-token');

        // Create a personal access token using Sanctum; we get the model back via accessToken
        $newToken = $user->createToken($name, $abilities);

        // Optionally set expiry on the token record
        $expiresIn = $request->input('expires_in');
        if ($expiresIn) {
            try {
                $accessToken = $newToken->accessToken; // PersonalAccessToken model instance
                $accessToken->expires_at = Carbon::now()->addSeconds((int) $expiresIn);
                $accessToken->save();
            } catch (\Throwable $e) {
                // ignore if model not present for some reason
            }
        }

        return response()->json([
            'user' => $user,
            'token' => $newToken->plainTextToken,
            'abilities' => $abilities,
            'expires_at' => isset($accessToken) ? $accessToken->expires_at : null,
        ]);
    }

    /**
     * Log the user out (Invalidate the token).
     */
    public function logout(Request $request)
    {
        // If using token-based auth, delete the current access token
        if ($request->user() && method_exists($request->user(), 'currentAccessToken')) {
            $token = $request->user()->currentAccessToken();
            if ($token) {
                $token->delete();
            }
        }

        // Also attempt session logout for cookie-based flows
        try {
            \Illuminate\Support\Facades\Auth::logout();
            $request->session()?->invalidate();
            $request->session()?->regenerateToken();
        } catch (\Throwable $e) {
            // ignore if session not available
        }

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Get the authenticated User.
     */
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
}
