<script setup>
import { ref, computed } from 'vue'
import {
  ShieldCheck, Building2, Users, BarChart3, LayoutGrid,
  ShieldAlert, Search, Filter, Plus, MoreHorizontal,
  TrendingUp, Activity, Globe, CreditCard, FileText,
  CheckCircle2, XCircle, Eye, Trash2, Edit, Mail,
  Phone, MapPin, Hash, Wallet, X,
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { toast } from 'vue-sonner'

const activeTab = ref('companies')

const companies = ref([
  {
    id: 1, name: 'Kantox International', domain: 'kantox.com', logo: 'KI',
    owner: 'Jean Dupont', email: 'jean@kantox.com', phone: '+257 79 123 456',
    address: 'Bujumbura, Avenue de la Paix', nif: '400012345',
    plan: 'Enterprise', users: 128, revenue: '2 400 000 BIF',
    monthlyFee: '500 000 BIF', status: 'active', color: 'bg-blue-500',
    modules: ['employees', 'tasks', 'projects', 'finance', 'archives', 'communication', 'builder'],
  },
  {
    id: 2, name: 'AfriTech Solutions', domain: 'afritech.io', logo: 'AT',
    owner: 'Sarah Koné', email: 'sarah@afritech.io', phone: '+257 79 234 567',
    address: 'Gitega, Rue Principale', nif: '',
    plan: 'Business', users: 64, revenue: '1 100 000 BIF',
    monthlyFee: '300 000 BIF', status: 'active', color: 'bg-emerald-500',
    modules: ['employees', 'tasks', 'projects', 'finance'],
  },
  {
    id: 3, name: 'LogiPort Douala', domain: 'logiport.cm', logo: 'LP',
    owner: 'Marc Belibi', email: 'marc@logiport.cm', phone: '+257 79 345 678',
    address: 'Ngozi, Centre Ville', nif: '400098765',
    plan: 'Starter', users: 22, revenue: '350 000 BIF',
    monthlyFee: '150 000 BIF', status: 'trial', color: 'bg-orange-500',
    modules: ['employees', 'tasks'],
  },
  {
    id: 4, name: 'MediCare Plus', domain: 'medicare.cm', logo: 'MC',
    owner: 'Alice Mbarga', email: 'alice@medicare.cm', phone: '+257 79 456 789',
    address: 'Bujumbura, Quartier Asiatique', nif: '',
    plan: 'Business', users: 45, revenue: '890 000 BIF',
    monthlyFee: '300 000 BIF', status: 'suspended', color: 'bg-violet-500',
    modules: ['employees', 'tasks', 'projects', 'finance', 'archives'],
  },
])

const payments = ref([
  { id: 1, companyId: 1, company: 'Kantox International', date: '2026-04-20', amount: '500 000 BIF', receipt: 'recu_kantox_04.jpg', account: 'BANCOBU - 10045678', status: 'validated' },
  { id: 2, companyId: 2, company: 'AfriTech Solutions', date: '2026-04-18', amount: '300 000 BIF', receipt: 'recu_afritech_04.jpg', account: 'ECOBANK - 20089012', status: 'pending' },
  { id: 3, companyId: 3, company: 'LogiPort Douala', date: '2026-04-15', amount: '150 000 BIF', receipt: 'recu_logiport_04.jpg', account: 'BCB - 30056789', status: 'pending' },
  { id: 4, companyId: 4, company: 'MediCare Plus', date: '2026-03-20', amount: '300 000 BIF', receipt: '', account: 'BANCOBU - 40012345', status: 'rejected' },
])

const paymentMethods = ref([
  { id: 1, bankName: 'BANCOBU', accountNumber: '10045678901234', accountHolder: 'RDT SARL', type: 'BIF' },
  { id: 2, bankName: 'ECOBANK', accountNumber: '20089012345678', accountHolder: 'RDT SARL', type: 'BIF' },
  { id: 3, bankName: 'Binance', accountNumber: 'TRC20-abc123def456', accountHolder: 'RDT Platform', type: 'USDT' },
])

const contracts = ref([
  { id: 1, companyId: 1, company: 'Kantox International', startDate: '2025-01-01', endDate: '2026-12-31', monthlyFee: '500 000 BIF', status: 'active' },
  { id: 2, companyId: 2, company: 'AfriTech Solutions', startDate: '2025-06-01', endDate: '2026-05-31', monthlyFee: '300 000 BIF', status: 'active' },
  { id: 3, companyId: 3, company: 'LogiPort Douala', startDate: '2026-03-01', endDate: '2026-06-01', monthlyFee: '150 000 BIF', status: 'trial' },
  { id: 4, companyId: 4, company: 'MediCare Plus', startDate: '2025-09-01', endDate: '2026-08-31', monthlyFee: '300 000 BIF', status: 'suspended' },
])

const adminMessages = ref([
  { id: 1, company: 'AfriTech Solutions', from: 'Sarah Koné', subject: 'Demande ajout module Archives', date: '2026-04-22', read: false },
  { id: 2, company: 'LogiPort Douala', from: 'Marc Belibi', subject: 'Problème de facturation', date: '2026-04-20', read: false },
  { id: 3, company: 'Kantox International', from: 'Jean Dupont', subject: 'Renouvellement contrat', date: '2026-04-18', read: true },
])

const searchTerm = ref('')
const showAddCompany = ref(false)
const showAddPaymentMethod = ref(false)
const showCompanyDetail = ref(false)
const selectedCompany = ref(null)
const currentPage = ref(1)
const itemsPerPage = 3

const newCompany = ref({
  name: '', owner: '', email: '', phone: '', address: '', nif: '', monthlyFee: '',
})

const newPaymentMethod = ref({
  bankName: '', accountNumber: '', accountHolder: '', type: 'BIF',
})

const allModules = [
  { id: 'employees', label: 'Employés' },
  { id: 'tasks', label: 'Tâches' },
  { id: 'projects', label: 'Projets' },
  { id: 'finance', label: 'Finance' },
  { id: 'archives', label: 'Archives' },
  { id: 'communication', label: 'Communication' },
  { id: 'builder', label: 'Module Builder' },
  { id: 'attendance', label: 'Présence' },
]

const filteredCompanies = computed(() => {
  const term = searchTerm.value.toLowerCase()
  if (!term) return companies.value
  return companies.value.filter(c =>
    c.name.toLowerCase().includes(term) ||
    c.owner.toLowerCase().includes(term) ||
    c.email.toLowerCase().includes(term)
  )
})

const paginatedCompanies = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredCompanies.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(filteredCompanies.value.length / itemsPerPage))

