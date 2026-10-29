import { useEffect, useState } from 'react'
import {
  createNote,
  deleteNote,
  deleteNotes,
  listNotes,
  updateNote,
  type Note,
  type NoteCollection,
  type NoteInput,
} from '../api/notes'
import { noteFormsAccusative, plural } from '../utils/plural'
import { ConfirmDialog } from './ConfirmDialog'
import { Modal } from './Modal'
import { NoteForm } from './NoteForm'
import { NoteItem } from './NoteItem'
import { SelectionBar } from './SelectionBar'
import { primaryButton, secondaryButton } from './ui'

const PER_PAGE = 10

type LoadResult = {
  // Для какого запроса (страница + попытка) получен результат
  key: string
  notes: NoteCollection | null
  error: string | null
}

export function NotesList() {
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [result, setResult] = useState<LoadResult | null>(null)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Note | null>(null)
  const [deleting, setDeleting] = useState<Note | null>(null)
  // Идёт сохранение в форме создания/редактирования — модалку закрывать нельзя
  const [saving, setSaving] = useState(false)
  // Выбранные заметки — в пределах текущей страницы
  const [selected, setSelected] = useState<ReadonlySet<number>>(() => new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const requestKey = `${page}:${reloadKey}`

  useEffect(() => {
    const controller = new AbortController()
    const key = `${page}:${reloadKey}`

    listNotes(page, PER_PAGE, controller.signal)
      .then((notes) => setResult({ key, notes, error: null }))
      .catch((e: unknown) => {
        if (controller.signal.aborted) return
        const error = e instanceof Error ? e.message : 'Не удалось загрузить заметки'
        // Оставляем ранее загруженный список, чтобы не мигал при ошибке
        setResult((prev) => ({ key, notes: prev?.notes ?? null, error }))
      })

    return () => controller.abort()
  }, [page, reloadKey])

  // Пока результат относится к другому запросу — идёт загрузка
  const loading = result?.key !== requestKey
  const notes = result?.notes ?? null
  const error = loading ? null : (result?.error ?? null)

  // Учитываем только id, которые есть на странице: удалённые и устаревшие отпадают сами
  const selectedNotes = notes?.data.filter((note) => selected.has(note.id)) ?? []

  const reload = () => setReloadKey((key) => key + 1)

  function goToPage(next: number) {
    setSelected(new Set())
    setPage(next)
  }

  function toggleNote(note: Note) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(note.id)) next.delete(note.id)
      else next.add(note.id)
      return next
    })
  }

  function toggleAll() {
    if (!notes) return
    const allSelected = selectedNotes.length === notes.data.length
    setSelected(allSelected ? new Set() : new Set(notes.data.map((note) => note.id)))
  }

  async function handleCreate(input: NoteInput) {
    await createNote(input)
    setCreating(false)
    // Новые заметки — в начале списка
    if (page === 1) reload()
    else goToPage(1)
  }

  async function handleUpdate(input: NoteInput) {
    if (!editing) return

    // PATCH: отправляем только изменённые поля
    const changes: Partial<NoteInput> = {}
    if (input.title !== editing.title) changes.title = input.title
    if (input.content !== editing.content) changes.content = input.content

    if (Object.keys(changes).length === 0) {
      setEditing(null)
      return
    }

    await updateNote(editing.id, changes)
    setEditing(null)
    reload()
  }

  async function handleDelete() {
    if (!deleting) return
    await deleteNote(deleting.id)
    setDeleting(null)
    // Удалили последнюю заметку на странице — переходим на предыдущую
    if (notes && notes.data.length === 1 && page > 1) goToPage(page - 1)
    else reload()
  }

  async function handleBulkDelete() {
    const ids = selectedNotes.map((note) => note.id)
    const failed = await deleteNotes(ids)
    const deletedCount = ids.length - failed.length

    // Неудалённые остаются выбранными — их можно удалить повторно
    setSelected(new Set(failed))

    if (failed.length > 0) {
      if (deletedCount > 0) reload()
      // Ошибка остаётся в окне подтверждения, кнопка «Удалить» повторит попытку
      throw new Error(
        `Не удалось удалить ${failed.length} ${plural(failed.length, noteFormsAccusative)} из ${ids.length}. Повторите попытку.`,
      )
    }

    setBulkDeleting(false)
    // Удалили всё на странице — переходим на предыдущую
    if (notes && deletedCount === notes.data.length && page > 1) goToPage(page - 1)
    else reload()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button type="button" onClick={() => setCreating(true)} className={primaryButton}>
          Новая заметка
        </button>
      </div>

      <Modal
        open={creating}
        title="Новая заметка"
        onClose={() => setCreating(false)}
        locked={saving}
      >
        <NoteForm
          submitLabel="Создать"
          onSubmit={handleCreate}
          onCancel={() => setCreating(false)}
          onSubmittingChange={setSaving}
        />
      </Modal>

      <Modal
        open={editing !== null}
        title="Редактирование заметки"
        onClose={() => setEditing(null)}
        locked={saving}
      >
        {editing && (
          <NoteForm
            initial={{ title: editing.title, content: editing.content }}
            submitLabel="Сохранить"
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
            onSubmittingChange={setSaving}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={deleting !== null}
        title="Удалить заметку?"
        confirmLabel="Удалить"
        pendingLabel="Удаление…"
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      >
        Заметка <span className="font-bold text-ink">«{deleting?.title}»</span> будет удалена
        без возможности восстановления.
      </ConfirmDialog>

      <ConfirmDialog
        open={bulkDeleting}
        title={`Удалить ${selectedNotes.length} ${plural(selectedNotes.length, noteFormsAccusative)}?`}
        confirmLabel="Удалить"
        pendingLabel="Удаление…"
        onConfirm={handleBulkDelete}
        onClose={() => setBulkDeleting(false)}
      >
        <p>Выбранные заметки будут удалены без возможности восстановления:</p>
        <ul className="mt-2 max-h-48 list-disc space-y-1 overflow-y-auto pl-5">
          {selectedNotes.map((note) => (
            <li key={note.id} className="break-words font-bold text-ink">
              {note.title}
            </li>
          ))}
        </ul>
      </ConfirmDialog>

      {error ? (
        <div className="rounded-xl border-2 border-ink bg-coral p-4 text-sm font-medium text-on-accent shadow-brutal">
          <p>{error}</p>
          <button
            type="button"
            onClick={reload}
            className="mt-2 font-bold underline decoration-2 underline-offset-4 hover:no-underline"
          >
            Повторить
          </button>
        </div>
      ) : !notes ? (
        <p className="py-12 text-center text-sm font-bold text-muted">Загрузка…</p>
      ) : notes.meta.total === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-ink bg-surface py-12 text-center text-sm font-bold text-muted">
          Заметок пока нет
        </div>
      ) : (
        <div
          className={`space-y-3 ${loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}`}
        >
          <SelectionBar
            selectedCount={selectedNotes.length}
            pageCount={notes.data.length}
            onToggleAll={toggleAll}
            onClear={() => setSelected(new Set())}
            onDelete={() => setBulkDeleting(true)}
          />

          <ul className="space-y-4">
            {notes.data.map((note) => (
              <NoteItem
                key={note.id}
                note={note}
                selected={selected.has(note.id)}
                onToggle={toggleNote}
                onEdit={setEditing}
                onDelete={setDeleting}
              />
            ))}
          </ul>

          {notes.meta.last_page > 1 && (
            <nav className="flex items-center justify-between text-sm">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => goToPage(page - 1)}
                className={secondaryButton}
              >
                ← Назад
              </button>
              <span className="font-bold text-ink">
                Страница {notes.meta.current_page} из {notes.meta.last_page}
              </span>
              <button
                type="button"
                disabled={page >= notes.meta.last_page || loading}
                onClick={() => goToPage(page + 1)}
                className={secondaryButton}
              >
                Вперёд →
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  )
}
