<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Users,
  Calendar,
  CheckSquare,
  Briefcase,
  MessageSquare,
  Settings,
  Wallet,
  Archive,
  PlusCircle,
  Search,
  Bell,
  User,
  LogOut,
  Zap,
  Menu,
  Moon,
  Sun,
  Database,
  UserCircle,
} from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { useBuilderStore } from '@/stores/builder'
import { cn } from '@/lib/utils'

const isSidebarCollapsed = ref(false)
const isMobileMenuOpen = ref(false)

const authStore = useAuthStore()
const themeStore = useThemeStore()
const builderStore = useBuilderStore()
const { user } = storeToRefs(authStore)
const { isAdmin, isSuperAdmin, isEmployee, allowedModules } = storeToRefs(authStore)
const { theme } = storeToRefs(themeStore)
const { sidebarModules: builderModules } = storeToRefs(builderStore)

const route = useRoute()
const router = useRouter()

const adminNavItems = [
  { label: 'Tableau de bord', icon: LayoutDashboard, path: '/dashboard', moduleId: null },
  { label: 'Employés', icon: Users, path: '/employees', moduleId: 'employees' },
  { label: 'Présence', icon: Calendar, path: '/attendance', moduleId: 'attendance' },
  { label: 'Tâches', icon: CheckSquare, path: '/tasks', moduleId: 'tasks' },
  { label: 'Projets', icon: Briefcase, path: '/projects', moduleId: 'projects' },
  { label: 'Finance', icon: Wallet, path: '/finance', moduleId: 'finance' },
  { label: 'Archives', icon: Archive, path: '/archives', moduleId: 'archives' },
  { label: 'Communication', icon: MessageSquare, path: '/communication', moduleId: 'communication' },
  { label: 'Dynamic Builder', icon: PlusCircle, path: '/builder', moduleId: 'builder' },
  { label: 'Paramètres', icon: Settings, path: '/settings', moduleId: null },
]

const employeeNavItems = [
  { label: 'Présence', icon: Calendar, path: '/attendance', moduleId: 'attendance' },
  { label: 'Tâches', icon: CheckSquare, path: '/tasks', moduleId: 'tasks' },
  { label: 'Projets', icon: Briefcase, path: '/projects', moduleId: 'projects' },
  { label: 'Archives', icon: Archive, path: '/archives', moduleId: 'archives' },
  { label: 'Communication', icon: MessageSquare, path: '/communication', moduleId: 'communication' },
  { label: 'Mon Profil', icon: UserCircle, path: '/profile', moduleId: null },
]

const superAdminNavItems = [
  { label: 'Super Admin', icon: Zap, path: '/super-admin', moduleId: null },
]

const navItems = computed(() => {
  if (isSuperAdmin.value) return superAdminNavItems

  const modules = allowedModules.value
  const items = isEmployee.value ? employeeNavItems : adminNavItems

  return items.filter(item => {
    if (!item.moduleId) return true
    return modules.includes(item.moduleId)
  })
})

function handleLogout() {
  authStore.logout()
  router.push('/')
}

onMounted(() => {
  if (isAdmin.value && !builderStore.loaded) {
    builderStore.fetchModules()
  }
})

