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
      { path: 'employees', component: () => import('@/pages/dashboard/EmployeesPage.vue'), meta: { moduleId: 'employees' } },
      { path: 'tasks', component: () => import('@/pages/dashboard/TasksPage.vue'), meta: { moduleId: 'tasks' } },
      { path: 'projects', component: () => import('@/pages/dashboard/ProjectsPage.vue'), meta: { moduleId: 'projects' } },
      { path: 'finance', component: () => import('@/pages/dashboard/FinancePage.vue'), meta: { moduleId: 'finance' } },
      {
        path: 'inventory',
        component: () => import('@/pages/dashboard/InventoryPage.vue'),
        meta: { moduleId: 'inventory', fullWidth: true },
      },
      {
        path: 'library',
        component: () => import('@/pages/dashboard/LibraryPage.vue'),
        meta: { moduleId: 'library', fullWidth: true },
      },
      { path: 'attendance', component: () => import('@/pages/dashboard/AttendancePage.vue'), meta: { moduleId: 'attendance' } },
      { path: 'archives', component: () => import('@/pages/dashboard/ArchivesPage.vue'), meta: { moduleId: 'archives' } },
      { path: 'communication', component: () => import('@/pages/dashboard/CommunicationPage.vue'), meta: { moduleId: 'communication' } },
      { path: 'builder', component: () => import('@/pages/dashboard/BuilderPage.vue'), meta: { moduleId: 'builder' } },
      { path: 'module/:id', component: () => import('@/pages/dashboard/DynamicModulePage.vue'), props: true, meta: { moduleId: 'builder' } },
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

  if (to.meta.moduleId && authStore.isAuthenticated && !authStore.isSuperAdmin) {
    const allowed = authStore.allowedModules
    if (!allowed.includes(to.meta.moduleId)) {
      return { path: '/dashboard' }
    }
  }
})

export default router
