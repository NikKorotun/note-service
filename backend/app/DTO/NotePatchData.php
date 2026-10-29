<?php

namespace App\DTO;

use Illuminate\Support\Arr;

/**
 * Частичное обновление заметки (NotePatch в спецификации): только переданные поля.
 */
final readonly class NotePatchData
{
    private const FIELDS = ['title', 'content'];

    /**
     * @param  array{title?: string, content?: string|null}  $changes
     */
    private function __construct(
        private array $changes,
    ) {
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(Arr::only($data, self::FIELDS));
    }

    /**
     * @return array{title?: string, content?: string|null}
     */
    public function toArray(): array
    {
        return $this->changes;
    }
}
