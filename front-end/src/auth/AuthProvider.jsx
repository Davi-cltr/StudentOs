import { useEffect, useState } from 'react'
import { api, clearToken, getToken, setToken, setUnauthorizedHandler } from '../api'
import { AuthContext } from './context'

// status:
//   checking      há um token guardado e estamos confirmando com o servidor
//   anonymous     ninguém logado
//   authenticated usuário logado
//   unreachable   não foi possível falar com o servidor ao abrir o app
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [status, setStatus] = useState(() => (getToken() ? 'checking' : 'anonymous'))
  const [notice, setNotice] = useState('')
  const [attempt, setAttempt] = useState(0)

  // Token expirado ou revogado: volta para o login e explica o motivo.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      setUser(null)
      setStatus('anonymous')
      setNotice('Sua sessão expirou. Entre novamente.')
    })
    return () => setUnauthorizedHandler(null)
  }, [])

  // Ao abrir o app com um token guardado, confirma quem é o usuário.
  useEffect(() => {
    if (status !== 'checking') return
    let ignore = false
    api
      .me()
      .then((me) => {
        if (ignore) return
        setUser(me)
        setStatus('authenticated')
      })
      .catch((err) => {
        if (ignore) return
        // 401 já foi tratado pelo handler acima (limpa o token e volta ao login).
        if (err.status !== 401) setStatus('unreachable')
      })
    return () => {
      ignore = true
    }
  }, [status, attempt])

  function startSession({ token, user: me }) {
    setToken(token)
    setUser(me)
    setNotice('')
    setStatus('authenticated')
  }

  const value = {
    user,
    status,
    notice,
    login: async (email, password) => startSession(await api.login(email, password)),
    signup: async (attrs) => startSession(await api.signup(attrs)),
    logout: async () => {
      try {
        await api.logout()
      } catch {
        // Mesmo sem resposta do servidor, a pessoa sai do app neste aparelho.
      }
      clearToken()
      setUser(null)
      setNotice('')
      setStatus('anonymous')
    },
    retry: () => {
      setStatus('checking')
      setAttempt((current) => current + 1)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
