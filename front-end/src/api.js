// Cliente da API Rails. Em desenvolvimento, o Vite encaminha /api para o backend
// (veja vite.config.js), então não é preciso configurar CORS.
const BASE = '/api/v1'

export class ApiError extends Error {
  constructor(messages, status) {
    super(messages.join(' '))
    this.messages = messages
    this.status = status
  }
}

async function request(path, { method = 'GET', body } = {}) {
  let response

  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(
      ['Não foi possível conectar ao servidor. Confira se o backend está rodando.'],
      0,
    )
  }

  if (response.status === 204) return null

  let data = null
  try {
    data = await response.json()
  } catch {
    // Resposta sem corpo JSON: cai na mensagem genérica abaixo, se for um erro.
  }

  if (!response.ok) {
    const messages = data?.errors?.length
      ? data.errors
      : [`Algo deu errado no servidor (erro ${response.status}).`]
    throw new ApiError(messages, response.status)
  }

  return data
}

// `key` é o nome do objeto que o Rails espera no corpo: { task: { ... } }
export const api = {
  list: (resource) => request(`/${resource}`),
  create: (resource, key, attrs) =>
    request(`/${resource}`, { method: 'POST', body: { [key]: attrs } }),
  update: (resource, key, id, attrs) =>
    request(`/${resource}/${id}`, { method: 'PATCH', body: { [key]: attrs } }),
  remove: (resource, id) => request(`/${resource}/${id}`, { method: 'DELETE' }),
}
