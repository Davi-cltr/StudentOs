import { useState } from 'react'
import { ConfirmDialog, FormDialog } from '../components/Modal'
import {
  EmptyState,
  Field,
  LoadError,
  Loading,
  PageHeader,
  RowActions,
} from '../components/ui'

export default function SubjectsPage({ subjects }) {
  const [editing, setEditing] = useState(null) // null | 'new' | matéria
  const [deleting, setDeleting] = useState(null)

  async function save(form) {
    const attrs = {
      name: form.get('name').trim(),
      teacher: form.get('teacher').trim(),
    }
    if (editing === 'new') await subjects.create(attrs)
    else await subjects.update(editing.id, attrs)
  }

  return (
    <section>
      <PageHeader title="Matérias" actionLabel="Nova matéria" onAction={() => setEditing('new')} />

      {subjects.loading && <Loading />}
      {subjects.error && <LoadError error={subjects.error} onRetry={subjects.reload} />}

      {!subjects.loading && !subjects.error && subjects.items.length === 0 && (
        <EmptyState title="Nenhuma matéria cadastrada.">
          <p>Cadastre suas matérias para poder organizar tarefas, provas e anotações.</p>
        </EmptyState>
      )}

      <ul className="rows">
        {subjects.items.map((subject) => (
          <li key={subject.id} className="row subject-row">
            <div className="row-main">
              <p className="row-title">{subject.name}</p>
              <p className="row-meta">Professor(a) {subject.teacher}</p>
            </div>
            <RowActions
              label={subject.name}
              onEdit={() => setEditing(subject)}
              onDelete={() => setDeleting(subject)}
            />
          </li>
        ))}
      </ul>

      {editing && (
        <FormDialog
          title={editing === 'new' ? 'Nova matéria' : 'Editar matéria'}
          onSubmit={save}
          onClose={() => setEditing(null)}
        >
          <Field label="Nome da matéria">
            <input name="name" defaultValue={editing.name ?? ''} required />
          </Field>
          <Field label="Professor(a)">
            <input name="teacher" defaultValue={editing.teacher ?? ''} required />
          </Field>
        </FormDialog>
      )}

      {deleting && (
        <ConfirmDialog
          title={`Excluir ${deleting.name}?`}
          confirmLabel="Excluir matéria"
          onConfirm={() => subjects.remove(deleting.id)}
          onClose={() => setDeleting(null)}
        >
          <p>
            As tarefas, provas e anotações desta matéria também serão excluídas. Não é possível
            desfazer.
          </p>
        </ConfirmDialog>
      )}
    </section>
  )
}
