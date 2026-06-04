import axios from 'axios'

// ✅ FIX: BASE_URL من env variable عشان يشتغل في production
// في الـ dev: اعمل ملف .env فيه VITE_API_URL=http://localhost:5144/api
// في الـ production: حط الـ URL بتاع السيرفر
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5144/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// بيحط الـ Token تلقائياً في كل request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// لو الـ Token انتهى بيعمل Refresh تلقائياً
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }

      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefresh } = res.data.data
        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefresh)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch {
        localStorage.clear()
        window.location.href = '/login'
        return Promise.reject(error)
      }
    }

    return Promise.reject(error)
  }
)

// ── Auth ──
export const authApi = {
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  register: (data: { fullName: string; email: string; password: string }) =>
    api.post('/auth/register', data),
  logout: (refreshToken: string) =>
    api.post('/auth/logout', { refreshToken }),
}

// ── Projects ──
export const projectsApi = {
  getAll: () => api.get('/projects'),
  getById: (id: string) => api.get(`/projects/${id}`),
  create: (data: { name: string; description?: string; color?: string }) =>
    api.post('/projects', data),
  update: (id: string, data: object) => api.put(`/projects/${id}`, data),
  delete: (id: string) => api.delete(`/projects/${id}`),
  addMember: (id: string, data: { userId: string; role: string }) =>
    api.post(`/projects/${id}/members`, data),
  removeMember: (id: string, memberId: string) =>
    api.delete(`/projects/${id}/members/${memberId}`),
}

// ── Tasks ──
export const tasksApi = {
  getByProject: (projectId: string) =>
    api.get(`/tasks/project/${projectId}`),
  getById: (id: string) => api.get(`/tasks/${id}`),
  create: (data: object) => api.post('/tasks', data),
  update: (id: string, data: object) => api.put(`/tasks/${id}`, data),
  delete: (id: string) => api.delete(`/tasks/${id}`),
  changeStatus: (id: string, status: string) =>
    api.patch(`/tasks/${id}/status`, { status }),
}

// ── Comments ──
export const commentsApi = {
  getByTask: (taskId: string) => api.get(`/comments/task/${taskId}`),
  create: (data: { text: string; taskId: string }) =>
    api.post('/comments', data),
  update: (id: string, text: string) => api.put(`/comments/${id}`, { text }),
  delete: (id: string) => api.delete(`/comments/${id}`),
}

// ── Notifications ──
export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: string) => api.patch(`/notifications/${id}/read`, {}),
  markAllAsRead: () => api.patch('/notifications/read-all', {}),
  delete: (id: string) => api.delete(`/notifications/${id}`),
}

// ── Users ──
export const usersApi = {
  getAll: () => api.get('/users'),
  getMe: () => api.get('/users/me'),
  updateProfile: (data: { fullName?: string; avatarUrl?: string }) =>
    api.put('/users/me', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/users/me/password', data),
}
