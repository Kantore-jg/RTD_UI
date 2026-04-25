<script setup>
import { ref, computed } from 'vue'
import {
  Users, Search, Filter, UserPlus, MoreHorizontal,
  Download, Briefcase, Edit, Trash2, ShieldCheck,
  Mail, Phone, X,
} from 'lucide-vue-next'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader,
  DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { toast } from 'vue-sonner'

const employees = ref([
  { id: '1', name: 'Sarah Lawson', email: 'sarah.l@acme.com', phone: '+257 79 111 111', role: 'Leader', department: 'Produit', status: 'Active', joined: '2023-01-15' },
  { id: '2', name: 'Marc Kouassi', email: 'marc.k@acme.com', phone: '+257 79 222 222', role: 'Employé', department: 'Ingénierie', status: 'Active', joined: '2022-11-20' },
  { id: '3', name: 'Alice Mensah', email: 'alice.m@acme.com', phone: '+257 79 333 333', role: 'Directeur Général', department: 'Direction', status: 'Active', joined: '2021-06-10' },
  { id: '4', name: 'Paul Atreides', email: 'paul.a@acme.com', phone: '+257 79 444 444', role: 'Employé', department: 'Data', status: 'Active', joined: '2024-02-01' },
  { id: '5', name: 'Franck Nguessan', email: 'f.nguessan@acme.com', phone: '+257 79 555 555', role: 'Employé', department: 'Marketing', status: 'Inactive', joined: '2023-09-12' },
])

const searchTerm = ref('')
const showAddDialog = ref(false)
const showEditDialog = ref(false)
const filterRole = ref('')
const editingEmployee = ref(null)

const newEmployee = ref({
  name: '', email: '', phone: '', role: 'Employé', department: '', identifiant: '', password: '',
})

const filteredEmployees = computed(() => {
  let list = employees.value
  if (filterRole.value) {
    list = list.filter(emp => emp.role === filterRole.value)
  }
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    list = list.filter(emp =>
      emp.name.toLowerCase().includes(term) ||
      emp.email.toLowerCase().includes(term) ||
      emp.department.toLowerCase().includes(term)
    )
  }
  return list
})

const stats = computed(() => ({
  total: employees.value.filter(e => e.status === 'Active').length,
  leaders: employees.value.filter(e => e.role === 'Leader').length,
  newThisQuarter: employees.value.filter(e => {
    const d = new Date(e.joined)
    const now = new Date()
    return d.getFullYear() === now.getFullYear() && Math.floor(d.getMonth() / 3) === Math.floor(now.getMonth() / 3)
  }).length,
}))

function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('')
}

let nextId = 6

function addEmployee() {
  if (!newEmployee.value.name || !newEmployee.value.email || !newEmployee.value.department) {
    toast.error('Veuillez remplir les champs obligatoires (nom, email, département)')
    return
  }
  employees.value.push({
    id: String(nextId++),
    name: newEmployee.value.name,
    email: newEmployee.value.email,
    phone: newEmployee.value.phone,
    role: newEmployee.value.role,
    department: newEmployee.value.department,
    status: 'Active',
    joined: new Date().toISOString().split('T')[0],
  })
  newEmployee.value = { name: '', email: '', phone: '', role: 'Employé', department: '', identifiant: '', password: '' }
  showAddDialog.value = false
  toast.success('Employé ajouté avec succès')
}

function startEdit(emp) {
  editingEmployee.value = { ...emp }
  showEditDialog.value = true
}

function saveEdit() {
  const idx = employees.value.findIndex(e => e.id === editingEmployee.value.id)
  if (idx >= 0) {
    employees.value[idx] = { ...editingEmployee.value }
    showEditDialog.value = false
    toast.success('Profil mis à jour')
  }
}

function toggleStatus(emp) {
  emp.status = emp.status === 'Active' ? 'Inactive' : 'Active'
  toast.success(`Accès ${emp.status === 'Active' ? 'activé' : 'désactivé'} pour ${emp.name}`)
}

function deleteEmployee(id) {
  employees.value = employees.value.filter(e => e.id !== id)
  toast.success('Employé supprimé')
}

