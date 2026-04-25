<script setup>
import { ref, computed } from 'vue'
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

const authStore = useAuthStore()
const { isAdmin, isEmployee } = storeToRefs(authStore)

const folders = ref([
  { id: 1, name: 'Contrats RH', filesCount: 12, createdAt: '2026-01-15', createdBy: 'Alice Mensah' },
  { id: 2, name: 'Factures IT', filesCount: 8, createdAt: '2026-02-10', createdBy: 'Marc Kouassi' },
  { id: 3, name: 'Rapports RH', filesCount: 15, createdAt: '2025-11-20', createdBy: 'Sarah Lawson' },
  { id: 4, name: 'Documents Légaux', filesCount: 6, createdAt: '2025-08-05', createdBy: 'Jean Dupont' },
])

const files = ref([
  { id: '1', name: 'Contrat_Sarah_Lawson.pdf', type: 'PDF', category: 'RH', size: '1.2 MB', date: '2026-01-15', owner: 'RH Dept', folderId: 1, accessLog: [
    { user: 'Alice Mensah', action: 'Consulté', date: '2026-04-20 14:30' },
    { user: 'Jean Dupont', action: 'Téléchargé', date: '2026-04-18 09:15' },
  ]},
  { id: '2', name: 'Paiement_Mars_2026.xlsx', type: 'XLSX', category: 'Finance', size: '850 KB', date: '2026-04-05', owner: 'Finance Dept', folderId: 2, accessLog: [
    { user: 'Marc Kouassi', action: 'Modifié', date: '2026-04-10 16:45' },
  ]},
  { id: '3', name: 'Plan_Expansion_Sud.pdf', type: 'PDF', category: 'Stratégie', size: '5.4 MB', date: '2026-03-20', owner: 'Direction', folderId: null, accessLog: [] },
  { id: '4', name: 'Facture_AWS_Avril.pdf', type: 'PDF', category: 'Infrastructure', size: '210 KB', date: '2026-04-18', owner: 'IT Dept', folderId: 2, accessLog: [
    { user: 'Paul Atreides', action: 'Consulté', date: '2026-04-19 10:00' },
    { user: 'Sarah Lawson', action: 'Consulté', date: '2026-04-18 17:30' },
    { user: 'Marc Kouassi', action: 'Uploadé', date: '2026-04-18 09:00' },
  ]},
  { id: '5', name: 'Charte_Ethique_V2.docx', type: 'DOCX', category: 'Admin', size: '420 KB', date: '2025-11-12', owner: 'Legal Dept', folderId: 4, accessLog: [] },
])

const searchTerm = ref('')
const currentFolderId = ref(null)
const showCreateFolder = ref(false)
const showUploadFile = ref(false)
const showAccessLog = ref(false)
const selectedFile = ref(null)

const newFolderName = ref('')
const newFile = ref({ name: '', type: 'PDF', category: '', folderId: null })

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
  const totalKB = files.value.reduce((sum, f) => {
    const sizeStr = f.size
    if (sizeStr.includes('MB')) return sum + parseFloat(sizeStr) * 1024
    if (sizeStr.includes('KB')) return sum + parseFloat(sizeStr)
    return sum
  }, 0)
  return (totalKB / 1024 / 1024).toFixed(1)
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

function openFolder(folderId) {
  currentFolderId.value = folderId
}

function goBack() {
  currentFolderId.value = null
}

let nextFolderId = 5
function createFolder() {
  if (!newFolderName.value) {
    toast.error('Entrez un nom de dossier')
    return
  }
  folders.value.push({
    id: nextFolderId++,
    name: newFolderName.value,
    filesCount: 0,
    createdAt: new Date().toISOString().split('T')[0],
    createdBy: 'Moi',
  })
  newFolderName.value = ''
  showCreateFolder.value = false
  toast.success('Dossier créé')
}

let nextFileId = 6
function uploadFile() {
  if (!newFile.value.name) {
    toast.error('Entrez un nom de fichier')
    return
  }
  files.value.push({
    id: String(nextFileId++),
    name: newFile.value.name,
    type: newFile.value.type,
    category: newFile.value.category || 'Général',
    size: '0 KB',
    date: new Date().toISOString().split('T')[0],
    owner: 'Moi',
    folderId: newFile.value.folderId || currentFolderId.value,
    accessLog: [{ user: 'Moi', action: 'Uploadé', date: new Date().toLocaleString('fr-FR') }],
  })
  if (newFile.value.folderId || currentFolderId.value) {
    const folder = folders.value.find(f => f.id === (newFile.value.folderId || currentFolderId.value))
    if (folder) folder.filesCount++
  }
  newFile.value = { name: '', type: 'PDF', category: '', folderId: null }
  showUploadFile.value = false
  toast.success('Fichier archivé')
}

function viewAccessLog(file) {
  selectedFile.value = file
  showAccessLog.value = true
}

function downloadFile(file) {
  file.accessLog.push({
    user: 'Moi',
    action: 'Téléchargé',
    date: new Date().toLocaleString('fr-FR'),
  })
  toast.success(`Téléchargement de ${file.name}`)
}

function deleteFile(id) {
  const file = files.value.find(f => f.id === id)
  if (file && file.folderId) {
    const folder = folders.value.find(f => f.id === file.folderId)
    if (folder) folder.filesCount--
  }
  files.value = files.value.filter(f => f.id !== id)
  toast.success('Fichier supprimé')
}

function deleteFolder(id) {
  files.value = files.value.filter(f => f.folderId !== id)
  folders.value = folders.value.filter(f => f.id !== id)
  if (currentFolderId.value === id) currentFolderId.value = null
  toast.success('Dossier supprimé')
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
          <DialogContent class="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Archiver un fichier</DialogTitle>
              <DialogDescription>Ajoutez un document à l'archive.</DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Nom du fichier *</Label>
                <Input v-model="newFile.name" placeholder="Ex: Rapport_Q2_2026.pdf" />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Type</Label>
                  <select v-model="newFile.type" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
                    <option value="PDF">PDF</option>
                    <option value="DOCX">DOCX</option>
                    <option value="XLSX">XLSX</option>
                    <option value="JPG">Image JPG</option>
                    <option value="PNG">Image PNG</option>
                  </select>
                </div>
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Catégorie</Label>
                  <Input v-model="newFile.category" placeholder="RH, Finance, ..." />
                </div>
              </div>
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Dossier</Label>
                <select v-model="newFile.folderId" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
                  <option :value="null">Aucun (racine)</option>
                  <option v-for="f in folders" :key="f.id" :value="f.id">{{ f.name }}</option>
                </select>
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <Button variant="outline" @click="showUploadFile = false">Annuler</Button>
              <Button @click="uploadFile">Archiver</Button>
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
