/**
 * Русское склонение по числу: plural(5, ['заметка', 'заметки', 'заметок']) → 'заметок'.
 */
export function plural(count: number, [one, few, many]: [string, string, string]): string {
  const mod10 = count % 10
  const mod100 = count % 100

  if (mod10 === 1 && mod100 !== 11) return one
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few
  return many
}

// «Выбрано: 1 заметка»
export const noteForms: [string, string, string] = ['заметка', 'заметки', 'заметок']

// Винительный падеж: «Удалить 1 заметку»
export const noteFormsAccusative: [string, string, string] = ['заметку', 'заметки', 'заметок']
