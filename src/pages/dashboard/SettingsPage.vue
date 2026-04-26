<script setup>
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
  Settings, Building2, ShieldCheck, Palette, BellRing, Globe,
  CreditCard, User, LogOut, AppWindow, Cloud, ChevronRight, Zap,
  Mail, Lock, Phone, MapPin, Save, Send, Key, Camera, Eye, EyeOff,
  Upload,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { cn, storageUrl } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { toast } from 'vue-sonner'
import { settingsService, profileService } from '@/services/profile'
import { adminMessageService } from '@/services/contact'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const { user } = storeToRefs(authStore)

const loading = ref(false)
const activeSection = ref('organisation')

const navItems = [
  { id: 'organisation', label: 'Organisation', icon: Building2 },
  { id: 'apparence', label: 'Apparence', icon: Palette },
  { id: 'securite', label: 'Sécurité & Accès', icon: ShieldCheck },
  { id: 'notifications', label: 'Notifications', icon: BellRing },
  { id: 'contact', label: 'Contacter l\'Admin', icon: Mail },
]

const orgForm = ref({
  name: '',
  domain: '',
  address: '',
  phone: '',
  email: '',
  companyEmail: '',
  companyEmailPassword: '',
})

const companyLogo = ref(null)
const logoPreview = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await settingsService.getOrg()
    const org = data.data || data
    orgForm.value = {
      name: org.name || '',
      domain: org.domain || '',
      address: org.address || '',
      phone: org.phone || '',
      email: org.email || '',
      companyEmail: org.company_email || org.companyEmail || '',
      companyEmailPassword: '',
    }
    if (org.logo) logoPreview.value = storageUrl(org.logo)
    if (org.accent_color) themeStore.setAccent(org.accent_color)
    if (user.value?.organization) {
      authStore.setUser({ ...user.value, organization: { ...user.value.organization, ...org } })
    }
  } catch {
    toast.error('Impossible de charger les paramètres')
  } finally {
    loading.value = false
  }
})

async function handleLogoUpload(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.error('Veuillez sélectionner une image')
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    toast.error('La taille maximale est de 2 Mo')
    return
  }
  companyLogo.value = file
  const formData = new FormData()
  formData.append('logo', file)
  try {
    const { data } = await settingsService.updateLogo(formData)
    const rawPath = data.data?.logo || data.logo
    logoPreview.value = storageUrl(rawPath)
    if (user.value?.organization) {
      authStore.setUser({ ...user.value, organization: { ...user.value.organization, logo: rawPath } })
    }
    toast.success('Logo mis à jour')
  } catch {
    toast.error('Erreur lors de l\'upload du logo')
  }
}

async function removeLogo() {
  try {
    await settingsService.removeLogo()
    companyLogo.value = null
    logoPreview.value = null
    if (user.value?.organization) {
      authStore.setUser({ ...user.value, organization: { ...user.value.organization, logo: null } })
    }
    toast.info('Logo supprimé')
  } catch {
    toast.error('Erreur lors de la suppression du logo')
  }
}

const credentialsForm = ref({
  newEmail: '',
  currentPasswordForEmail: '',
  showCurrentPasswordForEmail: false,
})

async function updateCredentials() {
  if (!credentialsForm.value.newEmail) {
    toast.error('Veuillez entrer le nouvel email')
    return
  }
  if (!credentialsForm.value.currentPasswordForEmail) {
    toast.error('Veuillez entrer votre mot de passe actuel')
    return
  }
  try {
    await settingsService.updateCredentials({
      email: credentialsForm.value.newEmail,
      current_password: credentialsForm.value.currentPasswordForEmail,
    })
    authStore.setUser({ ...user.value, email: credentialsForm.value.newEmail })
    credentialsForm.value = { newEmail: '', currentPasswordForEmail: '', showCurrentPasswordForEmail: false }
    toast.success('Identifiants mis à jour avec succès')
  } catch (err) {
    const msg = err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || 'Erreur lors de la mise à jour des identifiants'
    toast.error(msg)
  }
}

const securityForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  twoFactor: false,
  sessionTimeout: '30',
  showCurrent: false,
  showNew: false,
  showConfirm: false,
})

const notificationSettings = ref({
  emailNotif: true,
  taskAssigned: true,
  taskCompleted: true,
  newMessage: true,
  systemAlerts: false,
})

const contactForm = ref({
  subject: '',
  message: '',
})

const colors = [
  { id: 'blue', name: 'Bleu', value: 'bg-blue-500', ring: 'ring-blue-300' },
  { id: 'violet', name: 'Violet', value: 'bg-violet-500', ring: 'ring-violet-300' },
  { id: 'emerald', name: 'Émeraude', value: 'bg-emerald-500', ring: 'ring-emerald-300' },
  { id: 'rose', name: 'Rose', value: 'bg-rose-500', ring: 'ring-rose-300' },
  { id: 'orange', name: 'Orange', value: 'bg-orange-500', ring: 'ring-orange-300' },
  { id: 'slate', name: 'Slate', value: 'bg-slate-800', ring: 'ring-slate-400' },
]

async function saveOrg() {
  loading.value = true
  try {
    const { data } = await settingsService.updateOrg({
      name: orgForm.value.name,
      domain: orgForm.value.domain,
      address: orgForm.value.address,
      phone: orgForm.value.phone,
      email: orgForm.value.email,
      company_email: orgForm.value.companyEmail,
    })
    const updatedOrg = data.data || data
    if (user.value?.organization) {
      authStore.setUser({ ...user.value, organization: { ...user.value.organization, ...updatedOrg } })
    }
    toast.success('Informations de l\'organisation sauvegardées')
  } catch {
    toast.error('Erreur lors de la sauvegarde')
  } finally {
    loading.value = false
  }
}

async function saveEmail() {
  if (!orgForm.value.companyEmail) {
    toast.error('Entrez l\'adresse email de l\'entreprise')
    return
  }
  try {
    await settingsService.updateOrg({
      company_email: orgForm.value.companyEmail,
    })
    toast.success('Email entreprise configuré')
  } catch {
    toast.error('Erreur lors de la configuration de l\'email')
  }
}

async function changePassword() {
  if (!securityForm.value.currentPassword || !securityForm.value.newPassword) {
    toast.error('Veuillez remplir tous les champs')
    return
  }
  if (securityForm.value.newPassword !== securityForm.value.confirmPassword) {
    toast.error('Les mots de passe ne correspondent pas')
    return
  }
  try {
    await profileService.changePassword({
      current_password: securityForm.value.currentPassword,
      password: securityForm.value.newPassword,
      password_confirmation: securityForm.value.confirmPassword,
    })
    securityForm.value = {
      currentPassword: '', newPassword: '', confirmPassword: '',
      twoFactor: securityForm.value.twoFactor, sessionTimeout: securityForm.value.sessionTimeout,
      showCurrent: false, showNew: false, showConfirm: false,
    }
    toast.success('Mot de passe modifié avec succès')
  } catch (err) {
    const msg = err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || 'Erreur lors du changement de mot de passe'
    toast.error(msg)
  }
}

async function saveNotifications() {
  try {
    await settingsService.updateNotifications(notificationSettings.value)
    toast.success('Préférences de notification sauvegardées')
  } catch {
    toast.error('Erreur lors de la sauvegarde des notifications')
  }
}

async function sendContactMessage() {
  if (!contactForm.value.subject || !contactForm.value.message) {
    toast.error('Veuillez remplir le sujet et le message')
    return
  }
  try {
    await adminMessageService.send({
      subject: contactForm.value.subject,
      message: contactForm.value.message,
    })
    toast.success('Message envoyé à l\'administration. Vous recevrez une réponse par email.')
    contactForm.value = { subject: '', message: '' }
  } catch {
    toast.error('Erreur lors de l\'envoi du message')
  }
}

