import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const isAuthenticated = ref(false)

  const isAdmin = computed(() => user.value?.role === 'ORG_ADMIN')
  const isSuperAdmin = computed(() => user.value?.role === 'SUPER_ADMIN')
  const isEmployee = computed(() => user.value?.role === 'EMPLOYEE')
  const employeeId = computed(() => user.value?.employee?.id || user.value?.employee_id || null)
  const allowedModules = computed(() => user.value?.organization?.modules || [])

  async function login(email, password) {
    const { data } = await authService.login(email, password)
    user.value = data.user
    token.value = data.token
    isAuthenticated.value = true
    return data
  }

  async function fetchUser() {
    try {
      const { data } = await authService.me()
      user.value = data.user || data.data || data
      isAuthenticated.value = true
      return user.value
    } catch {
      clearAuth()
      return null
    }
  }

  async function logout() {
    try {
      await authService.logout()
    } finally {
      clearAuth()
    }
  }

  function clearAuth() {
    user.value = null
    token.value = null
    isAuthenticated.value = false
  }

  function setUser(userData) {
    user.value = userData
    isAuthenticated.value = true
  }

  return {
    user,
    token,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isEmployee,
    employeeId,
    allowedModules,
    login,
    logout,
    fetchUser,
    clearAuth,
    setUser,
  }
}, {
  persist: {
    key: 'auth-storage',
    pick: ['user', 'token', 'isAuthenticated'],
  },
})
