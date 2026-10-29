import type { Note } from '../api/notes'
import { Markdown } from './Markdown'
import { card, checkbox, linkButton, linkDangerButton } from './ui'

const dateFormat = new Intl.DateTimeFormat('ru-RU', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

type Props = {
  note: Note
  selected: boolean
  onToggle: (note: Note) => void
  onEdit: (note: Note) => void
  onDelete: (note: Note) => void
}

export function NoteItem({ note, selected, onToggle, onEdit, onDelete }: Props) {
  const checkboxId = `note-${note.id}-select`

  return (
    <li
      className={`${card} flex gap-3 p-4 transition-colors ${selected ? 'bg-highlight' : ''}`}
    >
      <input
        id={checkboxId}
        type="checkbox"
        checked={selected}
        onChange={() => onToggle(note)}
        aria-label={`Выбрать заметку «${note.title}»`}
        className={`${checkbox} mt-1 shrink-0`}
      />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="break-words font-display text-base font-semibold text-ink">
            {note.title}
          </h2>
          <time
            dateTime={note.updated_at}
            className="shrink-0 rounded-md border-2 border-ink bg-lime px-1.5 py-0.5 text-xs font-bold text-on-accent"
          >
            {dateFormat.format(new Date(note.updated_at))}
          </time>
        </div>

        {note.content && (
          <Markdown className="mt-2 line-clamp-3 text-sm text-muted">{note.content}</Markdown>
        )}

        <div className="mt-3 flex justify-end gap-4">
          <button type="button" onClick={() => onEdit(note)} className={linkButton}>
            Изменить
          </button>
          <button type="button" onClick={() => onDelete(note)} className={linkDangerButton}>
            Удалить
          </button>
        </div>
      </div>
    </li>
  )
}
