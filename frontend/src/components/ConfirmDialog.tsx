import { useState, type ReactNode } from 'react'
import { Modal } from './Modal'
import { dangerButton, errorBox, secondaryButton } from './ui'

type Props = {
  open: boolean
  title: string
  children: ReactNode
  confirmLabel: string
  pendingLabel: string
  onConfirm: () => Promise<void>
  onClose: () => void
}

export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  pendingLabel,
  onConfirm,
  onClose,
}: Props) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function close() {
    setError(null)
    onClose()
  }

  async function handleConfirm() {
    setPending(true)
    setError(null)
    try {
      await onConfirm()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Что-то пошло не так')
    } finally {
      setPending(false)
    }
  }

  return (
    // Пока запрос выполняется, окно не закрываем
    <Modal open={open} title={title} onClose={close} locked={pending}>
      <div className="text-sm text-muted">{children}</div>

      {error && <p className={`${errorBox} mt-3`}>{error}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={close} disabled={pending} className={secondaryButton}>
          Отмена
        </button>
        <button type="button" onClick={handleConfirm} disabled={pending} className={dangerButton}>
          {pending ? pendingLabel : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
