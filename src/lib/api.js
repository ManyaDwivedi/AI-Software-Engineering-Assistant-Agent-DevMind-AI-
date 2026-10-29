export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000').replace(/\/$/, '')

const STORAGE_KEY = 'aiswe.auth'

function authHeaders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY)
    const token = raw ? JSON.parse(raw).token : null
    return token ? { Authorization: `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...authHeaders(),
        ...options.headers,
      },
    })
  } catch {
    throw new Error(`Could not connect to the backend at ${API_BASE_URL}. Check that the API server is running.`)
  }

  const payload = await response.json().catch(() => null)
  if (!response.ok) {
    const detail = payload?.detail
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(', ')
      : typeof detail === 'string'
        ? detail
        : `Request failed (${response.status}).`
    const error = new Error(message)
    error.status = response.status
    if (response.status === 401) {
      window.dispatchEvent(new Event('aiswe:unauthorized'))
    }
    throw error
  }
  return payload
}

function post(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) })
}

export function login(email, password) {
  return post('/auth/login', { email, password })
}

export function register(name, email, password) {
  return post('/auth/register', { name, email, password })
}

export function getCurrentUser() {
  return request('/auth/me')
}

export function getHealth() {
  return request('/health')
}

export function requestPasswordReset(email) {
  return post('/auth/forgot-password', { email })
}

export function getProjects() {
  return request('/projects')
}

export function uploadProject(files, onStage, name) {
  const form = new FormData()
  if (name) form.append('name', name)
  for (const file of Array.isArray(files) ? files : files ? [files] : []) {
    form.append('files', file, file.name)
  }
  onStage?.('Uploading and indexing project')
  return request('/projects/upload', { method: 'POST', body: form })
}

export function analyzeCode(code, language) {
  return post('/ai/analyze', { code, language })
}

export function explainCode(code, language = 'javascript') {
  return post('/ai/explain', { code, language })
}

export function debugCode(code, errorTrace) {
  return post('/ai/debug', { code, errorTrace })
}

export function reviewCode(code, language = 'javascript') {
  return post('/ai/review', { code, language })
}

export function generateCode(prompt, language, framework) {
  return post('/ai/generate', { prompt, language, framework })
}

export function generateTests(code, kinds) {
  return post('/ai/tests', { code, kinds })
}

export function refactorCode(code, language = 'javascript') {
  return post('/ai/refactor', { code, language })
}

export function generateDocumentation(code, type, language = 'javascript') {
  return post('/ai/docs', { code, type, language }).then((result) => result.documentation)
}

export function chatWithAI(message, projectId) {
  return post('/ai/chat', { message, projectId })
}

export function getHistory() {
  return request('/history')
}

export function getProjectGraph(projectId) {
  const query = projectId ? `?project_id=${encodeURIComponent(projectId)}` : ''
  return request(`/projects/graph${query}`)
}

export function getProjectDNA(projectId) {
  const query = projectId ? `?project_id=${encodeURIComponent(projectId)}` : ''
  return request(`/projects/dna${query}`)
}
