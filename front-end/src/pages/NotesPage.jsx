import { useState } from 'react'
import { ConfirmDialog, FormDialog } from '../components/Modal'
import {
  EmptyState,
  Field,
  LoadError,
  Loading,
  PageHeader,
  RowActions,
  SubjectFilter,
  SubjectSelect,
} from '../components/ui'
import { useResource } from '../useResource'

export default function NotesPage({ subjects, goTo }) {
  const notes = useResource('notes', 'note')
  const [editing, setEditing] = useState(null) // null | 'new' | anotação
  const [deleting, setDeleting] = useState(null)
  const [filter, setFilter] = useState('')

  const hasSubjects = subjects.items.length > 0
  const subjectName = (id) => subjects.items.find((subject) => subject.id === id)?.name ?? ''
  const visible = notes.items.filter((note) => !filter || String(note.subject_id) === filter)

  async function save(form) {
    const attrs = {
      title: form.get('title').trim(),
      content: form.get('content').trim(),
      subject_id: Number(form.get('subject_id')),
    }
    if (editing === 'new') await notes.create(attrs)
    else await notes.update(editing.id, attrs)
  }

  return (
    <section>
      <PageHeader
        title="Anotações"
        actionLabel="Nova anotação"
        onAction={hasSubjects ? () => setEditing('new') : undefined}
      />

      <SubjectFilter subjects={subjects.items} value={filter} onChange={setFilter} />

      {notes.loading && <Loading />}
      {notes.error && <LoadError error={notes.error} onRetry={notes.reload} />}

      {!subjects.loading && !hasSubjects && (
        <EmptyState title="Cadastre uma matéria primeiro.">
          <p>Cada anotação pertence a uma matéria.</p>
          <button type="button" className="btn primary" onClick={() => goTo('materias')}>
            Cadastrar matéria
          </button>
        </EmptyState>
      )}

      {hasSubjects && !notes.loading && !notes.error && visible.length === 0 && (
        <EmptyState title="Nenhuma anotação ainda.">
          <p>Escreva resumos e lembretes de estudo, organizados por matéria.</p>
        </EmptyState>
      )}

      <ul className="rows">
        {visible.map((note) => (
          <li key={note.id} className="row note-row">
            <details className="row-main">
              <summary>
                <span className="row-title">{note.title}</span>
                <span className="tag">{subjectName(note.subject_id)}</span>
              </summary>
              <p className="note-content">{note.content}</p>
            </details>
            <RowActions
              label={note.title}
              onEdit={() => setEditing(note)}
              onDelete={() => setDeleting(note)}
            />
          </li>
        ))}
      </ul>

      {editing && (
        <FormDialog
          title={editing === 'new' ? 'Nova anotação' : 'Editar anotação'}
          onSubmit={save}
          onClose={() => setEditing(null)}
        >
          <Field label="Título">
            <input name="title" defaultValue={editing.title ?? ''} required />
          </Field>
          <SubjectSelect
            subjects={subjects.items}
            defaultValue={editing.subject_id ?? filter}
          />
          <Field label="Anotação">
            <textarea name="content" rows="7" defaultValue={editing.content ?? ''} required />
          </Field>
        </FormDialog>
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir anotação?"
          confirmLabel="Excluir anotação"
          onConfirm={() => notes.remove(deleting.id)}
          onClose={() => setDeleting(null)}
        >
          <p>“{deleting.title}” será excluída. Não é possível desfazer.</p>
        </ConfirmDialog>
      )}
    </section>
  )
}
