<script setup>
import { ref, computed, onMounted } from 'vue'
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
import { cn, storageUrl } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { superAdminService } from '@/services/superadmin'

const loading = ref(false)
const activeTab = ref('companies')

const companies = ref([])
const payments = ref([])
const paymentMethods = ref([])
const adminMessages = ref([])
const dashboardStats = ref(null)

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

async function fetchCompanies() {
  try {
    const { data } = await superAdminService.organizations()
    const orgs = data.data || data
    const colorPool = ['bg-blue-500', 'bg-emerald-500', 'bg-orange-500', 'bg-violet-500', 'bg-rose-500', 'bg-cyan-500']
    companies.value = (Array.isArray(orgs) ? orgs : []).map((org, i) => ({
      id: org.id,
      name: org.name || '',
      domain: org.domain || '',
      logo: (org.name || '').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
      owner: org.owner || org.admin_name || '',
      email: org.email || '',
      phone: org.phone || '',
      address: org.address || '',
      nif: org.nif || '',
      plan: org.plan || 'Starter',
      users: org.users_count ?? org.users ?? 0,
      revenue: org.revenue || '0 BIF',
      monthlyFee: org.monthly_fee || org.monthlyFee || '0 BIF',
      status: org.status || 'active',
      color: colorPool[i % colorPool.length],
      modules: org.modules || [],
    }))
  } catch {
    toast.error('Erreur lors du chargement des entreprises')
  }
}

async function fetchPayments() {
  try {
    const { data } = await superAdminService.payments()
    const raw = data.data || data || []
    payments.value = (Array.isArray(raw) ? raw : []).map(p => ({
      ...p,
      company: p.organization?.name || p.company || '',
      amount: p.montant ? Number(p.montant).toLocaleString('fr-FR') + ' BIF' : p.amount || '0 BIF',
      status: p.statut || p.status || 'En attente',
      account: p.payment_method
        ? `${p.payment_method.bank_name} — ${p.payment_method.account_number}`
        : p.account || '',
    }))
  } catch {
    toast.error('Erreur lors du chargement des paiements')
  }
}

function getReceiptUrl(receipt) {
  return storageUrl(receipt)
}

async function fetchPaymentMethods() {
  try {
    const { data } = await superAdminService.paymentMethods()
    paymentMethods.value = data.data || data || []
  } catch {
    toast.error('Erreur lors du chargement des moyens de paiement')
  }
}

async function fetchAdminMessages() {
  try {
    const { data } = await superAdminService.adminMessages()
    const raw = data.data || data || []
    adminMessages.value = (Array.isArray(raw) ? raw : []).map(m => ({
      ...m,
      from: m.user?.name || m.from || 'Inconnu',
      company: m.organization?.name || m.company || '',
      date: m.created_at ? new Date(m.created_at).toLocaleDateString('fr-FR') : m.date || '',
    }))
  } catch {
    toast.error('Erreur lors du chargement des messages')
  }
}

async function fetchDashboard() {
  try {
    const { data } = await superAdminService.dashboard()
    dashboardStats.value = data.data || data
  } catch {
    // stats will be computed from local data as fallback
  }
}

onMounted(async () => {
  loading.value = true
  await Promise.all([
    fetchDashboard(),
    fetchCompanies(),
    fetchPayments(),
    fetchPaymentMethods(),
    fetchAdminMessages(),
  ])
  loading.value = false
})

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

