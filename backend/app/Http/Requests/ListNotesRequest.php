<?php

namespace App\Http\Requests;

use App\DTO\NoteListQuery;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Валидация query-параметров пагинации списка заметок.
 */
class ListNotesRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:'.NoteListQuery::MAX_PER_PAGE],
        ];
    }

    public function toDto(): NoteListQuery
    {
        return NoteListQuery::fromArray($this->validated());
    }
}
