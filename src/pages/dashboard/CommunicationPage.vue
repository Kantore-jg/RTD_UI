<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  MessageSquare, Send, Search, Megaphone, Hash,
  Plus, MoreVertical, Paperclip, Smile,
  Lightbulb, X, Newspaper, Clock,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { channelService, suggestionService, newsletterService } from '@/services/communication'

const authStore = useAuthStore()
const { user, isAdmin, isEmployee } = storeToRefs(authStore)

const channels = ref([])
const currentMessages = ref([])
const suggestions = ref([])
const loading = ref(false)
const loadingMessages = ref(false)
const loadingSuggestions = ref(false)

const selectedChannelId = ref(null)
const message = ref('')
const activeView = ref('chat')
const showNewSuggestion = ref(false)
const newSuggestion = ref('')
const sidebarSearchTerm = ref('')

const showNewChannel = ref(false)
const newChannel = ref({ name: '', type: 'PUBLIC' })

const selectedChannel = computed(() =>
  channels.value.find(c => c.id === selectedChannelId.value)
)

const filteredChannels = computed(() => {
  if (!sidebarSearchTerm.value) return channels.value
  const term = sidebarSearchTerm.value.toLowerCase()
  return channels.value.filter(c => c.name.toLowerCase().includes(term))
})

const announcementChannels = computed(() =>
  filteredChannels.value.filter(c => c.type === 'ANNOUNCEMENT')
)

const regularChannels = computed(() =>
  filteredChannels.value.filter(c => c.type !== 'ANNOUNCEMENT')
)

const filteredSuggestions = computed(() => {
  if (isAdmin.value) return suggestions.value
  const userId = user.value?.id
  const userName = user.value?.name
  return suggestions.value.filter(s =>
    s.user_id === userId || s.user?.id === userId || s.author === userName
  )
})

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('')
}

async function fetchChannels() {
  loading.value = true
  try {
    const { data } = await channelService.list()
    channels.value = data.data ?? data
    if (channels.value.length && !selectedChannelId.value) {
      await selectChannel(channels.value[0].id)
    }
  } catch {
    toast.error('Erreur lors du chargement des canaux')
  } finally {
    loading.value = false
  }
}

async function fetchMessages(channelId) {
  loadingMessages.value = true
  try {
    const { data } = await channelService.getMessages(channelId)
    const msgs = data.data ?? data
    currentMessages.value = msgs.map(m => ({
      id: m.id,
      user: m.user?.name ?? 'Inconnu',
      text: m.text,
      time: new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      avatar: getInitials(m.user?.name ?? 'IN'),
      self: m.user?.id === user.value?.id,
    }))
    scrollToBottom()
  } catch {
    toast.error('Erreur lors du chargement des messages')
  } finally {
    loadingMessages.value = false
  }
}

async function fetchSuggestions() {
  loadingSuggestions.value = true
  try {
    const { data } = await suggestionService.list()
    const raw = data.data ?? data
    suggestions.value = (Array.isArray(raw) ? raw : []).map(s => ({
      ...s,
      author: s.user?.name || s.author || 'Anonyme',
      date: s.created_at ? new Date(s.created_at).toLocaleDateString('fr-FR') : s.date || '',
    }))
  } catch {
    toast.error('Erreur lors du chargement des suggestions')
  } finally {
    loadingSuggestions.value = false
  }
}

async function selectChannel(channelId) {
  selectedChannelId.value = channelId
  const channel = channels.value.find(c => c.id === channelId)
  if (channel) channel.unread = 0
  await fetchMessages(channelId)
}

async function sendMessage() {
  if (!message.value.trim() || !selectedChannelId.value) return
  try {
    await channelService.sendMessage(selectedChannelId.value, message.value)
    message.value = ''
    await fetchMessages(selectedChannelId.value)
    scrollToBottom()
  } catch {
    toast.error('Erreur lors de l\'envoi du message')
  }
}

async function createChannel() {
  if (!newChannel.value.name.trim()) {
    toast.error('Le nom du canal est obligatoire')
    return
  }
  try {
    await channelService.create({
      name: newChannel.value.name,
      type: newChannel.value.type,
    })
    newChannel.value = { name: '', type: 'PUBLIC' }
    showNewChannel.value = false
    toast.success('Canal créé')
    await fetchChannels()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la création du canal')
  }
}