const globalStats = computed(() => [
  { label: 'Tenants Actifs', value: String(companies.value.filter(c => c.status === 'active').length), icon: Building2, change: '+3', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { label: 'Utilisateurs Totaux', value: String(companies.value.reduce((sum, c) => sum + c.users, 0)), icon: Users, change: '+156', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  { label: 'Revenus MRR', value: companies.value.reduce((sum, c) => sum + parseInt(c.monthlyFee.replace(/\D/g, '') || 0), 0).toLocaleString('fr-FR') + ' BIF', icon: BarChart3, change: '+18%', color: 'text-violet-500', bg: 'bg-violet-500/10' },
  { label: 'Paiements en attente', value: String(payments.value.filter(p => p.status === 'pending').length), icon: Activity, change: 'À traiter', color: 'text-orange-500', bg: 'bg-orange-500/10' },
])

function statusBadge(status) {
  const map = {
    active: { label: 'Actif', class: 'bg-emerald-100 text-emerald-700' },
    trial: { label: 'Essai', class: 'bg-orange-100 text-orange-700' },
    suspended: { label: 'Suspendu', class: 'bg-red-100 text-red-700' },
  }
  return map[status] ?? { label: status, class: 'bg-slate-100 text-slate-700' }
}

function paymentStatusBadge(status) {
  const map = {
    validated: { label: 'Validé', class: 'bg-emerald-100 text-emerald-700' },
    pending: { label: 'En attente', class: 'bg-orange-100 text-orange-700' },
    rejected: { label: 'Rejeté', class: 'bg-red-100 text-red-700' },
  }
  return map[status] ?? { label: status, class: 'bg-slate-100 text-slate-700' }
}

let nextCompanyId = 5

function addCompany() {
  if (!newCompany.value.name || !newCompany.value.owner || !newCompany.value.email) {
    toast.error('Veuillez remplir les champs obligatoires')
    return
  }
  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-violet-500', 'bg-rose-500', 'bg-cyan-500']
  companies.value.push({
    id: nextCompanyId++,
    name: newCompany.value.name,
    owner: newCompany.value.owner,
    email: newCompany.value.email,
    phone: newCompany.value.phone,
    address: newCompany.value.address,
    nif: newCompany.value.nif,
    domain: newCompany.value.email.split('@')[1] || '',
    logo: newCompany.value.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
    plan: 'Starter',
    users: 0,
    revenue: '0 BIF',
    monthlyFee: newCompany.value.monthlyFee || '150 000 BIF',
    status: 'trial',
    color: colors[Math.floor(Math.random() * colors.length)],
    modules: ['employees', 'tasks'],
  })
  newCompany.value = { name: '', owner: '', email: '', phone: '', address: '', nif: '', monthlyFee: '' }
  showAddCompany.value = false
  toast.success('Entreprise créée avec succès')
}

function deleteCompany(id) {
  companies.value = companies.value.filter(c => c.id !== id)
  toast.success('Entreprise supprimée')
}

function toggleCompanyStatus(company) {
  company.status = company.status === 'suspended' ? 'active' : 'suspended'
  toast.success(`Entreprise ${company.status === 'active' ? 'activée' : 'suspendue'}`)
}

function viewCompanyDetail(company) {
  selectedCompany.value = { ...company }
  showCompanyDetail.value = true
}

function toggleModule(company, moduleId) {
  const idx = company.modules.indexOf(moduleId)
  if (idx >= 0) {
    company.modules.splice(idx, 1)
    toast.info(`Module retiré pour ${company.name}`)
  } else {
    company.modules.push(moduleId)
    toast.info(`Module ajouté pour ${company.name}`)
  }
}

function validatePayment(payment) {
  payment.status = 'validated'
  toast.success(`Paiement de ${payment.company} validé`)
}

function rejectPayment(payment) {
  payment.status = 'rejected'
  toast.error(`Paiement de ${payment.company} rejeté`)
}

function addPaymentMethod() {
  if (!newPaymentMethod.value.bankName || !newPaymentMethod.value.accountNumber) {
    toast.error('Veuillez remplir tous les champs')
    return
  }
  paymentMethods.value.push({ id: paymentMethods.value.length + 1, ...newPaymentMethod.value })
  newPaymentMethod.value = { bankName: '', accountNumber: '', accountHolder: '', type: 'BIF' }
  showAddPaymentMethod.value = false
  toast.success('Moyen de paiement ajouté')
}

function deletePaymentMethod(id) {
  paymentMethods.value = paymentMethods.value.filter(m => m.id !== id)
  toast.success('Moyen de paiement supprimé')
}

function markMessageRead(msg) {
  msg.read = true
}
</script>

<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-red-500/10 rounded-xl">
          <ShieldCheck class="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h1 class="text-2xl font-bold text-slate-900">Super Admin</h1>
          <p class="text-slate-500 text-sm font-medium">Gestion centralisée de tous les tenants de la plateforme.</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        <Badge v-if="adminMessages.filter(m => !m.read).length > 0" variant="destructive" class="text-xs font-bold">
          <Mail class="w-3.5 h-3.5 mr-1" />
          {{ adminMessages.filter(m => !m.read).length }} message(s)
        </Badge>
        <Button variant="outline" size="sm" class="text-xs font-bold uppercase tracking-wider">
          <Activity class="w-3.5 h-3.5 mr-1" />
          System Health
        </Button>
      </div>
    </div>

    <!-- Global Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="(stat, i) in globalStats" :key="i">
        <Card class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all group relative">
          <CardContent class="p-5">
            <div class="flex justify-between items-start mb-4">
              <div :class="cn(stat.bg, 'p-3 rounded-lg transition-transform group-hover:scale-110')">
                <component :is="stat.icon" :class="cn(stat.color, 'w-5 h-5')" />
              </div>
              <Badge variant="ghost" class="bg-slate-50 border-none text-[10px] font-bold">
                <TrendingUp class="w-3 h-3 mr-1 text-emerald-500" />
                {{ stat.change }}
              </Badge>
            </div>
            <div class="space-y-1">
              <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">{{ stat.label }}</p>
              <p class="text-3xl font-bold text-slate-900">{{ stat.value }}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Tabs -->
    <Tabs v-model="activeTab" class="space-y-6">
      <TabsList class="bg-muted p-1 border h-11 rounded-xl gap-1">
        <TabsTrigger value="companies" class="font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 text-xs">
          <Building2 class="w-3.5 h-3.5 mr-1.5" />Entreprises
        </TabsTrigger>
        <TabsTrigger value="payments" class="font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 text-xs">
          <Wallet class="w-3.5 h-3.5 mr-1.5" />Paiements
        </TabsTrigger>
        <TabsTrigger value="contracts" class="font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 text-xs">
          <FileText class="w-3.5 h-3.5 mr-1.5" />Contrats
        </TabsTrigger>
        <TabsTrigger value="paymentMethods" class="font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 text-xs">
          <CreditCard class="w-3.5 h-3.5 mr-1.5" />Moyens de paiement
        </TabsTrigger>
        <TabsTrigger value="messages" class="font-bold data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-lg px-4 text-xs relative">
          <Mail class="w-3.5 h-3.5 mr-1.5" />Messages
          <span v-if="adminMessages.filter(m => !m.read).length" class="ml-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">{{ adminMessages.filter(m => !m.read).length }}</span>
        </TabsTrigger>
      </TabsList>

      <!-- === COMPANIES TAB === -->
      <TabsContent value="companies">
        <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
          <CardHeader>
            <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div class="flex items-center gap-3">
                <div class="p-2 bg-slate-100 rounded-lg">
                  <LayoutGrid class="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <CardTitle class="font-bold text-lg text-slate-800">Tous les Tenants</CardTitle>
                  <CardDescription class="text-slate-500 text-sm">{{ companies.length }} entreprises enregistrées sur la plateforme.</CardDescription>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="relative">
                  <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input v-model="searchTerm" placeholder="Rechercher un tenant..." class="pl-9 bg-slate-50 border-slate-200 text-sm w-64" />
                </div>
                <Dialog v-model:open="showAddCompany">
                  <DialogTrigger as-child>
                    <Button size="sm" class="text-xs font-bold uppercase tracking-wider">
                      <Plus class="w-3.5 h-3.5 mr-1" />
                      Ajouter
                    </Button>
                  </DialogTrigger>
                  <DialogContent class="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Nouvelle Entreprise</DialogTitle>
                      <DialogDescription>Créez un compte entreprise sur la plateforme.</DialogDescription>
                    </DialogHeader>
                    <div class="grid gap-4 py-4">
                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                          <Label class="text-xs font-bold uppercase text-slate-500">Nom de l'entreprise *</Label>
                          <Input v-model="newCompany.name" placeholder="Ex: Kantox SARL" />
                        </div>
                        <div class="space-y-2">
                          <Label class="text-xs font-bold uppercase text-slate-500">Directeur Général *</Label>
                          <Input v-model="newCompany.owner" placeholder="Ex: Jean Dupont" />
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                          <Label class="text-xs font-bold uppercase text-slate-500">Email *</Label>
                          <Input v-model="newCompany.email" type="email" placeholder="contact@entreprise.com" />
                        </div>
                        <div class="space-y-2">
                          <Label class="text-xs font-bold uppercase text-slate-500">Téléphone</Label>
                          <Input v-model="newCompany.phone" placeholder="+257 79 XXX XXX" />
                        </div>
                      </div>
                      <div class="space-y-2">
                        <Label class="text-xs font-bold uppercase text-slate-500">Adresse</Label>
                        <Input v-model="newCompany.address" placeholder="Ville, Rue, ..." />
                      </div>
                      <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-2">
                          <Label class="text-xs font-bold uppercase text-slate-500">NIF (optionnel)</Label>
                          <Input v-model="newCompany.nif" placeholder="400XXXXXXX" />
                        </div>
                        <div class="space-y-2">
                          <Label class="text-xs font-bold uppercase text-slate-500">Montant mensuel</Label>
                          <Input v-model="newCompany.monthlyFee" placeholder="150 000 BIF" />
                        </div>
                      </div>
                    </div>
                    <div class="flex justify-end gap-2">
                      <Button variant="outline" @click="showAddCompany = false">Annuler</Button>
                      <Button @click="addCompany">Créer l'entreprise</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow class="hover:bg-transparent">
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Entreprise</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">DG & Contact</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Users</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Montant/mois</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Modules</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Statut</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="company in paginatedCompanies" :key="company.id" class="group">
                  <TableCell>
                    <div class="flex items-center gap-3">
                      <div :class="cn('w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs', company.color)">
                        {{ company.logo }}
                      </div>
                      <div>
                        <p class="font-semibold text-sm text-slate-800">{{ company.name }}</p>
                        <p class="text-xs text-slate-400 flex items-center gap-1">
                          <Globe class="w-3 h-3" />
                          {{ company.domain }}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p class="text-sm font-medium text-slate-700">{{ company.owner }}</p>
                    <p class="text-[10px] text-slate-400">{{ company.email }}</p>
                  </TableCell>
                  <TableCell>
                    <div class="flex items-center gap-1.5">
                      <Users class="w-3.5 h-3.5 text-slate-400" />
                      <span class="text-sm font-bold text-slate-700">{{ company.users }}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span class="text-sm font-bold text-slate-800">{{ company.monthlyFee }}</span>
                  </TableCell>
                  <TableCell>
                    <span class="text-xs text-slate-500">{{ company.modules.length }} modules</span>
                  </TableCell>
                  <TableCell>
                    <Badge
                      :class="cn('text-[10px] font-bold uppercase tracking-wider', statusBadge(company.status).class)"
                    >
                      {{ statusBadge(company.status).label }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger as-child>
                        <Button variant="ghost" size="icon" class="h-8 w-8">
                          <MoreHorizontal class="w-4 h-4 text-slate-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" class="w-48 font-medium">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem class="cursor-pointer" @click="viewCompanyDetail(company)">
                          <Eye class="w-4 h-4 mr-2" />Voir les détails
                        </DropdownMenuItem>
                        <DropdownMenuItem class="cursor-pointer" @click="viewCompanyDetail(company)">
                          <Edit class="w-4 h-4 mr-2" />Gérer les modules
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem class="cursor-pointer" @click="toggleCompanyStatus(company)">
                          <component :is="company.status === 'suspended' ? CheckCircle2 : XCircle" class="w-4 h-4 mr-2" />
                          {{ company.status === 'suspended' ? 'Activer' : 'Suspendre' }}
                        </DropdownMenuItem>
                        <DropdownMenuItem class="text-red-500 font-bold cursor-pointer" @click="deleteCompany(company.id)">
                          <Trash2 class="w-4 h-4 mr-2" />Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            <div class="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
              <p class="text-xs font-medium text-slate-500">
                Page <span class="font-bold text-slate-700">{{ currentPage }}</span> sur <span class="font-bold text-slate-700">{{ totalPages }}</span> · {{ filteredCompanies.length }} tenants
              </p>
              <div class="flex items-center gap-1">
                <Button variant="outline" size="sm" class="text-xs h-8 px-3" :disabled="currentPage <= 1" @click="currentPage--">
                  Précédent
                </Button>
                <Button
                  v-for="p in totalPages" :key="p"
                  variant="outline" size="sm"
                  :class="cn('text-xs h-8 w-8', p === currentPage && 'bg-primary text-white border-primary')"
                  @click="currentPage = p"
                >
                  {{ p }}
                </Button>
                <Button variant="outline" size="sm" class="text-xs h-8 px-3" :disabled="currentPage >= totalPages" @click="currentPage++">
                  Suivant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- === PAYMENTS TAB === -->
      <TabsContent value="payments">
        <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle class="font-bold text-lg">Validation des Paiements</CardTitle>
            <CardDescription>Validez ou rejetez les paiements des entreprises.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Entreprise</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Montant</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Compte</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Reçu</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Statut</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="payment in payments" :key="payment.id" class="group">
                  <TableCell class="font-semibold text-sm">{{ payment.company }}</TableCell>
                  <TableCell class="text-sm text-slate-600">{{ payment.date }}</TableCell>
                  <TableCell class="text-sm font-bold">{{ payment.amount }}</TableCell>
                  <TableCell class="text-xs text-slate-500">{{ payment.account }}</TableCell>
                  <TableCell>
                    <Badge v-if="payment.receipt" variant="outline" class="text-[10px]">
                      <FileText class="w-3 h-3 mr-1" />{{ payment.receipt }}
                    </Badge>
                    <span v-else class="text-xs text-slate-400">Aucun</span>
                  </TableCell>
                  <TableCell>
                    <Badge :class="cn('text-[10px] font-bold uppercase tracking-wider', paymentStatusBadge(payment.status).class)">
                      {{ paymentStatusBadge(payment.status).label }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right">
                    <div v-if="payment.status === 'pending'" class="flex items-center justify-end gap-1">
                      <Button size="sm" class="h-7 text-xs bg-emerald-600 hover:bg-emerald-700" @click="validatePayment(payment)">
                        <CheckCircle2 class="w-3.5 h-3.5 mr-1" />Valider
                      </Button>
                      <Button size="sm" variant="destructive" class="h-7 text-xs" @click="rejectPayment(payment)">
                        <XCircle class="w-3.5 h-3.5 mr-1" />Rejeter
                      </Button>
                    </div>
                    <span v-else class="text-xs text-slate-400">—</span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- === CONTRACTS TAB === -->
      <TabsContent value="contracts">
        <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle class="font-bold text-lg">Contrats des Entreprises</CardTitle>
            <CardDescription>Historique des contrats et collaborations.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Entreprise</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Début</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Fin</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Montant/mois</TableHead>
                  <TableHead class="text-[10px] font-bold uppercase tracking-widest text-slate-400">Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="contract in contracts" :key="contract.id">
                  <TableCell class="font-semibold text-sm">{{ contract.company }}</TableCell>
                  <TableCell class="text-sm text-slate-600">{{ contract.startDate }}</TableCell>
                  <TableCell class="text-sm text-slate-600">{{ contract.endDate }}</TableCell>
                  <TableCell class="text-sm font-bold">{{ contract.monthlyFee }}</TableCell>
                  <TableCell>
                    <Badge :class="cn('text-[10px] font-bold uppercase tracking-wider', statusBadge(contract.status).class)">
                      {{ statusBadge(contract.status).label }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- === PAYMENT METHODS TAB === -->
      <TabsContent value="paymentMethods">
        <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
          <CardHeader>
            <div class="flex justify-between items-center">
              <div>
                <CardTitle class="font-bold text-lg">Moyens de Paiement</CardTitle>
                <CardDescription>Comptes bancaires pour recevoir les paiements.</CardDescription>
              </div>
              <Dialog v-model:open="showAddPaymentMethod">
                <DialogTrigger as-child>
                  <Button size="sm" class="text-xs font-bold">
                    <Plus class="w-3.5 h-3.5 mr-1" />Ajouter
                  </Button>
                </DialogTrigger>
                <DialogContent class="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Nouveau Moyen de Paiement</DialogTitle>
                    <DialogDescription>Ajoutez un compte pour recevoir les paiements.</DialogDescription>
                  </DialogHeader>
                  <div class="grid gap-4 py-4">
                    <div class="space-y-2">
                      <Label class="text-xs font-bold uppercase text-slate-500">Banque / Plateforme</Label>
                      <Input v-model="newPaymentMethod.bankName" placeholder="Ex: BANCOBU, Binance" />
                    </div>
                    <div class="space-y-2">
                      <Label class="text-xs font-bold uppercase text-slate-500">Numéro de Compte</Label>
                      <Input v-model="newPaymentMethod.accountNumber" placeholder="Numéro de compte" />
                    </div>
                    <div class="space-y-2">
                      <Label class="text-xs font-bold uppercase text-slate-500">Nom sur le compte</Label>
                      <Input v-model="newPaymentMethod.accountHolder" placeholder="Nom du titulaire" />
                    </div>
                    <div class="space-y-2">
                      <Label class="text-xs font-bold uppercase text-slate-500">Type de devise</Label>
                      <select v-model="newPaymentMethod.type" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
                        <option value="BIF">BIF (Franc Burundais)</option>
                        <option value="USDT">USDT (Crypto)</option>
                      </select>
                    </div>
                  </div>
                  <div class="flex justify-end gap-2">
                    <Button variant="outline" @click="showAddPaymentMethod = false">Annuler</Button>
                    <Button @click="addPaymentMethod">Ajouter</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card v-for="method in paymentMethods" :key="method.id" class="border-2">
                <CardContent class="p-5 space-y-3">
                  <div class="flex justify-between items-start">
                    <div class="p-2 rounded-lg" :class="method.type === 'USDT' ? 'bg-emerald-100' : 'bg-blue-100'">
                      <Wallet class="w-5 h-5" :class="method.type === 'USDT' ? 'text-emerald-600' : 'text-blue-600'" />
                    </div>
                    <Button variant="ghost" size="icon" class="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" @click="deletePaymentMethod(method.id)">
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                  <div>
                    <p class="font-bold text-sm">{{ method.bankName }}</p>
                    <p class="text-xs text-slate-500 mt-1">{{ method.accountNumber }}</p>
                  </div>
                  <div class="flex justify-between items-center pt-2 border-t">
                    <span class="text-xs text-slate-500">{{ method.accountHolder }}</span>
                    <Badge variant="outline" class="text-[10px] font-bold">{{ method.type }}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- === MESSAGES TAB === -->
      <TabsContent value="messages">
        <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle class="font-bold text-lg">Messages des Entreprises</CardTitle>
            <CardDescription>Messages et demandes reçus des entreprises clientes.</CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <div
              v-for="msg in adminMessages" :key="msg.id"
              :class="cn(
                'p-4 rounded-lg border-2 cursor-pointer transition-all hover:border-primary/30',
                msg.read ? 'bg-white border-slate-100' : 'bg-blue-50/50 border-blue-200'
              )"
              @click="markMessageRead(msg)"
            >
              <div class="flex justify-between items-start">
                <div class="flex items-center gap-3">
                  <div :class="cn('w-2 h-2 rounded-full', msg.read ? 'bg-transparent' : 'bg-blue-500')" />
                  <div>
                    <p class="font-bold text-sm">{{ msg.subject }}</p>
                    <p class="text-xs text-slate-500">{{ msg.from }} — {{ msg.company }}</p>
                  </div>
                </div>
                <span class="text-xs text-slate-400">{{ msg.date }}</span>
              </div>
            </div>
            <div v-if="adminMessages.length === 0" class="text-center py-8 text-slate-400">
              Aucun message
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <!-- Company Detail Dialog (Module Management) -->
    <Dialog v-model:open="showCompanyDetail">
      <DialogContent class="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>{{ selectedCompany?.name }}</DialogTitle>
          <DialogDescription>Détails et gestion des modules de l'entreprise.</DialogDescription>
        </DialogHeader>
        <div v-if="selectedCompany" class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex items-center gap-2">
              <Users class="w-4 h-4 text-slate-400" />
              <span class="text-slate-600">DG: <strong>{{ selectedCompany.owner }}</strong></span>
            </div>
            <div class="flex items-center gap-2">
              <Mail class="w-4 h-4 text-slate-400" />
              <span class="text-slate-600">{{ selectedCompany.email }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Phone class="w-4 h-4 text-slate-400" />
              <span class="text-slate-600">{{ selectedCompany.phone }}</span>
            </div>
            <div class="flex items-center gap-2">
              <MapPin class="w-4 h-4 text-slate-400" />
              <span class="text-slate-600">{{ selectedCompany.address }}</span>
            </div>
            <div v-if="selectedCompany.nif" class="flex items-center gap-2">
              <Hash class="w-4 h-4 text-slate-400" />
              <span class="text-slate-600">NIF: {{ selectedCompany.nif }}</span>
            </div>
          </div>

          <div class="pt-4 border-t">
            <p class="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">Modules Actifs</p>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="mod in allModules" :key="mod.id"
                class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  :checked="companies.find(c => c.id === selectedCompany.id)?.modules.includes(mod.id)"
                  @change="toggleModule(companies.find(c => c.id === selectedCompany.id), mod.id)"
                  class="rounded"
                />
                <span class="text-sm font-medium">{{ mod.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