watch(isAdmin, (val) => {
  if (val && !builderStore.loaded) {
    builderStore.fetchModules()
  }
})
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-background text-foreground">
    <!-- Sidebar -->
    <aside
      :class="cn(
        'relative flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 border-r border-sidebar-border z-30',
        isSidebarCollapsed ? 'w-20' : 'w-64'
      )"
    >
      <!-- Brand -->
      <div class="h-16 flex items-center justify-between px-6 mb-4 border-b border-sidebar-border/30">
        <div class="flex items-center">
          <div class="w-8 h-8 bg-primary rounded flex items-center justify-center shrink-0">
            <div class="w-4 h-4 bg-white rounded-sm" />
          </div>
          <span v-if="!isSidebarCollapsed" class="ml-3 font-bold text-lg tracking-tight">
            RDT
          </span>
        </div>
        <button
          class="w-7 h-7 flex items-center justify-center hover:bg-sidebar-accent rounded-md transition-colors text-sidebar-foreground/60 hover:text-white"
          @click="isSidebarCollapsed = !isSidebarCollapsed"
        >
          <ChevronLeft v-if="!isSidebarCollapsed" class="w-4 h-4" />
          <ChevronRight v-else class="w-4 h-4" />
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 overflow-y-auto px-3 space-y-1">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="cn(
            'flex items-center gap-3 px-6 py-3 transition-all group overflow-hidden font-medium text-sm border-l-3',
            route.path === item.path
              ? 'bg-primary/10 text-white border-primary'
              : 'hover:bg-white/5 text-sidebar-foreground hover:text-white border-transparent'
          )"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          <span v-if="!isSidebarCollapsed" class="truncate">{{ item.label }}</span>
        </router-link>

        <!-- Dynamic Modules (admin only) -->
        <div v-if="isAdmin && builderModules.length > 0" class="mt-6 pt-4 border-t border-sidebar-border/30">
          <p v-if="!isSidebarCollapsed" class="px-6 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50 mb-2">
            Mes Modules
          </p>
          <router-link
            v-for="mod in builderModules"
            :key="'mod-' + mod.id"
            :to="'/module/' + mod.id"
            :class="cn(
              'flex items-center gap-3 px-6 py-3 transition-all group overflow-hidden font-medium text-sm border-l-3',
              route.path === '/module/' + mod.id
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500'
                : 'hover:bg-white/5 text-sidebar-foreground hover:text-white border-transparent'
            )"
          >
            <Database class="w-5 h-5 shrink-0" />
            <span v-if="!isSidebarCollapsed" class="truncate">{{ mod.name }}</span>
          </router-link>
        </div>

      </nav>

    </aside>

    <!-- Main area -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header / Topbar -->
      <header class="h-16 border-b flex items-center justify-between px-6 bg-white dark:bg-slate-950 z-20">
        <!-- Mobile menu button -->
        <Button variant="ghost" size="icon" class="md:hidden" @click="isMobileMenuOpen = !isMobileMenuOpen">
          <Menu class="w-5 h-5" />
        </Button>

        <!-- Search -->
        <div class="hidden md:flex items-center bg-slate-100 dark:bg-slate-900 rounded-lg px-3 py-2 w-96 border-none focus-within:ring-2 ring-primary/20 transition-all">
          <Search class="w-4 h-4 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Rechercher..."
            class="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
          />
        </div>

        <!-- Right side actions -->
        <div class="flex items-center gap-2">
          <!-- Theme toggle -->
          <Button variant="ghost" size="icon" @click="themeStore.toggleTheme()">
            <Sun v-if="theme === 'dark'" class="w-5 h-5" />
            <Moon v-else class="w-5 h-5" />
          </Button>

          <!-- Notifications -->
          <Button variant="ghost" size="icon" class="relative">
            <Bell class="w-5 h-5" />
          </Button>

          <!-- User dropdown -->
          <DropdownMenu>
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" class="flex items-center gap-2 px-2">
                <Avatar class="h-8 w-8">
                  <AvatarImage :src="user?.avatar" :alt="user?.name" />
                  <AvatarFallback>
                    {{ user?.name?.charAt(0) || 'U' }}
                  </AvatarFallback>
                </Avatar>
                <span class="hidden md:inline text-sm font-medium">{{ user?.name }}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" class="w-56">
              <DropdownMenuLabel>
                <div class="flex flex-col space-y-1">
                  <p class="text-sm font-medium">{{ user?.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ user?.email }}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem v-if="!isSuperAdmin" @click="router.push(isEmployee ? '/profile' : '/settings')">
                <User class="w-4 h-4 mr-2" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem v-if="isAdmin" @click="router.push('/settings')">
                <Settings class="w-4 h-4 mr-2" />
                Paramètres
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem class="text-red-600 focus:text-red-600" @click="handleLogout">
                <LogOut class="w-4 h-4 mr-2" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <!-- Main content area with page transition -->
      <main class="flex-1 overflow-auto p-8 relative">
        <div class="max-w-7xl mx-auto h-full">
          <router-view v-slot="{ Component, route: viewRoute }">
            <Transition name="page" mode="out-in">
              <component :is="Component" :key="viewRoute.path" />
            </Transition>
          </router-view>
        </div>
      </main>
    </div>

    <!-- Mobile sidebar overlay -->
    <Transition name="fade">
      <div
        v-if="isMobileMenuOpen"
        class="fixed inset-0 bg-black/50 z-40 md:hidden"
        @click="isMobileMenuOpen = false"
      />
    </Transition>
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
