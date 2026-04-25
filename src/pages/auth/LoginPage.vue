<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Zap, ArrowRight, Lock, Mail, Eye, EyeOff } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card'

import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const loginRole = ref('')
const showPassword = ref(false)

const authStore = useAuthStore()
const router = useRouter()

const DEMO_ACCOUNTS = {
  admin: {
    id: '1',
    email: 'admin@company.com',
    name: 'Jean Dupont',
    role: 'ORG_ADMIN',
    employeeId: 'JD',
    organizationId: 'org_1',
  },
  employee: {
    id: '2',
    email: 'sarah@company.com',
    name: 'Sarah Lawson',
    role: 'EMPLOYEE',
    employeeId: 'SL',
    organizationId: 'org_1',
  },
  superadmin: {
    id: '0',
    email: 'superadmin@rdt-platform.com',
    name: 'Super Admin',
    role: 'SUPER_ADMIN',
    employeeId: null,
    organizationId: null,
  },
}

function handleLogin() {
  isLoading.value = true
  loginRole.value = ''

  setTimeout(() => {
    authStore.login({
      ...DEMO_ACCOUNTS.admin,
      email: email.value || DEMO_ACCOUNTS.admin.email,
      createdAt: new Date().toISOString(),
    })
    isLoading.value = false
    router.push('/dashboard')
  }, 1500)
}

function handleDemoLogin(role) {
  isLoading.value = true
  loginRole.value = role

  setTimeout(() => {
    authStore.login({
      ...DEMO_ACCOUNTS[role],
      createdAt: new Date().toISOString(),
    })
    isLoading.value = false
    router.push(role === 'superadmin' ? '/super-admin' : '/dashboard')
  }, 1000)
}
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Left Panel - Branding -->
    <div class="hidden lg:flex lg:w-1/2 bg-foreground text-background relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
      <div class="relative z-10 flex flex-col justify-between p-12 w-full">
        <div>
          <router-link to="/" class="flex items-center gap-2">
            <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <Zap class="text-white w-6 h-6" />
            </div>
            <span class="font-bold text-2xl tracking-tight">Registre Dynamique</span>
          </router-link>
        </div>

        <div class="space-y-6 max-w-md">
          <h1 class="text-4xl font-bold leading-tight">
            Simplifiez la gestion de votre entreprise
          </h1>
          <p class="text-lg opacity-80 leading-relaxed">
            Accédez à tous vos outils de gestion depuis une plateforme unique, intuitive et sécurisée.
          </p>
          <div class="space-y-4 pt-4">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Lock class="w-4 h-4" />
              </div>
              <span class="text-sm opacity-80">Données chiffrées de bout en bout</span>
            </div>
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Zap class="w-4 h-4" />
              </div>
              <span class="text-sm opacity-80">Temps de réponse inférieur à 100ms</span>
            </div>
          </div>
        </div>

        <p class="text-sm opacity-50">
          &copy; {{ new Date().getFullYear() }} Registre Dynamique de Travail
        </p>
      </div>
    </div>

    <!-- Right Panel - Login Form -->
    <div class="flex-1 flex items-center justify-center p-8 bg-background">
      <div class="w-full max-w-md space-y-8">
        <!-- Mobile Logo -->
        <div class="lg:hidden flex items-center gap-2 justify-center mb-4">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap class="text-white w-5 h-5" />
          </div>
          <span class="font-bold text-xl tracking-tight">Registre Dynamique</span>
        </div>

        <div class="text-center space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">Bon retour parmi nous</h2>
          <p class="text-muted-foreground">Connectez-vous pour accéder à votre espace</p>
        </div>

        <Card>
          <CardContent class="pt-6">
            <form @submit.prevent="handleLogin" class="space-y-4">
              <div class="space-y-2">
                <Label for="email">Adresse e-mail</Label>
                <div class="relative">
                  <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="vous@entreprise.com"
                    v-model="email"
                    class="pl-10"
                    :disabled="isLoading"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <Label for="password">Mot de passe</Label>
                </div>
                <div class="relative">
                  <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="••••••••"
                    v-model="password"
                    class="pl-10 pr-10"
                    :disabled="isLoading"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    @click="showPassword = !showPassword"
                    tabindex="-1"
                  >
                    <EyeOff v-if="showPassword" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <input
                  id="remember"
                  type="checkbox"
                  class="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                />
                <label for="remember" class="text-sm text-muted-foreground">
                  Se souvenir de moi
                </label>
              </div>

              <Button class="w-full" :disabled="isLoading">
                <template v-if="isLoading">
                  <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion en cours...
                </template>
                <template v-else>
                  Se connecter
                  <ArrowRight class="w-4 h-4" />
                </template>
              </Button>
            </form>
          </CardContent>
<!-- 
          <CardFooter class="flex flex-col space-y-4">
            <div class="relative w-full">
              <div class="absolute inset-0 flex items-center">
                <span class="w-full border-t" />
              </div>
              <div class="relative flex justify-center text-xs uppercase">
                <span class="bg-background px-2 text-muted-foreground">Accès démo rapide</span>
              </div>
            </div>

            <div class="grid grid-cols-3 gap-3 w-full">
              <Button variant="outline" :disabled="isLoading" @click="handleDemoLogin('superadmin')" class="border-2 hover:border-red-500 hover:bg-red-500/5">
                <Zap class="w-4 h-4 mr-2" />
                Super Admin
              </Button>
              <Button variant="outline" :disabled="isLoading" @click="handleDemoLogin('admin')" class="border-2 hover:border-primary hover:bg-primary/5">
                <Lock class="w-4 h-4 mr-2" />
                Admin
              </Button>
              <Button variant="outline" :disabled="isLoading" @click="handleDemoLogin('employee')" class="border-2 hover:border-emerald-500 hover:bg-emerald-500/5">
                <Mail class="w-4 h-4 mr-2" />
                Employé
              </Button>
            </div>
          </CardFooter> -->
        </Card>

        <p class="text-center text-sm text-muted-foreground">
          Besoin d'aide ?
          <a href="/contact" class="text-primary hover:underline font-medium">Contacter le support</a>
        </p>
      </div>
    </div>
  </div>
</template>