const globalStats = computed(() => {
  const s = dashboardStats.value
  const activeCount = s?.active_organizations ?? companies.value.filter(c => c.status === 'active').length
  const totalUsers = s?.total_users ?? companies.value.reduce((sum, c) => sum + c.users, 0)
  const revenue = s?.total_revenue ?? companies.value.reduce((sum, c) => sum + parseInt(String(c.monthlyFee).replace(/\D/g, '') || 0), 0)
  const pendingCount = payments.value.filter(p => (p.statut || p.status) === 'En attente').length

  return [
    { label: 'Tenants Actifs', value: String(activeCount), icon: Building2, change: '+0', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Utilisateurs Totaux', value: String(totalUsers), icon: Users, change: '+0', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Revenus MRR', value: Number(revenue).toLocaleString('fr-FR') + ' BIF', icon: BarChart3, change: '+0%', color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { label: 'Paiements en attente', value: String(pendingCount), icon: Activity, change: 'À traiter', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  ]
})

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
    'Validé': { label: 'Validé', class: 'bg-emerald-100 text-emerald-700' },
    'En attente': { label: 'En attente', class: 'bg-orange-100 text-orange-700' },
    'Rejeté': { label: 'Rejeté', class: 'bg-red-100 text-red-700' },
    validated: { label: 'Validé', class: 'bg-emerald-100 text-emerald-700' },
    pending: { label: 'En attente', class: 'bg-orange-100 text-orange-700' },
    rejected: { label: 'Rejeté', class: 'bg-red-100 text-red-700' },
  }
  return map[status] ?? { label: status, class: 'bg-slate-100 text-slate-700' }
}

async function addCompany() {
  if (!newCompany.value.name || !newCompany.value.owner || !newCompany.value.email) {
    toast.error('Veuillez remplir les champs obligatoires')
    return
  }
  try {
    await superAdminService.createOrganization({
      name: newCompany.value.name,
      admin_name: newCompany.value.owner,
      admin_email: newCompany.value.email,
      email: newCompany.value.email,
      phone: newCompany.value.phone,
      address: newCompany.value.address,
      nif: newCompany.value.nif,
      monthly_fee: newCompany.value.monthlyFee,
    })
    newCompany.value = { name: '', owner: '', email: '', phone: '', address: '', nif: '', monthlyFee: '' }
    showAddCompany.value = false
    await fetchCompanies()
    toast.success('Entreprise créée avec succès')
  } catch (err) {
    const msg = err.response?.data?.message || Object.values(err.response?.data?.errors || {}).flat()[0] || 'Erreur lors de la création de l\'entreprise'
    toast.error(msg)
  }
}

