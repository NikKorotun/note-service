<?php

namespace App\Support;

use DateTimeImmutable;
use Psr\Clock\ClockInterface;

/**
 * PSR-20 часы поверх Carbon, чтобы в тестах работал Carbon::setTestNow().
 */
final class LaravelClock implements ClockInterface
{
    public function now(): DateTimeImmutable
    {
        return now()->toDateTimeImmutable();
    }
}
