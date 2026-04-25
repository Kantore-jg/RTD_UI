<script setup>
import { ref, computed, nextTick } from 'vue'
import {
  MessageSquare, Send, Search, Users, Megaphone, Hash,
  AtSign, Plus, MoreVertical, Paperclip, Smile, Pin,
  Lightbulb, Mail, X,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'

const authStore = useAuthStore()
const { user, isAdmin, isEmployee } = storeToRefs(authStore)

const channels = ref([
  { id: '1', name: 'général', type: 'PUBLIC', unread: 0 },
  { id: '2', name: 'annonces-officielles', type: 'ANNOUNCEMENT', unread: 2 },
  { id: '3', name: 'projet-erp-v2', type: 'PRIVATE', unread: 15 },
  { id: '4', name: 'design-feedback', type: 'PUBLIC', unread: 0 },
  { id: '5', name: 'marketing-team', type: 'PRIVATE', unread: 5 },
])

const allMessages = ref({
  '1': [
    { id: '1', user: 'Jean Dupont', text: "Bonjour à tous ! N'oubliez pas la réunion de demain à 10h.", time: '09:30', avatar: 'JD', self: false },
    { id: '2', user: 'Sarah Lawson', text: "C'est noté Jean. Je préparerai les slides.", time: '09:45', avatar: 'SL', self: false },
    { id: '3', user: 'Moi', text: "Parfait, je serai présent également.", time: '10:05', avatar: 'ME', self: true },
    { id: '4', user: 'Marc Kasongo', text: "Le nouveau module de builder est presque prêt. Des volontaires pour tester ?", time: '10:30', avatar: 'MK', self: false },
  ],
  '2': [
    { id: '1', user: 'Direction', text: "📢 Nouveau : La plateforme RDT est maintenant accessible sur mobile !", time: '08:00', avatar: 'DR', self: false },
    { id: '2', user: 'Direction', text: "Rappel : Mise à jour des profils employés avant le 30 avril.", time: '14:00', avatar: 'DR', self: false },
  ],
  '3': [
    { id: '1', user: 'Marc Kouassi', text: "L'API est prête pour les tests d'intégration.", time: '11:00', avatar: 'MK', self: false },
  ],
  '4': [],
  '5': [
    { id: '1', user: 'Sarah Lawson', text: "Nouveau brief marketing pour la campagne Q3.", time: '15:00', avatar: 'SL', self: false },
  ],
})

const suggestions = ref([
  { id: 1, author: 'Alice Mensah', text: 'Proposer un mode sombre pour l\'interface employé', date: '2026-04-22', votes: 5, status: 'open' },
  { id: 2, author: 'Paul Atreides', text: 'Ajouter un système de notifications push pour les tâches urgentes', date: '2026-04-20', votes: 12, status: 'open' },
  { id: 3, author: 'Marc Kouassi', text: 'Permettre l\'export des rapports en format Excel', date: '2026-04-18', votes: 8, status: 'implemented' },
])

const selectedChannelId = ref('1')
const message = ref('')
const activeView = ref('chat')
const showNewSuggestion = ref(false)
const newSuggestion = ref('')
const sidebarSearchTerm = ref('')

const selectedChannel = computed(() =>
  channels.value.find(c => c.id === selectedChannelId.value)
)

const currentMessages = computed(() =>
  allMessages.value[selectedChannelId.value] || []
)

const announcementChannels = computed(() =>
  channels.value.filter(c => c.type === 'ANNOUNCEMENT')
)

const regularChannels = computed(() =>
  channels.value.filter(c => c.type !== 'ANNOUNCEMENT')
)

const directUsers = [
  { name: 'Sarah Lawson', status: 'online' },
  { name: 'Marc Kasongo', status: 'away' },
  { name: 'Alice Mboma', status: 'online' },
  { name: 'Kevin Durant', status: 'offline' },
]

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('')
}

function selectChannel(channelId) {
  selectedChannelId.value = channelId
  const channel = channels.value.find(c => c.id === channelId)
  if (channel) channel.unread = 0
}

let nextMsgId = 10

function sendMessage() {
  if (!message.value.trim()) return
  if (!allMessages.value[selectedChannelId.value]) {
    allMessages.value[selectedChannelId.value] = []
  }
  allMessages.value[selectedChannelId.value].push({
    id: String(nextMsgId++),
    user: 'Moi',
    text: message.value,
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    avatar: 'ME',
    self: true,
  })
  message.value = ''
}

const filteredSuggestions = computed(() => {
  if (isAdmin.value) return suggestions.value
  const userName = user.value?.name || 'Moi'
  return suggestions.value.filter(s => s.author === userName || s.author === 'Moi')
})

function addSuggestion() {
  if (!newSuggestion.value.trim()) {
    toast.error('Écrivez votre suggestion')
    return
  }
  suggestions.value.unshift({
    id: suggestions.value.length + 1,
    author: user.value?.name || 'Moi',
    text: newSuggestion.value,
    date: new Date().toISOString().split('T')[0],
    votes: 0,
    status: 'open',
  })
  newSuggestion.value = ''
  showNewSuggestion.value = false
  toast.success('Suggestion envoyée')
}

function voteSuggestion(suggestion) {
  suggestion.votes++
  toast.success('Vote enregistré')
}

