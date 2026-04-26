<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { cn } from '@/lib/utils'
import {
  Briefcase, Plus, Search, Filter, Calendar, Users,
  ChevronRight, MoreVertical, Banknote, Activity, Layers,
  Edit, Trash2, Eye, CheckCircle2, X, Check,
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
import { projectService } from '@/services/projects'
import { employeeService } from '@/services/employees'

const loading = ref(true)
const projects = ref([])
const EMPLOYEES = ref([])

const searchTerm = ref('')
const showAddProject = ref(false)
const showDetailDialog = ref(false)
const showEditDialog = ref(false)
const selectedProject = ref(null)
const editingProject = ref(null)

const showNewMemberDropdown = ref(false)
const showEditMemberDropdown = ref(false)

const newProject = ref({
  name: '', description: '', category: '', budget: '', deadline: '', status: 'Planifié', members: [],
})

async function fetchEmployees() {
  try {
    const response = await employeeService.list()
    const employees = response.data.data || response.data
    EMPLOYEES.value = (Array.isArray(employees) ? employees : []).map(e => ({ id: e.id, name: e.name }))
  } catch {
    toast.error('Erreur lors du chargement des employés')
  }
}

function getMemberName(idOrObj) {
  if (typeof idOrObj === 'object' && idOrObj !== null) return idOrObj.name || String(idOrObj.id)
  const found = EMPLOYEES.value.find(e => e.id === idOrObj)
  return found?.name || String(idOrObj || '?')
}

function getMemberInitials(idOrObj) {
  return getMemberName(idOrObj).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

function toggleNewMember(id) {
  const idx = newProject.value.members.indexOf(id)
  if (idx >= 0) newProject.value.members.splice(idx, 1)
  else newProject.value.members.push(id)
}

function removeNewMember(id) {
  newProject.value.members = newProject.value.members.filter(m => m !== id)
}

function toggleEditMember(id) {
  if (!editingProject.value) return
  const idx = editingProject.value.members.indexOf(id)
  if (idx >= 0) editingProject.value.members.splice(idx, 1)
  else editingProject.value.members.push(id)
}

function removeEditMember(id) {
  if (!editingProject.value) return
  editingProject.value.members = editingProject.value.members.filter(m => m !== id)
}

function startEdit(project) {
  const memberIds = (project.members || []).map(m => typeof m === 'object' ? m.id : m)
  editingProject.value = { ...project, members: [...memberIds] }
  showEditDialog.value = true
  showEditMemberDropdown.value = false
}

async function saveEdit() {
  if (!editingProject.value) return
  try {
    await projectService.update(editingProject.value.id, {
      name: editingProject.value.name,
      description: editingProject.value.description,
      category: editingProject.value.category,
      status: editingProject.value.status,
      budget: editingProject.value.budget,
      deadline: editingProject.value.deadline,
      members: editingProject.value.members,
    })
    showEditDialog.value = false
    toast.success('Projet mis à jour')
    await fetchProjects()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour')
  }
}

function handleClickOutside(e) {
  if (!e.target.closest('.member-multiselect')) {
    showNewMemberDropdown.value = false
    showEditMemberDropdown.value = false
  }
}

const filteredProjects = computed(() => {
  if (!searchTerm.value) return projects.value
  const term = searchTerm.value.toLowerCase()
  return projects.value.filter(p => (p.name || '').toLowerCase().includes(term) || (p.category || '').toLowerCase().includes(term))
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

async function fetchProjects() {
  try {
    loading.value = true
    const response = await projectService.list()
    projects.value = response.data.data || response.data
  } catch (error) {
    toast.error('Erreur lors du chargement des projets')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  Promise.all([fetchProjects(), fetchEmployees()])
})
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

async function addProject() {
  if (!newProject.value.name) {
    toast.error('Le nom du projet est obligatoire')
    return
  }
  try {
    await projectService.create({
      name: newProject.value.name,
      description: newProject.value.description,
      category: newProject.value.category,
      budget: newProject.value.budget,
      deadline: newProject.value.deadline,
      status: newProject.value.status,
      members: newProject.value.members,
    })
    newProject.value = { name: '', description: '', category: '', budget: '', deadline: '', status: 'Planifié', members: [] }
    showNewMemberDropdown.value = false
    showAddProject.value = false
    toast.success('Projet créé avec succès')
    await fetchProjects()
  } catch (error) {
    toast.error(error.response?.data?.message || 'Erreur lors de la création du projet')
  }
}

function viewDetail(project) {
  selectedProject.value = project
  showDetailDialog.value = true
}

async function updateProgress(project, value) {
  const progress = Math.min(100, Math.max(0, value))
  try {
    await projectService.updateProgress(project.id, progress)
    toast.success(`Progression mise à jour: ${progress}%`)
    await fetchProjects()
    if (selectedProject.value) {
      selectedProject.value = projects.value.find(p => p.id === selectedProject.value.id) || null
    }
  } catch (error) {
    toast.error('Erreur lors de la mise à jour de la progression')
  }
}

async function deleteProject(id) {
  try {
    await projectService.delete(id)
    toast.success('Projet supprimé')
    await fetchProjects()
  } catch (error) {
    toast.error('Erreur lors de la suppression du projet')
  }
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
            <div class="space-y-2 member-multiselect">
              <Label class="text-xs font-bold uppercase text-slate-500">Membres de l'équipe</Label>
              <div class="relative">
                <div
                  class="w-full min-h-[40px] px-3 py-1.5 rounded-md border border-slate-200 text-sm bg-white cursor-pointer flex flex-wrap items-center gap-1"
                  @click.stop="showNewMemberDropdown = !showNewMemberDropdown"
                >
                  <template v-if="newProject.members.length > 0">
                    <span
                      v-for="mId in newProject.members" :key="mId"
                      class="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ getMemberName(mId) }}
                      <X class="w-3 h-3 cursor-pointer hover:text-red-500" @click.stop="removeNewMember(mId)" />
                    </span>
                  </template>
                  <span v-else class="text-slate-400">Sélectionner des employés...</span>
                </div>
                <div v-if="showNewMemberDropdown" class="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  <div
                    v-for="emp in EMPLOYEES" :key="emp.id"
                    class="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm"
                    @click="toggleNewMember(emp.id)"
                  >
                    <div :class="cn('w-4 h-4 rounded border flex items-center justify-center', newProject.members.includes(emp.id) ? 'bg-primary border-primary' : 'border-slate-300')">
                      <Check v-if="newProject.members.includes(emp.id)" class="w-3 h-3 text-white" />
                    </div>
                    <span>{{ emp.name }}</span>
                  </div>
                  <div v-if="EMPLOYEES.length === 0" class="px-3 py-2 text-sm text-slate-400">Aucun employé disponible</div>
                </div>
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
                <DropdownMenuItem @click="startEdit(project)" class="cursor-pointer"><Edit class="w-4 h-4 mr-2" />Modifier</DropdownMenuItem>
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
                <Avatar v-for="member in (project.members || []).slice(0, 4)" :key="typeof member === 'object' ? member.id : member" class="h-7 w-7 border-2 border-background">
                  <AvatarFallback class="text-xs font-bold">{{ getMemberInitials(member) }}</AvatarFallback>
                </Avatar>
                <Avatar v-if="(project.members || []).length > 4" class="h-7 w-7 border-2 border-background">
                  <AvatarFallback class="text-[10px] font-bold">+{{ project.members.length - 4 }}</AvatarFallback>
                </Avatar>
              </div>
              <span v-if="!project.members || project.members.length === 0" class="text-xs text-slate-400 ml-1">Aucun</span>
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
            <div class="flex flex-wrap gap-2">
              <div
                v-for="member in (selectedProject.members || [])"
                :key="typeof member === 'object' ? member.id : member"
                class="flex items-center gap-2 bg-slate-50 border rounded-full px-3 py-1"
              >
                <Avatar class="h-6 w-6">
                  <AvatarFallback class="text-[10px] font-bold">{{ getMemberInitials(member) }}</AvatarFallback>
                </Avatar>
                <span class="text-sm font-medium">{{ getMemberName(member) }}</span>
              </div>
              <div v-if="!selectedProject.members || selectedProject.members.length === 0" class="text-sm text-slate-400">Aucun membre assigné</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Edit Project Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier le projet</DialogTitle>
          <DialogDescription>Modifiez les détails et les membres du projet.</DialogDescription>
        </DialogHeader>
        <div v-if="editingProject" class="grid gap-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-slate-500">Nom du projet *</Label>
            <Input v-model="editingProject.name" placeholder="Nom du projet" />
          </div>
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-slate-500">Description</Label>
            <textarea v-model="editingProject.description" class="w-full min-h-[80px] px-3 py-2 rounded-md border border-slate-200 text-sm bg-white resize-none" placeholder="Description du projet..." />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Catégorie</Label>
              <Input v-model="editingProject.category" placeholder="Technologie, ..." />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Budget</Label>
              <Input v-model="editingProject.budget" placeholder="1 000 000 BIF" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Date limite</Label>
              <Input v-model="editingProject.deadline" type="date" />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Statut</Label>
              <select v-model="editingProject.status" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
                <option value="Planifié">Planifié</option>
                <option value="En cours">En cours</option>
                <option value="Urgent">Urgent</option>
                <option value="Terminé">Terminé</option>
              </select>
            </div>
          </div>
          <div class="space-y-2 member-multiselect">
            <Label class="text-xs font-bold uppercase text-slate-500">Membres de l'équipe</Label>
            <div class="relative">
              <div
                class="w-full min-h-[40px] px-3 py-1.5 rounded-md border border-slate-200 text-sm bg-white cursor-pointer flex flex-wrap items-center gap-1"
                @click.stop="showEditMemberDropdown = !showEditMemberDropdown"
              >
                <template v-if="editingProject.members && editingProject.members.length > 0">
                  <span
                    v-for="mId in editingProject.members" :key="mId"
                    class="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium"
                  >
                    {{ getMemberName(mId) }}
                    <X class="w-3 h-3 cursor-pointer hover:text-red-500" @click.stop="removeEditMember(mId)" />
                  </span>
                </template>
                <span v-else class="text-slate-400">Sélectionner des employés...</span>
              </div>
              <div v-if="showEditMemberDropdown" class="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                <div
                  v-for="emp in EMPLOYEES" :key="emp.id"
                  class="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm"
                  @click="toggleEditMember(emp.id)"
                >
                  <div :class="cn('w-4 h-4 rounded border flex items-center justify-center', editingProject.members?.includes(emp.id) ? 'bg-primary border-primary' : 'border-slate-300')">
                    <Check v-if="editingProject.members?.includes(emp.id)" class="w-3 h-3 text-white" />
                  </div>
                  <span>{{ emp.name }}</span>
                </div>
                <div v-if="EMPLOYEES.length === 0" class="px-3 py-2 text-sm text-slate-400">Aucun employé disponible</div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="showEditDialog = false">Annuler</Button>
          <Button @click="saveEdit">Sauvegarder</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
