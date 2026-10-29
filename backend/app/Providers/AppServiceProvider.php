<?php

namespace App\Providers;

use App\Services\Auth\InvalidTokenException;
use App\Services\Auth\JwtService;
use App\Support\LaravelClock;
use Illuminate\Auth\GenericUser;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Psr\Clock\ClockInterface;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(ClockInterface::class, LaravelClock::class);

        $this->app->singleton(JwtService::class, fn (Application $app) => new JwtService(
            clock: $app->make(ClockInterface::class),
            cache: $app->make('cache.store'),
            secret: (string) config('jwt.secret'),
            issuer: config('jwt.issuer'),
            ttl: config('jwt.ttl'),
            refreshTtl: config('jwt.refresh_ttl'),
        ));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Гард "jwt" (guards.api в config/auth.php): токен не привязан к пользователю,
        // поэтому аутентифицированным считается сам валидный токен, идентификатор — его jti
        Auth::viaRequest('jwt', function (Request $request) {
            $token = $request->bearerToken();

            if ($token === null) {
                return null;
            }

            try {
                $claims = $this->app->make(JwtService::class)->decode($token);
            } catch (InvalidTokenException) {
                return null;
            }

            return new GenericUser(['id' => $claims['jti']]);
        });
    }
}
