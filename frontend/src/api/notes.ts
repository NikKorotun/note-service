import { ApiError, apiRequest } from './client'

export const TITLE_MAX_LENGTH = 255
export const CONTENT_MAX_LENGTH = 10000

export type Note = {
  id: number
  title: string
  content: string | null
  created_at: string
  updated_at: string
}

export type NoteInput = {
  title: string
  content: string | null
}

export type PaginationMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export type NoteCollection = {
  data: Note[]
  meta: PaginationMeta
}

type NoteResource = {
  data: Note
}

export function listNotes(page = 1, perPage = 10, signal?: AbortSignal): Promise<NoteCollection> {
  const query = new URLSearchParams({ page: String(page), per_page: String(perPage) })

  return apiRequest<NoteCollection>(`/notes?${query}`, { signal })
}

export async function createNote(input: NoteInput): Promise<Note> {
  const response = await apiRequest<NoteResource>('/notes', {
    method: 'POST',
    body: JSON.stringify(input),
  })

  return response.data
}

// PATCH: передаются только изменяемые поля, хотя бы одно
export async function updateNote(id: number, input: Partial<NoteInput>): Promise<Note> {
  const response = await apiRequest<NoteResource>(`/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  })

  return response.data
}

export function deleteNote(id: number): Promise<void> {
  return apiRequest<void>(`/notes/${id}`, { method: 'DELETE' })
}

/**
 * Удаляет заметки параллельными DELETE /notes/{id} (отдельного bulk-метода в API нет).
 * Удаление не атомарное: возвращает id, которые удалить не удалось.
 * 404 считается успехом — заметки уже нет.
 */
export async function deleteNotes(ids: number[]): Promise<number[]> {
  const results = await Promise.allSettled(ids.map((id) => deleteNote(id)))

  return ids.filter((_, i) => {
    const result = results[i]
    return (
      result.status === 'rejected' &&
      !(result.reason instanceof ApiError && result.reason.status === 404)
    )
  })
}
