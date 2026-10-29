import { useEffect, useState } from 'react'

export type Theme = 'system' | 'light' | 'dark'

// Ключ и логика продублированы в inline-скрипте index.html
const STORAGE_KEY = 'notes.theme'
const darkQuery = '(prefers-color-scheme: dark)'

function readTheme(): Theme {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

function saveTheme(theme: Theme): void {
  try {
    if (theme === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // localStorage недоступен — тема продержится до перезагрузки
  }
}

function applyTheme(theme: Theme): void {
  const dark = theme === 'dark' || (theme === 'system' && window.matchMedia(darkQuery).matches)
  document.documentElement.classList.toggle('dark', dark)
}

export function useTheme(): [Theme, (theme: Theme) => void] {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    applyTheme(theme)
    saveTheme(theme)

    if (theme !== 'system') return

    // В системном режиме следим за сменой темы ОС
    const media = window.matchMedia(darkQuery)
    const onChange = () => applyTheme('system')
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])

  return [theme, setTheme]
}