async function selectAccent(color) {
  themeStore.setAccent(color.id)
  try {
    await settingsService.updateOrg({ accent_color: color.id })
    toast.success(`Couleur "${color.name}" appliquée`)
  } catch {
    toast.error('Erreur lors de la sauvegarde de la couleur')
  }
}

function handleLogout() {
  authStore.logout()
  toast.info('Déconnexion...')
}
</script>

<template>
  <div class="space-y-8">
    <!-- Page Header -->
    <div class="flex items-center gap-3">
      <div class="p-2.5 bg-primary/10 rounded-xl">
        <Settings class="w-6 h-6 text-primary" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Paramètres</h1>
        <p class="text-slate-500 text-sm font-medium">Gérez la configuration de votre espace de travail.</p>
      </div>
    </div>

    <div class="grid lg:grid-cols-4 gap-8">
      <!-- Left Sidebar -->
      <div class="space-y-6">
        <!-- Profile Card -->
        <Card class="border border-slate-200 bg-white rounded-xl shadow-sm overflow-hidden">
          <div class="h-20 bg-gradient-to-br from-primary via-primary/80 to-violet-500" />
          <CardContent class="p-5 -mt-10 flex flex-col items-center text-center">
            <Avatar class="w-16 h-16 border-4 border-white shadow-md">
              <AvatarImage :src="storageUrl(user?.avatar)" />
              <AvatarFallback class="bg-primary text-white font-bold text-lg">
                {{ user?.name?.charAt(0) ?? 'U' }}
              </AvatarFallback>
            </Avatar>
            <h3 class="font-bold text-slate-900 mt-3">{{ user?.name ?? 'Utilisateur' }}</h3>
            <p class="text-xs text-slate-500 font-medium">{{ user?.email ?? '' }}</p>
            <div class="flex gap-2 mt-4 w-full">
              <Button variant="outline" size="sm" class="flex-1 text-xs font-bold" @click="activeSection = 'organisation'">
                <User class="w-3.5 h-3.5 mr-1" />
                Éditer
              </Button>
              <Button variant="ghost" size="sm" class="text-xs text-red-500 hover:text-red-600 hover:bg-red-50" @click="handleLogout">
                <LogOut class="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <!-- Nav List -->
        <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
          <CardContent class="p-2">
            <nav class="space-y-1">
              <button
                v-for="item in navItems" :key="item.id"
                :class="cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left',
                  activeSection === item.id
                    ? 'bg-primary/10 text-primary font-bold'
                    : 'text-slate-600 hover:bg-slate-50'
                )"
                @click="activeSection = item.id"
              >
                <component :is="item.icon" class="w-4 h-4" />
                {{ item.label }}
                <ChevronRight v-if="activeSection === item.id" class="w-4 h-4 ml-auto" />
              </button>
            </nav>
          </CardContent>
        </Card>
      </div>

      <!-- Main Content -->
      <div class="lg:col-span-3 space-y-6">

        <!-- Organisation Section -->
        <template v-if="activeSection === 'organisation'">
          <!-- Company Logo -->
          <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="p-2 bg-violet-500/10 rounded-lg"><Camera class="w-5 h-5 text-violet-500" /></div>
                <div>
                  <CardTitle class="font-bold text-lg text-slate-800">Logo de l'entreprise</CardTitle>
                  <CardDescription class="text-slate-500 text-sm">Ajoutez ou modifiez le logo de votre organisation.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div class="flex items-center gap-6">
                <div class="relative group">
                  <div class="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50 group-hover:border-primary/40 transition-colors">
                    <img v-if="logoPreview" :src="logoPreview" alt="Logo" class="w-full h-full object-cover" />
                    <Building2 v-else class="w-10 h-10 text-slate-300" />
                  </div>
                  <label class="absolute -bottom-1 -right-1 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-primary/90 transition">
                    <Camera class="w-4 h-4" />
                    <input type="file" accept="image/*" class="hidden" @change="handleLogoUpload" />
                  </label>
                </div>
                <div class="space-y-2">
                  <p class="text-sm font-medium text-slate-700">{{ logoPreview ? 'Logo actuel' : 'Aucun logo défini' }}</p>
                  <p class="text-xs text-slate-400">Format : JPG, PNG, SVG. Taille max : 2 Mo.</p>
                  <div class="flex gap-2">
                    <label class="cursor-pointer">
                      <Button variant="outline" size="sm" class="text-xs font-bold" as="span">
                        <Upload class="w-3.5 h-3.5 mr-1" />{{ logoPreview ? 'Changer' : 'Uploader' }}
                      </Button>
                      <input type="file" accept="image/*" class="hidden" @change="handleLogoUpload" />
                    </label>
                    <Button v-if="logoPreview" variant="ghost" size="sm" class="text-xs text-red-500 hover:text-red-600 hover:bg-red-50" @click="removeLogo">
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-500/10 rounded-lg"><Building2 class="w-5 h-5 text-blue-500" /></div>
                <div>
                  <CardTitle class="font-bold text-lg text-slate-800">Profil Organisation</CardTitle>
                  <CardDescription class="text-slate-500 text-sm">Informations générales de votre entreprise.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-5">
              <div class="grid md:grid-cols-2 gap-5">
                <div class="space-y-2">
                  <Label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom de l'entreprise</Label>
                  <Input v-model="orgForm.name" class="bg-slate-50 border-slate-200" />
                </div>
              </div>
              <div class="space-y-2">
                <Label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Adresse du siège</Label>
                <Input v-model="orgForm.address" class="bg-slate-50 border-slate-200" />
              </div>
              <div class="grid md:grid-cols-2 gap-5">
                <div class="space-y-2">
                  <Label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Téléphone</Label>
                  <Input v-model="orgForm.phone" class="bg-slate-50 border-slate-200" />
                </div>
                <div class="space-y-2">
                  <Label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Email de contact</Label>
                  <Input v-model="orgForm.email" class="bg-slate-50 border-slate-200" />
                </div>
              </div>
              <div class="flex justify-end">
                <Button class="text-xs font-bold uppercase tracking-wider" @click="saveOrg">
                  <Save class="w-3.5 h-3.5 mr-1" />Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Company Email Config -->
          <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="p-2 bg-emerald-500/10 rounded-lg"><Mail class="w-5 h-5 text-emerald-500" /></div>
                <div>
                  <CardTitle class="font-bold text-lg text-slate-800">Email de l'Entreprise</CardTitle>
                  <CardDescription class="text-slate-500 text-sm">Configurez l'email utilisé pour la communication interne.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-5">
              <div class="grid md:grid-cols-2 gap-5">
                <div class="space-y-2">
                  <Label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Adresse Email</Label>
                  <Input v-model="orgForm.companyEmail" type="email" placeholder="entreprise@mail.com" class="bg-slate-50" />
                </div>
                <div class="space-y-2">
                  <Label class="text-xs font-bold text-slate-500 uppercase tracking-wider">Mot de passe</Label>
                  <Input v-model="orgForm.companyEmailPassword" type="password" placeholder="••••••••" class="bg-slate-50" />
                </div>
              </div>
              <div class="flex justify-end">
                <Button class="text-xs font-bold" @click="saveEmail">
                  <Save class="w-3.5 h-3.5 mr-1" />Configurer l'email
                </Button>
              </div>
            </CardContent>
          </Card>
        </template>

        <!-- Apparence Section -->
        <template v-if="activeSection === 'apparence'">
          <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="p-2 bg-violet-500/10 rounded-lg"><Palette class="w-5 h-5 text-violet-500" /></div>
                <div>
                  <CardTitle class="font-bold text-lg text-slate-800">Apparence</CardTitle>
                  <CardDescription class="text-slate-500 text-sm">Personnalisez l'interface de votre espace.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-6">
              <div class="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                <div class="flex items-center gap-3">
                  <div class="p-2 bg-slate-800 rounded-lg"><AppWindow class="w-4 h-4 text-white" /></div>
                  <div>
                    <p class="text-sm font-bold text-slate-800">Mode Sombre</p>
                    <p class="text-xs text-slate-500">Activer le thème sombre pour réduire la fatigue visuelle.</p>
                  </div>
                </div>
                <Switch :checked="themeStore.theme === 'dark'" @update:checked="themeStore.toggleTheme" />
              </div>
              <div>
                <p class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Couleur d'accentuation</p>
                <div class="flex flex-wrap gap-3">
                  <button
                    v-for="color in colors" :key="color.id"
                    :class="cn(
                      'w-10 h-10 rounded-full transition-all hover:scale-110 flex items-center justify-center',
                      color.value,
                      themeStore.accent === color.id ? 'ring-2 ring-offset-2 ' + color.ring : ''
                    )"
                    :title="color.name"
                    @click="selectAccent(color)"
                  >
                    <svg v-if="themeStore.accent === color.id" class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </div>
                <p class="text-xs text-slate-400 mt-2">Cette couleur sera appliquée à toute l'interface de votre entreprise.</p>
              </div>
            </CardContent>
          </Card>
        </template>

        <!-- Securite Section -->
        <template v-if="activeSection === 'securite'">
          <!-- Modifier les identifiants -->
          <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="p-2 bg-blue-500/10 rounded-lg"><Mail class="w-5 h-5 text-blue-500" /></div>
                <div>
                  <CardTitle class="font-bold text-lg text-slate-800">Modifier les identifiants</CardTitle>
                  <CardDescription class="text-slate-500 text-sm">Changez l'adresse email de connexion de votre compte.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-5">
              <div class="p-3 rounded-lg bg-slate-50 border border-slate-100">
                <p class="text-xs font-bold text-slate-400 uppercase">Email actuel</p>
                <p class="text-sm font-medium text-slate-700 mt-1">{{ user?.email }}</p>
              </div>
              <div class="space-y-2">
                <Label class="text-xs font-bold text-slate-500 uppercase">Nouvel email</Label>
                <Input v-model="credentialsForm.newEmail" type="email" placeholder="nouveau@email.com" class="bg-slate-50" />
              </div>
              <div class="space-y-2">
                <Label class="text-xs font-bold text-slate-500 uppercase">Mot de passe actuel (confirmation)</Label>
                <div class="relative">
                  <Input
                    v-model="credentialsForm.currentPasswordForEmail"
                    :type="credentialsForm.showCurrentPasswordForEmail ? 'text' : 'password'"
                    placeholder="••••••••"
                    class="bg-slate-50 pr-10"
                  />
                  <button
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    @click="credentialsForm.showCurrentPasswordForEmail = !credentialsForm.showCurrentPasswordForEmail"
                  >
                    <EyeOff v-if="credentialsForm.showCurrentPasswordForEmail" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="flex justify-end">
                <Button class="text-xs font-bold" @click="updateCredentials">
                  <Save class="w-3.5 h-3.5 mr-1" />Mettre à jour l'email
                </Button>
              </div>
            </CardContent>
          </Card>

          <!-- Changer le mot de passe -->
          <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="p-2 bg-red-500/10 rounded-lg"><Lock class="w-5 h-5 text-red-500" /></div>
                <div>
                  <CardTitle class="font-bold text-lg text-slate-800">Changer le mot de passe</CardTitle>
                  <CardDescription class="text-slate-500 text-sm">Modifiez le mot de passe de votre compte.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-5">
              <div class="space-y-2">
                <Label class="text-xs font-bold text-slate-500 uppercase">Mot de passe actuel</Label>
                <div class="relative">
                  <Input v-model="securityForm.currentPassword" :type="securityForm.showCurrent ? 'text' : 'password'" class="bg-slate-50 pr-10" />
                  <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" @click="securityForm.showCurrent = !securityForm.showCurrent">
                    <EyeOff v-if="securityForm.showCurrent" class="w-4 h-4" />
                    <Eye v-else class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="grid md:grid-cols-2 gap-5">
                <div class="space-y-2">
                  <Label class="text-xs font-bold text-slate-500 uppercase">Nouveau mot de passe</Label>
                  <div class="relative">
                    <Input v-model="securityForm.newPassword" :type="securityForm.showNew ? 'text' : 'password'" class="bg-slate-50 pr-10" />
                    <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" @click="securityForm.showNew = !securityForm.showNew">
                      <EyeOff v-if="securityForm.showNew" class="w-4 h-4" />
                      <Eye v-else class="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div class="space-y-2">
                  <Label class="text-xs font-bold text-slate-500 uppercase">Confirmer</Label>
                  <div class="relative">
                    <Input v-model="securityForm.confirmPassword" :type="securityForm.showConfirm ? 'text' : 'password'" class="bg-slate-50 pr-10" />
                    <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" @click="securityForm.showConfirm = !securityForm.showConfirm">
                      <EyeOff v-if="securityForm.showConfirm" class="w-4 h-4" />
                      <Eye v-else class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <Button class="text-xs font-bold" @click="changePassword">
                  <Key class="w-3.5 h-3.5 mr-1" />Changer le mot de passe
                </Button>
              </div>
            </CardContent>
          </Card>
        </template>

        <!-- Notifications Section -->
        <template v-if="activeSection === 'notifications'">
          <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="p-2 bg-amber-500/10 rounded-lg"><BellRing class="w-5 h-5 text-amber-500" /></div>
                <div>
                  <CardTitle class="font-bold text-lg text-slate-800">Notifications</CardTitle>
                  <CardDescription class="text-slate-500 text-sm">Configurez vos préférences de notification.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-4">
              <div v-for="(value, key) in notificationSettings" :key="key" class="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                <span class="text-sm font-medium text-slate-700">
                  {{ key === 'emailNotif' ? 'Notifications par email' :
                     key === 'taskAssigned' ? 'Tâche assignée' :
                     key === 'taskCompleted' ? 'Tâche terminée' :
                     key === 'newMessage' ? 'Nouveau message' :
                     'Alertes système' }}
                </span>
                <Switch :checked="notificationSettings[key]" @update:checked="v => notificationSettings[key] = v" />
              </div>
              <div class="flex justify-end pt-2">
                <Button class="text-xs font-bold" @click="saveNotifications">
                  <Save class="w-3.5 h-3.5 mr-1" />Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </template>

        <!-- Contact Admin -->
        <template v-if="activeSection === 'contact'">
          <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
            <CardHeader>
              <div class="flex items-center gap-3">
                <div class="p-2 bg-primary/10 rounded-lg"><Mail class="w-5 h-5 text-primary" /></div>
                <div>
                  <CardTitle class="font-bold text-lg text-slate-800">Contacter l'Administration</CardTitle>
                  <CardDescription class="text-slate-500 text-sm">Envoyez un message au super admin de la plateforme. Il recevra votre message par email.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent class="space-y-5">
              <div class="space-y-2">
                <Label class="text-xs font-bold text-slate-500 uppercase">Sujet</Label>
                <Input v-model="contactForm.subject" placeholder="Ex: Demande d'ajout de module" class="bg-slate-50" />
              </div>
              <div class="space-y-2">
                <Label class="text-xs font-bold text-slate-500 uppercase">Message</Label>
                <textarea
                  v-model="contactForm.message"
                  class="w-full min-h-[150px] px-3 py-2 rounded-md border border-slate-200 text-sm bg-slate-50 resize-none"
                  placeholder="Décrivez votre demande en détail..."
                />
              </div>
              <div class="flex justify-end">
                <Button class="font-bold" @click="sendContactMessage">
                  <Send class="w-4 h-4 mr-2" />Envoyer à l'admin
                </Button>
              </div>
            </CardContent>
          </Card>
        </template>
      </div>
    </div>
  </div>
</template>
