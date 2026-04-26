<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Zap, ArrowRight, Lock, Mail, Eye, EyeOff, AlertCircle } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/stores/auth'
import { toast } from 'vue-sonner'

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

onMounted(() => {
  if (route.query.suspended === '1') {
    errorMessage.value = 'Votre organisation a été suspendue. Veuillez contacter l\'administration.'
  }
})

async function handleLogin() {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Veuillez remplir tous les champs.'
    return
  }

  isLoading.value = true

  try {
    const data = await authStore.login(email.value, password.value)
    toast.success(`Bienvenue, ${data.user.name} !`)

    if (data.user.role === 'SUPER_ADMIN') {
      router.push('/super-admin')
    } else {
      router.push('/dashboard')
    }
  } catch (err) {
    const msg = err.response?.data?.message || 'Identifiants incorrects.'
    errorMessage.value = msg
  } finally {
    isLoading.value = false
  }
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
              <div v-if="errorMessage" class="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                <AlertCircle class="w-4 h-4 flex-shrink-0" />
                {{ errorMessage }}
              </div>

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
                    @keydown.enter="handleLogin"
                  />
                </div>
              </div>

              <div class="space-y-2">
                <Label for="password">Mot de passe</Label>
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
        </Card>

        <p class="text-center text-sm text-muted-foreground">
          Besoin d'aide ?
          <router-link to="/contact" class="text-primary hover:underline font-medium">Contacter le support</router-link>
        </p>
      </div>
    </div>
  </div>
</template>
