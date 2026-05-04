<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  Plus, MoreHorizontal, Clock, MessageSquare, Search,
  Filter, LayoutGrid, List as ListIcon, ChevronDown,
  CheckCircle2, XCircle, Edit, Trash2, User, Calendar,
  AlertTriangle, X, Check,
} from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { taskService } from '@/services/tasks'
import { employeeService } from '@/services/employees'

const authStore = useAuthStore()
const { isAdmin, isEmployee, employeeId } = storeToRefs(authStore)

const loading = ref(false)

const COLUMNS = [
  { id: 'PENDING', label: 'En attente', color: 'bg-slate-500' },
  { id: 'IN_PROGRESS', label: 'En cours', color: 'bg-primary' },
  { id: 'COMPLETED', label: 'Terminé', color: 'bg-emerald-500' },
  { id: 'CANCELLED', label: 'Annulé', color: 'bg-red-500' },
]

const ASSIGNEES = ref([])

const tasks = ref([])

const viewMode = ref('board')
const searchTerm = ref('')
const filterStatus = ref('')
const filterPriority = ref('')
const filterPeriod = ref('')
const filterEmployee = ref('')
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const editingTask = ref(null)

const newTask = ref({
  title: '', description: '', priority: 'MEDIUM', assignees: [], dueDate: '', status: 'PENDING',
})

const showNewAssigneeDropdown = ref(false)
const showEditAssigneeDropdown = ref(false)

async function fetchTasks() {
  try {
    loading.value = true
    const response = await taskService.list()
    const raw = response.data.data || response.data
    tasks.value = (Array.isArray(raw) ? raw : []).map(t => ({
      ...t,
      dueDate: t.due_date || t.dueDate || '',
      createdAt: t.created_at || t.createdAt || '',
      comments: t.comments || 0,
    }))
  } catch (err) {
    toast.error('Erreur lors du chargement des tâches')
  } finally {
    loading.value = false
  }
}

async function fetchEmployees() {
  try {
    const response = await employeeService.list()
    const employees = response.data.data || response.data
    ASSIGNEES.value = employees.map(e => ({ id: e.id, name: e.name }))
  } catch (err) {
    toast.error('Erreur lors du chargement des employés')
  }
}

function toggleNewAssignee(id) {
  const idx = newTask.value.assignees.indexOf(id)
  if (idx >= 0) {
    newTask.value.assignees.splice(idx, 1)
  } else {
    newTask.value.assignees.push(id)
  }
}

function toggleEditAssignee(id) {
  if (!editingTask.value) return
  const idx = editingTask.value.assignees.indexOf(id)
  if (idx >= 0) {
    editingTask.value.assignees.splice(idx, 1)
  } else {
    editingTask.value.assignees.push(id)
  }
}

function removeNewAssignee(id) {
  newTask.value.assignees = newTask.value.assignees.filter(a => a !== id)
}

function removeEditAssignee(id) {
  if (!editingTask.value) return
  editingTask.value.assignees = editingTask.value.assignees.filter(a => a !== id)
}

const filteredTasks = computed(() => {
  let list = tasks.value
  if (isEmployee.value && employeeId.value) {
    list = list.filter(t => t.assignees && t.assignees.some(a => a.id === employeeId.value || a === employeeId.value))
  }
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    list = list.filter(t => t.title.toLowerCase().includes(term) || (t.description || '').toLowerCase().includes(term))
  }
  if (filterEmployee.value) {
    list = list.filter(t => t.assignees && t.assignees.some(a => (a.id || a) == filterEmployee.value))
  }
  if (filterStatus.value) {
    list = list.filter(t => t.status === filterStatus.value)
  }
  if (filterPriority.value) {
    list = list.filter(t => t.priority === filterPriority.value)
  }
  if (filterPeriod.value) {
    const now = new Date()
    list = list.filter(t => {
      const created = new Date(t.createdAt || t.created_at)
      const diff = (now - created) / (1000 * 60 * 60 * 24)
      if (filterPeriod.value === 'today') return diff <= 1
      if (filterPeriod.value === 'week') return diff <= 7
      if (filterPeriod.value === 'month') return diff <= 30
      if (filterPeriod.value === 'year') return diff <= 365
      return true
    })
  }
  return list
})