function exportCSV() {
  const header = 'Nom,Email,Téléphone,Rôle,Département,Statut,Date d\'arrivée\n'
  const rows = employees.value.map(e =>
    `${e.name},${e.email},${e.phone},${e.role},${e.department},${e.status},${e.joined}`
  ).join('\n')
  const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'employes.csv'
  link.click()
  toast.success('Export CSV téléchargé')
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 leading-tight">Annuaire des Employés</h1>
        <p class="text-slate-500 font-medium">Gérez votre capital humain et les permissions d'accès.</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" class="font-bold border-2" @click="exportCSV">
          <Download class="w-4 h-4 mr-2" />
          Exporter CSV
        </Button>
        <Dialog v-model:open="showAddDialog">
          <DialogTrigger as-child>
            <Button class="font-bold shadow-lg">
              <UserPlus class="w-4 h-4 mr-2" />
              Ajouter un employé
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Nouvel Employé</DialogTitle>
              <DialogDescription>Remplissez les informations pour créer le profil de l'employé.</DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-4">
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Nom complet *</Label>
                  <Input v-model="newEmployee.name" placeholder="Jean Dupont" />
                </div>
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Email *</Label>
                  <Input v-model="newEmployee.email" type="email" placeholder="jean@entreprise.com" />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Téléphone</Label>
                  <Input v-model="newEmployee.phone" placeholder="+257 79 XXX XXX" />
                </div>
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Département *</Label>
                  <Input v-model="newEmployee.department" placeholder="Ingénierie, RH, ..." />
                </div>
              </div>
              <div class="space-y-2">
                <Label class="text-xs font-bold uppercase text-slate-500">Rôle</Label>
                <select v-model="newEmployee.role" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
                  <option value="Employé">Employé</option>
                  <option value="Leader">Leader</option>
                  <option value="Directeur Général">Directeur Général</option>
                </select>
              </div>
              <div class="pt-2 border-t">
                <p class="text-xs font-bold uppercase text-slate-500 mb-3">Identifiants de connexion</p>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label class="text-xs font-bold uppercase text-slate-500">Identifiant</Label>
                    <Input v-model="newEmployee.identifiant" placeholder="jean.dupont" />
                  </div>
                  <div class="space-y-2">
                    <Label class="text-xs font-bold uppercase text-slate-500">Mot de passe</Label>
                    <Input v-model="newEmployee.password" type="password" placeholder="••••••••" />
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-end gap-2">
              <Button variant="outline" @click="showAddDialog = false">Annuler</Button>
              <Button @click="addEmployee">Enregistrer</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <!-- Filters & Actions -->
    <div class="flex flex-wrap items-center gap-4">
      <div class="relative flex-1 min-w-[300px]">
        <Search class="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom, email, département..."
          class="pl-10 h-11 border-2 focus-visible:ring-primary"
          v-model="searchTerm"
        />
      </div>
      <select v-model="filterRole" class="h-11 px-3 rounded-md border-2 text-sm bg-white font-bold">
        <option value="">Tous les rôles</option>
        <option value="Employé">Employés</option>
        <option value="Leader">Leaders</option>
        <option value="Directeur Général">Directeur Général</option>
      </select>
    </div>

    <!-- Table Section -->
    <div class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader class="bg-slate-50">
          <TableRow class="hover:bg-transparent border-slate-200">
            <TableHead class="w-[280px] font-bold uppercase text-[10px] text-slate-400 tracking-wider py-4 pl-6">Collaborateur</TableHead>
            <TableHead class="font-bold uppercase text-[10px] text-slate-400 tracking-wider py-4">Rôle & Département</TableHead>
            <TableHead class="font-bold uppercase text-[10px] text-slate-400 tracking-wider py-4">Contact</TableHead>
            <TableHead class="font-bold uppercase text-[10px] text-slate-400 tracking-wider py-4">Statut</TableHead>
            <TableHead class="font-bold uppercase text-[10px] text-slate-400 tracking-wider py-4">Arrivée</TableHead>
            <TableHead class="text-right font-bold uppercase text-[10px] text-slate-400 tracking-wider py-4 pr-6">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="emp in filteredEmployees"
            :key="emp.id"
            class="group transition-colors border-slate-100 last:border-0 hover:bg-slate-50"
          >
            <TableCell class="pl-6 py-4">
              <div class="flex items-center gap-3">
                <Avatar class="w-9 h-9 border border-slate-200 shadow-sm">
                  <AvatarFallback class="bg-slate-100 text-slate-600 font-bold text-[10px]">{{ getInitials(emp.name) }}</AvatarFallback>
                </Avatar>
                <div class="flex flex-col">
                  <span class="font-bold text-slate-900 text-sm">{{ emp.name }}</span>
                  <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ emp.email }}</span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div class="flex flex-col">
                <Badge
                  variant="ghost"
                  :class="cn(
                    'text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider w-fit mb-0.5',
                    emp.role === 'Directeur Général' && 'bg-violet-100 text-violet-700',
                    emp.role === 'Leader' && 'bg-blue-100 text-blue-700',
                    emp.role === 'Employé' && 'bg-slate-100 text-slate-600',
                  )"
                >
                  {{ emp.role }}
                </Badge>
                <span class="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{{ emp.department }}</span>
              </div>
            </TableCell>
            <TableCell>
              <span class="text-xs text-slate-500">{{ emp.phone }}</span>
            </TableCell>
            <TableCell>
              <Badge
                variant="ghost"
                :class="cn(
                  'font-bold text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-wider border-none',
                  emp.status === 'Active' && 'bg-emerald-100 text-emerald-700',
                  emp.status === 'On Leave' && 'bg-blue-100 text-blue-700',
                  emp.status === 'Inactive' && 'bg-slate-100 text-slate-600'
                )"
              >
                {{ emp.status }}
              </Badge>
            </TableCell>
            <TableCell>
              <span class="text-xs font-semibold text-slate-500">{{ emp.joined }}</span>
            </TableCell>
            <TableCell class="text-right pr-6">
              <DropdownMenu>
                <DropdownMenuTrigger as-child>
                  <Button variant="ghost" size="icon" class="h-8 w-8 text-slate-400">
                    <MoreHorizontal class="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-48 font-medium">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="cursor-pointer" @click="startEdit(emp)">
                    <Edit class="w-4 h-4 mr-2" />Modifier le profil
                  </DropdownMenuItem>
                  <DropdownMenuItem class="cursor-pointer" @click="toggleStatus(emp)">
                    <ShieldCheck class="w-4 h-4 mr-2" />
                    {{ emp.status === 'Active' ? 'Désactiver' : 'Activer' }} l'accès
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem class="text-red-500 font-bold cursor-pointer" @click="deleteEmployee(emp.id)">
                    <Trash2 class="w-4 h-4 mr-2" />Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
          <TableRow v-if="filteredEmployees.length === 0">
            <TableCell colspan="6" class="text-center py-8 text-slate-400">
              Aucun employé trouvé
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Stats Summary -->
    <div class="grid md:grid-cols-3 gap-6 pt-4">
      <div class="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Actifs</p>
          <p class="text-2xl font-bold text-slate-900">{{ stats.total }}</p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
          <Users class="w-5 h-5" />
        </div>
      </div>
      <div class="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Leaders</p>
          <p class="text-2xl font-bold text-slate-900">{{ stats.leaders }}</p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
          <Briefcase class="w-5 h-5" />
        </div>
      </div>
      <div class="p-5 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-between">
        <div class="space-y-1">
          <p class="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Nouveautés (Trimestre)</p>
          <p class="text-2xl font-bold text-emerald-500">+{{ stats.newThisQuarter }}</p>
        </div>
        <div class="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
          <UserPlus class="w-5 h-5" />
        </div>
      </div>
    </div>

    <!-- Edit Dialog -->
    <Dialog v-model:open="showEditDialog">
      <DialogContent class="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Modifier l'employé</DialogTitle>
          <DialogDescription>Modifiez les informations du profil.</DialogDescription>
        </DialogHeader>
        <div v-if="editingEmployee" class="grid gap-4 py-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Nom</Label>
              <Input v-model="editingEmployee.name" />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Email</Label>
              <Input v-model="editingEmployee.email" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Téléphone</Label>
              <Input v-model="editingEmployee.phone" />
            </div>
            <div class="space-y-2">
              <Label class="text-xs font-bold uppercase text-slate-500">Département</Label>
              <Input v-model="editingEmployee.department" />
            </div>
          </div>
          <div class="space-y-2">
            <Label class="text-xs font-bold uppercase text-slate-500">Rôle</Label>
            <select v-model="editingEmployee.role" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
              <option value="Employé">Employé</option>
              <option value="Leader">Leader</option>
              <option value="Directeur Général">Directeur Général</option>
            </select>
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
