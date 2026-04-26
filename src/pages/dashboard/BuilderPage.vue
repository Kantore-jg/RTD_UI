<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Plus, Settings, Layout, Database, Eye,
  Save, Trash2, ChevronRight, ArrowUp, ArrowDown,
  Edit, X, CheckCircle2, Type, AlignLeft, Hash,
  Calendar, List, CheckSquare, Lock, ExternalLink,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { moduleService } from '@/services/builder'
import { useBuilderStore } from '@/stores/builder'
import { storeToRefs } from 'pinia'

const router = useRouter()
const builderStore = useBuilderStore()
const { modules } = storeToRefs(builderStore)
const loading = ref(false)

const FIELD_TYPES = [
  { label: 'Entrée Texte', icon: Type, type: 'text', description: 'Champ texte court' },
  { label: 'Zone de Texte', icon: AlignLeft, type: 'textarea', description: 'Texte long multi-lignes' },
  { label: 'Champ Numérique', icon: Hash, type: 'number', description: 'Nombres et montants' },
  { label: 'Sélecteur de Date', icon: Calendar, type: 'date', description: 'Date du calendrier' },
  { label: 'Choix Multiple', icon: List, type: 'select', description: 'Liste déroulante' },
  { label: 'Case à cocher', icon: CheckSquare, type: 'checkbox', description: 'Oui / Non' },
]

const activeTab = ref('structure')
const currentView = ref('list')
const editingModuleId = ref(null)
const showPreview = ref(false)
const showNewModule = ref(false)
const showEditField = ref(false)
const editingField = ref(null)
const editingFieldIndex = ref(-1)

const newModuleName = ref('')
const newModuleDescription = ref('')
const newModuleSidebar = ref(true)

const editingModule = computed(() =>
  editingModuleId.value !== null ? modules.value.find(m => m.id === editingModuleId.value) : null
)

async function fetchModules() {
  loading.value = true
  try {
    await builderStore.fetchModules()
  } catch {
    toast.error('Erreur lors du chargement des modules')
  } finally {
    loading.value = false
  }
}

async function createModule() {
  if (!newModuleName.value) {
    toast.error('Le nom du module est obligatoire')
    return
  }
  try {
    const { data } = await moduleService.create({
      name: newModuleName.value,
      description: newModuleDescription.value,
      icon: 'Database',
      fields: [],
      show_in_sidebar: newModuleSidebar.value,
    })
    const raw = data.data ?? data
    const mod = builderStore.normalize(raw)
    modules.value.push(mod)
    newModuleName.value = ''
    newModuleDescription.value = ''
    newModuleSidebar.value = true
    showNewModule.value = false
    toast.success('Module créé — ajoutez des champs')
    editingModuleId.value = mod.id
    currentView.value = 'editor'
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la création du module')
  }
}

function openModuleEditor(mod) {
  editingModuleId.value = mod.id
  currentView.value = 'editor'
  activeTab.value = 'structure'
}

function backToList() {
  editingModuleId.value = null
  currentView.value = 'list'
}

function goToModulePage(mod) {
  router.push('/module/' + mod.id)
}

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
}

function addFieldFromToolbox(fieldType) {
  if (!editingModule.value) return
  const label = fieldType.label
  editingModule.value.fields.push({
    id: Date.now(),
    name: slugify(label),
    label,
    type: fieldType.type,
    required: false,
    options: fieldType.type === 'select' ? ['Option 1', 'Option 2'] : [],
  })
  toast.success(`Champ "${label}" ajouté`)
}

function removeField(index) {
  if (!editingModule.value) return
  editingModule.value.fields.splice(index, 1)
  toast.success('Champ supprimé')
}

function moveField(index, direction) {
  if (!editingModule.value) return
  const fields = editingModule.value.fields
  const newIndex = index + direction
  if (newIndex < 0 || newIndex >= fields.length) return
  const temp = fields[index]
  fields[index] = fields[newIndex]
  fields[newIndex] = temp
}