async function deleteChannel(channelId) {
  try {
    await channelService.delete(channelId)
    toast.success('Canal supprimé')
    if (selectedChannelId.value === channelId) {
      selectedChannelId.value = null
      currentMessages.value = []
    }
    await fetchChannels()
  } catch {
    toast.error('Erreur lors de la suppression du canal')
  }
}

function scrollToBottom() {
  setTimeout(() => {
    const scrollEl = document.querySelector('.chat-scroll-area [data-radix-scroll-area-viewport]')
    if (scrollEl) scrollEl.scrollTop = scrollEl.scrollHeight
  }, 100)
}

async function addSuggestion() {
  if (!newSuggestion.value.trim()) {
    toast.error('Écrivez votre suggestion')
    return
  }
  try {
    await suggestionService.create({ text: newSuggestion.value })
    newSuggestion.value = ''
    showNewSuggestion.value = false
    toast.success('Suggestion envoyée')
    await fetchSuggestions()
  } catch {
    toast.error('Erreur lors de l\'envoi de la suggestion')
  }
}

async function voteSuggestion(suggestion) {
  try {
    await suggestionService.vote(suggestion.id)
    toast.success('Vote enregistré')
    await fetchSuggestions()
  } catch {
    toast.error('Erreur lors du vote')
  }
}

async function updateSuggestionStatus(suggestion, status) {
  try {
    await suggestionService.updateStatus(suggestion.id, status)
    toast.success(`Suggestion marquée comme "${status === 'implemented' ? 'Implémenté' : status === 'rejected' ? 'Rejeté' : 'Ouvert'}"`)
    await fetchSuggestions()
  } catch {
    toast.error('Erreur lors de la mise à jour du statut')
  }
}

const receivedNewsletters = ref([])
const loadingNewsletters = ref(false)

async function fetchNewsletters() {
  loadingNewsletters.value = true
  try {
    const { data } = await newsletterService.list()
    receivedNewsletters.value = data.data || data || []
  } catch {
    // silent
  } finally {
    loadingNewsletters.value = false
  }
}

onMounted(() => {
  fetchChannels()
  fetchSuggestions()
  fetchNewsletters()
})
</script>

