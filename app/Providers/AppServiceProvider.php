<?php

namespace App\Providers;

use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\ServiceProvider;

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
     *
     * Handles safe ngrok compatibility without affecting localhost.
     * - Trusts X-Forwarded-Proto header from proxies
     * - Forces HTTPS scheme only when request arrives via proxy
     * - Never affects direct localhost requests
     */
    public function boot(): void
    {
        // Detect proxy / ngrok request via X-Forwarded-Proto header.
        // This runs early enough for URL generation to use the correct scheme.
        if ($this->app->runningInConsole()) {
            return; // Skip for artisan commands — no HTTP request context
        }

        $request = $this->app['request'];

        $forwardedProto = $request->header('X-Forwarded-Proto');
        $forwardedHost  = $request->header('X-Forwarded-Host');
        $isViaProxy     = ! empty($forwardedProto) || ! empty($forwardedHost);

        if ($isViaProxy) {
            // Force HTTPS scheme for URL generation so all asset/redirect URLs
            // are correct when accessed through ngrok or any HTTPS proxy.
            if ($forwardedProto === 'https') {
                URL::forceScheme('https');
            }

            // Override the root URL so Inertia + Laravel route helpers generate
            // absolute URLs pointing at the ngrok host, not 127.0.0.1.
            if ($forwardedHost) {
                $scheme = $forwardedProto ?? 'https';
                URL::forceRootUrl("{$scheme}://{$forwardedHost}");
            }

            // Debug logging — safe to leave enabled in development
            Log::debug('[ngrok] Proxy request detected', [
                'scheme'           => $forwardedProto ?? 'http',
                'forwarded_host'   => $forwardedHost ?? '—',
                'real_host'        => $request->getHost(),
                'proxy_detected'   => true,
            ]);
        }
    }
}
