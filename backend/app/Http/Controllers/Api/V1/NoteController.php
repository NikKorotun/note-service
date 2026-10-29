<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\ListNotesRequest;
use App\Http\Requests\StoreNoteRequest;
use App\Http\Requests\UpdateNoteRequest;
use App\Http\Resources\NoteCollection;
use App\Http\Resources\NoteResource;
use App\Models\Note;
use App\Services\NoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class NoteController extends Controller
{
    public function __construct(
        private readonly NoteService $notes,
    ) {
    }

    /**
     * GET /notes — список всех заметок.
     */
    public function index(ListNotesRequest $request): NoteCollection
    {
        return new NoteCollection($this->notes->list($request->toDto()));
    }

    /**
     * POST /notes — создание заметки.
     */
    public function store(StoreNoteRequest $request): JsonResponse
    {
        $note = $this->notes->create($request->toDto());

        return (new NoteResource($note))
            ->response()
            ->setStatusCode(Response::HTTP_CREATED);
    }

    /**
     * GET /notes/{id} — просмотр заметки.
     */
    public function show(Note $note): NoteResource
    {
        return new NoteResource($note);
    }

    /**
     * PATCH /notes/{id} — частичное редактирование заметки.
     */
    public function update(UpdateNoteRequest $request, Note $note): NoteResource
    {
        return new NoteResource($this->notes->update($note, $request->toDto()));
    }

    /**
     * DELETE /notes/{id} — удаление заметки.
     */
    public function destroy(Note $note): Response
    {
        $this->notes->delete($note);

        return response()->noContent();
    }
}