function startEditField(field, index) {
  editingField.value = { ...field, options: Array.isArray(field.options) ? field.options.join(', ') : '' }
  editingFieldIndex.value = index
  showEditField.value = true
}

function saveFieldEdit() {
  if (!editingModule.value) return
  const fieldData = {
    name: slugify(editingField.value.label),
    label: editingField.value.label,
    type: editingField.value.type,
    required: editingField.value.required,
  }
  if (editingField.value.type === 'select') {
    fieldData.options = editingField.value.options.split(',').map(o => o.trim()).filter(Boolean)
  } else {
    fieldData.options = []
  }
  Object.assign(editingModule.value.fields[editingFieldIndex.value], fieldData)
  showEditField.value = false
  toast.success('Champ mis à jour')
}

async function saveModule() {
  if (!editingModule.value) return
  try {
    const { data } = await moduleService.update(editingModule.value.id, {
      name: editingModule.value.name,
      description: editingModule.value.description,
      icon: editingModule.value.icon,
      fields: editingModule.value.fields,
      show_in_sidebar: editingModule.value.showInSidebar,
    })
    const updated = data.data ?? data
    builderStore.updateLocal(editingModule.value.id, {
      name: updated.name,
      fields: updated.fields || [],
      showInSidebar: updated.show_in_sidebar ?? editingModule.value.showInSidebar,
    })
    toast.success(`Module "${editingModule.value.name}" enregistré`)
  } catch {
    toast.error('Erreur lors de l\'enregistrement du module')
  }
}

async function deleteModule(id) {
  try {
    await moduleService.delete(id)
    builderStore.removeLocal(id)
    if (editingModuleId.value === id) backToList()
    toast.success('Module supprimé')
  } catch {
    toast.error('Erreur lors de la suppression du module')
  }
}

function previewModule() {
  showPreview.value = true
}

function fieldTypeIcon(type) {
  const map = { text: Type, textarea: AlignLeft, number: Hash, date: Calendar, select: List, checkbox: CheckSquare }
  return map[type] || Type
}

function fieldTypeName(type) {
  const map = { text: 'Texte', textarea: 'Zone de texte', number: 'Numérique', date: 'Date', select: 'Sélection', checkbox: 'Case à cocher' }
  return map[type] || type
}

