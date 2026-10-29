<?php

namespace Database\Seeders;

use App\Models\Note;
use Illuminate\Database\Seeder;

class NoteSeeder extends Seeder
{
    private const COUNT = 500;

    /**
     * Список сортируется по id, поэтому сохраняем в порядке создания:
     * тогда новые по id заметки окажутся и новыми по дате.
     */
    public function run(): void
    {
        Note::factory()
            ->count(self::COUNT)
            ->make()
            ->sortBy('created_at')
            ->each->save();
    }
}
