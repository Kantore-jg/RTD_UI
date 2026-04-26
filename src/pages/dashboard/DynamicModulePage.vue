<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Database, Plus, Search, Eye, Trash2, Edit,
  CheckCircle2, ArrowLeft, Calendar, Hash, Type,
  AlignLeft, List, CheckSquare, FileDown, X,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { moduleService, entryService } from '@/services/builder'

const route = useRoute()
const router = useRouter()

const moduleId = computed(() => Number(route.params.id))
const currentModule = ref(null)
const entries = ref([])
const loading = ref(false)
const loadingEntries = ref(false)

const activeTab = ref('entries')
const showAddEntry = ref(false)
const showEntryDetail = ref(false)
const selectedEntry = ref(null)
const searchTerm = ref('')
const formData = ref({})

async function fetchModule() {
  loading.value = true
  try {
    const { data } = await moduleService.get(moduleId.value)
    const mod = data.data ?? data
    currentModule.value = {
      ...mod,
      fields: mod.fields || [],
      entries: [],
    }
  } catch {
    toast.error('Erreur lors du chargement du module')
  } finally {
    loading.value = false
  }
}

async function fetchEntries() {
  loadingEntries.value = true
  try {
    const { data } = await entryService.list(moduleId.value)
    entries.value = (data.data ?? data).map(e => ({
      id: e.id,
      data: e.data || {},
      submittedBy: e.submitter?.name || e.submittedBy || 'Inconnu',
      submittedAt: e.created_at ? new Date(e.created_at).toLocaleDateString('fr-FR') : '',
    }))
    if (currentModule.value) {
      currentModule.value.entries = entries.value
    }
  } catch {
    toast.error('Erreur lors du chargement des entrées')
  } finally {
    loadingEntries.value = false
  }
}

function resetForm() {
  formData.value = {}
  if (currentModule.value) {
    currentModule.value.fields.forEach(f => {
      formData.value[f.label] = f.type === 'checkbox' ? false : ''
    })
  }
}

function openAddEntry() {
  resetForm()
  showAddEntry.value = true
}

async function submitEntry() {
  if (!currentModule.value) return
  const required = currentModule.value.fields.filter(f => f.required)
  for (const field of required) {
    const val = formData.value[field.label]
    if (val === '' || val === undefined || val === null) {
      toast.error(`Le champ "${field.label}" est obligatoire`)
      return
    }
  }
  try {
    await entryService.create(moduleId.value, { data: formData.value })
    showAddEntry.value = false
    toast.success('Entrée enregistrée avec succès')
    await fetchEntries()
  } catch {
    toast.error('Erreur lors de l\'enregistrement de l\'entrée')
  }
}

function viewEntry(entry) {
  selectedEntry.value = entry
  showEntryDetail.value = true
}

async function deleteEntry(entryId) {
  try {
    await entryService.delete(entryId)
    toast.success('Entrée supprimée')
    await fetchEntries()
  } catch {
    toast.error('Erreur lors de la suppression de l\'entrée')
  }
}

const filteredEntries = computed(() => {
  if (!currentModule.value) return []
  let list = entries.value
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    list = list.filter(entry =>
      Object.values(entry.data).some(val =>
        String(val).toLowerCase().includes(term)
      )
    )
  }
  return [...list].reverse()
})

const displayColumns = computed(() => {
  if (!currentModule.value) return []
  return currentModule.value.fields.slice(0, 5)
})

async function exportCSV() {
  if (!currentModule.value) return
  try {
    const { data } = await entryService.exportCsv(moduleId.value)
    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = `${currentModule.value.name.replace(/\s+/g, '_')}_export.csv`
    link.click()
    URL.revokeObjectURL(url)
    toast.success('Données exportées en CSV')
  } catch {
    toast.error('Erreur lors de l\'export CSV')
  }
}

function getFieldValue(entry, field) {
  return entry.data[field.label] ?? entry.data[field.name] ?? null
}

function fieldTypeIcon(type) {
  const map = { text: Type, textarea: AlignLeft, number: Hash, date: Calendar, select: List, checkbox: CheckSquare }
  return map[type] || Type
}

onMounted(async () => {
  await fetchModule()
  await fetchEntries()
})
</script>

