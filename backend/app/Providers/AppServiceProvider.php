<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Schema;
use Laravel\Sanctum\Sanctum;
use App\Models\PersonalAccessToken;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Fix for older MySQL versions where index key length may be too long
        Schema::defaultStringLength(191);

        // Use our custom PersonalAccessToken model so we can enforce expiries/abilities
        try {
            Sanctum::usePersonalAccessTokenModel(PersonalAccessToken::class);
        } catch (\Throwable $e) {
            // If Sanctum is not available in some contexts (tests/bootstrap), ignore.
        }
    }
}
