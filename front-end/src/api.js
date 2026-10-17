// Cliente da API Rails. Em desenvolvimento, o Vite encaminha /api para o backend
// (veja vite.config.js), então não é preciso configurar CORS.
const BASE = '/api/v1'
const TOKEN_KEY = 'studentos.token'

// O token de login fica no localStorage. É simples e sobrevive ao recarregar a página,
// mas qualquer script da página consegue lê-lo: por isso o app nunca injeta HTML cru.
export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setToken(token) {
  try {
    localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Sem armazenamento disponível (modo privado, por exemplo): a sessão dura até recarregar.
  }
}

export function clearToken() {
  try {
    localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Nada a limpar.
  }
}

// Chamado quando o servidor responde 401 a uma requisição que usava o token
// (token expirado ou revogado). Quem registra decide o que fazer, normalmente voltar ao login.
let unauthorizedHandler = null
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler
}

export class ApiError extends Error {
  constructor(messages, status) {
    super(messages.join(' '))
    this.messages = messages
    this.status = status
  }
}

// `publicRequest`: não envia o token e não trata 401 como sessão expirada (login e cadastro).
// `silent401`: envia o token, mas um 401 não dispara o tratamento de sessão expirada (logout).
async function request(path, { method = 'GET', body, publicRequest = false, silent401 = false } = {}) {
  const token = publicRequest ? null : getToken()
  let response

  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    if (response.status === 401 && !publicRequest && !silent401) {
      clearToken()
      unauthorizedHandler?.()
    }
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

  signup: (attrs) =>
    request('/signup', { method: 'POST', body: { user: attrs }, publicRequest: true }),
  login: (email, password) =>
    request('/login', { method: 'POST', body: { email, password }, publicRequest: true }),
  logout: () => request('/logout', { method: 'DELETE', silent401: true }),
  me: () => request('/me'),
}
