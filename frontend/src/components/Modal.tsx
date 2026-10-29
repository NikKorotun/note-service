import { useEffect, useId, useRef, type ReactNode } from 'react'

type Props = {
  open: boolean
  title: string
  onClose: () => void
  // Запрет закрытия (например, пока идёт сохранение): Esc, фон и крестик не срабатывают
  locked?: boolean
  children: ReactNode
}

/**
 * Модальное окно на нативном <dialog>: фокус удерживается внутри, Esc и клик по фону закрывают.
 * Содержимое монтируется только пока окно открыто, поэтому формы внутри каждый раз начинают с нуля.
 */
export function Modal({ open, title, onClose, locked = false, children }: Props) {
  const close = () => {
    if (!locked) onClose()
  }

  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return

    if (open && !dialog.open) {
      dialog.showModal()
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus()
    } else if (!open && dialog.open) {
      dialog.close()
    }
  }, [open])

  // <dialog> не блокирует прокрутку страницы под собой
  useEffect(() => {
    if (!open) return

    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [open])

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onCancel={(e) => {
        // Esc: закрываем через состояние, а не силами браузера
        e.preventDefault()
        close()
      }}
      onClick={(e) => {
        // Клик мимо содержимого попадает в сам <dialog> — это фон
        if (e.target === e.currentTarget) close()
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-2xl border-2 border-ink bg-surface p-0 text-ink shadow-brutal-lg backdrop:bg-black/50 dark:backdrop:bg-black/70"
    >
      {open && (
        <>
          <div className="flex items-center justify-between gap-4 border-b-2 border-ink bg-pink px-5 py-3">
            <h2 id={titleId} className="font-display text-lg font-semibold text-on-accent">
              {title}
            </h2>
            <button
              type="button"
              onClick={close}
              disabled={locked}
              aria-label="Закрыть"
              className="-mr-1 shrink-0 rounded-lg border-2 border-ink bg-surface p-1 text-ink shadow-brutal-sm transition-[translate,box-shadow] enabled:hover:-translate-0.5 enabled:hover:shadow-brutal enabled:active:translate-0.5 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
              </svg>
            </button>
          </div>
          <div className="p-5">{children}</div>
        </>
      )}
    </dialog>
  )
}
