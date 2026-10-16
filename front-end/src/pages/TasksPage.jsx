import { useState } from 'react'
import { ConfirmDialog, FormDialog } from '../components/Modal'
import {
  ActionError,
  EmptyState,
  Field,
  LoadError,
  Loading,
  PageHeader,
  RowActions,
  SubjectFilter,
  SubjectSelect,
} from '../components/ui'
import { formatDate, todayISO } from '../lib/format'
import { useResource } from '../useResource'

const STATUS_LABELS = {
  pending: 'Pendente',
  in_progress: 'Em andamento',
  completed: 'Concluída',
}

export default function TasksPage({ subjects, goTo }) {
  const tasks = useResource('tasks', 'task')
  const [editing, setEditing] = useState(null) // null | 'new' | tarefa
  const [deleting, setDeleting] = useState(null)
  const [filter, setFilter] = useState('')
  const [actionError, setActionError] = useState(null)

  const hasSubjects = subjects.items.length > 0
  const subjectName = (id) => subjects.items.find((subject) => subject.id === id)?.name ?? ''
  const visible = tasks.items.filter((task) => !filter || String(task.subject_id) === filter)
  const open = visible.filter((task) => task.status !== 'completed')
  const done = visible.filter((task) => task.status === 'completed')
  const today = todayISO()

  async function toggle(task) {
    setActionError(null)
    try {
      await tasks.update(task.id, {
        status: task.status === 'completed' ? 'pending' : 'completed',
      })
    } catch (err) {
      setActionError(err)
    }
  }

  async function save(form) {
    const attrs = {
      title: form.get('title').trim(),
      description: form.get('description').trim(),
      status: form.get('status'),
      due_date: form.get('due_date') || null,
      subject_id: Number(form.get('subject_id')),
    }
    if (editing === 'new') await tasks.create(attrs)
    else await tasks.update(editing.id, attrs)
  }

  function renderTask(task) {
    const completed = task.status === 'completed'
    const late = !completed && task.due_date && task.due_date < today
    return (
      <li key={task.id} className="row task-row">
        <input
          type="checkbox"
          className="check"
          checked={completed}
          onChange={() => toggle(task)}
          aria-label={`Marcar “${task.title}” como ${completed ? 'pendente' : 'concluída'}`}
        />
        <div className="row-main">
          <p className={completed ? 'row-title is-done' : 'row-title'}>{task.title}</p>
          {task.description && <p className="row-text">{task.description}</p>}
          <p className="row-meta">
            <span className="tag">{subjectName(task.subject_id)}</span>
            {task.due_date && (
              <span className={late ? 'due late' : 'due'}>
                {late ? 'Venceu em ' : 'Entrega '}
                {formatDate(task.due_date)}
              </span>
            )}
            {task.status === 'in_progress' && <span className="chip">{STATUS_LABELS.in_progress}</span>}
          </p>
        </div>
        <RowActions
          label={task.title}
          onEdit={() => setEditing(task)}
          onDelete={() => setDeleting(task)}
        />
      </li>
    )
  }

  return (
    <section>
      <PageHeader
        title="Tarefas"
        actionLabel="Nova tarefa"
        onAction={hasSubjects ? () => setEditing('new') : undefined}
      />

      <SubjectFilter subjects={subjects.items} value={filter} onChange={setFilter} />
      <ActionError error={actionError} />

      {tasks.loading && <Loading />}
      {tasks.error && <LoadError error={tasks.error} onRetry={tasks.reload} />}

      {!subjects.loading && !hasSubjects && (
        <EmptyState title="Cadastre uma matéria primeiro.">
          <p>Cada tarefa pertence a uma matéria.</p>
          <button type="button" className="btn primary" onClick={() => goTo('materias')}>
            Cadastrar matéria
          </button>
        </EmptyState>
      )}

      {hasSubjects && !tasks.loading && !tasks.error && visible.length === 0 && (
        <EmptyState title="Nenhuma tarefa por aqui.">
          <p>Crie uma tarefa para acompanhar suas entregas.</p>
        </EmptyState>
      )}

      {open.length > 0 && (
        <>
          <h2 className="group-title">A fazer</h2>
          <ul className="rows">
            {open.map(renderTask)}
          </ul>
        </>
      )}

      {done.length > 0 && (
        <>
          <h2 className="group-title">Concluídas</h2>
          <ul className="rows">
            {done.map(renderTask)}
          </ul>
        </>
      )}

      {editing && (
        <FormDialog
          title={editing === 'new' ? 'Nova tarefa' : 'Editar tarefa'}
          onSubmit={save}
          onClose={() => setEditing(null)}
        >
          <Field label="Título">
            <input name="title" defaultValue={editing.title ?? ''} required />
          </Field>
          <Field label="Descrição">
            <textarea name="description" rows="3" defaultValue={editing.description ?? ''} />
          </Field>
          <SubjectSelect
            subjects={subjects.items}
            defaultValue={editing.subject_id ?? filter}
          />
          <div className="field-pair">
            <Field label="Data de entrega">
              <input type="date" name="due_date" defaultValue={editing.due_date ?? ''} />
            </Field>
            <Field label="Situação">
              <select name="status" defaultValue={editing.status ?? 'pending'}>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormDialog>
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir tarefa?"
          confirmLabel="Excluir tarefa"
          onConfirm={() => tasks.remove(deleting.id)}
          onClose={() => setDeleting(null)}
        >
          <p>“{deleting.title}” será excluída. Não é possível desfazer.</p>
        </ConfirmDialog>
      )}
    </section>
  )
}
