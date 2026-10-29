<?php

namespace App\Http\Requests;

use App\DTO\NotePatchData;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * Валидация тела запроса при частичном обновлении заметки (PATCH /notes/{id}).
 */
class UpdateNoteRequest extends FormRequest
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
            'title' => ['sometimes', 'required', 'string', 'min:1', 'max:255'],
            'content' => ['sometimes', 'nullable', 'string', 'max:10000'],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if (! $this->hasAny(['title', 'content'])) {
                    $validator->errors()->add('title', 'At least one of the title or content fields is required.');
                }
            },
        ];
    }

    public function toDto(): NotePatchData
    {
        return NotePatchData::fromArray($this->validated());
    }
}
