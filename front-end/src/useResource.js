import { useCallback, useEffect, useState } from 'react'
import { api } from './api'

// Carrega uma lista da API e expõe as operações de criar, editar e excluir.
// Depois de cada alteração a lista é recarregada, para respeitar a ordem do servidor.
export function useResource(resource, key) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Recarrega a lista (usado depois de alterações e no botão "Tentar de novo").
  const load = useCallback(async () => {
    try {
      setItems(await api.list(resource))
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [resource])

  // Carga inicial. A flag `ignore` evita atualizar o estado depois que o
  // componente já foi desmontado (por exemplo, ao trocar de seção rapidamente).
  useEffect(() => {
    let ignore = false
    api
      .list(resource)
      .then((data) => {
        if (!ignore) {
          setItems(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (!ignore) setError(err)
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })
    return () => {
      ignore = true
    }
  }, [resource])

  const create = async (attrs) => {
    await api.create(resource, key, attrs)
    await load()
  }

  const update = async (id, attrs) => {
    await api.update(resource, key, id, attrs)
    await load()
  }

  const remove = async (id) => {
    await api.remove(resource, id)
    await load()
  }

  return { items, loading, error, reload: load, create, update, remove }
}
