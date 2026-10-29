<?php

namespace App\Models;

use Database\Factories\NoteFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $title
 * @property string|null $content
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
#[Fillable(['title', 'content'])]
class Note extends Model
{
    /** @use HasFactory<NoteFactory> */
    use HasFactory;
}
