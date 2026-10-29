<?php

namespace App\Services;

use App\DTO\NoteData;
use App\DTO\NoteListQuery;
use App\DTO\NotePatchData;
use App\Models\Note;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NoteService
{
    /**
     * @return LengthAwarePaginator<int, Note>
     */
    public function list(NoteListQuery $query): LengthAwarePaginator
    {
        return Note::query()
            ->latest('id')
            ->paginate(perPage: $query->perPage, page: $query->page);
    }

    public function create(NoteData $data): Note
    {
        return Note::create($data->toArray());
    }

    public function update(Note $note, NotePatchData $data): Note
    {
        $note->update($data->toArray());

        return $note;
    }

    public function delete(Note $note): void
    {
        $note->delete();
    }
}
