<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  User, Mail, Briefcase, Calendar, Shield, Camera,
  Phone, MapPin, Building, Clock, Eye, EyeOff, Key,
  Save, Upload,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { toast } from 'vue-sonner'
import { profileService } from '@/services/profile'
import { storageUrl } from '@/lib/utils'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const loading = ref(false)
const isEditing = ref(false)
const showPasswordDialog = ref(false)
const avatarPreview = ref(null)

const profile = ref({
  phone: '',
  address: '',
  department: '',
  position: '',
  joinDate: '',
  bio: '',
})

const editForm = ref({ ...profile.value })

const passwordForm = ref({
  current: '',
  newPass: '',
  confirm: '',
  showCurrent: false,
  showNew: false,
  showConfirm: false,
})

onMounted(async () => {
  loading.value = true
  try {
    const { data } = await profileService.get()
    const u = data.user || data.data || data
    const emp = u.employee || {}
    profile.value = {
      phone: u.phone || emp.phone || '',
      address: emp.address || '',
      department: emp.department || '',
      position: emp.role || '',
      joinDate: emp.joined_at || '',
      bio: '',
    }
    authStore.setUser({ ...user.value, ...u })
  } catch {
    toast.error('Impossible de charger le profil')
  } finally {
    loading.value = false
  }
})

function startEditing() {
  editForm.value = { ...profile.value }
  isEditing.value = true
}

async function saveProfile() {
  loading.value = true
  try {
    await profileService.update({
      phone: editForm.value.phone,
      address: editForm.value.address,
      department: editForm.value.department,
      position: editForm.value.position,
      bio: editForm.value.bio,
    })
    const { data } = await profileService.get()
    const u = data.user || data.data || data
    const emp = u.employee || {}
    profile.value = {
      phone: u.phone || emp.phone || '',
      address: emp.address || '',
      department: emp.department || '',
      position: emp.role || '',
      joinDate: emp.joined_at || '',
      bio: '',
    }
    authStore.setUser({ ...user.value, ...u })
    isEditing.value = false
    toast.success('Profil mis à jour avec succès')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour du profil')
  } finally {
    loading.value = false
  }
}

function cancelEditing() {
  isEditing.value = false
}

async function handleAvatarUpload(event) {
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
  const formData = new FormData()
  formData.append('avatar', file)
  try {
    const { data } = await profileService.updateAvatar(formData)
    const avatarUrl = data.avatar || data.data?.avatar || data.user?.avatar
    avatarPreview.value = avatarUrl
    authStore.setUser({ ...user.value, avatar: avatarUrl })
    toast.success('Photo de profil mise à jour')
  } catch {
    toast.error('Erreur lors de l\'upload de la photo')
  }
}

async function removeAvatar() {
  try {
    await profileService.removeAvatar()
    avatarPreview.value = null
    authStore.setUser({ ...user.value, avatar: null })
    toast.info('Photo de profil supprimée')
  } catch {
    toast.error('Erreur lors de la suppression de la photo')
  }
}

function openPasswordDialog() {
  passwordForm.value = { current: '', newPass: '', confirm: '', showCurrent: false, showNew: false, showConfirm: false }
  showPasswordDialog.value = true
}

async function changePassword() {
  if (!passwordForm.value.current) {
    toast.error('Entrez votre mot de passe actuel')
    return
  }
  if (!passwordForm.value.newPass) {
    toast.error('Entrez le nouveau mot de passe')
    return
  }
  if (passwordForm.value.newPass.length < 8) {
    toast.error('Le mot de passe doit contenir au moins 8 caractères')
    return
  }
  if (passwordForm.value.newPass !== passwordForm.value.confirm) {
    toast.error('Les mots de passe ne correspondent pas')
    return
  }
  try {
    await profileService.changePassword({
      current_password: passwordForm.value.current,
      password: passwordForm.value.newPass,
      password_confirmation: passwordForm.value.confirm,
    })
    showPasswordDialog.value = false
    passwordForm.value = { current: '', newPass: '', confirm: '', showCurrent: false, showNew: false, showConfirm: false }
    toast.success('Mot de passe modifié avec succès')
  } catch (err) {
    const msg = err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || 'Erreur lors du changement de mot de passe'
    toast.error(msg)
  }
}

