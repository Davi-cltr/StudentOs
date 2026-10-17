import { useState } from 'react'
import { useAuth } from '../auth/context'
import { ErrorList } from '../components/Modal'
import { Field } from '../components/ui'

export default function LoginPage() {
  const { login, signup, notice } = useAuth()
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [errors, setErrors] = useState([])
  const [saving, setSaving] = useState(false)

  const isSignup = mode === 'signup'

  function switchMode() {
    setMode(isSignup ? 'login' : 'signup')
    setErrors([])
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const email = form.get('email').trim()
    const password = form.get('password')

    if (isSignup && password !== form.get('password_confirmation')) {
      setErrors(['As senhas não conferem.'])
      return
    }

    setSaving(true)
    setErrors([])
    try {
      if (isSignup) {
        await signup({
          name: form.get('name').trim(),
          email,
          password,
          password_confirmation: form.get('password_confirmation'),
        })
      } else {
        await login(email, password)
      }
      // Sucesso: o AuthProvider troca esta tela pelo app.
    } catch (err) {
      setErrors(err.messages ?? [err.message])
      setSaving(false)
    }
  }

  return (
    <div className="shell">
      <header className="topbar">
        <span className="wordmark">StudentOS</span>
      </header>

      <main className="page auth">
        <h1>{isSignup ? 'Criar conta' : 'Entrar'}</h1>
        <p className="auth-lead">
          {isSignup
            ? 'Cada conta tem as suas próprias matérias, tarefas, provas e anotações.'
            : 'Entre para ver suas matérias, tarefas e provas.'}
        </p>

        {notice && !isSignup && (
          <div className="notice" role="status">
            <p>{notice}</p>
          </div>
        )}

        {/* key: ao alternar entre entrar e criar conta, o formulário começa limpo */}
        <form key={mode} onSubmit={handleSubmit}>
          {isSignup && (
            <Field label="Nome">
              <input name="name" autoComplete="name" required />
            </Field>
          )}
          <Field label="E-mail">
            <input type="email" name="email" autoComplete="email" required />
          </Field>
          <Field label="Senha" hint={isSignup ? 'Use pelo menos 8 caracteres.' : undefined}>
            <input
              type="password"
              name="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              minLength={isSignup ? 8 : undefined}
              required
            />
          </Field>
          {isSignup && (
            <Field label="Confirmar senha">
              <input type="password" name="password_confirmation" autoComplete="new-password" required />
            </Field>
          )}

          <ErrorList messages={errors} />

          <button type="submit" className="btn primary auth-submit" disabled={saving}>
            {saving ? 'Aguarde…' : isSignup ? 'Criar conta' : 'Entrar'}
          </button>
        </form>

        <p className="auth-switch">
          {isSignup ? 'Já tem uma conta?' : 'Ainda não tem uma conta?'}{' '}
          <button type="button" className="link-btn" onClick={switchMode}>
            {isSignup ? 'Entrar' : 'Criar conta'}
          </button>
        </p>
      </main>
    </div>
  )
}