<template>
  <div class="h-[calc(100vh-160px)] flex flex-col gap-4 overflow-hidden">
    <!-- Tab switcher -->
    <div class="flex items-center justify-between shrink-0">
      <Tabs v-model="activeView" class="w-full">
        <TabsList class="bg-muted p-1 border h-10 rounded-xl gap-1">
          <TabsTrigger value="chat" class="font-bold data-[state=active]:bg-background rounded-lg px-4 text-xs">
            <MessageSquare class="w-3.5 h-3.5 mr-1.5" />Communication
          </TabsTrigger>
          <TabsTrigger value="suggestions" class="font-bold data-[state=active]:bg-background rounded-lg px-4 text-xs">
            <Lightbulb class="w-3.5 h-3.5 mr-1.5" />Suggestions
          </TabsTrigger>
          <TabsTrigger value="newsletter" class="font-bold data-[state=active]:bg-background rounded-lg px-4 text-xs">
            <Newspaper class="w-3.5 h-3.5 mr-1.5" />Newsletter
            <Badge v-if="receivedNewsletters.length" variant="secondary" class="ml-1 h-4 min-w-4 px-1 text-[10px]">{{ receivedNewsletters.length }}</Badge>
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>

    <!-- CHAT VIEW -->
    <div v-if="activeView === 'chat'" class="flex gap-6 flex-1 overflow-hidden">
      <!-- Sidebar -->
      <div class="w-80 flex flex-col gap-6 shrink-0 h-full">
        <Card class="flex-1 border-2 overflow-hidden flex flex-col h-full rounded-2xl">
          <CardHeader class="py-4 px-4 border-b">
            <div class="flex justify-between items-center">
              <CardTitle class="text-lg font-black tracking-tight">Communication</CardTitle>
              <Dialog v-if="isAdmin" v-model:open="showNewChannel">
                <DialogTrigger as-child>
                  <Button variant="ghost" size="icon" class="h-8 w-8">
                    <Plus class="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent class="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Nouveau Canal</DialogTitle>
                    <DialogDescription>Créez un canal de communication.</DialogDescription>
                  </DialogHeader>
                  <div class="grid gap-4 py-4">
                    <div class="space-y-2">
                      <Label class="text-xs font-bold uppercase text-slate-500">Nom du canal *</Label>
                      <Input v-model="newChannel.name" placeholder="Ex: Marketing, Projets..." />
                    </div>
                    <div class="space-y-2">
                      <Label class="text-xs font-bold uppercase text-slate-500">Type</Label>
                      <select v-model="newChannel.type" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
                        <option value="PUBLIC">Public</option>
                        <option value="ANNOUNCEMENT">Annonces</option>
                        <option value="PRIVATE">Privé</option>
                      </select>
                    </div>
                  </div>
                  <div class="flex justify-end gap-2">
                    <Button variant="outline" @click="showNewChannel = false">Annuler</Button>
                    <Button @click="createChannel">Créer</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div class="relative mt-2">
              <Search class="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <Input v-model="sidebarSearchTerm" placeholder="Rechercher..." class="pl-9 h-9 border-2 text-xs" />
            </div>
          </CardHeader>
          <ScrollArea class="flex-1 p-2">
            <div class="space-y-6">
              <!-- Announcements -->
              <div v-if="announcementChannels.length > 0">
                <h3 class="px-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-2">
                  <Megaphone class="w-3 h-3" />Annonces
                </h3>
                <div class="space-y-1">
                  <div
                    v-for="c in announcementChannels" :key="c.id"
                    :class="cn(
                      'w-full flex justify-between items-center px-3 py-2 rounded-lg hover:bg-muted font-bold text-sm group transition-all cursor-pointer',
                      selectedChannelId === c.id && 'bg-primary/10 text-primary'
                    )"
                    @click="selectChannel(c.id)"
                  >
                    <span class="flex items-center gap-2">
                      <Megaphone class="w-3.5 h-3.5 text-primary" />{{ c.name }}
                    </span>
                    <div class="flex items-center gap-1">
                      <Badge v-if="c.messages_count" variant="secondary" class="h-4 min-w-4 px-1 flex items-center justify-center text-[10px]">{{ c.messages_count }}</Badge>
                      <Button v-if="isAdmin" variant="ghost" size="icon" class="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600" @click.stop="deleteChannel(c.id)">
                        <X class="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Channels -->
              <div>
                <h3 class="px-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-2">
                  <Hash class="w-3 h-3" />Canaux
                </h3>
                <div class="space-y-1">
                  <div
                    v-for="c in regularChannels" :key="c.id"
                    :class="cn(
                      'w-full flex justify-between items-center px-3 py-2 rounded-lg hover:bg-muted font-bold text-sm group transition-all cursor-pointer',
                      selectedChannelId === c.id && 'bg-primary/10 text-primary'
                    )"
                    @click="selectChannel(c.id)"
                  >
                    <span class="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                      <Hash class="w-4 h-4" />{{ c.name }}
                    </span>
                    <div class="flex items-center gap-1">
                      <Badge v-if="c.messages_count" variant="secondary" class="h-4 min-w-4 px-1 flex items-center justify-center text-[10px]">{{ c.messages_count }}</Badge>
                      <Button v-if="isAdmin" variant="ghost" size="icon" class="h-6 w-6 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600" @click.stop="deleteChannel(c.id)">
                        <X class="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <div v-if="regularChannels.length === 0 && announcementChannels.length === 0" class="px-3 py-6 text-center text-xs text-muted-foreground">
                    Aucun canal trouvé
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>

      <!-- Main Chat Area -->
      <Card class="flex-1 border-2 overflow-hidden flex flex-col rounded-3xl h-full shadow-2xl relative">
        <template v-if="selectedChannel">
          <CardHeader class="py-3 px-6 border-b flex flex-row justify-between items-center shrink-0">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
                <component :is="selectedChannel.type === 'ANNOUNCEMENT' ? Megaphone : Hash" class="w-5 h-5" />
              </div>
              <div>
                <CardTitle class="text-lg font-black tracking-tight flex items-center gap-2">
                  {{ selectedChannel.name }}
                  <Badge variant="outline" class="text-[9px] font-black tracking-widest uppercase border-primary/20 text-primary">
                    {{ selectedChannel.type === 'ANNOUNCEMENT' ? 'Annonce' : selectedChannel.type === 'PRIVATE' ? 'Privé' : 'Public' }}
                  </Badge>
                </CardTitle>
              </div>
            </div>
          </CardHeader>

          <div class="flex-1 overflow-hidden flex flex-col bg-muted/5 relative">
            <ScrollArea class="flex-1 p-6 chat-scroll-area">
              <div class="space-y-8">
                <div v-if="currentMessages.length === 0 && !loadingMessages" class="flex flex-col items-center justify-center py-8 text-center space-y-4">
                  <div class="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center border-2 border-dashed border-primary/20">
                    <MessageSquare class="w-8 h-8 text-primary/30" />
                  </div>
                  <div class="space-y-1">
                    <h4 class="font-extrabold text-lg">Canal #{{ selectedChannel.name }}</h4>
                    <p class="text-xs text-muted-foreground max-w-xs mx-auto">Début de la conversation. Envoyez le premier message !</p>
                  </div>
                </div>

                <div v-if="loadingMessages" class="flex items-center justify-center py-12">
                  <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>

                <div
                  v-for="msg in currentMessages" :key="msg.id"
                  :class="cn('flex gap-3 px-2 group transition-all', msg.self ? 'flex-row-reverse' : '')"
                >
                  <Avatar class="w-9 h-9 border-2 mt-1 shadow-sm">
                    <AvatarFallback class="text-[10px] font-black bg-muted">{{ msg.avatar }}</AvatarFallback>
                  </Avatar>
                  <div :class="cn('flex flex-col space-y-1 max-w-[70%]', msg.self ? 'items-end' : 'items-start')">
                    <div :class="cn('flex items-center gap-2 text-xs font-black uppercase tracking-tighter text-muted-foreground', msg.self && 'flex-row-reverse')">
                      <span>{{ msg.user }}</span>
                      <span class="text-[9px] font-medium tracking-normal">{{ msg.time }}</span>
                    </div>
                    <div
                      :class="cn(
                        'px-4 py-3 rounded-2xl text-sm font-medium shadow-sm transition-all border-2',
                        msg.self
                          ? 'bg-primary text-white border-primary shadow-primary/10 rounded-tr-none'
                          : 'bg-background border-border hover:border-primary/20 rounded-tl-none'
                      )"
                    >
                      {{ msg.text }}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <!-- Input Area -->
            <div class="p-6 shrink-0 bg-background border-t-2 relative">
              <form @submit.prevent="sendMessage" class="flex flex-col gap-3 bg-muted/30 p-2 rounded-2xl border-2 focus-within:border-primary/30 focus-within:bg-muted/50 transition-all">
                <textarea
                  v-model="message"
                  class="w-full bg-transparent border-none outline-none resize-none p-3 text-sm min-h-[60px]"
                  placeholder="Écrivez un message ici..."
                  @keydown.enter.exact.prevent="sendMessage"
                />
                <div class="flex items-center justify-between px-2 pb-2">
                  <!-- <div class="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                      <Paperclip class="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                      <Smile class="w-4 h-4" />
                    </Button>
                  </div> -->
                  <Button
                    type="submit"
                    size="sm"
                    :class="cn(
                      'font-black text-xs gap-2 px-6 rounded-xl transition-all shadow-lg',
                      message.length > 0 ? 'bg-primary opacity-100 shadow-primary/20 scale-100' : 'opacity-50 scale-95 pointer-events-none'
                    )"
                  >
                    Envoyer
                    <Send class="w-3.5 h-3.5" />
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </template>

        <!-- No channel selected -->
        <div v-else class="flex-1 flex items-center justify-center">
          <div class="text-center space-y-4">
            <div class="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto border-2 border-dashed border-muted-foreground/20">
              <MessageSquare class="w-10 h-10 text-muted-foreground/30" />
            </div>
            <div class="space-y-1">
              <h3 class="text-lg font-bold text-muted-foreground">{{ channels.length === 0 ? 'Aucun canal' : 'Sélectionnez un canal' }}</h3>
              <p class="text-sm text-muted-foreground/70">{{ channels.length === 0 ? 'Créez un canal pour commencer à communiquer.' : 'Choisissez un canal dans la barre latérale pour commencer.' }}</p>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- SUGGESTION BOX VIEW -->
    <div v-if="activeView === 'suggestions'" class="flex-1 overflow-auto">
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <div>
            <h2 class="text-xl font-bold">Boîte à Suggestions</h2>
            <p class="text-sm text-muted-foreground">{{ isEmployee ? 'Vos suggestions soumises à l\'administration.' : 'Toutes les suggestions des employés.' }}</p>
          </div>
          <Dialog v-model:open="showNewSuggestion">
            <DialogTrigger as-child>
              <Button class="font-bold">
                <Plus class="w-4 h-4 mr-2" />Nouvelle suggestion
              </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Nouvelle Suggestion</DialogTitle>
                <DialogDescription>Partagez votre idée ou suggestion pour l'entreprise.</DialogDescription>
              </DialogHeader>
              <div class="space-y-4 py-4">
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Votre suggestion</Label>
                  <textarea
                    v-model="newSuggestion"
                    class="w-full min-h-[120px] px-3 py-2 rounded-md border border-slate-200 text-sm bg-white resize-none"
                    placeholder="Décrivez votre idée ou suggestion..."
                  />
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <Button variant="outline" @click="showNewSuggestion = false">Annuler</Button>
                <Button @click="addSuggestion">Envoyer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div class="space-y-4">
          <Card v-for="s in filteredSuggestions" :key="s.id" class="border-2">
            <CardContent class="p-5">
              <div class="flex justify-between items-start">
                <div class="flex items-start gap-3 flex-1">
                  <div class="p-2 rounded-lg bg-amber-50 text-amber-600 mt-0.5">
                    <Lightbulb class="w-5 h-5" />
                  </div>
                  <div class="flex-1">
                    <p class="text-sm font-medium">{{ s.text }}</p>
                    <p class="text-xs text-slate-400 mt-1">{{ s.author }} · {{ s.date }}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <Badge :class="cn('text-[10px]',
                    s.status === 'implemented' ? 'bg-emerald-100 text-emerald-700' :
                    s.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  )">
                    {{ s.status === 'implemented' ? 'Implémenté' : s.status === 'rejected' ? 'Rejeté' : 'Ouvert' }}
                  </Badge>
                  <!-- <Button variant="outline" size="sm" class="text-xs" @click="voteSuggestion(s)">
                    👍 {{ s.votes }}
                  </Button> -->
                  <!-- Admin actions -->
                  <DropdownMenu v-if="isAdmin">
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon" class="h-8 w-8">
                        <MoreVertical class="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="w-44">
                      <DropdownMenuItem v-if="s.status !== 'implemented'" @click="updateSuggestionStatus(s, 'implemented')" class="cursor-pointer text-emerald-600">
                        Marquer implémenté
                      </DropdownMenuItem>
                      <DropdownMenuItem v-if="s.status !== 'rejected'" @click="updateSuggestionStatus(s, 'rejected')" class="cursor-pointer text-red-600">
                        Rejeter
                      </DropdownMenuItem>
                      <DropdownMenuItem v-if="s.status !== 'open'" @click="updateSuggestionStatus(s, 'open')" class="cursor-pointer">
                        Rouvrir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
          <div v-if="filteredSuggestions.length === 0" class="text-center py-12 text-muted-foreground">
            <Lightbulb class="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p class="font-medium">Aucune suggestion</p>
            <p class="text-sm">{{ isEmployee ? 'Vous n\'avez pas encore soumis de suggestion.' : 'Aucune suggestion trouvée.' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- NEWSLETTER VIEW -->
    <div v-if="activeView === 'newsletter'" class="flex-1 overflow-auto">
      <div class="space-y-6">
        <div>
          <h2 class="text-xl font-bold flex items-center gap-2">
            <Newspaper class="w-5 h-5 text-primary" />
            Newsletter de la plateforme
          </h2>
          <p class="text-sm text-muted-foreground">Actualités et communications de l'administration RDT.</p>
        </div>

        <div v-if="loadingNewsletters" class="flex items-center justify-center py-16">
          <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
        </div>

        <div v-else class="space-y-4">
          <Card
            v-for="nl in receivedNewsletters" :key="nl.id"
            class="border-2 hover:border-primary/20 transition-all"
          >
            <CardContent class="p-6 space-y-3">
              <div class="flex items-center justify-between">
                <h3 class="font-bold text-base text-slate-800">{{ nl.subject }}</h3>
                <span v-if="nl.sent_at" class="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                  <Clock class="w-3 h-3" />
                  {{ new Date(nl.sent_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) }}
                </span>
              </div>
              <div class="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{{ nl.content }}</div>
            </CardContent>
          </Card>

          <div v-if="receivedNewsletters.length === 0" class="text-center py-16 text-muted-foreground">
            <Newspaper class="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p class="font-medium">Aucune newsletter reçue</p>
            <p class="text-sm">Les newsletters de la plateforme apparaîtront ici.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
