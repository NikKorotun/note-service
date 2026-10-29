const API_URL = '/api/v1'
const TOKEN_KEY = 'notes.token'

type TokenResponse = {
  access_token: string
  token_type: 'bearer'
  expires_in: number
}

export class ApiError extends Error {
  readonly status: number
  readonly body: unknown

  constructor(status: number, body: unknown) {
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? String(body.message)
        : `Request failed with status ${status}`
    super(message)
    this.status = status
    this.body = body
  }
}

export type ValidationErrors = Record<string, string[]>

/**
 * Ошибки валидации по полям из ответа 400 ({ message, errors }).
 */
export function getValidationErrors(error: unknown): ValidationErrors {
  if (!(error instanceof ApiError) || error.status !== 400) return {}

  const body = error.body
  if (typeof body === 'object' && body !== null && 'errors' in body) {
    return body.errors as ValidationErrors
  }

  return {}
}

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function saveToken(token: string | null): void {
  try {
    if (token === null) localStorage.removeItem(TOKEN_KEY)
    else localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // localStorage недоступен — токен проживёт до перезагрузки страницы
  }
}

let memoryToken: string | null = readToken()

// Один общий запрос за токеном, чтобы параллельные запросы не выпускали/обменивали его несколько раз
let pendingToken: Promise<string> | null = null

async function requestToken(path: string, token?: string): Promise<string | null> {
  const headers: HeadersInit = { Accept: 'application/json' }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_URL}${path}`, { method: 'POST', headers })
  if (!response.ok) return null

  const data = (await response.json()) as TokenResponse
  return data.access_token
}

function obtainToken(expired?: string): Promise<string> {
  pendingToken ??= (async () => {
    // Сначала пробуем пролонгировать истёкший токен, иначе выпускаем новый
    const token =
      (expired ? await requestToken('/auth/refresh', expired) : null) ??
      (await requestToken('/auth/token'))

    if (token === null) throw new ApiError(401, { message: 'Не удалось получить токен' })

    memoryToken = token
    saveToken(token)
    return token
  })().finally(() => {
    pendingToken = null
  })

  return pendingToken
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const send = (token: string) =>
    fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Accept: 'application/json',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
        ...init.headers,
        Authorization: `Bearer ${token}`,
      },
    })

  const token = memoryToken ?? (await obtainToken())
  let response = await send(token)

  if (response.status === 401) {
    // Токен мог уже обновиться параллельным запросом — тогда берём его, а не обмениваем повторно
    const fresh = memoryToken !== token && memoryToken !== null ? memoryToken : await obtainToken(token)
    response = await send(fresh)
  }

  if (response.status === 204) return undefined as T

  const body: unknown = await response.json().catch(() => null)
  if (!response.ok) throw new ApiError(response.status, body)

  return body as T
}
