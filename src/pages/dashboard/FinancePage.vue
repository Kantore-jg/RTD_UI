<script setup>
import { ref, computed, onMounted } from 'vue'
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
import { financeService, companyPaymentService, paymentMethodService } from '@/services/finance'

const loading = ref(false)
const records = ref([])
const companyPayments = ref([])
const paymentMethods = ref([])
const summary = ref({ revenues: 0, expenses: 0 })

const searchTerm = ref('')
const activeTab = ref('caisse')
const showAddOperation = ref(false)
const showAddPayment = ref(false)
const showReceiptPreview = ref(false)
const previewReceiptUrl = ref('')

const receiptFile = ref(null)
const receiptPreviewUrl = ref(null)
const fileInputRef = ref(null)

const newOperation = ref({
  description: '', type: 'Revenu', montant: '', date: new Date().toISOString().split('T')[0],
})

const newPayment = ref({
  date: new Date().toISOString().split('T')[0], montant: '', payment_method_id: '', description: '',
})

async function fetchRecords() {
  try {
    loading.value = true
    const response = await financeService.list()
    records.value = response.data.data || response.data
  } catch (err) {
    toast.error('Erreur lors du chargement des opérations')
  } finally {
    loading.value = false
  }
}

async function fetchCompanyPayments() {
  try {
    const response = await companyPaymentService.list()
    companyPayments.value = response.data.data || response.data
  } catch (err) {
    toast.error('Erreur lors du chargement des paiements')
  }
}

async function fetchSummary() {
  try {
    const response = await financeService.summary()
    summary.value = response.data.data || response.data
  } catch {
    // Fallback: compute from records
  }
}

async function fetchPaymentMethods() {
  try {
    const response = await paymentMethodService.list()
    paymentMethods.value = response.data.data || response.data || []
  } catch {
    // Non-blocking
  }
}

function handleReceiptSelect(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/')) {
    toast.error('Veuillez sélectionner une image (JPG, PNG, etc.)')
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    toast.error('L\'image ne doit pas dépasser 5 Mo')
    return
  }
  receiptFile.value = file
  receiptPreviewUrl.value = URL.createObjectURL(file)
}

function removeReceipt() {
  receiptFile.value = null
  receiptPreviewUrl.value = null
  if (fileInputRef.value) fileInputRef.value.value = ''
}

function viewReceipt(url) {
  previewReceiptUrl.value = url
  showReceiptPreview.value = true
}

function getPaymentMethodLabel(payment) {
  const method = payment.payment_method
  if (method) return `${method.bank_name} - ${method.account_number}`
  return payment.account || '—'
}

function getReceiptUrl(receipt) {
  if (!receipt) return null
  if (receipt.startsWith('http')) return receipt
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8000'
  return `${apiBase.replace('/api', '')}/storage/${receipt}`
}

onMounted(async () => {
  await Promise.all([fetchRecords(), fetchCompanyPayments(), fetchSummary(), fetchPaymentMethods()])
})

const filteredRecords = computed(() => {
  if (!searchTerm.value) return records.value
  const term = searchTerm.value.toLowerCase()
  return records.value.filter(r => r.description.toLowerCase().includes(term) || r.type.toLowerCase().includes(term))
})

