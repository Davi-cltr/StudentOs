export function PageHeader({ title, actionLabel, onAction }) {
  return (
    <header className="page-head">
      <h1>{title}</h1>
      {onAction && (
        <button type="button" className="btn primary" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </header>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small className="hint">{hint}</small>}
    </label>
  )
}

export function SubjectSelect({ subjects, defaultValue, name = 'subject_id' }) {
  return (
    <Field label="Matéria">
      <select name={name} defaultValue={defaultValue ?? ''} required>
        <option value="" disabled>
          Escolha uma matéria
        </option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>
    </Field>
  )
}

// Só aparece quando há mais de uma matéria para filtrar.
export function SubjectFilter({ subjects, value, onChange }) {
  if (subjects.length < 2) return null
  return (
    <label className="filter">
      <span>Matéria</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Todas</option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>
    </label>
  )
}

export function EmptyState({ title, children }) {
  return (
    <div className="empty">
      <p className="empty-title">{title}</p>
      {children}
    </div>
  )
}

export function Loading() {
  return (
    <p className="loading" role="status">
      Carregando…
    </p>
  )
}

export function LoadError({ error, onRetry }) {
  return (
    <div className="notice" role="alert">
      <p>{error.messages.join(' ')}</p>
      <button type="button" className="btn" onClick={onRetry}>
        Tentar de novo
      </button>
    </div>
  )
}

export function ActionError({ error }) {
  if (!error) return null
  return (
    <div className="notice" role="alert">
      <p>{error.messages.join(' ')}</p>
    </div>
  )
}

export function RowActions({ onEdit, onDelete, label }) {
  return (
    <div className="row-actions">
      <button type="button" className="link-btn" onClick={onEdit} aria-label={`Editar ${label}`}>
        Editar
      </button>
      <button type="button" className="link-btn" onClick={onDelete} aria-label={`Excluir ${label}`}>
        Excluir
      </button>
    </div>
  )
}
