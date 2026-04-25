import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    component: () => import('@/pages/landing/LandingPage.vue'),
  },
  {
    path: '/login',
    component: () => import('@/pages/auth/LoginPage.vue'),
  },
  {
    path: '/contact',
    component: () => import('@/pages/landing/ContactPage.vue'),
  },
  {
    path: '/',
    component: () => import('@/components/layout/Shell.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: 'dashboard', component: () => import('@/pages/dashboard/Dashboard.vue') },
      { path: 'employees', component: () => import('@/pages/dashboard/EmployeesPage.vue') },
      { path: 'tasks', component: () => import('@/pages/dashboard/TasksPage.vue') },
      { path: 'projects', component: () => import('@/pages/dashboard/ProjectsPage.vue') },
      { path: 'finance', component: () => import('@/pages/dashboard/FinancePage.vue') },
      { path: 'attendance', component: () => import('@/pages/dashboard/AttendancePage.vue') },
      { path: 'archives', component: () => import('@/pages/dashboard/ArchivesPage.vue') },
      { path: 'communication', component: () => import('@/pages/dashboard/CommunicationPage.vue') },
      { path: 'builder', component: () => import('@/pages/dashboard/BuilderPage.vue') },
      { path: 'module/:id', component: () => import('@/pages/dashboard/DynamicModulePage.vue'), props: true },
      { path: 'profile', component: () => import('@/pages/dashboard/ProfilePage.vue') },
      { path: 'settings', component: () => import('@/pages/dashboard/SettingsPage.vue') },
      { path: 'super-admin', component: () => import('@/pages/superadmin/SuperAdminDashboard.vue') },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login' }
  }
})

export default router