const summaryCards = computed(() => {
  const revenues = summary.value.revenues ?? records.value.filter(r => r.type === 'Revenu').reduce((sum, r) => sum + r.montant, 0)
  const expenses = summary.value.expenses ?? records.value.filter(r => r.type === 'Dépense').reduce((sum, r) => sum + r.montant, 0)
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

async function addOperation() {
  if (!newOperation.value.description || !newOperation.value.montant) {
    toast.error('Veuillez remplir tous les champs obligatoires')
    return
  }
  try {
    await financeService.create({
      date: newOperation.value.date,
      description: newOperation.value.description,
      type: newOperation.value.type,
      montant: parseInt(newOperation.value.montant),
    })
    newOperation.value = { description: '', type: 'Revenu', montant: '', date: new Date().toISOString().split('T')[0] }
    showAddOperation.value = false
    toast.success('Opération enregistrée')
    await Promise.all([fetchRecords(), fetchSummary()])
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement')
  }
}

async function addPayment() {
  if (!newPayment.value.montant) {
    toast.error('Veuillez indiquer le montant')
    return
  }
  if (!newPayment.value.payment_method_id) {
    toast.error('Veuillez sélectionner un moyen de paiement')
    return
  }
  try {
    const formData = new FormData()
    formData.append('date', newPayment.value.date)
    formData.append('montant', parseInt(newPayment.value.montant))
    formData.append('payment_method_id', newPayment.value.payment_method_id)
    if (newPayment.value.description) {
      formData.append('description', newPayment.value.description)
    }
    if (receiptFile.value) {
      formData.append('receipt', receiptFile.value)
    }

    await companyPaymentService.create(formData)
    newPayment.value = { date: new Date().toISOString().split('T')[0], montant: '', payment_method_id: '', description: '' }
    removeReceipt()
    showAddPayment.value = false
    toast.success('Paiement enregistré, en attente de validation par l\'admin')
    await fetchCompanyPayments()
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement du paiement')
  }
}

async function deleteRecord(id) {
  try {
    await financeService.delete(id)
    toast.success('Opération supprimée')
    await Promise.all([fetchRecords(), fetchSummary()])
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de la suppression')
  }
}

async function exportPDF() {
  try {
    toast.info('Rapport PDF en cours de génération...')
    const csvData = [
      ['Date', 'Description', 'Type', 'Montant', 'Statut'],
      ...records.value.map(r => [r.date, r.description, r.type, r.montant, r.statut || '']),
    ].map(row => row.join(',')).join('\n')
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `rapport_finance_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    toast.success('Rapport téléchargé')
  } catch {
    toast.error('Erreur lors de la génération du rapport')
  }
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
            <DialogContent class="sm:max-w-[500px]">
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
                  <Label class="text-xs font-bold uppercase text-slate-500">Compte utilisé pour payer *</Label>
                  <select
                    v-model="newPayment.payment_method_id"
                    class="w-full h-10 px-3 rounded-md border border-slate-200 text-sm bg-white"
                  >
                    <option value="" disabled>Sélectionner un moyen de paiement...</option>
                    <option v-for="method in paymentMethods" :key="method.id" :value="method.id">
                      {{ method.bank_name }} — {{ method.account_number }} ({{ method.type }})
                    </option>
                  </select>
                  <p v-if="paymentMethods.length === 0" class="text-[10px] text-orange-500">Aucun moyen de paiement disponible. Contactez l'administrateur.</p>
                </div>
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Reçu de paiement (image)</Label>
                  <div v-if="!receiptFile" class="relative">
                    <input
                      ref="fileInputRef"
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleReceiptSelect"
                    />
                    <div
                      class="flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                      @click="fileInputRef?.click()"
                    >
                      <Upload class="w-8 h-8 text-slate-400" />
                      <span class="text-sm text-slate-500 font-medium">Cliquez pour uploader le reçu</span>
                      <span class="text-[10px] text-slate-400">JPG, PNG — Max 5 Mo</span>
                    </div>
                  </div>
                  <div v-else class="relative border rounded-lg overflow-hidden">
                    <img :src="receiptPreviewUrl" alt="Aperçu du reçu" class="w-full h-40 object-cover" />
                    <div class="absolute top-2 right-2">
                      <Button size="icon" variant="destructive" class="h-7 w-7" @click="removeReceipt">
                        <Trash2 class="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <div class="px-3 py-2 bg-slate-50 border-t text-xs text-slate-600 font-medium truncate">
                      {{ receiptFile.name }} ({{ (receiptFile.size / 1024).toFixed(0) }} Ko)
                    </div>
                  </div>
                </div>
                <div class="space-y-2">
                  <Label class="text-xs font-bold uppercase text-slate-500">Description (optionnel)</Label>
                  <Input v-model="newPayment.description" placeholder="Ex: Paiement abonnement avril 2026" />
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
                  <TableCell class="font-bold">{{ Number(payment.montant).toLocaleString('fr-FR') }} BIF</TableCell>
                  <TableCell>
                    <button
                      v-if="payment.receipt"
                      class="flex items-center gap-1 text-primary hover:underline text-xs font-medium"
                      @click="viewReceipt(getReceiptUrl(payment.receipt))"
                    >
                      <FileText class="w-3 h-3" />Voir le reçu
                    </button>
                    <span v-else class="text-xs text-slate-400">Aucun</span>
                  </TableCell>
                  <TableCell class="text-xs text-slate-600 font-medium">{{ getPaymentMethodLabel(payment) }}</TableCell>
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

    <!-- Receipt Preview Dialog -->
    <Dialog v-model:open="showReceiptPreview">
      <DialogContent class="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reçu de paiement</DialogTitle>
          <DialogDescription>Aperçu du reçu uploadé</DialogDescription>
        </DialogHeader>
        <div class="py-4">
          <img :src="previewReceiptUrl" alt="Reçu de paiement" class="w-full rounded-lg border" />
        </div>
        <div class="flex justify-end">
          <Button variant="outline" @click="showReceiptPreview = false">Fermer</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
