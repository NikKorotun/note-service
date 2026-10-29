<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Отдаёт кириллицу в JSON как есть, а не \uXXXX: так ответ в 2–3 раза меньше и читается в отладке.
 * Глобальный, чтобы покрыть и ответы контроллеров, и отрендеренные исключения.
 */
class UnescapedUnicodeJson
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($response instanceof JsonResponse) {
            $response->setEncodingOptions($response->getEncodingOptions() | JSON_UNESCAPED_UNICODE);
        }

        return $response;
    }
}
