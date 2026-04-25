import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)

  const isAdmin = computed(() =>
    user.value?.role === 'ORG_ADMIN'
  )

  const isSuperAdmin = computed(() =>
    user.value?.role === 'SUPER_ADMIN'
  )

  const isEmployee = computed(() =>
    user.value?.role === 'EMPLOYEE'
  )

  const employeeId = computed(() => user.value?.employeeId || null)

  function login(userData) {
    user.value = userData
    isAuthenticated.value = true
  }

  function logout() {
    user.value = null
    isAuthenticated.value = false
  }

  return { user, isAuthenticated, isAdmin, isSuperAdmin, isEmployee, employeeId, login, logout }
}, {
  persist: {
    key: 'auth-storage',
  },
})
