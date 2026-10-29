import { NotesList } from './components/NotesList'
import { ThemeToggle } from './components/ThemeToggle'

function App() {
  return (
    <div className="min-h-screen bg-paper bg-[radial-gradient(var(--color-dots)_1.5px,transparent_1.5px)] bg-size-[22px_22px] px-4 py-10">
      <main className="mx-auto max-w-2xl">
        <header className="mb-8 flex items-center justify-between gap-4">
          <h1 className="inline-block -rotate-2 rounded-xl border-2 border-ink bg-yellow px-4 py-1.5 font-display text-2xl font-extrabold text-on-accent shadow-brutal">
            Заметки
          </h1>
          <ThemeToggle />
        </header>
        <NotesList />
      </main>
    </div>
  )
}

export default App