function tasksForColumn(colId) {
  return filteredTasks.value.filter(t => t.status === colId)
}

async function addTask() {
  if (!newTask.value.title) {
    toast.error('Le titre est obligatoire')
    return
  }
  try {
    await taskService.create({
      title: newTask.value.title,
      description: newTask.value.description,
      status: newTask.value.status,
      priority: newTask.value.priority,
      assignees: newTask.value.assignees,
      due_date: newTask.value.dueDate,
    })
    newTask.value = { title: '', description: '', priority: 'MEDIUM', assignees: [], dueDate: '', status: 'PENDING' }
    showNewAssigneeDropdown.value = false
    showAddDialog.value = false
    toast.success('Tâche créée avec succès')
    await fetchTasks()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la création de la tâche')
  }
}

async function markComplete(task) {
  try {
    await taskService.updateStatus(task.id, 'COMPLETED')
    toast.success(`"${task.title}" marquée comme terminée`)
    await fetchTasks()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour')
  }
}

async function markCancelled(task) {
  try {
    await taskService.updateStatus(task.id, 'CANCELLED')
    toast.info(`"${task.title}" annulée`)
    await fetchTasks()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de l\'annulation')
  }
}

function startEdit(task) {
  const assigneeIds = (task.assignees || []).map(a => typeof a === 'object' ? a.id : a)
  editingTask.value = { ...task, assignees: [...assigneeIds] }
  showEditDialog.value = true
  showEditAssigneeDropdown.value = false
}

async function saveEdit() {
  try {
    await taskService.update(editingTask.value.id, {
      title: editingTask.value.title,
      description: editingTask.value.description,
      status: editingTask.value.status,
      priority: editingTask.value.priority,
      progress: editingTask.value.progress,
      assignees: editingTask.value.assignees,
      due_date: editingTask.value.dueDate || editingTask.value.due_date,
    })
    showEditDialog.value = false
    toast.success('Tâche mise à jour')
    await fetchTasks()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la mise à jour')
  }
}

async function deleteTask(id) {
  try {
    await taskService.delete(id)
    toast.success('Tâche supprimée')
    await fetchTasks()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la suppression')
  }
}

function priorityColor(priority) {
  const map = { CRITICAL: 'text-red-500', HIGH: 'text-orange-500', MEDIUM: 'text-blue-500', LOW: 'text-slate-400' }
  return map[priority] || 'text-primary'
}

function statusLabel(status) {
  const map = { PENDING: 'En attente', IN_PROGRESS: 'En cours', COMPLETED: 'Terminé', CANCELLED: 'Annulé' }
  return map[status] || status
}

function statusColor(status) {
  const map = {
    PENDING: 'bg-slate-100 text-slate-700',
    IN_PROGRESS: 'bg-blue-100 text-blue-700',
    COMPLETED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-red-100 text-red-700',
  }
  return map[status] || ''
}

function getAssigneeName(idOrObj) {
  if (typeof idOrObj === 'object' && idOrObj !== null) return idOrObj.name || String(idOrObj.id)
  const found = ASSIGNEES.value.find(a => a.id === idOrObj)
  return found?.name || String(idOrObj || '?')
}