async function deleteCompany(id) {
  try {
    await superAdminService.deleteOrganization(id)
    await fetchCompanies()
    toast.success('Entreprise supprimée')
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}

async function toggleCompanyStatus(company) {
  try {
    await superAdminService.toggleOrganizationStatus(company.id)
    await fetchCompanies()
    toast.success(`Statut de l'entreprise mis à jour`)
  } catch {
    toast.error('Erreur lors du changement de statut')
  }
}

function viewCompanyDetail(company) {
  selectedCompany.value = company
  showCompanyDetail.value = true
}

const liveSelectedCompany = computed(() => {
  if (!selectedCompany.value) return null
  return companies.value.find(c => c.id === selectedCompany.value.id) || selectedCompany.value
})

async function toggleModule(company, moduleId) {
  try {
    await superAdminService.toggleModule(company.id, { module: moduleId })
    await fetchCompanies()
    toast.info(`Module mis à jour pour ${company.name}`)
  } catch {
    toast.error('Erreur lors de la mise à jour du module')
  }
}

async function validatePayment(payment) {
  try {
    await superAdminService.validatePayment(payment.id)
    await fetchPayments()
    toast.success(`Paiement de ${payment.company} validé`)
  } catch {
    toast.error('Erreur lors de la validation du paiement')
  }
}

async function rejectPayment(payment) {
  try {
    await superAdminService.rejectPayment(payment.id)
    await fetchPayments()
    toast.error(`Paiement de ${payment.company} rejeté`)
  } catch {
    toast.error('Erreur lors du rejet du paiement')
  }
}

async function addPaymentMethod() {
  if (!newPaymentMethod.value.bankName || !newPaymentMethod.value.accountNumber) {
    toast.error('Veuillez remplir tous les champs')
    return
  }
  try {
    await superAdminService.createPaymentMethod({
      bank_name: newPaymentMethod.value.bankName,
      account_number: newPaymentMethod.value.accountNumber,
      account_holder: newPaymentMethod.value.accountHolder,
      type: newPaymentMethod.value.type,
    })
    newPaymentMethod.value = { bankName: '', accountNumber: '', accountHolder: '', type: 'BIF' }
    showAddPaymentMethod.value = false
    await fetchPaymentMethods()
    toast.success('Moyen de paiement ajouté')
  } catch {
    toast.error('Erreur lors de l\'ajout du moyen de paiement')
  }
}

async function deletePaymentMethod(id) {
  try {
    await superAdminService.deletePaymentMethod(id)
    await fetchPaymentMethods()
    toast.success('Moyen de paiement supprimé')
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}

async function markMessageRead(msg) {
  try {
    await superAdminService.markAdminMessageRead(msg.id)
    await fetchAdminMessages()
  } catch {
    msg.read = true
  }
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
                  <TableCell class="text-xs text-slate-600 font-medium">{{ payment.account || '—' }}</TableCell>
                  <TableCell>
                    <a
                      v-if="payment.receipt"
                      :href="getReceiptUrl(payment.receipt)"
                      target="_blank"
                      class="flex items-center gap-1 text-primary hover:underline text-xs font-medium"
                    >
                      <FileText class="w-3 h-3" />Voir le reçu
                    </a>
                    <span v-else class="text-xs text-slate-400">Aucun</span>
                  </TableCell>
                  <TableCell>
                    <Badge :class="cn('text-[10px] font-bold uppercase tracking-wider', paymentStatusBadge(payment.status).class)">
                      {{ paymentStatusBadge(payment.status).label }}
                    </Badge>
                  </TableCell>
                  <TableCell class="text-right">
                    <div v-if="payment.status === 'En attente' || payment.status === 'pending'" class="flex items-center justify-end gap-1">
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
                    <p class="font-bold text-sm">{{ method.bank_name || method.bankName }}</p>
                    <p class="text-xs text-slate-500 mt-1">{{ method.account_number || method.accountNumber }}</p>
                  </div>
                  <div class="flex justify-between items-center pt-2 border-t">
                    <span class="text-xs text-slate-500">{{ method.account_holder || method.accountHolder }}</span>
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
          <DialogTitle>{{ liveSelectedCompany?.name }}</DialogTitle>
          <DialogDescription>Détails et gestion des modules de l'entreprise.</DialogDescription>
        </DialogHeader>
        <div v-if="liveSelectedCompany" class="space-y-4 py-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div class="flex items-center gap-2">
              <Users class="w-4 h-4 text-slate-400" />
              <span class="text-slate-600">DG: <strong>{{ liveSelectedCompany.owner }}</strong></span>
            </div>
            <div class="flex items-center gap-2">
              <Mail class="w-4 h-4 text-slate-400" />
              <span class="text-slate-600">{{ liveSelectedCompany.email }}</span>
            </div>
            <div class="flex items-center gap-2">
              <Phone class="w-4 h-4 text-slate-400" />
              <span class="text-slate-600">{{ liveSelectedCompany.phone }}</span>
            </div>
            <div class="flex items-center gap-2">
              <MapPin class="w-4 h-4 text-slate-400" />
              <span class="text-slate-600">{{ liveSelectedCompany.address }}</span>
            </div>
            <div v-if="liveSelectedCompany.nif" class="flex items-center gap-2">
              <Hash class="w-4 h-4 text-slate-400" />
              <span class="text-slate-600">NIF: {{ liveSelectedCompany.nif }}</span>
            </div>
          </div>

          <div class="flex items-center gap-3">
            <Badge :class="cn('text-[10px] font-bold uppercase tracking-wider', statusBadge(liveSelectedCompany.status).class)">
              {{ statusBadge(liveSelectedCompany.status).label }}
            </Badge>
            <span class="text-xs text-slate-400">{{ liveSelectedCompany.users }} utilisateurs</span>
            <span class="text-xs text-slate-400">{{ liveSelectedCompany.monthlyFee }}/mois</span>
          </div>

          <div class="pt-4 border-t">
            <p class="text-xs font-bold uppercase text-slate-500 tracking-wider mb-3">Modules Actifs ({{ liveSelectedCompany.modules.length }}/{{ allModules.length }})</p>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="mod in allModules" :key="mod.id"
                class="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <input
                  type="checkbox"
                  :checked="liveSelectedCompany.modules.includes(mod.id)"
                  @change="toggleModule(liveSelectedCompany, mod.id)"
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