function updateSuggestionStatus(suggestion, status) {
  suggestion.status = status
  toast.success(`Suggestion marquée comme "${status === 'implemented' ? 'Implémenté' : status === 'rejected' ? 'Rejeté' : 'Ouvert'}"`)
}
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
            <Lightbulb class="w-3.5 h-3.5 mr-1.5" />Boîte à suggestions
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
            </div>
            <div class="relative mt-2">
              <Search class="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <Input v-model="sidebarSearchTerm" placeholder="Rechercher..." class="pl-9 h-9 border-2 text-xs" />
            </div>
          </CardHeader>
          <ScrollArea class="flex-1 p-2">
            <div class="space-y-6">
              <!-- Announcements -->
              <div>
                <h3 class="px-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-2">
                  <Megaphone class="w-3 h-3" />Annonces
                </h3>
                <div class="space-y-1">
                  <button
                    v-for="c in announcementChannels" :key="c.id"
                    :class="cn(
                      'w-full flex justify-between items-center px-3 py-2 rounded-lg hover:bg-muted font-bold text-sm group transition-all',
                      selectedChannelId === c.id && 'bg-primary/10 text-primary'
                    )"
                    @click="selectChannel(c.id)"
                  >
                    <span class="flex items-center gap-2">
                      <Megaphone class="w-3.5 h-3.5 text-primary" />{{ c.name }}
                    </span>
                    <Badge v-if="c.unread > 0" class="h-4 min-w-4 px-1 flex items-center justify-center text-[10px] bg-primary">{{ c.unread }}</Badge>
                  </button>
                </div>
              </div>
              <!-- Channels -->
              <div>
                <h3 class="px-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-2">
                  <Hash class="w-3 h-3" />Canaux
                </h3>
                <div class="space-y-1">
                  <button
                    v-for="c in regularChannels" :key="c.id"
                    :class="cn(
                      'w-full flex justify-between items-center px-3 py-2 rounded-lg hover:bg-muted font-bold text-sm group transition-all',
                      selectedChannelId === c.id && 'bg-primary/10 text-primary'
                    )"
                    @click="selectChannel(c.id)"
                  >
                    <span class="flex items-center gap-2 text-muted-foreground group-hover:text-foreground">
                      <Hash class="w-4 h-4" />{{ c.name }}
                    </span>
                    <Badge v-if="c.unread > 0" class="h-4 min-w-4 px-1 flex items-center justify-center text-[10px] bg-red-500">{{ c.unread }}</Badge>
                  </button>
                </div>
              </div>
              <!-- DMs -->
              <div>
                <h3 class="px-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-2 flex items-center gap-2">
                  <Users class="w-3 h-3" />Messages Directs
                </h3>
                <div class="space-y-1">
                  <button
                    v-for="(user, i) in directUsers" :key="i"
                    class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted font-bold text-sm transition-all group"
                  >
                    <div class="relative">
                      <Avatar class="w-8 h-8 border-2 group-hover:border-primary/20 transition-all">
                        <AvatarFallback class="text-[10px] font-black">{{ getInitials(user.name) }}</AvatarFallback>
                      </Avatar>
                      <div
                        :class="cn(
                          'absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background',
                          user.status === 'online' ? 'bg-emerald-500' : user.status === 'away' ? 'bg-orange-500' : 'bg-muted-foreground'
                        )"
                      />
                    </div>
                    <span class="text-muted-foreground group-hover:text-foreground truncate">{{ user.name }}</span>
                  </button>
                </div>
              </div>
            </div>
          </ScrollArea>
        </Card>
      </div>

      <!-- Main Chat Area -->
      <Card class="flex-1 border-2 overflow-hidden flex flex-col rounded-3xl h-full shadow-2xl relative">
        <CardHeader class="py-3 px-6 border-b flex flex-row justify-between items-center shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary border border-primary/20">
              <Hash class="w-5 h-5" />
            </div>
            <div>
              <CardTitle class="text-lg font-black tracking-tight flex items-center gap-2">
                {{ selectedChannel?.name || 'général' }}
                <Badge variant="outline" class="text-[9px] font-black tracking-widest uppercase border-primary/20 text-primary">
                  {{ selectedChannel?.type === 'ANNOUNCEMENT' ? 'Annonce' : selectedChannel?.type === 'PRIVATE' ? 'Privé' : 'Public' }}
                </Badge>
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <div class="flex-1 overflow-hidden flex flex-col bg-muted/5 relative">
          <ScrollArea class="flex-1 p-6">
            <div class="space-y-8">
              <div class="flex flex-col items-center justify-center py-8 text-center space-y-4">
                <div class="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center border-2 border-dashed border-primary/20">
                  <MessageSquare class="w-8 h-8 text-primary/30" />
                </div>
                <div class="space-y-1">
                  <h4 class="font-extrabold text-lg">Canal #{{ selectedChannel?.name }}</h4>
                  <p class="text-xs text-muted-foreground max-w-xs mx-auto">Début de la conversation.</p>
                </div>
                <hr class="w-full border-muted-foreground/10" />
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
                    <span class="text-[9px] font-medium tracking-normal">• {{ msg.time }}</span>
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
                <div class="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Paperclip class="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10">
                    <Smile class="w-4 h-4" />
                  </Button>
                </div>
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
                  <Button variant="outline" size="sm" class="text-xs" @click="voteSuggestion(s)">
                    👍 {{ s.votes }}
                  </Button>
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
  </div>
</template>
