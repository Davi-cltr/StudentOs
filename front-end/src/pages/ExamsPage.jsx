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
import { formatGrade, parseDate, todayISO } from '../lib/format'
import { useResource } from '../useResource'

export default function ExamsPage({ subjects, goTo }) {
  const exams = useResource('exams', 'exam')
  const [editing, setEditing] = useState(null) // null | 'new' | prova
  const [deleting, setDeleting] = useState(null)
  const [filter, setFilter] = useState('')

  const hasSubjects = subjects.items.length > 0
  const subjectName = (id) => subjects.items.find((subject) => subject.id === id)?.name ?? ''
  const visible = exams.items.filter((exam) => !filter || String(exam.subject_id) === filter)
  const today = todayISO()
  const upcoming = visible.filter((exam) => exam.date >= today)
  // A API devolve em ordem de data; as realizadas ficam da mais recente para a mais antiga.
  const past = visible.filter((exam) => exam.date < today).reverse()

  async function save(form) {
    const attrs = {
      name: form.get('name').trim(),
      date: form.get('date'),
      grade: form.get('grade') || null,
      subject_id: Number(form.get('subject_id')),
    }
    if (editing === 'new') await exams.create(attrs)
    else await exams.update(editing.id, attrs)
  }

  function renderExam(exam) {
    const date = parseDate(exam.date)
    const grade = formatGrade(exam.grade)
    return (
      <li key={exam.id} className="row exam-row">
        <div className="date-block" aria-hidden="true">
          <b>{date.getDate()}</b>
          <small>{date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '')}</small>
        </div>
        <div className="row-main">
          <p className="row-title">{exam.name}</p>
          <p className="row-meta">
            <span className="tag">{subjectName(exam.subject_id)}</span>
            <span>
              {date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </span>
            <span className={grade ? 'grade' : 'grade none'}>
              {grade ? `Nota ${grade}` : 'Sem nota'}
            </span>
          </p>
        </div>
        <RowActions
          label={exam.name}
          onEdit={() => setEditing(exam)}
          onDelete={() => setDeleting(exam)}
        />
      </li>
    )
  }

  return (
    <section>
      <PageHeader
        title="Provas"
        actionLabel="Nova prova"
        onAction={hasSubjects ? () => setEditing('new') : undefined}
      />

      <SubjectFilter subjects={subjects.items} value={filter} onChange={setFilter} />

      {exams.loading && <Loading />}
      {exams.error && <LoadError error={exams.error} onRetry={exams.reload} />}

      {!subjects.loading && !hasSubjects && (
        <EmptyState title="Cadastre uma matéria primeiro.">
          <p>Cada prova pertence a uma matéria.</p>
          <button type="button" className="btn primary" onClick={() => goTo('materias')}>
            Cadastrar matéria
          </button>
        </EmptyState>
      )}

      {hasSubjects && !exams.loading && !exams.error && visible.length === 0 && (
        <EmptyState title="Nenhuma prova registrada.">
          <p>Registre as datas das provas e, depois, as notas que você tirar.</p>
        </EmptyState>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="group-title">Próximas</h2>
          <ul className="rows">
            {upcoming.map(renderExam)}
          </ul>
        </>
      )}

      {past.length > 0 && (
        <>
          <h2 className="group-title">Já realizadas</h2>
          <ul className="rows">
            {past.map(renderExam)}
          </ul>
        </>
      )}

      {editing && (
        <FormDialog
          title={editing === 'new' ? 'Nova prova' : 'Editar prova'}
          onSubmit={save}
          onClose={() => setEditing(null)}
        >
          <Field label="Nome da prova">
            <input name="name" defaultValue={editing.name ?? ''} required />
          </Field>
          <SubjectSelect
            subjects={subjects.items}
            defaultValue={editing.subject_id ?? filter}
          />
          <div className="field-pair">
            <Field label="Data">
              <input type="date" name="date" defaultValue={editing.date ?? ''} required />
            </Field>
            <Field label="Nota (0 a 10)">
              <input
                type="number"
                name="grade"
                min="0"
                max="10"
                step="0.01"
                inputMode="decimal"
                defaultValue={editing.grade ?? ''}
              />
            </Field>
          </div>
        </FormDialog>
      )}

      {deleting && (
        <ConfirmDialog
          title="Excluir prova?"
          confirmLabel="Excluir prova"
          onConfirm={() => exams.remove(deleting.id)}
          onClose={() => setDeleting(null)}
        >
          <p>“{deleting.name}” será excluída. Não é possível desfazer.</p>
        </ConfirmDialog>
      )}
    </section>
  )
}
