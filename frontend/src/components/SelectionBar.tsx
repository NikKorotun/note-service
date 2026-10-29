import { useEffect, useRef } from 'react'
import { noteForms, plural } from '../utils/plural'
import { card, checkbox, dangerButton, linkButton } from './ui'

type Props = {
  selectedCount: number
  pageCount: number
  onToggleAll: () => void
  onClear: () => void
  onDelete: () => void
}

export function SelectionBar({ selectedCount, pageCount, onToggleAll, onClear, onDelete }: Props) {
  const checkboxRef = useRef<HTMLInputElement>(null)

  const allSelected = pageCount > 0 && selectedCount === pageCount
  const someSelected = selectedCount > 0 && !allSelected

  // indeterminate задаётся только через DOM-свойство
  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.indeterminate = someSelected
  }, [someSelected])

  return (
    <div
      className={`${card} flex min-h-12 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2`}
    >
      <label className="flex cursor-pointer items-center gap-3 text-sm font-bold text-ink">
        <input
          ref={checkboxRef}
          type="checkbox"
          checked={allSelected}
          onChange={onToggleAll}
          className={checkbox}
        />
        {selectedCount > 0
          ? `Выбрано: ${selectedCount} ${plural(selectedCount, noteForms)}`
          : 'Выбрать все на странице'}
      </label>

      {selectedCount > 0 && (
        <div className="ml-auto flex items-center gap-4">
          <button type="button" onClick={onClear} className={linkButton}>
            Снять выбор
          </button>
          <button type="button" onClick={onDelete} className={dangerButton}>
            Удалить выбранные
          </button>
        </div>
      )}
    </div>
  )
}
