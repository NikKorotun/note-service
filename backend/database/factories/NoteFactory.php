<?php

namespace Database\Factories;

use App\Models\Note;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Note>
 */
class NoteFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Интерфейс на русском, поэтому и тексты русские независимо от APP_FAKER_LOCALE
        $faker = fake('ru_RU');

        $createdAt = $faker->dateTimeBetween('-1 year');

        return [
            'title' => rtrim($faker->realTextBetween(15, 80), '.,;:!?'),
            'content' => $faker->optional(0.85)->passthrough(
                implode("\n\n", array_map(
                    fn () => $faker->realTextBetween(80, 600),
                    range(1, $faker->numberBetween(1, 4)),
                )),
            ),
            'created_at' => $createdAt,
            'updated_at' => $faker->optional(0.3, $createdAt)->dateTimeBetween($createdAt),
        ];
    }

    /**
     * Заметка без текста, только с заголовком.
     */
    public function withoutContent(): static
    {
        return $this->state(fn (array $attributes) => [
            'content' => null,
        ]);
    }
}
