<script setup>
import { ref, computed } from 'vue'
import { cn } from '@/lib/utils'
import {
  Briefcase, Plus, Search, Filter, Calendar, Users,
  ChevronRight, MoreVertical, Banknote, Activity, Layers,
  Edit, Trash2, Eye, CheckCircle2,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'vue-sonner'

const projects = ref([
  { id: 1, name: 'Refonte ERP V2', description: 'Migration complète du système ERP vers une architecture microservices moderne.', status: 'En cours', progress: 65, budget: '12 500 000 BIF', deadline: '2026-09-15', team: ['AB', 'CD', 'EF', 'GH'], category: 'Technologie' },
  { id: 2, name: 'Expansion Logistique Sud', description: "Ouverture de 3 nouveaux entrepôts dans la région sud.", status: 'Planifié', progress: 20, budget: '45 000 000 BIF', deadline: '2027-01-30', team: ['IJ', 'KL', 'MN'], category: 'Logistique' },
  { id: 3, name: 'Application Mobile Client', description: "Développement d'une application mobile pour le suivi des commandes.", status: 'En cours', progress: 40, budget: '8 000 000 BIF', deadline: '2026-07-20', team: ['OP', 'QR'], category: 'Technologie' },
  { id: 4, name: 'Audit de Sécurité Globale', description: "Audit complet de l'infrastructure IT et mise en conformité.", status: 'Urgent', progress: 10, budget: '5 500 000 BIF', deadline: '2026-06-01', team: ['ST', 'UV', 'WX'], category: 'Sécurité' },
  { id: 5, name: 'Système BI & Analytics', description: "Mise en place d'un tableau de bord analytique.", status: 'Terminé', progress: 100, budget: '15 000 000 BIF', deadline: '2026-03-10', team: ['YZ', 'AB'], category: 'Data' },
])

const searchTerm = ref('')
const showAddProject = ref(false)
const showDetailDialog = ref(false)
const selectedProject = ref(null)

const newProject = ref({
  name: '', description: '', category: '', budget: '', deadline: '', status: 'Planifié',
})

const filteredProjects = computed(() => {
  if (!searchTerm.value) return projects.value
  const term = searchTerm.value.toLowerCase()
  return projects.value.filter(p => p.name.toLowerCase().includes(term) || p.category.toLowerCase().includes(term))
})

const summaryCards = computed(() => [
  { title: 'Total Projets', value: String(projects.value.length), icon: Briefcase, description: 'Projets actifs', color: 'text-blue-600' },
  { title: 'En Cours', value: String(projects.value.filter(p => p.status === 'En cours').length), icon: Activity, description: 'En progression', color: 'text-amber-600' },
  { title: 'Terminés', value: String(projects.value.filter(p => p.status === 'Terminé').length), icon: CheckCircle2, description: 'Projets complétés', color: 'text-emerald-600' },
  { title: 'Catégories', value: String(new Set(projects.value.map(p => p.category)).size), icon: Layers, description: 'Domaines', color: 'text-purple-600' },
])

function statusVariant(status) {
  switch (status) {
    case 'En cours': return 'default'
    case 'Planifié': return 'secondary'
    case 'Urgent': return 'destructive'
    case 'Terminé': return 'outline'
    default: return 'default'
  }
}

let nextId = 6

function addProject() {
  if (!newProject.value.name) {
    toast.error('Le nom du projet est obligatoire')
    return
  }
  projects.value.push({
    id: nextId++,
    name: newProject.value.name,
    description: newProject.value.description,
    status: newProject.value.status,
    progress: 0,
    budget: newProject.value.budget || '0 BIF',
    deadline: newProject.value.deadline,
    team: [],
    category: newProject.value.category || 'Général',
  })
  newProject.value = { name: '', description: '', category: '', budget: '', deadline: '', status: 'Planifié' }
  showAddProject.value = false
  toast.success('Projet créé avec succès')
}

function viewDetail(project) {
  selectedProject.value = project
  showDetailDialog.value = true
}

function updateProgress(project, value) {
  project.progress = Math.min(100, Math.max(0, value))
  if (project.progress === 100) project.status = 'Terminé'
  toast.success(`Progression mise à jour: ${project.progress}%`)
}

function deleteProject(id) {
  projects.value = projects.value.filter(p => p.id !== id)
  toast.success('Projet supprimé')
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Projets</h1>
        <p class="text-muted-foreground">Gérez et suivez l'ensemble de vos projets</p>
      </div>
      <Dialog v-model:open="showAddProject">
        <DialogTrigger as-child>
          <Button>
            <Plus class="mr-2 h-4 w-4" />Nouveau Projet
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Nouveau Projet</DialogTitle>
            <DialogDescription>Créez un nouveau projet pour votre entreprise.</DialogDescription>
          </DialogHeader>
          <div class="grid gap-4 py-4">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Nom du projet *</Label>
              <Input v-model="newProject.name" placeholder="Ex: Refonte site web" />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Description</Label>
              <textarea v-model="newProject.description" class="w-full min-h-[80px] px-3 py-2 rounded-md border border-slate-200 text-sm bg-white resize-none" placeholder="Description du projet..." />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Catégorie</Label>
                <Input v-model="newProject.category" placeholder="Technologie, ..." />
              </div>
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Budget</Label>
                <Input v-model="newProject.budget" placeholder="1 000 000 BIF" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Date limite</Label>
                <Input v-model="newProject.deadline" type="date" />
              </div>
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Statut</Label>
                <select v-model="newProject.status" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
                  <option value="Planifié">Planifié</option>
                  <option value="En cours">En cours</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="showAddProject = false">Annuler</Button>
            <Button @click="addProject">Créer le projet</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    <!-- Summary Cards -->
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card v-for="(card, i) in summaryCards" :key="i">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">{{ card.title }}</CardTitle>
          <component :is="card.icon" :class="cn('h-4 w-4', card.color)" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ card.value }}</div>
          <p class="text-xs text-muted-foreground">{{ card.description }}</p>
        </CardContent>
      </Card>
    </div>

    <!-- Search & Filter -->
    <div class="flex items-center gap-4">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="searchTerm" placeholder="Rechercher un projet..." class="pl-10" />
      </div>
    </div>

    <!-- Projects Grid -->
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="project in filteredProjects" :key="project.id" class="flex flex-col">
        <CardHeader class="pb-3">
          <div class="flex items-center justify-between">
            <Badge :variant="statusVariant(project.status)">{{ project.status }}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon"><MoreVertical class="h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" class="w-44">
                <DropdownMenuItem @click="viewDetail(project)" class="cursor-pointer"><Eye class="w-4 h-4 mr-2" />Détails</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem @click="deleteProject(project.id)" class="text-red-500 cursor-pointer"><Trash2 class="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div class="flex items-center gap-2 pt-1">
            <Badge variant="outline" class="text-xs">{{ project.category }}</Badge>
          </div>
          <CardTitle class="text-lg">{{ project.name }}</CardTitle>
          <CardDescription>{{ project.description }}</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-1 flex-col justify-end gap-4">
          <div class="space-y-1">
            <div class="flex items-center justify-between text-sm">
              <span class="text-muted-foreground">Progression</span>
              <span class="font-medium">{{ project.progress }}%</span>
            </div>
            <Progress :model-value="project.progress" />
          </div>
          <div class="flex items-center justify-between text-sm">
            <div class="flex items-center gap-1 text-muted-foreground">
              <Banknote class="h-3.5 w-3.5" /><span>{{ project.budget }}</span>
            </div>
            <div class="flex items-center gap-1 text-muted-foreground">
              <Calendar class="h-3.5 w-3.5" /><span>{{ project.deadline }}</span>
            </div>
          </div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1">
              <Users class="mr-1 h-3.5 w-3.5 text-muted-foreground" />
              <div class="flex -space-x-2">
                <Avatar v-for="(member, j) in project.team" :key="j" class="h-7 w-7 border-2 border-background">
                  <AvatarFallback class="text-xs">{{ member }}</AvatarFallback>
                </Avatar>
              </div>
            </div>
            <Button variant="ghost" size="sm" @click="viewDetail(project)">
              Détails<ChevronRight class="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>

    <!-- Project Detail Dialog -->
    <Dialog v-model:open="showDetailDialog">
      <DialogContent class="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{{ selectedProject?.name }}</DialogTitle>
          <DialogDescription>{{ selectedProject?.description }}</DialogDescription>
        </DialogHeader>
        <div v-if="selectedProject" class="space-y-5 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="p-3 rounded-lg bg-slate-50 border">
              <p class="text-[10px] font-bold uppercase text-slate-400">Statut</p>
              <Badge :variant="statusVariant(selectedProject.status)" class="mt-1">{{ selectedProject.status }}</Badge>
            </div>
            <div class="p-3 rounded-lg bg-slate-50 border">
              <p class="text-[10px] font-bold uppercase text-slate-400">Catégorie</p>
              <p class="font-bold text-sm mt-1">{{ selectedProject.category }}</p>
            </div>
            <div class="p-3 rounded-lg bg-slate-50 border">
              <p class="text-[10px] font-bold uppercase text-slate-400">Budget</p>
              <p class="font-bold text-sm mt-1">{{ selectedProject.budget }}</p>
            </div>
            <div class="p-3 rounded-lg bg-slate-50 border">
              <p class="text-[10px] font-bold uppercase text-slate-400">Date limite</p>
              <p class="font-bold text-sm mt-1">{{ selectedProject.deadline }}</p>
            </div>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between text-sm">
              <span class="font-medium">Progression</span>
              <span class="font-bold">{{ selectedProject.progress }}%</span>
            </div>
            <Progress :model-value="selectedProject.progress" class="h-2" />
          </div>
          <div class="flex items-center gap-2">
            <Label class="text-xs font-bold uppercase text-slate-500">Mettre à jour (%)</Label>
            <Input :value="selectedProject.progress" type="number" min="0" max="100" class="w-24"
              @change="e => updateProgress(selectedProject, parseInt(e.target.value))" />
          </div>
          <div>
            <p class="text-xs font-bold uppercase text-slate-500 mb-2">Équipe</p>
            <div class="flex gap-2">
              <Avatar v-for="(member, j) in selectedProject.team" :key="j" class="h-9 w-9 border-2">
                <AvatarFallback class="text-xs font-bold">{{ member }}</AvatarFallback>
              </Avatar>
              <div v-if="selectedProject.team.length === 0" class="text-sm text-slate-400">Aucun membre assigné</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
