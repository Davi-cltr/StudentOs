import { useEffect, useRef, useState } from 'react'

// Usa o <dialog> nativo: o navegador cuida do foco, do Esc e do fundo escurecido.
export function Modal({ title, onClose, children }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (dialog && !dialog.open) dialog.showModal()
  }, [])

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(event) => {
        // Clique no fundo escurecido fecha o diálogo.
        if (event.target === ref.current) ref.current.close()
      }}
    >
      <div className="modal-body">
        <h2 id="modal-title">{title}</h2>
        {children}
      </div>
    </dialog>
  )
}

export function ErrorList({ messages }) {
  if (!messages.length) return null
  return (
    <ul className="errors" role="alert">
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  )
}

// Formulário em diálogo. `onSubmit` recebe o FormData e pode lançar um ApiError;
// as mensagens aparecem no próprio diálogo, que só fecha quando o envio dá certo.
export function FormDialog({ title, submitLabel = 'Salvar', onSubmit, onClose, children }) {
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState([])

  async function handleSubmit(event) {
    event.preventDefault()
    setSaving(true)
    setErrors([])
    try {
      await onSubmit(new FormData(event.currentTarget))
      onClose()
    } catch (err) {
      setErrors(err.messages ?? [err.message])
      setSaving(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        {children}
        <ErrorList messages={errors} />
        <div className="modal-actions">
          <button type="button" className="btn" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn primary" disabled={saving}>
            {saving ? 'Salvando…' : submitLabel}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function ConfirmDialog({ title, confirmLabel, onConfirm, onClose, children }) {
  const [working, setWorking] = useState(false)
  const [errors, setErrors] = useState([])

  async function handleConfirm() {
    setWorking(true)
    setErrors([])
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setErrors(err.messages ?? [err.message])
      setWorking(false)
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <div className="modal-text">{children}</div>
      <ErrorList messages={errors} />
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onClose} disabled={working}>
          Cancelar
        </button>
        <button type="button" className="btn danger" onClick={handleConfirm} disabled={working}>
          {working ? 'Excluindo…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
