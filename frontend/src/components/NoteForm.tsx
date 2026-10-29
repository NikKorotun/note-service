import { lazy, Suspense, useId, useState, type FormEvent } from 'react'
import { getValidationErrors } from '../api/client'
import { CONTENT_MAX_LENGTH, TITLE_MAX_LENGTH, type NoteInput } from '../api/notes'
import { errorBox, primaryButton, secondaryButton } from './ui'

// Редактор тяжёлый и нужен только в модалке — грузим его отдельным чанком при первом открытии
const MarkdownEditor = lazy(() =>
  import('./MarkdownEditor').then((module) => ({ default: module.MarkdownEditor })),
)

type Props = {
  initial?: NoteInput
  submitLabel: string
  onSubmit: (input: NoteInput) => Promise<void>
  onCancel: () => void
  // Сообщает родителю о начале/конце сохранения, например чтобы заблокировать закрытие модалки
  onSubmittingChange?: (submitting: boolean) => void
}

type FormErrors = {
  title?: string
  content?: string
  form?: string
}

// Те же правила, что в NoteRequest на бэкенде
function validate(input: NoteInput): FormErrors {
  const errors: FormErrors = {}

  if (input.title.length === 0) errors.title = 'Введите заголовок'
  else if (input.title.length > TITLE_MAX_LENGTH)
    errors.title = `Не длиннее ${TITLE_MAX_LENGTH} символов`

  if (input.content !== null && input.content.length > CONTENT_MAX_LENGTH)
    errors.content = `Не длиннее ${CONTENT_MAX_LENGTH} символов`

  return errors
}

const fieldClass =
  'block w-full rounded-lg border-2 border-ink bg-surface px-3 py-2 text-sm text-ink outline-hidden transition-shadow'

const labelClass = 'block text-sm font-bold text-ink'

const fieldErrorClass = 'text-xs font-bold text-danger'

function fieldState(error?: string): string {
  return error
    ? 'shadow-brutal-coral'
    : 'focus:shadow-brutal'
}

export function NoteForm({ initial, submitLabel, onSubmit, onCancel, onSubmittingChange }: Props) {
  const id = useId()
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmittingState] = useState(false)

  function setSubmitting(value: boolean) {
    setSubmittingState(value)
    onSubmittingChange?.(value)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const input: NoteInput = {
      title: title.trim(),
      content: content.trim() === '' ? null : content,
    }

    const clientErrors = validate(input)
    setErrors(clientErrors)
    if (Object.keys(clientErrors).length > 0) return

    setSubmitting(true)
    try {
      await onSubmit(input)
    } catch (e) {
      const serverErrors = getValidationErrors(e)
      setErrors({
        title: serverErrors.title?.[0],
        content: serverErrors.content?.[0],
        form:
          Object.keys(serverErrors).length > 0
            ? undefined
            : e instanceof Error
              ? e.message
              : 'Не удалось сохранить заметку',
      })
    } finally {
      // И после успеха: родитель уже закрыл модалку, но его флаг блокировки надо снять
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3">
      <div>
        <label htmlFor={`${id}-title`} className={`${labelClass} mb-1`}>
          Заголовок
        </label>
        <input
          id={`${id}-title`}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={TITLE_MAX_LENGTH}
          data-autofocus
          aria-invalid={Boolean(errors.title)}
          className={`${fieldClass} ${fieldState(errors.title)}`}
        />
        {errors.title && <p className={`${fieldErrorClass} mt-1`}>{errors.title}</p>}
      </div>

      <div>
        <label htmlFor={`${id}-content`} className={`${labelClass} mb-1`}>
          Текст
        </label>
        <Suspense
          fallback={
            <div className="h-[260px] animate-pulse rounded-lg border-2 border-ink bg-paper" />
          }
        >
          <MarkdownEditor
            id={`${id}-content`}
            value={content}
            onChange={setContent}
            maxLength={CONTENT_MAX_LENGTH}
            invalid={Boolean(errors.content)}
          />
        </Suspense>
        <div className="mt-1 flex justify-between gap-4 text-xs">
          <span className={fieldErrorClass}>{errors.content}</span>
          <span className="shrink-0 font-medium text-muted">
            {content.length} / {CONTENT_MAX_LENGTH}
          </span>
        </div>
      </div>

      {errors.form && (
        <p className={errorBox}>{errors.form}</p>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} disabled={submitting} className={secondaryButton}>
          Отмена
        </button>
        <button type="submit" disabled={submitting} className={primaryButton}>
          {submitting ? 'Сохранение…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
