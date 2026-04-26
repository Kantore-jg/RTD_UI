<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Archive, Search, Filter, FileText, FileDown, Folder,
  MoreVertical, Clock, Shield, Plus, ArrowRight, HardDrive,
  FolderPlus, Upload, Eye, Trash2, Users, Download,
  ArrowLeft, FileSpreadsheet, FileImage, File,
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
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { folderService, fileService } from '@/services/archives'

const authStore = useAuthStore()
const { isAdmin, isEmployee } = storeToRefs(authStore)

const folders = ref([])
const files = ref([])
const loading = ref(false)
const loadingFiles = ref(false)

const searchTerm = ref('')
const currentFolderId = ref(null)
const showCreateFolder = ref(false)
const showUploadFile = ref(false)
const showAccessLog = ref(false)
const selectedFile = ref(null)

const newFolderName = ref('')
const newFile = ref({ name: '', type: 'PDF', category: '', folderId: null, size: '0 KB' })
const uploadedFile = ref(null)
const isDragging = ref(false)
const fileInputRef = ref(null)

const extensionToType = {
  pdf: 'PDF',
  doc: 'DOCX', docx: 'DOCX',
  xls: 'XLSX', xlsx: 'XLSX',
  csv: 'CSV',
  ppt: 'PPTX', pptx: 'PPTX',
  jpg: 'JPG', jpeg: 'JPG',
  png: 'PNG',
  gif: 'GIF',
  svg: 'SVG',
  txt: 'TXT',
  zip: 'ZIP', rar: 'RAR', '7z': '7Z',
}

const extensionToCategory = {
  pdf: 'Document',
  doc: 'Document', docx: 'Document',
  xls: 'Tableur', xlsx: 'Tableur', csv: 'Tableur',
  ppt: 'Présentation', pptx: 'Présentation',
  jpg: 'Image', jpeg: 'Image', png: 'Image', gif: 'Image', svg: 'Image',
  txt: 'Texte',
  zip: 'Archive', rar: 'Archive', '7z': 'Archive',
}

function formatFileSize(bytes) {
  if (typeof bytes === 'string') return bytes
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function detectFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  return extensionToType[ext] || ext.toUpperCase()
}

function detectFileCategory(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  return extensionToCategory[ext] || 'Général'
}

function handleFileSelect(event) {
  const file = event.target.files?.[0]
  if (file) processSelectedFile(file)
}

function handleDrop(event) {
  isDragging.value = false
  const file = event.dataTransfer.files?.[0]
  if (file) processSelectedFile(file)
}

function processSelectedFile(file) {
  uploadedFile.value = file
  newFile.value.name = file.name
  newFile.value.type = detectFileType(file.name)
  newFile.value.size = formatFileSize(file.size)
  if (!newFile.value.category) {
    newFile.value.category = detectFileCategory(file.name)
  }
}

function removeSelectedFile() {
  uploadedFile.value = null
  newFile.value = { name: '', type: 'PDF', category: '', folderId: null, size: '0 KB' }
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function normalizeFile(f) {
  return {
    id: f.id,
    name: f.original_name || f.name,
    type: (f.type || detectFileType(f.original_name || f.name)).toUpperCase(),
    category: f.category || 'Général',
    size: formatFileSize(f.size),
    date: f.created_at ? f.created_at.split('T')[0] : '',
    owner: f.uploaded_by?.name || 'Inconnu',
    folderId: f.folder_id,
    accessLog: f.access_logs || [],
    _rawSize: typeof f.size === 'number' ? f.size : 0,
  }
}

async function fetchFolders() {
  loading.value = true
  try {
    const { data } = await folderService.list()
    const raw = data.data ?? data
    folders.value = raw.map(f => ({
      id: f.id,
      name: f.name,
      filesCount: f.files_count ?? 0,
      createdAt: f.created_at ? f.created_at.split('T')[0] : '',
      createdBy: f.creator?.name || 'Inconnu',
    }))
  } catch {
    toast.error('Erreur lors du chargement des dossiers')
  } finally {
    loading.value = false
  }
}

async function fetchFiles() {
  loadingFiles.value = true
  try {
    const params = {}
    if (currentFolderId.value !== null) params.folder_id = currentFolderId.value
    const { data } = await fileService.list(params)
    const raw = data.data ?? data
    files.value = raw.map(normalizeFile)
  } catch {
    toast.error('Erreur lors du chargement des fichiers')
  } finally {
    loadingFiles.value = false
  }
}

const filteredFiles = computed(() => {
  let list = files.value
  if (currentFolderId.value !== null) {
    list = list.filter(f => f.folderId === currentFolderId.value)
  }
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    list = list.filter(f => f.name.toLowerCase().includes(term) || f.category.toLowerCase().includes(term))
  }
  return list
})

