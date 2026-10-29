<?php

namespace App\Http\Requests;

use App\DTO\NoteData;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Валидация тела запроса при создании заметки (POST /notes).
 */
class StoreNoteRequest extends FormRequest
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
            'title' => ['required', 'string', 'min:1', 'max:255'],
            'content' => ['nullable', 'string', 'max:10000'],
        ];
    }

    public function toDto(): NoteData
    {
        return NoteData::fromArray($this->validated());
    }
}