onMounted(fetchModules)
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-black tracking-tight">Module Builder</h1>
        <p class="text-muted-foreground font-medium">Créez des formulaires et structures de données personnalisés pour votre entreprise.</p>
      </div>
      <div v-if="currentView === 'editor'" class="flex items-center gap-2">
        <Button variant="outline" class="font-bold border-2" @click="backToList">
          <X class="w-4 h-4 mr-2" />Retour
        </Button>
        <Button variant="outline" class="font-bold border-2" @click="previewModule">
          <Eye class="w-4 h-4 mr-2" />Prévisualiser
        </Button>
        <Button class="font-bold shadow-lg shadow-primary/20" @click="saveModule">
          <Save class="w-4 h-4 mr-2" />Enregistrer
        </Button>
      </div>
      <div v-else>
        <Dialog v-model:open="showNewModule">
          <DialogTrigger as-child>
            <Button class="font-bold shadow-lg">
              <Plus class="w-4 h-4 mr-2" />Nouveau Module
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Nouveau Module</DialogTitle>
              <DialogDescription>Créez un module personnalisé pour enregistrer des données.</DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Nom du module *</Label>
                <Input v-model="newModuleName" placeholder="Ex: Inventaire, Réclamations..." />
              </div>
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Description</Label>
                <Input v-model="newModuleDescription" placeholder="Description courte du module" />
              </div>
              <div class="flex items-center justify-between py-2 px-1">
                <div>
                  <Label class="text-sm font-medium">Afficher dans le Sidebar</Label>
                  <p class="text-xs text-muted-foreground">Le module sera accessible directement depuis le menu latéral.</p>
                </div>
                <Switch :checked="newModuleSidebar" @update:checked="newModuleSidebar = $event" />
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <Button variant="outline" @click="showNewModule = false">Annuler</Button>
              <Button @click="createModule">Créer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <!-- === MODULE LIST VIEW === -->
    <template v-if="currentView === 'list'">
      <div v-if="modules.length === 0" class="text-center py-20">
        <div class="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed">
          <Database class="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 class="text-xl font-bold mb-2">Aucun module créé</h2>
        <p class="text-muted-foreground mb-6">Créez votre premier module personnalisé pour commencer.</p>
        <Button @click="showNewModule = true">
          <Plus class="w-4 h-4 mr-2" />Nouveau Module
        </Button>
      </div>

      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="mod in modules" :key="mod.id"
          class="p-5 border-2 rounded-2xl bg-background hover:border-primary/30 transition-all group hover:shadow-xl hover:shadow-primary/5"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all cursor-pointer" @click="goToModulePage(mod)">
              <Database class="w-6 h-6" />
            </div>
            <div class="flex items-center gap-1">
              <Button variant="ghost" size="icon" class="h-8 w-8" @click="openModuleEditor(mod)" title="Modifier la structure">
                <Settings class="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" class="h-8 w-8 text-red-500 hover:bg-red-50" @click="deleteModule(mod.id)">
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div class="space-y-1 cursor-pointer" @click="goToModulePage(mod)">
            <h4 class="text-lg font-black">{{ mod.name }}</h4>
            <p v-if="mod.description" class="text-xs text-muted-foreground">{{ mod.description }}</p>
            <div class="flex items-center gap-4 text-xs font-bold text-muted-foreground tracking-tighter mt-2">
              <span>{{ mod.fields.length }} champs</span>
              <span>•</span>
              <span>{{ mod.entriesCount }} entrées</span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t-2 border-dashed flex items-center justify-between">
            <div class="flex items-center gap-2" @click.stop>
              <Switch :checked="mod.showInSidebar" @update:checked="builderStore.toggleSidebar(mod.id)" class="scale-75" />
              <span class="text-[10px] font-bold text-muted-foreground">{{ mod.showInSidebar ? 'Sidebar' : 'Masqué' }}</span>
            </div>
            <Button variant="ghost" size="sm" class="text-xs h-7 gap-1" @click="goToModulePage(mod)">
              Ouvrir <ExternalLink class="w-3 h-3" />
            </Button>
          </div>
        </div>
      </div>
    </template>

    <!-- === MODULE EDITOR VIEW === -->
    <template v-if="currentView === 'editor' && editingModule">
      <div class="flex items-center justify-between mb-2">
        <div class="flex items-center gap-3">
          <Badge class="bg-primary/10 text-primary border-primary/20 text-xs font-bold">
            {{ editingModule.fields.length }} champs
          </Badge>
          <h2 class="text-xl font-bold">{{ editingModule.name }}</h2>
        </div>
        <Button variant="outline" size="sm" class="text-xs font-bold gap-1" @click="goToModulePage(editingModule)">
          <ExternalLink class="w-3.5 h-3.5" />Voir le module
        </Button>
      </div>

      <div class="grid lg:grid-cols-4 gap-8">
        <!-- Toolbox -->
        <div class="lg:col-span-1 space-y-4 shrink-0">
          <Card class="border-2 rounded-2xl overflow-hidden">
            <CardHeader class="bg-muted/30 border-b py-3">
              <CardTitle class="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <Layout class="w-4 h-4 text-primary" />
                Ajouter un champ
              </CardTitle>
            </CardHeader>
            <CardContent class="p-3">
              <div class="grid gap-2">
                <button
                  v-for="(comp, i) in FIELD_TYPES" :key="i"
                  class="flex items-center gap-3 p-3 bg-background border-2 rounded-xl hover:border-primary/50 hover:bg-muted/30 transition-all group active:scale-95 w-full text-left"
                  @click="addFieldFromToolbox(comp)"
                >
                  <div class="p-2 rounded-lg bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-white transition-colors">
                    <component :is="comp.icon" class="w-4 h-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <span class="text-sm font-bold block">{{ comp.label }}</span>
                    <span class="text-[10px] text-muted-foreground">{{ comp.description }}</span>
                  </div>
                  <Plus class="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <!-- Editor Canvas -->
        <div class="lg:col-span-3">
          <Tabs v-model="activeTab" class="space-y-6">
            <TabsList class="bg-muted p-1 border-2 border-muted h-12 rounded-xl gap-1">
              <TabsTrigger value="structure" class="font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-6">Structure</TabsTrigger>
              <TabsTrigger value="permissions" class="font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-6">Permissions</TabsTrigger>
            </TabsList>

            <TabsContent value="structure" class="space-y-4">
              <Card v-if="editingModule.fields.length === 0" class="border-4 border-dashed bg-muted/20 border-muted rounded-2xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div class="w-16 h-16 bg-background rounded-2xl flex items-center justify-center shadow-lg border-2 border-primary/10">
                  <Plus class="w-8 h-8 text-primary" />
                </div>
                <div class="space-y-2">
                  <h2 class="text-xl font-black tracking-tight">Ajoutez des champs</h2>
                  <p class="text-muted-foreground font-medium max-w-sm mx-auto">Cliquez sur un type de champ dans la boîte à outils à gauche pour l'ajouter.</p>
                </div>
              </Card>

              <div v-else class="space-y-3">
                <div
                  v-for="(field, idx) in editingModule.fields" :key="field.id"
                  class="p-4 border-2 rounded-xl bg-background hover:border-primary/20 transition-all group flex items-center gap-4"
                >
                  <div class="flex flex-col gap-1">
                    <button class="p-1 rounded hover:bg-muted disabled:opacity-20" :disabled="idx === 0" @click="moveField(idx, -1)">
                      <ArrowUp class="w-3 h-3" />
                    </button>
                    <button class="p-1 rounded hover:bg-muted disabled:opacity-20" :disabled="idx === editingModule.fields.length - 1" @click="moveField(idx, 1)">
                      <ArrowDown class="w-3 h-3" />
                    </button>
                  </div>
                  <div class="p-2 rounded-lg bg-muted text-muted-foreground shrink-0">
                    <component :is="fieldTypeIcon(field.type)" class="w-4 h-4" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-sm">{{ field.label }}</span>
                      <Badge v-if="field.required" class="text-[8px] bg-red-100 text-red-600 border-none px-1.5 py-0">Requis</Badge>
                    </div>
                    <div class="flex items-center gap-2 mt-0.5">
                      <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{{ fieldTypeName(field.type) }}</span>
                      <span v-if="field.type === 'select' && field.options.length" class="text-[10px] text-muted-foreground">· {{ field.options.length }} options</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" class="h-8 w-8" @click="startEditField(field, idx)"><Edit class="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" class="h-8 w-8 text-red-500 hover:bg-red-50" @click="removeField(idx)"><Trash2 class="w-4 h-4" /></Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="permissions">
              <Card class="border-2 p-8 space-y-6">
                <div class="flex items-center gap-3">
                  <div class="p-3 rounded-xl bg-muted"><Lock class="w-6 h-6 text-muted-foreground" /></div>
                  <div>
                    <h3 class="text-lg font-bold">Accès par rôle</h3>
                    <p class="text-sm text-muted-foreground">Définissez les permissions pour ce module.</p>
                  </div>
                </div>
                <div class="space-y-3">
                  <div v-for="role in ['Directeur Général', 'Leader', 'Employé']" :key="role" class="flex items-center justify-between p-4 rounded-lg border bg-slate-50">
                    <div>
                      <p class="font-bold text-sm">{{ role }}</p>
                      <p class="text-xs text-muted-foreground">Accès aux données de ce module</p>
                    </div>
                    <div class="flex items-center gap-4">
                      <label class="flex items-center gap-1.5 text-xs font-medium"><input type="checkbox" checked class="rounded" />Lire</label>
                      <label class="flex items-center gap-1.5 text-xs font-medium"><input type="checkbox" :checked="role !== 'Employé'" class="rounded" />Écrire</label>
                      <label class="flex items-center gap-1.5 text-xs font-medium"><input type="checkbox" :checked="role === 'Directeur Général'" class="rounded" />Supprimer</label>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </template>

    <!-- Edit Field Dialog -->
    <Dialog v-model:open="showEditField">
      <DialogContent class="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Modifier le champ</DialogTitle>
          <DialogDescription>Configurez les propriétés du champ.</DialogDescription>
        </DialogHeader>
        <div v-if="editingField" class="grid gap-4 py-4">
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-slate-500">Libellé</Label>
            <Input v-model="editingField.label" />
          </div>
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-slate-500">Type de champ</Label>
            <select v-model="editingField.type" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
              <option value="text">Entrée Texte</option>
              <option value="textarea">Zone de Texte</option>
              <option value="number">Champ Numérique</option>
              <option value="date">Sélecteur de Date</option>
              <option value="select">Choix Multiple</option>
              <option value="checkbox">Case à cocher</option>
            </select>
          </div>
          <div v-if="editingField.type === 'select'" class="space-y-2">
            <Label class="text-xs font-bold uppercase text-slate-500">Options (séparées par des virgules)</Label>
            <Input v-model="editingField.options" placeholder="Option 1, Option 2, Option 3" />
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg bg-slate-50 border">
            <span class="text-sm font-medium">Champ obligatoire</span>
            <Switch :checked="editingField.required" @update:checked="v => editingField.required = v" />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" @click="showEditField = false">Annuler</Button>
          <Button @click="saveFieldEdit">Sauvegarder</Button>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Preview Dialog -->
    <Dialog v-model:open="showPreview">
      <DialogContent class="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prévisualisation — {{ editingModule?.name }}</DialogTitle>
          <DialogDescription>Voici comment le formulaire apparaîtra pour les utilisateurs.</DialogDescription>
        </DialogHeader>
        <div v-if="editingModule" class="space-y-5 py-4">
          <div v-if="editingModule.fields.length === 0" class="text-center py-8 text-muted-foreground">
            Aucun champ défini
          </div>
          <div v-for="field in editingModule.fields" :key="field.id" class="space-y-2">
            <Label class="text-xs font-bold uppercase text-slate-500">
              {{ field.label }}
              <span v-if="field.required" class="text-red-500 ml-1">*</span>
            </Label>
            <Input v-if="field.type === 'text'" :placeholder="field.label" />
            <textarea v-else-if="field.type === 'textarea'" class="w-full min-h-[80px] px-3 py-2 rounded-md border border-slate-200 text-sm bg-white resize-none" :placeholder="field.label" />
            <Input v-else-if="field.type === 'number'" type="number" placeholder="0" />
            <Input v-else-if="field.type === 'date'" type="date" />
            <select v-else-if="field.type === 'select'" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
              <option value="">Sélectionner...</option>
              <option v-for="opt in field.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <div v-else-if="field.type === 'checkbox'" class="flex items-center gap-2">
              <input type="checkbox" class="rounded" /><span class="text-sm">{{ field.label }}</span>
            </div>
          </div>
          <div v-if="editingModule.fields.length > 0" class="pt-4 border-t">
            <Button class="w-full font-bold" disabled>
              <CheckCircle2 class="w-4 h-4 mr-2" />Soumettre
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