const currentFolder = computed(() =>
  currentFolderId.value !== null ? folders.value.find(f => f.id === currentFolderId.value) : null
)

const storageUsed = computed(() => {
  const totalBytes = files.value.reduce((sum, f) => sum + (f._rawSize || 0), 0)
  return (totalBytes / (1024 * 1024 * 1024)).toFixed(1)
})

const fileTypeStats = computed(() => [
  { label: 'Documents PDF', count: files.value.filter(f => f.type === 'PDF').length, color: 'text-red-500' },
  { label: 'Tableurs XLS', count: files.value.filter(f => f.type === 'XLSX').length, color: 'text-emerald-500' },
  { label: 'Documents DOCX', count: files.value.filter(f => f.type === 'DOCX').length, color: 'text-blue-500' },
  { label: 'Autres formats', count: files.value.filter(f => !['PDF', 'XLSX', 'DOCX'].includes(f.type)).length, color: 'text-orange-500' },
])

function fileIcon(type) {
  if (type === 'PDF') return FileText
  if (type === 'XLSX') return FileSpreadsheet
  if (['JPG', 'PNG', 'GIF'].includes(type)) return FileImage
  return File
}

async function openFolder(folderId) {
  currentFolderId.value = folderId
  await fetchFiles()
}

async function goBack() {
  currentFolderId.value = null
  await fetchFiles()
}

async function createFolder() {
  if (!newFolderName.value) {
    toast.error('Entrez un nom de dossier')
    return
  }
  try {
    await folderService.create({ name: newFolderName.value })
    newFolderName.value = ''
    showCreateFolder.value = false
    toast.success('Dossier créé')
    await fetchFolders()
  } catch {
    toast.error('Erreur lors de la création du dossier')
  }
}

async function uploadFile() {
  if (!uploadedFile.value) {
    toast.error('Veuillez sélectionner un fichier à archiver.')
    return
  }
  try {
    const formData = new FormData()
    formData.append('file', uploadedFile.value)
    formData.append('category', newFile.value.category || 'Général')
    const targetFolderId = newFile.value.folderId || currentFolderId.value
    if (targetFolderId) formData.append('folder_id', targetFolderId)
    await fileService.upload(formData)
    removeSelectedFile()
    showUploadFile.value = false
    toast.success('Fichier archivé avec succès')
    await Promise.all([fetchFiles(), fetchFolders()])
  } catch {
    toast.error('Erreur lors de l\'archivage du fichier')
  }
}

async function viewAccessLog(file) {
  try {
    const { data } = await fileService.get(file.id)
    const detailed = data.data ?? data
    selectedFile.value = {
      ...file,
      accessLog: detailed.access_logs || [],
    }
    showAccessLog.value = true
  } catch {
    toast.error('Erreur lors du chargement de la traçabilité')
  }
}

async function downloadFile(file) {
  try {
    const { data } = await fileService.download(file.id)
    const url = URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = file.name
    link.click()
    URL.revokeObjectURL(url)
    toast.success(`Téléchargement de ${file.name}`)
  } catch {
    toast.error('Erreur lors du téléchargement')
  }
}

async function deleteFile(id) {
  try {
    await fileService.delete(id)
    toast.success('Fichier supprimé')
    await Promise.all([fetchFiles(), fetchFolders()])
  } catch {
    toast.error('Erreur lors de la suppression du fichier')
  }
}

