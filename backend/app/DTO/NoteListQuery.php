<?php

namespace App\DTO;

/**
 * Параметры пагинации для списка заметок.
 */
final readonly class NoteListQuery
{
    public const DEFAULT_PER_PAGE = 15;

    public const MAX_PER_PAGE = 100;

    public function __construct(
        public int $page = 1,
        public int $perPage = self::DEFAULT_PER_PAGE,
    ) {
    }

    /**
     * @param  array{page?: int|string, per_page?: int|string}  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            page: (int) ($data['page'] ?? 1),
            perPage: (int) ($data['per_page'] ?? self::DEFAULT_PER_PAGE),
        );
    }
}
