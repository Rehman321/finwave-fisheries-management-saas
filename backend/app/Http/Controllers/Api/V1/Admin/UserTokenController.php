<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\PersonalAccessToken;

class UserTokenController extends Controller
{
    /**
     * List personal access tokens for a given user.
     */
    public function index(Request $request, $userId)
    {
        $user = User::findOrFail($userId);


        // Allow admins to include expired tokens if requested
        if ($request->boolean('include_expired')) {
            $tokens = $user->tokens()->withoutGlobalScope('not_expired')->get(['id', 'name', 'abilities', 'last_used_at', 'created_at', 'expires_at']);
        } else {
            $tokens = $user->tokens()->get(['id', 'name', 'abilities', 'last_used_at', 'created_at', 'expires_at']);
        }

        return response()->json(['data' => $tokens]);
    }

    /**
     * Revoke a token for a given user by token id.
     */
    public function destroy(Request $request, $userId, $tokenId)
    {
        $user = User::findOrFail($userId);

        $token = $user->tokens()->where('id', $tokenId)->first();
        if (! $token) {
            return response()->json(['message' => 'Token not found'], 404);
        }

        $token->delete();

        return response()->json(['message' => 'Token revoked']);
    }

    /**
     * Revoke all tokens for a user.
     */
    public function destroyAll(Request $request, $userId)
    {
        $user = User::findOrFail($userId);
        $user->tokens()->delete();
        return response()->json(['message' => 'All tokens revoked']);
    }
}