async function deleteFolder(id) {
  try {
    await folderService.delete(id)
    if (currentFolderId.value === id) currentFolderId.value = null
    toast.success('Dossier supprimé')
    await Promise.all([fetchFolders(), fetchFiles()])
  } catch {
    toast.error('Erreur lors de la suppression du dossier')
  }
}

function exportData() {
  const header = 'Nom,Type,Catégorie,Taille,Date,Propriétaire\n'
  const rows = files.value.map(f => `${f.name},${f.type},${f.category},${f.size},${f.date},${f.owner}`).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'archives_export.csv'
  link.click()
  toast.success('Données exportées')
}

onMounted(() => {
  fetchFolders()
  fetchFiles()
})
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-3xl font-black tracking-tight">Archives & Coffre-Fort</h1>
        <p class="text-muted-foreground font-medium">Stockage sécurisé et centralisé de vos documents officiels.</p>
      </div>
      <div v-if="isAdmin" class="flex items-center gap-2">
        <Button variant="outline" class="font-bold border-2" @click="exportData">
          <Download class="w-4 h-4 mr-2" />
          Extraire les données
        </Button>
        <Dialog v-model:open="showUploadFile">
          <DialogTrigger as-child>
            <Button class="font-bold shadow-lg">
              <Upload class="w-4 h-4 mr-2" />
              Archiver un fichier
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Archiver un fichier</DialogTitle>
              <DialogDescription>Glissez-déposez ou sélectionnez un document. Le type sera détecté automatiquement.</DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
              <!-- Drop Zone -->
              <input
                ref="fileInputRef"
                type="file"
                class="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.svg,.txt,.zip,.rar,.7z"
                @change="handleFileSelect"
              />
              <div
                v-if="!uploadedFile"
                class="relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all"
                :class="isDragging ? 'border-primary bg-primary/5 scale-[1.01]' : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30'"
                @click="triggerFileInput"
                @dragover.prevent="isDragging = true"
                @dragleave.prevent="isDragging = false"
                @drop.prevent="handleDrop"
              >
                <div class="flex flex-col items-center gap-3">
                  <div class="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <Upload class="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p class="font-semibold text-sm">
                      {{ isDragging ? 'Déposez le fichier ici' : 'Glissez-déposez votre fichier ici' }}
                    </p>
                    <p class="text-xs text-muted-foreground mt-1">ou <span class="text-primary font-medium underline underline-offset-2">parcourir vos fichiers</span></p>
                  </div>
                  <p class="text-[10px] text-muted-foreground/60 uppercase tracking-wider font-bold">PDF, DOCX, XLSX, Images, CSV, ZIP...</p>
                </div>
              </div>

              <!-- Selected File Preview -->
              <div
                v-else
                class="relative border-2 rounded-xl p-4 bg-muted/20"
              >
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm"
                    :class="{
                      'bg-red-50 text-red-500 border-red-100': newFile.type === 'PDF',
                      'bg-blue-50 text-blue-500 border-blue-100': newFile.type === 'DOCX',
                      'bg-emerald-50 text-emerald-500 border-emerald-100': ['XLSX', 'CSV'].includes(newFile.type),
                      'bg-amber-50 text-amber-500 border-amber-100': ['JPG', 'PNG', 'GIF', 'SVG'].includes(newFile.type),
                      'bg-slate-50 text-slate-500 border-slate-100': !['PDF', 'DOCX', 'XLSX', 'CSV', 'JPG', 'PNG', 'GIF', 'SVG'].includes(newFile.type),
                    }"
                  >
                    <component :is="fileIcon(newFile.type)" class="w-6 h-6" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-bold text-sm truncate">{{ uploadedFile.name }}</p>
                    <div class="flex items-center gap-3 mt-0.5">
                      <Badge variant="secondary" class="font-black text-[9px] uppercase tracking-widest">{{ newFile.type }}</Badge>
                      <span class="text-xs text-muted-foreground font-medium">{{ newFile.size }}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-muted-foreground hover:text-red-500" @click="removeSelectedFile">
                    <Trash2 class="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <!-- Category & Folder -->
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Catégorie</Label>
                  <Input v-model="newFile.category" placeholder="RH, Finance, ..." />
                </div>
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Dossier</Label>
                  <select v-model="newFile.folderId" class="w-full h-10 px-3 rounded-md border border-input text-sm bg-background">
                    <option :value="null">Aucun (racine)</option>
                    <option v-for="f in folders" :key="f.id" :value="f.id">{{ f.name }}</option>
                  </select>
                </div>
              </div>

              <!-- Auto-detected type info -->
              <div v-if="uploadedFile" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10">
                <Shield class="w-4 h-4 text-primary flex-shrink-0" />
                <p class="text-xs text-primary">
                  Type détecté automatiquement : <span class="font-bold">{{ newFile.type }}</span> — Catégorie : <span class="font-bold">{{ newFile.category }}</span>
                </p>
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <Button variant="outline" @click="showUploadFile = false; removeSelectedFile()">Annuler</Button>
              <Button @click="uploadFile" :disabled="!uploadedFile">
                <Upload class="w-4 h-4 mr-2" />
                Archiver
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <!-- Breadcrumb + Filters -->
    <div class="flex flex-wrap items-center gap-4">
      <div v-if="currentFolder" class="flex items-center gap-2">
        <Button variant="ghost" size="sm" @click="goBack">
          <ArrowLeft class="w-4 h-4 mr-1" />Retour
        </Button>
        <span class="text-sm font-bold text-slate-600">/ {{ currentFolder.name }}</span>
      </div>
      <div class="relative flex-1 min-w-[300px]">
        <Search class="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input v-model="searchTerm" placeholder="Rechercher par nom, catégorie..." class="pl-10 h-11 border-2" />
      </div>
      <Dialog v-if="isAdmin" v-model:open="showCreateFolder">
        <DialogTrigger as-child>
          <Button variant="outline" class="h-11 font-bold border-2">
            <FolderPlus class="w-4 h-4 mr-2" />
            Nouveau Dossier
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Créer un dossier</DialogTitle>
          </DialogHeader>
          <div class="space-y-4 py-4">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Nom du dossier</Label>
              <Input v-model="newFolderName" placeholder="Ex: Contrats 2026" @keyup.enter="createFolder" />
            </div>
          </div>
          <div class="flex justify-end gap-2">
            <Button variant="outline" @click="showCreateFolder = false">Annuler</Button>
            <Button @click="createFolder">Créer</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>

    <!-- Folders Grid (only at root) -->
    <div v-if="currentFolderId === null" class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div
        v-for="folder in folders" :key="folder.id"
        class="p-4 rounded-xl border-2 bg-background hover:border-primary/20 hover:bg-muted/10 transition-all cursor-pointer group flex flex-col gap-3"
        @click="openFolder(folder.id)"
      >
        <div class="flex justify-between items-start">
          <div class="p-2 rounded-lg bg-blue-50 text-blue-600 border border-blue-100 group-hover:scale-110 transition-transform">
            <Folder class="w-5 h-5" />
          </div>
          <DropdownMenu v-if="isAdmin">
            <DropdownMenuTrigger as-child>
              <Button variant="ghost" size="icon" class="h-7 w-7 opacity-0 group-hover:opacity-100" @click.stop>
                <MoreVertical class="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem @click.stop="deleteFolder(folder.id)" class="text-red-500 cursor-pointer">
                <Trash2 class="w-4 h-4 mr-2" />Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div>
          <p class="font-bold text-sm leading-tight">{{ folder.name }}</p>
          <p class="text-[10px] font-black uppercase text-muted-foreground tracking-widest mt-1">{{ folder.filesCount }} Fichiers</p>
          <p class="text-[9px] text-slate-400 mt-0.5">Créé par {{ folder.createdBy }}</p>
        </div>
      </div>
    </div>

    <!-- Archives Table -->
    <Card class="border-2 rounded-2xl overflow-hidden">
      <CardHeader>
        <CardTitle class="text-sm font-bold">{{ currentFolder ? 'Fichiers dans ' + currentFolder.name : 'Tous les fichiers' }}</CardTitle>
      </CardHeader>
      <Table>
        <TableHeader class="bg-muted/50">
          <TableRow class="border-none">
            <TableHead class="font-black text-[10px] uppercase py-4">Fichier</TableHead>
            <TableHead class="font-black text-[10px] uppercase py-4">Catégorie</TableHead>
            <TableHead class="font-black text-[10px] uppercase py-4">Taille</TableHead>
            <TableHead class="font-black text-[10px] uppercase py-4">Propriétaire</TableHead>
            <TableHead class="font-black text-[10px] uppercase py-4">Date</TableHead>
            <TableHead class="font-black text-[10px] uppercase py-4">Traçabilité</TableHead>
            <TableHead class="font-black text-[10px] uppercase py-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="file in filteredFiles" :key="file.id" class="group hover:bg-muted/30 border-b-2 last:border-0">
            <TableCell>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-lg bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 border border-red-100 dark:border-red-500/20 shadow-sm">
                  <component :is="fileIcon(file.type)" class="w-5 h-5" />
                </div>
                <div class="flex flex-col">
                  <span class="font-bold text-sm leading-tight">{{ file.name }}</span>
                  <span class="text-[10px] font-black uppercase text-muted-foreground tracking-tighter">{{ file.type }}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="secondary" class="font-black text-[9px] uppercase tracking-widest px-2 py-0.5">{{ file.category }}</Badge>
            </TableCell>
            <TableCell class="text-xs font-bold text-muted-foreground">{{ file.size }}</TableCell>
            <TableCell class="text-[11px] font-black uppercase tracking-tighter">{{ file.owner }}</TableCell>
            <TableCell class="text-xs font-bold text-muted-foreground">
              <div class="flex items-center gap-1.5"><Clock class="w-3 h-3" />{{ file.date }}</div>
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm" class="text-xs h-7" @click="viewAccessLog(file)">
                <Eye class="w-3 h-3 mr-1" />
                {{ file.accessLog.length }} accès
              </Button>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex items-center justify-end gap-1">
                <Button variant="ghost" size="icon" class="h-8 w-8 hover:bg-blue-50 hover:text-blue-600" @click="downloadFile(file)">
                  <FileDown class="w-4 h-4" />
                </Button>
                <DropdownMenu v-if="isAdmin">
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon" class="h-8 w-8"><MoreVertical class="w-4 h-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @click="viewAccessLog(file)" class="cursor-pointer"><Eye class="w-4 h-4 mr-2" />Traçabilité</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem @click="deleteFile(file.id)" class="text-red-500 cursor-pointer"><Trash2 class="w-4 h-4 mr-2" />Supprimer</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-if="filteredFiles.length === 0">
            <TableCell colspan="7" class="text-center py-8 text-slate-400">Aucun fichier trouvé</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>

    <!-- Access Log Dialog -->
    <Dialog v-model:open="showAccessLog">
      <DialogContent class="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Traçabilité — {{ selectedFile?.name }}</DialogTitle>
          <DialogDescription>Historique des accès à ce document.</DialogDescription>
        </DialogHeader>
        <div v-if="selectedFile" class="py-4">
          <div v-if="selectedFile.accessLog.length === 0" class="text-center py-6 text-slate-400">
            Aucun accès enregistré
          </div>
          <div v-else class="space-y-3">
            <div v-for="(log, i) in selectedFile.accessLog" :key="i" class="flex items-center gap-3 p-3 rounded-lg border bg-slate-50">
              <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users class="w-4 h-4 text-primary" />
              </div>
              <div class="flex-1">
                <p class="text-sm font-bold">{{ log.user }}</p>
                <p class="text-xs text-slate-500">{{ log.action }}</p>
              </div>
              <span class="text-xs text-slate-400">{{ log.date }}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
