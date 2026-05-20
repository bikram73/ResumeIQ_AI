import axios from 'axios'

const BASE = 'http://localhost:8000'

const api = axios.create({ baseURL: BASE })

// Attach JWT token to every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auto-clear token and redirect on 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err?.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export async function register(name, email, password) {
  const res = await api.post('/auth/register', { name, email, password })
  return res.data
}

export async function login(email, password) {
  const form = new FormData()
  form.append('username', email)
  form.append('password', password)
  const res = await api.post('/auth/login', form)
  return res.data
}

export async function getProfile() {
  const res = await api.get('/auth/me')
  return res.data
}

// Resume
export async function uploadResume(file) {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/upload-resume', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function analyze(analysisId, jd) {
  const form = new FormData()
  form.append('analysis_id', analysisId)
  form.append('job_description', jd)
  const res = await api.post('/analyze', form)
  return res.data
}

export async function getResults(analysisId) {
  const res = await api.get(`/results/${analysisId}`)
  return res.data
}

export async function getResumeHistory() {
  const res = await api.get('/resumes')
  return res.data
}

export async function getSuggestions(analysisId) {
  const res = await api.get(`/suggestions/${analysisId}`)
  return res.data
}

export async function getRoleRecommendations(analysisId) {
  const res = await api.get(`/roles/${analysisId}`)
  return res.data
}

export async function rescoreResume(analysisId) {
  const res = await api.post(`/rescore/${analysisId}`)
  return res.data
}

export async function deleteResume(resumeId) {
  const res = await api.delete(`/resumes/${resumeId}`)
  return res.data
}
