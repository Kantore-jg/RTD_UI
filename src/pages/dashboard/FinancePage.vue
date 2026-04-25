<script setup>
import { ref, computed } from 'vue'
import { cn } from '@/lib/utils'
import {
  Wallet, ArrowUpCircle, ArrowDownCircle, TrendingUp,
  Filter, Download, Plus, Search, FileText, Upload,
  CheckCircle2, Clock, CreditCard, Trash2,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'vue-sonner'

const records = ref([
  { id: 1, date: '2026-04-20', description: 'Paiement fournisseur — Matières premières', type: 'Dépense', montant: 1250000, statut: 'Validé' },
  { id: 2, date: '2026-04-18', description: 'Facture client — Projet ERP', type: 'Revenu', montant: 3400000, statut: 'Encaissé' },
  { id: 3, date: '2026-04-15', description: 'Salaires — Avril 2026', type: 'Dépense', montant: 2100000, statut: 'Validé' },
  { id: 4, date: '2026-04-12', description: 'Subvention gouvernementale', type: 'Revenu', montant: 800000, statut: 'En attente' },
  { id: 5, date: '2026-04-10', description: 'Maintenance serveurs — Q2', type: 'Dépense', montant: 350000, statut: 'Validé' },
])

const companyPayments = ref([
  { id: 1, date: '2026-04-20', description: 'Paiement abonnement plateforme RDT', montant: 500000, receipt: 'recu_avril_2026.jpg', account: 'BANCOBU - 10045678', statut: 'Validé' },
  { id: 2, date: '2026-03-20', description: 'Paiement abonnement plateforme RDT', montant: 500000, receipt: 'recu_mars_2026.jpg', account: 'BANCOBU - 10045678', statut: 'Validé' },
  { id: 3, date: '2026-05-01', description: 'Paiement abonnement plateforme RDT', montant: 500000, receipt: '', account: '', statut: 'En attente' },
])

const searchTerm = ref('')
const activeTab = ref('caisse')
const showAddOperation = ref(false)
const showAddPayment = ref(false)

const newOperation = ref({
  description: '', type: 'Revenu', montant: '', date: new Date().toISOString().split('T')[0],
})

const newPayment = ref({
  date: new Date().toISOString().split('T')[0], montant: '', receipt: '', account: '', description: 'Paiement abonnement plateforme RDT',
})

const filteredRecords = computed(() => {
  if (!searchTerm.value) return records.value
  const term = searchTerm.value.toLowerCase()
  return records.value.filter(r => r.description.toLowerCase().includes(term) || r.type.toLowerCase().includes(term))
})

const summaryCards = computed(() => {
  const revenues = records.value.filter(r => r.type === 'Revenu').reduce((sum, r) => sum + r.montant, 0)
  const expenses = records.value.filter(r => r.type === 'Dépense').reduce((sum, r) => sum + r.montant, 0)
  return [
    { title: 'Entrées', value: revenues.toLocaleString('fr-FR') + ' BIF', icon: ArrowUpCircle, description: 'Total des revenus', color: 'text-emerald-600' },
    { title: 'Sorties', value: expenses.toLocaleString('fr-FR') + ' BIF', icon: ArrowDownCircle, description: 'Total des dépenses', color: 'text-red-600' },
    { title: 'Solde Net', value: (revenues - expenses).toLocaleString('fr-FR') + ' BIF', icon: TrendingUp, description: 'Bénéfice / Perte', color: revenues - expenses >= 0 ? 'text-blue-600' : 'text-red-600' },
  ]
})

function formatAmount(amount, type) {
  const prefix = type === 'Revenu' ? '+' : '-'
  return `${prefix}${amount.toLocaleString('fr-FR')} BIF`
}

function typeVariant(type) {
  return type === 'Revenu' ? 'default' : 'destructive'
}

function statutVariant(statut) {
  switch (statut) {
    case 'Validé': return 'outline'
    case 'Encaissé': return 'default'
    case 'En attente': return 'secondary'
    default: return 'outline'
  }
}

let nextId = 6

function addOperation() {
  if (!newOperation.value.description || !newOperation.value.montant) {
    toast.error('Veuillez remplir tous les champs obligatoires')
    return
  }
  records.value.unshift({
    id: nextId++,
    date: newOperation.value.date,
    description: newOperation.value.description,
    type: newOperation.value.type,
    montant: parseInt(newOperation.value.montant),
    statut: 'En attente',
  })
  newOperation.value = { description: '', type: 'Revenu', montant: '', date: new Date().toISOString().split('T')[0] }
  showAddOperation.value = false
  toast.success('Opération enregistrée')
}

function addPayment() {
  if (!newPayment.value.montant) {
    toast.error('Veuillez indiquer le montant')
    return
  }
  companyPayments.value.unshift({
    id: companyPayments.value.length + 1,
    date: newPayment.value.date,
    description: newPayment.value.description,
    montant: parseInt(newPayment.value.montant),
    receipt: newPayment.value.receipt,
    account: newPayment.value.account,
    statut: 'En attente',
  })
  newPayment.value = { date: new Date().toISOString().split('T')[0], montant: '', receipt: '', account: '', description: 'Paiement abonnement plateforme RDT' }
  showAddPayment.value = false
  toast.success('Paiement enregistré, en attente de validation par l\'admin')
}

function deleteRecord(id) {
  records.value = records.value.filter(r => r.id !== id)
  toast.success('Opération supprimée')
}

function exportPDF() {
  toast.info('Rapport PDF en cours de génération...')
  setTimeout(() => toast.success('Rapport PDF prêt au téléchargement'), 1500)
}
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Finances & Caisse</h1>
        <p class="text-muted-foreground">Suivi des entrées, sorties et opérations financières</p>
      </div>
      <div class="flex items-center gap-2">
        <Button variant="outline" @click="exportPDF">
          <Download class="mr-2 h-4 w-4" />
          Rapport PDF
        </Button>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="grid gap-4 md:grid-cols-3">
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

    <!-- Tabs -->
    <Tabs v-model="activeTab" class="space-y-6">
      <TabsList class="bg-muted p-1 border h-11 rounded-xl gap-1">
        <TabsTrigger value="caisse" class="font-bold data-[state=active]:bg-background rounded-lg px-4 text-xs">
          <Wallet class="w-3.5 h-3.5 mr-1.5" />Caisse (Entrées/Sorties)
        </TabsTrigger>
        <TabsTrigger value="payments" class="font-bold data-[state=active]:bg-background rounded-lg px-4 text-xs">
          <CreditCard class="w-3.5 h-3.5 mr-1.5" />Paiements Plateforme
        </TabsTrigger>
      </TabsList>

      <!-- CAISSE TAB -->
      <TabsContent value="caisse">
        <!-- Search & Filter -->
        <div class="flex items-center gap-4 mb-6">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input v-model="searchTerm" placeholder="Rechercher une opération..." class="pl-10" />
          </div>
          <Dialog v-model:open="showAddOperation">
            <DialogTrigger as-child>
              <Button>
                <Plus class="mr-2 h-4 w-4" />
                Nouvelle Opération
              </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Nouvelle Opération</DialogTitle>
                <DialogDescription>Enregistrez une entrée ou sortie de caisse.</DialogDescription>
              </DialogHeader>
              <div class="grid gap-4 py-4">
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Description *</Label>
                  <Input v-model="newOperation.description" placeholder="Ex: Paiement fournisseur" />
                </div>
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label class="text-xs font-bold uppercase text-slate-500">Type</Label>
                    <select v-model="newOperation.type" class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white">
                      <option value="Revenu">Entrée (Revenu)</option>
                      <option value="Dépense">Sortie (Dépense)</option>
                    </select>
                  </div>
                  <div class="space-y-2">
                    <Label class="text-xs font-bold uppercase text-slate-500">Montant (BIF) *</Label>
                    <Input v-model="newOperation.montant" type="number" placeholder="500000" />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Date</Label>
                  <Input v-model="newOperation.date" type="date" />
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <Button variant="outline" @click="showAddOperation = false">Annuler</Button>
                <Button @click="addOperation">Enregistrer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <!-- Transactions Table -->
        <Card>
          <CardHeader>
            <CardTitle>Transactions récentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead class="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="record in filteredRecords" :key="record.id" class="group">
                  <TableCell class="font-medium">{{ record.date }}</TableCell>
                  <TableCell>{{ record.description }}</TableCell>
                  <TableCell>
                    <Badge :variant="typeVariant(record.type)">{{ record.type }}</Badge>
                  </TableCell>
                  <TableCell :class="cn('font-semibold', record.type === 'Revenu' ? 'text-emerald-600' : 'text-red-600')">
                    {{ formatAmount(record.montant, record.type) }}
                  </TableCell>
                  <TableCell>
                    <Badge :variant="statutVariant(record.statut)">{{ record.statut }}</Badge>
                  </TableCell>
                  <TableCell class="text-right">
                    <Button variant="ghost" size="icon" class="h-8 w-8 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100" @click="deleteRecord(record.id)">
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <!-- COMPANY PAYMENTS TAB -->
      <TabsContent value="payments">
        <div class="flex justify-end mb-6">
          <Dialog v-model:open="showAddPayment">
            <DialogTrigger as-child>
              <Button>
                <Plus class="mr-2 h-4 w-4" />
                Enregistrer un paiement
              </Button>
            </DialogTrigger>
            <DialogContent class="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Enregistrer un Paiement</DialogTitle>
                <DialogDescription>Enregistrez votre paiement. L'admin validera après vérification du reçu.</DialogDescription>
              </DialogHeader>
              <div class="grid gap-4 py-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-2">
                    <Label class="text-xs font-bold uppercase text-slate-500">Date</Label>
                    <Input v-model="newPayment.date" type="date" />
                  </div>
                  <div class="space-y-2">
                    <Label class="text-xs font-bold uppercase text-slate-500">Montant (BIF) *</Label>
                    <Input v-model="newPayment.montant" type="number" placeholder="500000" />
                  </div>
                </div>
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Reçu (image)</Label>
                  <Input v-model="newPayment.receipt" placeholder="nom_du_fichier.jpg" />
                  <p class="text-[10px] text-slate-400">Entrez le nom du fichier reçu ou uploadez-le</p>
                </div>
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Compte utilisé</Label>
                  <Input v-model="newPayment.account" placeholder="Ex: BANCOBU - 10045678" />
                </div>
              </div>
              <div class="flex justify-end gap-2">
                <Button variant="outline" @click="showAddPayment = false">Annuler</Button>
                <Button @click="addPayment">Enregistrer</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Historique des paiements plateforme</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Reçu</TableHead>
                  <TableHead>Compte</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="payment in companyPayments" :key="payment.id">
                  <TableCell class="font-medium">{{ payment.date }}</TableCell>
                  <TableCell>{{ payment.description }}</TableCell>
                  <TableCell class="font-bold">{{ payment.montant.toLocaleString('fr-FR') }} BIF</TableCell>
                  <TableCell>
                    <Badge v-if="payment.receipt" variant="outline" class="text-[10px]">
                      <FileText class="w-3 h-3 mr-1" />{{ payment.receipt }}
                    </Badge>
                    <span v-else class="text-xs text-slate-400">Aucun</span>
                  </TableCell>
                  <TableCell class="text-xs text-slate-500">{{ payment.account || '—' }}</TableCell>
                  <TableCell>
                    <Badge :variant="statutVariant(payment.statut)">
                      <component :is="payment.statut === 'Validé' ? CheckCircle2 : Clock" class="w-3 h-3 mr-1" />
                      {{ payment.statut }}
                    </Badge>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