function handleClickOutside(e) {
  if (!e.target.closest('.assignee-multiselect')) {
    showNewAssigneeDropdown.value = false
    showEditAssigneeDropdown.value = false
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside)
  await Promise.all([fetchTasks(), fetchEmployees()])
})
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="space-y-8 h-full flex flex-col">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 leading-tight">{{ isEmployee ? 'Mes Tâches' : 'Gestion des Tâches' }}</h1>
        <p class="text-slate-500 font-medium">{{ isEmployee ? 'Retrouvez les tâches qui vous sont assignées.' : 'Suivez l\'avancement de vos activités avec agilité.' }}</p>
      </div>
      <div class="flex items-center gap-2">
        <div class="flex items-center bg-muted/50 p-1 rounded-lg border-2 mr-2">
          <Button :variant="viewMode === 'board' ? 'secondary' : 'ghost'" size="sm" class="font-bold rounded-md" @click="viewMode = 'board'">
            <LayoutGrid class="w-4 h-4 mr-2" />Tableau
          </Button>
          <Button :variant="viewMode === 'list' ? 'secondary' : 'ghost'" size="sm" class="font-bold rounded-md" @click="viewMode = 'list'">
            <ListIcon class="w-4 h-4 mr-2" />Liste
          </Button>
        </div>
        <Dialog v-if="isAdmin" v-model:open="showAddDialog">
          <DialogTrigger as-child>
            <Button class="font-bold shadow-lg">
              <Plus class="w-4 h-4 mr-2" />Nouvelle Tâche
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nouvelle Tâche</DialogTitle>
              <DialogDescription>Plan your tasks, win the day</DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Titre *</Label>
                <Input v-model="newTask.title" placeholder="Titre de la tâche" />
              </div>
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Description</Label>
                <textarea v-model="newTask.description" class="w-full min-h-[80px] px-3 py-2 rounded-md border border-slate-200 text-sm bg-white resize-none" placeholder="Description détaillée..." />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Priorité</Label>
                  <select v-model="newTask.priority" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
                    <option value="LOW">Basse</option>
                    <option value="MEDIUM">Moyenne</option>
                    <option value="HIGH">Haute</option>
                    <option value="CRITICAL">Critique</option>
                  </select>
                </div>
                <div class="space-y-2 assignee-multiselect">
                  <Label class="text-xs font-bold uppercase text-slate-500">Assigner à</Label>
                  <div class="relative">
                    <div
                      class="w-full min-h-[40px] px-3 py-1.5 rounded-md border border-slate-200 text-sm bg-white cursor-pointer flex flex-wrap items-center gap-1"
                      @click.stop="showNewAssigneeDropdown = !showNewAssigneeDropdown"
                    >
                      <template v-if="newTask.assignees.length > 0">
                        <span
                          v-for="aId in newTask.assignees" :key="aId"
                          class="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium"
                        >
                          {{ getAssigneeName(aId) }}
                          <X class="w-3 h-3 cursor-pointer hover:text-red-500" @click.stop="removeNewAssignee(aId)" />
                        </span>
                      </template>
                      <span v-else class="text-slate-400">Sélectionner des employés...</span>
                    </div>
                    <div v-if="showNewAssigneeDropdown" class="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      <div
                        v-for="a in ASSIGNEES" :key="a.id"
                        class="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm"
                        @click="toggleNewAssignee(a.id)"
                      >
                        <div :class="cn('w-4 h-4 rounded border flex items-center justify-center', newTask.assignees.includes(a.id) ? 'bg-primary border-primary' : 'border-slate-300')">
                          <Check v-if="newTask.assignees.includes(a.id)" class="w-3 h-3 text-white" />
                        </div>
                        <span>{{ a.name }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Date d'échéance</Label>
                  <Input v-model="newTask.dueDate" type="date" />
                </div>
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Statut initial</Label>
                  <select v-model="newTask.status" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
                    <option value="PENDING">En attente</option>
                    <option value="IN_PROGRESS">En cours</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <Button variant="outline" @click="showAddDialog = false">Annuler</Button>
              <Button @click="addTask">Créer la tâche</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-wrap items-center gap-3 shrink-0">
      <div class="relative flex-1 max-w-sm">
        <Search class="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <Input v-model="searchTerm" placeholder="Rechercher une tâche..." class="pl-10 border-2" />
      </div>
      <select v-model="filterStatus" class="h-10 px-3 rounded-md border-2 text-sm bg-white font-bold">
        <option value="">Tous statuts</option>
        <option value="PENDING">En attente</option>
        <option value="IN_PROGRESS">En cours</option>
        <option value="COMPLETED">Terminé</option>
        <option value="CANCELLED">Annulé</option>
      </select>
      <select v-model="filterPriority" class="h-10 px-3 rounded-md border-2 text-sm bg-white font-bold">
        <option value="">Toutes priorités</option>
        <option value="CRITICAL">Critique</option>
        <option value="HIGH">Haute</option>
        <option value="MEDIUM">Moyenne</option>
        <option value="LOW">Basse</option>
      </select>
      <select v-model="filterPeriod" class="h-10 px-3 rounded-md border-2 text-sm bg-white font-bold">
        <option value="">Toute période</option>
        <option value="today">Aujourd'hui</option>
        <option value="week">Cette semaine</option>
        <option value="month">Ce mois</option>
        <option value="year">Cette année</option>
      </select>
      <select v-if="isAdmin" v-model="filterEmployee" class="h-10 px-3 rounded-md border-2 text-sm bg-white font-bold">
        <option value="">Tous les employés</option>
        <option v-for="a in ASSIGNEES" :key="a.id" :value="a.id">{{ a.name }}</option>
      </select>
    </div>

    <!-- Board View -->
    <div v-if="viewMode === 'board'" class="flex-1 overflow-x-auto overflow-y-hidden">
      <div class="flex gap-6 h-full pb-4">
        <div v-for="col in COLUMNS" :key="col.id" class="w-[300px] shrink-0 flex flex-col gap-4">
          <div class="flex items-center justify-between px-2">
            <div class="flex items-center gap-2">
              <h3 class="font-bold text-[11px] text-slate-500 uppercase tracking-widest">{{ col.label }} ({{ tasksForColumn(col.id).length }})</h3>
            </div>
          </div>
          <div class="flex-1 bg-slate-200/50 dark:bg-slate-900 rounded-xl p-3 space-y-3 overflow-y-auto border-none">
            <div
              v-for="task in tasksForColumn(col.id)" :key="task.id"
              :class="cn(
                'bg-white dark:bg-slate-800 p-3.5 rounded-md border-none shadow-sm hover:shadow-md transition-all group border-l-3',
                task.priority === 'CRITICAL' ? 'border-l-red-400' :
                task.priority === 'HIGH' ? 'border-l-orange-400' : 'border-l-slate-300'
              )"
            >
              <div class="flex justify-between items-start mb-3">
                <Badge variant="outline" :class="`text-[10px] font-black tracking-widest uppercase border-none px-0 ${priorityColor(task.priority)}`">
                  {{ task.priority }}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <button class="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal class="w-4 h-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="w-44">
                    <DropdownMenuItem @click="startEdit(task)" class="cursor-pointer"><Edit class="w-4 h-4 mr-2" />Modifier</DropdownMenuItem>
                    <DropdownMenuItem v-if="task.status !== 'COMPLETED'" @click="markComplete(task)" class="cursor-pointer"><CheckCircle2 class="w-4 h-4 mr-2" />Terminer</DropdownMenuItem>
                    <DropdownMenuItem v-if="task.status !== 'CANCELLED'" @click="markCancelled(task)" class="cursor-pointer"><XCircle class="w-4 h-4 mr-2" />Annuler</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="deleteTask(task.id)" class="text-red-500 cursor-pointer"><Trash2 class="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <h4 class="font-semibold text-sm text-slate-800 dark:text-slate-100 mb-2 leading-tight">{{ task.title }}</h4>
              <p v-if="task.description" class="text-xs text-slate-400 mb-3 line-clamp-2">{{ task.description }}</p>
              <div v-if="task.progress > 0 && task.progress < 100" class="mb-4 space-y-1.5">
                <Progress :value="task.progress" class="h-1 bg-slate-100 dark:bg-slate-700" />
              </div>
              <div class="flex items-center justify-between mt-3">
                <div class="flex items-center gap-3">
                  <div v-if="task.comments > 0" class="flex items-center text-[10px] text-slate-400 font-bold">
                    <MessageSquare class="w-3 h-3 mr-1" />{{ task.comments }}
                  </div>
                  <div v-if="task.dueDate" class="flex items-center text-[10px] text-slate-400 font-bold">
                    <Calendar class="w-3 h-3 mr-1" />{{ task.dueDate }}
                  </div>
                </div>
                <div v-if="task.assignees && task.assignees.length > 0" class="flex items-center -space-x-1.5">
                  <div
                    v-for="(aId, idx) in task.assignees.slice(0, 3)" :key="typeof aId === 'object' ? aId.id : aId"
                    class="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-[9px] text-slate-600 border-2 border-white dark:border-slate-800"
                    :title="getAssigneeName(aId)"
                    :style="{ zIndex: 10 - idx }"
                  >
                    {{ getAssigneeName(aId).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() }}
                  </div>
                  <div v-if="task.assignees.length > 3" class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-[9px] text-slate-500 border-2 border-white dark:border-slate-800" :style="{ zIndex: 6 }">
                    +{{ task.assignees.length - 3 }}
                  </div>
                </div>
              </div>
            </div>
            <div v-if="tasksForColumn(col.id).length === 0" class="py-12 flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-2">
              <Clock class="w-8 h-8" />
              <span class="text-[10px] uppercase font-black tracking-widest">Aucune tâche</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- List View -->
    <div v-else class="flex-1 overflow-auto">
      <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader class="bg-slate-50">
            <TableRow>
              <TableHead class="font-bold uppercase text-[10px] text-slate-400 tracking-wider py-4 pl-6">Tâche</TableHead>
              <TableHead class="font-bold uppercase text-[10px] text-slate-400 tracking-wider py-4">Priorité</TableHead>
              <TableHead class="font-bold uppercase text-[10px] text-slate-400 tracking-wider py-4">Statut</TableHead>
              <TableHead class="font-bold uppercase text-[10px] text-slate-400 tracking-wider py-4">Assigné</TableHead>
              <TableHead class="font-bold uppercase text-[10px] text-slate-400 tracking-wider py-4">Échéance</TableHead>
              <TableHead class="font-bold uppercase text-[10px] text-slate-400 tracking-wider py-4">Progression</TableHead>
              <TableHead class="text-right font-bold uppercase text-[10px] text-slate-400 tracking-wider py-4 pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="task in filteredTasks" :key="task.id" class="group hover:bg-slate-50">
              <TableCell class="pl-6">
                <div>
                  <p class="font-semibold text-sm">{{ task.title }}</p>
                  <p class="text-xs text-slate-400 line-clamp-1">{{ task.description }}</p>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" :class="cn('text-[10px] font-bold uppercase border-none', priorityColor(task.priority))">
                  {{ task.priority }}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge :class="cn('text-[10px] font-bold uppercase', statusColor(task.status))">
                  {{ statusLabel(task.status) }}
                </Badge>
              </TableCell>
              <TableCell>
                <div v-if="task.assignees && task.assignees.length > 0" class="flex flex-wrap gap-1">
                  <span
                    v-for="aId in task.assignees" :key="typeof aId === 'object' ? aId.id : aId"
                    class="inline-flex items-center bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[11px] font-medium"
                  >{{ getAssigneeName(aId) }}</span>
                </div>
                <span v-else class="text-sm text-slate-400">Non assigné</span>
              </TableCell>
              <TableCell>
                <span class="text-xs text-slate-500">{{ task.dueDate }}</span>
              </TableCell>
              <TableCell>
                <div class="flex items-center gap-2 w-24">
                  <Progress :value="task.progress" class="h-1.5" />
                  <span class="text-xs font-bold text-slate-500">{{ task.progress }}%</span>
                </div>
              </TableCell>
              <TableCell class="text-right pr-6">
                <div class="flex items-center justify-end gap-1">
                  <Button v-if="task.status !== 'COMPLETED' && task.status !== 'CANCELLED'" size="sm" class="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" @click="markComplete(task)">
                    <CheckCircle2 class="w-3 h-3 mr-1" />Terminer
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon" class="h-8 w-8"><MoreHorizontal class="w-4 h-4" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" class="w-44">
                      <DropdownMenuItem @click="startEdit(task)" class="cursor-pointer"><Edit class="w-4 h-4 mr-2" />Modifier</DropdownMenuItem>
                      <DropdownMenuItem v-if="task.status !== 'CANCELLED'" @click="markCancelled(task)" class="cursor-pointer"><XCircle class="w-4 h-4 mr-2" />Annuler</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="deleteTask(task.id)" class="text-red-500 cursor-pointer"><Trash2 class="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="filteredTasks.length === 0">
              <TableCell colspan="7" class="text-center py-8 text-slate-400">Aucune tâche trouvée</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>

    <!-- Edit Task Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifier la tâche</DialogTitle>
          <DialogDescription>Modifiez les détails de la tâche.</DialogDescription>
        </DialogHeader>
        <div v-if="editingTask" class="grid gap-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-slate-500">Titre</Label>
            <Input v-model="editingTask.title" />
          </div>
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-slate-500">Description</Label>
            <textarea v-model="editingTask.description" class="w-full min-h-[80px] px-3 py-2 rounded-md border border-slate-200 text-sm bg-white resize-none" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Statut</Label>
              <select v-model="editingTask.status" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
                <option value="PENDING">En attente</option>
                <option value="IN_PROGRESS">En cours</option>
                <option value="COMPLETED">Terminé</option>
                <option value="CANCELLED">Annulé</option>
              </select>
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Priorité</Label>
              <select v-model="editingTask.priority" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
                <option value="LOW">Basse</option>
                <option value="MEDIUM">Moyenne</option>
                <option value="HIGH">Haute</option>
                <option value="CRITICAL">Critique</option>
              </select>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2 assignee-multiselect">
              <Label class="text-xs font-bold uppercase text-slate-500">Assigné à</Label>
              <div class="relative">
                <div
                  class="w-full min-h-[40px] px-3 py-1.5 rounded-md border border-slate-200 text-sm bg-white cursor-pointer flex flex-wrap items-center gap-1"
                  @click.stop="showEditAssigneeDropdown = !showEditAssigneeDropdown"
                >
                  <template v-if="editingTask.assignees && editingTask.assignees.length > 0">
                    <span
                      v-for="aId in editingTask.assignees" :key="aId"
                      class="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium"
                    >
                      {{ getAssigneeName(aId) }}
                      <X class="w-3 h-3 cursor-pointer hover:text-red-500" @click.stop="removeEditAssignee(aId)" />
                    </span>
                  </template>
                  <span v-else class="text-slate-400">Sélectionner des employés...</span>
                </div>
                <div v-if="showEditAssigneeDropdown" class="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  <div
                    v-for="a in ASSIGNEES" :key="a.id"
                    class="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm"
                    @click="toggleEditAssignee(a.id)"
                  >
                    <div :class="cn('w-4 h-4 rounded border flex items-center justify-center', editingTask.assignees?.includes(a.id) ? 'bg-primary border-primary' : 'border-slate-300')">
                      <Check v-if="editingTask.assignees?.includes(a.id)" class="w-3 h-3 text-white" />
                    </div>
                    <span>{{ a.name }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Progression (%)</Label>
              <Input v-model.number="editingTask.progress" type="number" min="0" max="100" />
            </div>
          </div>
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-slate-500">Date d'échéance</Label>
            <Input v-model="editingTask.dueDate" type="date" />
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
