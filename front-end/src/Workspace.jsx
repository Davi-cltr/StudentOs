import { useEffect, useState } from 'react'
import { useAuth } from './auth/context'
import ExamsPage from './pages/ExamsPage'
import HomePage from './pages/HomePage'
import NotesPage from './pages/NotesPage'
import SubjectsPage from './pages/SubjectsPage'
import TasksPage from './pages/TasksPage'
import { useResource } from './useResource'

const SECTIONS = [
  { id: 'inicio', label: 'Início', Page: HomePage },
  { id: 'tarefas', label: 'Tarefas', Page: TasksPage },
  { id: 'provas', label: 'Provas', Page: ExamsPage },
  { id: 'anotacoes', label: 'Anotações', Page: NotesPage },
  { id: 'materias', label: 'Matérias', Page: SubjectsPage },
]

function sectionFromHash() {
  const id = window.location.hash.replace('#', '')
  return SECTIONS.some((section) => section.id === id) ? id : SECTIONS[0].id
}

export default function Workspace() {
  const { user, logout } = useAuth()
  const [current, setCurrent] = useState(sectionFromHash)
  // As matérias são usadas por todas as páginas (formulários e filtros).
  const subjects = useResource('subjects', 'subject')

  useEffect(() => {
    const onHashChange = () => setCurrent(sectionFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const goTo = (id) => {
    window.location.hash = id
  }

  const { Page } = SECTIONS.find((section) => section.id === current)

  return (
    <div className="shell">
      <header className="topbar">
        <a className="wordmark" href="#inicio">
          StudentOS
        </a>
        <nav aria-label="Seções">
          {SECTIONS.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              aria-current={section.id === current ? 'page' : undefined}
            >
              {section.label}
            </a>
          ))}
        </nav>
        <div className="account">
          <span className="account-name">{user.name}</span>
          <button type="button" className="link-btn" onClick={logout}>
            Sair
          </button>
        </div>
      </header>

      <main className="page">
        <Page subjects={subjects} goTo={goTo} />
      </main>
    </div>
  )
}
