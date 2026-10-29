<?php

namespace App\DTO;

/**
 * Данные для создания и редактирования заметки (NoteInput в спецификации).
 */
final readonly class NoteData
{
    public function __construct(
        public string $title,
        public ?string $content = null,
    ) {
    }

    /**
     * @param  array{title: string, content?: string|null}  $data
     */
    public static function fromArray(array $data): self
    {
        return new self(
            title: $data['title'],
            content: $data['content'] ?? null,
        );
    }

    /**
     * @return array{title: string, content: string|null}
     */
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'content' => $this->content,
        ];
    }
}
