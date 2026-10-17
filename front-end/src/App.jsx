import { AuthProvider } from './auth/AuthProvider'
import { useAuth } from './auth/context'
import { LoadError, Loading } from './components/ui'
import LoginPage from './pages/LoginPage'
import Workspace from './Workspace'

function Gate() {
  const { status, retry } = useAuth()

  if (status === 'authenticated') return <Workspace />
  if (status === 'anonymous') return <LoginPage />

  return (
    <div className="shell">
      <main className="page">
        {status === 'unreachable' ? (
          <LoadError
            error={{ messages: ['Não foi possível conectar ao servidor. Confira se o backend está rodando.'] }}
            onRetry={retry}
          />
        ) : (
          <Loading />
        )}
      </main>
    </div>
  )
}

// Só mostra o app para quem está logado. Ao sair, o Workspace é desmontado e todos os
// dados carregados somem da memória, então nada de uma conta aparece na outra.
export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
