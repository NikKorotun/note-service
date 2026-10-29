// Кнопка «вдавливается» в тень при нажатии; у неактивной эффекта нет
const button =
  'rounded-lg border-2 border-ink px-4 py-2 text-sm font-bold shadow-brutal-sm transition-[translate,box-shadow] enabled:hover:-translate-0.5 enabled:hover:shadow-brutal enabled:active:translate-0.5 enabled:active:shadow-none disabled:cursor-not-allowed disabled:opacity-50'

export const primaryButton = `${button} bg-yellow text-on-accent`

export const secondaryButton = `${button} bg-surface text-ink`

export const dangerButton = `${button} bg-coral text-on-accent`

export const linkButton =
  'text-sm font-bold text-ink underline decoration-2 underline-offset-4 hover:decoration-pink disabled:opacity-50'

export const linkDangerButton =
  'text-sm font-bold text-danger underline decoration-2 underline-offset-4 hover:decoration-coral disabled:opacity-50'

// Общие классы для карточек и блоков ошибок
export const card = 'rounded-xl border-2 border-ink bg-surface shadow-brutal'

export const errorBox =
  'rounded-lg border-2 border-ink bg-coral px-3 py-2 text-sm font-medium text-on-accent'

export const checkbox = 'h-5 w-5 cursor-pointer accent-pink'