<template>
  <div class="space-y-6">
    <template v-if="!currentModule">
      <div class="text-center py-20">
        <Database class="w-16 h-16 text-muted-foreground mx-auto mb-4" />
        <h2 class="text-xl font-bold mb-2">Module non trouvé</h2>
        <Button @click="router.push('/builder')">
          <ArrowLeft class="w-4 h-4 mr-2" />Retour au Builder
        </Button>
      </div>
    </template>

    <template v-else>
      <!-- Header -->
      <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div class="flex items-center gap-3">
          <div class="p-3 rounded-xl bg-primary/10">
            <Database class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 class="text-2xl font-bold">{{ currentModule.name }}</h1>
            <p class="text-muted-foreground text-sm">{{ currentModule.description || 'Module personnalisé' }}</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <Badge variant="outline" class="text-xs font-bold">
            {{ currentModule.fields.length }} champs · {{ currentModule.entries.length }} entrées
          </Badge>
          <Button variant="outline" class="font-bold" @click="exportCSV">
            <FileDown class="w-4 h-4 mr-2" />Exporter
          </Button>
          <Button class="font-bold shadow-lg" @click="openAddEntry">
            <Plus class="w-4 h-4 mr-2" />Nouvelle entrée
          </Button>
        </div>
      </div>

      <!-- Tabs -->
      <Tabs v-model="activeTab" class="space-y-6">
        <TabsList class="bg-muted p-1 border h-10 rounded-xl gap-1">
          <TabsTrigger value="entries" class="font-bold data-[state=active]:bg-background rounded-lg px-4 text-xs">
            <Database class="w-3.5 h-3.5 mr-1.5" />Entrées ({{ currentModule.entries.length }})
          </TabsTrigger>
          <TabsTrigger value="structure" class="font-bold data-[state=active]:bg-background rounded-lg px-4 text-xs">
            <Edit class="w-3.5 h-3.5 mr-1.5" />Structure
          </TabsTrigger>
        </TabsList>

        <!-- ENTRIES TAB -->
        <TabsContent value="entries">
          <!-- Search -->
          <div class="flex items-center gap-4 mb-6">
            <div class="relative flex-1">
              <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input v-model="searchTerm" placeholder="Rechercher dans les entrées..." class="pl-10" />
            </div>
          </div>

          <!-- Entries table -->
          <Card v-if="filteredEntries.length > 0" class="border-2 rounded-2xl overflow-hidden">
            <Table>
              <TableHeader class="bg-muted/50">
                <TableRow>
                  <TableHead class="font-bold text-[10px] uppercase tracking-wider py-3">#</TableHead>
                  <TableHead
                    v-for="col in displayColumns" :key="col.id"
                    class="font-bold text-[10px] uppercase tracking-wider py-3"
                  >
                    {{ col.label }}
                  </TableHead>
                  <TableHead class="font-bold text-[10px] uppercase tracking-wider py-3">Soumis par</TableHead>
                  <TableHead class="font-bold text-[10px] uppercase tracking-wider py-3">Date</TableHead>
                  <TableHead class="font-bold text-[10px] uppercase tracking-wider py-3 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="entry in filteredEntries" :key="entry.id" class="group hover:bg-muted/30">
                  <TableCell class="font-medium text-xs text-muted-foreground">{{ entry.id }}</TableCell>
                  <TableCell v-for="col in displayColumns" :key="col.id" class="text-sm">
                    <span v-if="col.type === 'checkbox'">
                      <Badge :class="getFieldValue(entry, col) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'" class="text-[10px]">
                        {{ getFieldValue(entry, col) ? 'Oui' : 'Non' }}
                      </Badge>
                    </span>
                    <span v-else class="line-clamp-1">{{ getFieldValue(entry, col) || '—' }}</span>
                  </TableCell>
                  <TableCell class="text-xs font-medium text-muted-foreground">{{ entry.submittedBy }}</TableCell>
                  <TableCell class="text-xs text-muted-foreground">{{ entry.submittedAt }}</TableCell>
                  <TableCell class="text-right">
                    <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" class="h-8 w-8" @click="viewEntry(entry)">
                        <Eye class="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" class="h-8 w-8 text-red-500 hover:bg-red-50" @click="deleteEntry(entry.id)">
                        <Trash2 class="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>

          <!-- Empty state -->
          <div v-else class="text-center py-16 border-2 border-dashed rounded-2xl">
            <Database class="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 class="text-lg font-bold mb-1">Aucune entrée</h3>
            <p class="text-sm text-muted-foreground mb-4">Ce module n'a pas encore de données enregistrées.</p>
            <Button @click="openAddEntry">
              <Plus class="w-4 h-4 mr-2" />Ajouter la première entrée
            </Button>
          </div>
        </TabsContent>

        <!-- STRUCTURE TAB -->
        <TabsContent value="structure">
          <Card class="border-2 rounded-2xl">
            <CardHeader>
              <CardTitle class="text-sm font-bold">Champs du formulaire</CardTitle>
              <CardDescription>Structure du module. Pour modifier, allez dans le Builder.</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-3">
                <div
                  v-for="field in currentModule.fields" :key="field.id"
                  class="p-3 border rounded-lg flex items-center gap-3"
                >
                  <div class="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                    <component :is="fieldTypeIcon(field.type)" class="w-4 h-4" />
                  </div>
                  <div class="flex-1">
                    <span class="font-bold text-sm">{{ field.label }}</span>
                    <div class="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" class="text-[9px]">{{ field.type }}</Badge>
                      <Badge v-if="field.required" class="text-[9px] bg-red-100 text-red-600 border-none">Requis</Badge>
                      <span v-if="field.type === 'select'" class="text-[10px] text-muted-foreground">{{ field.options.join(', ') }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-4 flex justify-end">
                <Button variant="outline" size="sm" @click="router.push('/builder')">
                  <Edit class="w-3.5 h-3.5 mr-1" />Modifier dans le Builder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <!-- Add Entry Dialog -->
      <Dialog v-model:open="showAddEntry">
        <DialogContent class="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle entrée — {{ currentModule.name }}</DialogTitle>
            <DialogDescription>Remplissez le formulaire pour enregistrer une nouvelle entrée.</DialogDescription>
          </DialogHeader>
          <div class="space-y-5 py-4">
            <div v-for="field in currentModule.fields" :key="field.id" class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500 ml-0.5">*</span>
              </Label>
              <Input
                v-if="field.type === 'text'"
                v-model="formData[field.label]"
                :placeholder="field.label"
              />
              <textarea
                v-else-if="field.type === 'textarea'"
                v-model="formData[field.label]"
                class="w-full min-h-[80px] px-3 py-2 rounded-md border border-slate-200 text-sm bg-white resize-none"
                :placeholder="field.label"
              />
              <Input
                v-else-if="field.type === 'number'"
                v-model="formData[field.label]"
                type="number"
                placeholder="0"
              />
              <Input
                v-else-if="field.type === 'date'"
                v-model="formData[field.label]"
                type="date"
              />
              <select
                v-else-if="field.type === 'select'"
                v-model="formData[field.label]"
                class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white"
              >
                <option value="">Sélectionner...</option>
                <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
              </select>
              <div v-else-if="field.type === 'checkbox'" class="flex items-center gap-2 pt-1">
                <input type="checkbox" v-model="formData[field.label]" class="rounded" :id="'field-' + field.id" />
                <label :for="'field-' + field.id" class="text-sm cursor-pointer">{{ field.label }}</label>
              </div>
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="showAddEntry = false">Annuler</Button>
            <Button @click="submitEntry">
              <CheckCircle2 class="w-4 h-4 mr-2" />Soumettre
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <!-- Entry Detail Dialog -->
      <Dialog v-model:open="showEntryDetail">
        <DialogContent class="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Détail de l'entrée #{{ selectedEntry?.id }}</DialogTitle>
            <DialogDescription>Soumis par {{ selectedEntry?.submittedBy }} le {{ selectedEntry?.submittedAt }}</DialogDescription>
          </DialogHeader>
          <div v-if="selectedEntry" class="space-y-4 py-4">
            <div v-for="field in currentModule.fields" :key="field.id" class="p-3 rounded-lg bg-slate-50 border">
              <p class="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">{{ field.label }}</p>
              <p v-if="field.type === 'checkbox'" class="text-sm font-medium">
                <Badge :class="getFieldValue(selectedEntry, field) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'">
                  {{ getFieldValue(selectedEntry, field) ? 'Oui' : 'Non' }}
                </Badge>
              </p>
              <p v-else class="text-sm font-medium">{{ getFieldValue(selectedEntry, field) || '—' }}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </template>
  </div>
</template>