const initials = computed(() => {
  if (!user.value?.name) return 'U'
  return user.value.name.split(' ').map(n => n[0]).join('')
})

const memberSince = computed(() => {
  if (!profile.value.joinDate) return ''
  const d = new Date(profile.value.joinDate)
  return d.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
})

const displayAvatar = computed(() => avatarPreview.value || storageUrl(user.value?.avatar) || null)
</script>

<template>
  <div class="space-y-8 max-w-4xl mx-auto">
    <div>
      <h1 class="text-2xl font-bold text-slate-900 leading-tight">Mon Profil</h1>
      <p class="text-slate-500 font-medium">Gérez vos informations personnelles.</p>
    </div>

    <!-- Profile Header Card -->
    <Card class="border-2 overflow-hidden">
      <div class="h-32 bg-gradient-to-r from-primary/80 to-primary/40 relative" />
      <CardContent class="relative px-6 pb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12">
          <div class="relative group">
            <Avatar class="w-24 h-24 border-4 border-white shadow-lg">
              <AvatarImage :src="displayAvatar" :alt="user?.name" />
              <AvatarFallback class="text-2xl font-bold bg-primary text-white">{{ initials }}</AvatarFallback>
            </Avatar>
            <label class="absolute bottom-0 right-0 w-8 h-8 bg-white border-2 rounded-full flex items-center justify-center shadow-sm hover:bg-slate-50 transition cursor-pointer">
              <Camera class="w-4 h-4 text-slate-500" />
              <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
            </label>
          </div>
          <div class="flex-1 pt-2">
            <h2 class="text-xl font-bold">{{ user?.name }}</h2>
            <p class="text-sm text-slate-500">{{ profile.position }} · {{ profile.department }}</p>
            <div class="flex items-center gap-2 mt-2">
              <label class="cursor-pointer">
                <Button variant="outline" size="sm" class="text-xs font-bold h-7" as="span">
                  <Upload class="w-3 h-3 mr-1" />{{ displayAvatar ? 'Changer la photo' : 'Ajouter une photo' }}
                </Button>
                <input type="file" accept="image/*" class="hidden" @change="handleAvatarUpload" />
              </label>
              <Button v-if="displayAvatar" variant="ghost" size="sm" class="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 h-7" @click="removeAvatar">
                Supprimer
              </Button>
            </div>
          </div>
          <div class="flex gap-2">
            <Badge variant="outline" class="text-xs font-bold">
              <Shield class="w-3 h-3 mr-1" />
              {{ user?.role === 'EMPLOYEE' ? 'Employé' : user?.role === 'ORG_ADMIN' ? 'Administrateur' : user?.role }}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Profile Info -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Info Card -->
      <Card class="border-2 lg:col-span-2">
        <CardHeader class="flex flex-row items-center justify-between">
          <div>
            <CardTitle class="text-lg font-bold">Informations personnelles</CardTitle>
            <CardDescription>Vos coordonnées et informations de contact.</CardDescription>
          </div>
          <Button v-if="!isEditing" variant="outline" size="sm" @click="startEditing" class="font-bold">
            Modifier
          </Button>
        </CardHeader>
        <CardContent class="space-y-6">
          <template v-if="!isEditing">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="flex items-start gap-3">
                <div class="p-2 bg-slate-100 rounded-lg">
                  <User class="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p class="text-xs font-bold uppercase text-slate-400">Nom complet</p>
                  <p class="text-sm font-medium">{{ user?.name }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-2 bg-slate-100 rounded-lg">
                  <Mail class="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p class="text-xs font-bold uppercase text-slate-400">Email</p>
                  <p class="text-sm font-medium">{{ user?.email }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-2 bg-slate-100 rounded-lg">
                  <Phone class="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p class="text-xs font-bold uppercase text-slate-400">Téléphone</p>
                  <p class="text-sm font-medium">{{ profile.phone }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-2 bg-slate-100 rounded-lg">
                  <MapPin class="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p class="text-xs font-bold uppercase text-slate-400">Adresse</p>
                  <p class="text-sm font-medium">{{ profile.address }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-2 bg-slate-100 rounded-lg">
                  <Building class="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p class="text-xs font-bold uppercase text-slate-400">Département</p>
                  <p class="text-sm font-medium">{{ profile.department }}</p>
                </div>
              </div>
              <div class="flex items-start gap-3">
                <div class="p-2 bg-slate-100 rounded-lg">
                  <Briefcase class="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p class="text-xs font-bold uppercase text-slate-400">Poste</p>
                  <p class="text-sm font-medium">{{ profile.position }}</p>
                </div>
              </div>
            </div>
            <div class="pt-4 border-t">
              <p class="text-xs font-bold uppercase text-slate-400 mb-2">Bio</p>
              <p class="text-sm text-slate-600">{{ profile.bio }}</p>
            </div>
          </template>

          <template v-else>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Téléphone</Label>
                <Input v-model="editForm.phone" />
              </div>
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Adresse</Label>
                <Input v-model="editForm.address" />
              </div>
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Département</Label>
                <Input v-model="editForm.department" />
              </div>
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Poste</Label>
                <Input v-model="editForm.position" />
              </div>
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Bio</Label>
              <textarea
                v-model="editForm.bio"
                class="w-full min-h-[80px] px-3 py-2 rounded-md border border-slate-200 text-sm bg-white resize-none"
              />
            </div>
            <div class="flex justify-end gap-2">
              <Button variant="outline" @click="cancelEditing">Annuler</Button>
              <Button @click="saveProfile">Sauvegarder</Button>
            </div>
          </template>
        </CardContent>
      </Card>

      <!-- Side Cards -->
      <div class="space-y-6">
        <Card class="border-2">
          <CardHeader>
            <CardTitle class="text-sm font-bold">Informations entreprise</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div class="flex items-center gap-3">
              <Clock class="w-4 h-4 text-slate-400" />
              <div>
                <p class="text-xs text-slate-400">Membre depuis</p>
                <p class="text-sm font-medium">{{ memberSince }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <Calendar class="w-4 h-4 text-slate-400" />
              <div>
                <p class="text-xs text-slate-400">Date d'embauche</p>
                <p class="text-sm font-medium">{{ profile.joinDate }}</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <Shield class="w-4 h-4 text-slate-400" />
              <div>
                <p class="text-xs text-slate-400">Rôle</p>
                <p class="text-sm font-medium">{{ user?.role === 'EMPLOYEE' ? 'Employé' : 'Admin' }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card class="border-2">
          <CardHeader>
            <CardTitle class="text-sm font-bold">Sécurité</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <Button variant="outline" class="w-full justify-start text-sm font-medium" @click="openPasswordDialog">
              <Key class="w-4 h-4 mr-2" />
              Changer le mot de passe
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Password Change Dialog -->
    <Dialog v-model:open="showPasswordDialog">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Changer le mot de passe</DialogTitle>
          <DialogDescription>Entrez votre mot de passe actuel puis le nouveau.</DialogDescription>
        </DialogHeader>
        <div class="space-y-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-slate-500">Mot de passe actuel</Label>
            <div class="relative">
              <Input
                v-model="passwordForm.current"
                :type="passwordForm.showCurrent ? 'text' : 'password'"
                placeholder="••••••••"
                class="pr-10"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                @click="passwordForm.showCurrent = !passwordForm.showCurrent"
              >
                <EyeOff v-if="passwordForm.showCurrent" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-slate-500">Nouveau mot de passe</Label>
            <div class="relative">
              <Input
                v-model="passwordForm.newPass"
                :type="passwordForm.showNew ? 'text' : 'password'"
                placeholder="Min. 6 caractères"
                class="pr-10"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                @click="passwordForm.showNew = !passwordForm.showNew"
              >
                <EyeOff v-if="passwordForm.showNew" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-slate-500">Confirmer le nouveau mot de passe</Label>
            <div class="relative">
              <Input
                v-model="passwordForm.confirm"
                :type="passwordForm.showConfirm ? 'text' : 'password'"
                placeholder="Répétez le mot de passe"
                class="pr-10"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                @click="passwordForm.showConfirm = !passwordForm.showConfirm"
              >
                <EyeOff v-if="passwordForm.showConfirm" class="w-4 h-4" />
                <Eye v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="showPasswordDialog = false">Annuler</Button>
          <Button @click="changePassword">
            <Save class="w-4 h-4 mr-2" />Confirmer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
