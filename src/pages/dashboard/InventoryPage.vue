<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import {
  Package, Plus, Search, Trash2, ShoppingCart, ArrowLeftRight, FileText, BarChart3,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'vue-sonner'
import { formatFbu, formatQty } from '@/lib/utils'
import { inventoryService } from '@/services/inventory'

const loading = ref(false)
const tab = ref('products')
const products = ref([])
const movements = ref([])
const sales = ref([])
const invoices = ref([])
const stats = ref({
  product_count: 0,
  low_stock_count: 0,
  sales_total: 0,
  top_products: [],
  revenue_period_days: 30,
  sales_by_day: [],
})
const alerts = ref({ low_stock: [], expiring_soon: [] })

const productSearch = ref('')
const showProductDialog = ref(false)
const editingProduct = ref(null)
const productForm = ref({
  name: '', sku: '', sale_price: '', purchase_price: '', quantity_on_hand: '', min_stock: '', unit: 'unité',
})

const cart = ref([])
const customerName = ref('')
const saleSearch = ref('')
const saleProductHits = ref([])

const movementForm = ref({
  inventory_product_id: '', type: 'manual_in', quantity: '', note: '',
})

const MOVEMENT_TYPE_LABELS = {
  manual_in: 'Entrée manuelle',
  manual_out: 'Sortie manuelle',
  purchase_in: 'Réception / achat',
  loss: 'Perte / casse',
  adjustment: 'Ajustement',
  sale_out: 'Vente',
}

function movementTypeLabel(type) {
  return MOVEMENT_TYPE_LABELS[type] || type
}

function movementProductLabel(m) {
  if (m.product?.name) return `${m.product.name} (#${m.inventory_product_id})`
  return `#${m.inventory_product_id}`
}

const invoiceSaleId = ref('')

function unwrapPaginated(res) {
  return res.data?.data ?? res.data
}

async function fetchProducts() {
  loading.value = true
  try {
    const res = await inventoryService.products({ search: productSearch.value || undefined })
    const body = unwrapPaginated(res)
    products.value = body.data || body
  } catch {
    toast.error('Erreur chargement produits')
  } finally {
    loading.value = false
  }
}

async function fetchMovements() {
  try {
    const res = await inventoryService.movements()
    const body = unwrapPaginated(res)
    movements.value = body.data || body
  } catch {
    toast.error('Erreur mouvements')
  }
}

async function fetchSales() {
  try {
    const res = await inventoryService.sales()
    const body = unwrapPaginated(res)
    sales.value = body.data || body
  } catch {
    toast.error('Erreur ventes')
  }
}

async function fetchInvoices() {
  try {
    const res = await inventoryService.invoices()
    const body = unwrapPaginated(res)
    invoices.value = body.data || body
  } catch {
    toast.error('Erreur factures')
  }
}

async function fetchStats() {
  try {
    const { data } = await inventoryService.stats()
    stats.value = data.data || data
  } catch { /* ignore */ }
}

async function fetchAlerts() {
  try {
    const { data } = await inventoryService.alerts()
    alerts.value = data.data || data
  } catch { /* ignore */ }
}

onMounted(async () => {
  await fetchProducts()
})

watch(tab, async (t) => {
  if (t === 'movements') await fetchMovements()
  if (t === 'sales') await fetchSales()
  if (t === 'invoices') await fetchInvoices()
  if (t === 'stats') {
    await fetchStats()
    await fetchAlerts()
  }
})

let productSearchTimer
watch(productSearch, () => {
  clearTimeout(productSearchTimer)
  productSearchTimer = setTimeout(fetchProducts, 350)
})

function openNewProduct() {
  editingProduct.value = null
  productForm.value = {
    name: '', sku: '', sale_price: '', purchase_price: '', quantity_on_hand: '', min_stock: '', unit: 'unité',
  }
  showProductDialog.value = true
}

function openEditProduct(p) {
  editingProduct.value = p
  productForm.value = {
    name: p.name,
    sku: p.sku || '',
    sale_price: String(p.sale_price ?? ''),
    purchase_price: String(p.purchase_price ?? ''),
    quantity_on_hand: String(p.quantity_on_hand ?? ''),
    min_stock: String(p.min_stock ?? ''),
    unit: p.unit || 'unité',
  }
  showProductDialog.value = true
}

async function saveProduct() {
  try {
    const payload = {
      name: productForm.value.name,
      sku: productForm.value.sku || null,
      sale_price: productForm.value.sale_price || 0,
      purchase_price: productForm.value.purchase_price || 0,
      quantity_on_hand: Math.round(Number(productForm.value.quantity_on_hand) || 0),
      min_stock: Math.round(Number(productForm.value.min_stock) || 0),
      unit: productForm.value.unit || 'unité',
    }
    if (editingProduct.value) {
      await inventoryService.updateProduct(editingProduct.value.id, payload)
      toast.success('Produit mis à jour')
    } else {
      await inventoryService.createProduct(payload)
      toast.success('Produit créé')
    }
    showProductDialog.value = false
    await fetchProducts()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erreur enregistrement')
  }
}

async function deleteProduct(p) {
  if (!confirm(`Supprimer ${p.name} ?`)) return
  try {
    await inventoryService.deleteProduct(p.id)
    toast.success('Produit supprimé')
    await fetchProducts()
  } catch {
    toast.error('Suppression impossible')
  }
}

async function searchSaleProducts() {
  if (!saleSearch.value.trim()) {
    saleProductHits.value = []
    return
  }
  try {
    const { data } = await inventoryService.products({ search: saleSearch.value, per_page: 10 })
    const body = data.data || data
    saleProductHits.value = body.data || body || []
  } catch {
    saleProductHits.value = []
  }
}

function addToCart(p) {
  if (cart.value.find((l) => l.inventory_product_id === p.id)) {
    toast.message('Déjà dans le panier')
    return
  }
  cart.value.push({
    inventory_product_id: p.id,
    name: p.name,
    quantity: 1,
    unit_price: p.sale_price,
  })
}

function removeLine(i) {
  cart.value.splice(i, 1)
}

async function submitSale() {
  if (!cart.value.length) {
    toast.error('Panier vide')
    return
  }
  try {
    await inventoryService.createSale({
      customer_name: customerName.value.trim() || null,
      items: cart.value.map((l) => ({
        inventory_product_id: l.inventory_product_id,
        quantity: Math.round(Number(l.quantity)),
        unit_price: l.unit_price,
      })),
    })
    toast.success('Vente enregistrée')
    cart.value = []
    customerName.value = ''
    await fetchProducts()
    await fetchSales()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erreur vente')
  }
}

async function submitMovement() {
  try {
    await inventoryService.createMovement({
      inventory_product_id: Number(movementForm.value.inventory_product_id),
      type: movementForm.value.type,
      quantity: Math.round(Number(movementForm.value.quantity)),
      note: movementForm.value.note || null,
    })
    toast.success('Mouvement enregistré')
    movementForm.value = { inventory_product_id: '', type: 'manual_in', quantity: '', note: '' }
    await fetchMovements()
    await fetchProducts()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erreur mouvement')
  }
}

async function createInvoice() {
  try {
    await inventoryService.createInvoice({ inventory_sale_id: Number(invoiceSaleId.value) })
    toast.success('Facture créée')
    invoiceSaleId.value = ''
    await fetchInvoices()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erreur facture')
  }
}

async function openPdf(id) {
  try {
    await inventoryService.openInvoicePdf(id)
  } catch {
    toast.error('Impossible d\'ouvrir le PDF')
  }
}

const cartTotal = computed(() =>
  cart.value.reduce((s, l) => s + Number(l.unit_price || 0) * Number(l.quantity || 0), 0),
)

const chartDayFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

function formatChartDay(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return chartDayFormatter.format(d)
}

const stockOkCount = computed(() =>
  Math.max(0, Number(stats.value.product_count || 0) - Number(stats.value.low_stock_count || 0)),
)

const stockOkPct = computed(() => {
  const total = Number(stats.value.product_count || 0)
  if (!total) return 0
  return (stockOkCount.value / total) * 100
})

const stockLowPct = computed(() => {
  const total = Number(stats.value.product_count || 0)
  if (!total) return 0
  return (Number(stats.value.low_stock_count || 0) / total) * 100
})

const salesByDaySeries = computed(() => stats.value.sales_by_day || [])

const statsPeriodCaption = computed(() => {
  const arr = salesByDaySeries.value
  if (!arr.length) return ''
  const a = arr[0]?.day
  const b = arr[arr.length - 1]?.day
  if (!a || !b) return ''
  return `${formatChartDay(a)} – ${formatChartDay(b)}`
})

const revenueChart = computed(() => {
  const raw = salesByDaySeries.value
  const series = raw.map((d) => Number(d.total))
  const n = series.length
  if (!n) return { lineD: '', areaD: '', points: [] }
  const max = Math.max(...series, 0.01)
  const w = 100
  const h = 40
  const py = 5
  const px = 2
  const innerW = w - px * 2
  const innerH = h - py * 2
  const points = series.map((v, i) => {
    const x = px + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
    const y = py + innerH - (v / max) * innerH
    return { x, y, day: raw[i].day, total: v }
  })
  const lineD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join('')
  const last = points[points.length - 1]
  const first = points[0]
  const areaD = `${lineD} L${last.x},${h} L${first.x},${h}Z`
  return { lineD, areaD, points }
})

const topProductsBars = computed(() => {
  const list = stats.value.top_products || []
  const max = Math.max(...list.map((t) => Number(t.qty_sold)), 1)
  return list.map((t) => ({
    ...t,
    pct: (Number(t.qty_sold) / max) * 100,
  }))
})
</script>

<template>
  <div class="space-y-6 w-full min-h-0">
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Package class="w-7 h-7 text-primary" />
          Stock & inventaire
        </h1>
        <p class="text-muted-foreground text-sm">Produits, ventes, mouvements et factures.</p>
      </div>
    </div>

    <Tabs v-model="tab" class="w-full">
      <TabsList class="flex flex-wrap h-auto gap-1">
        <TabsTrigger value="products">Produits</TabsTrigger>
        <TabsTrigger value="sale">Vente</TabsTrigger>
        <TabsTrigger value="movements">Mouvements</TabsTrigger>
        <TabsTrigger value="sales">Historique ventes</TabsTrigger>
        <TabsTrigger value="invoices">Factures</TabsTrigger>
        <TabsTrigger value="stats">Stats & alertes</TabsTrigger>
      </TabsList>

      <TabsContent value="products" class="mt-4 space-y-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between gap-4">
            <CardTitle>Catalogue</CardTitle>
            <div class="flex flex-wrap gap-2">
              <Input v-model="productSearch" placeholder="Rechercher…" class="w-48" />
              <Button @click="openNewProduct">
                <Plus class="w-4 h-4 mr-1" /> Nouveau
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead class="text-right">Prix vente</TableHead>
                  <TableHead class="text-right">Stock</TableHead>
                  <TableHead class="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="p in products" :key="p.id">
                  <TableCell>{{ p.name }}</TableCell>
                  <TableCell class="text-muted-foreground">{{ p.sku || '—' }}</TableCell>
                  <TableCell class="text-right">{{ formatFbu(p.sale_price) }}</TableCell>
                  <TableCell class="text-right">{{ formatQty(p.quantity_on_hand) }}</TableCell>
                  <TableCell class="text-right space-x-1">
                    <Button variant="ghost" size="sm" @click="openEditProduct(p)">Modifier</Button>
                    <Button variant="ghost" size="sm" class="text-destructive" @click="deleteProduct(p)">
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sale" class="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <Search class="w-5 h-5" /> Recherche produit
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="flex gap-2">
              <Input v-model="saleSearch" placeholder="Nom ou SKU…" @keyup.enter="searchSaleProducts" />
              <Button type="button" variant="secondary" @click="searchSaleProducts">Chercher</Button>
            </div>
            <ul class="border rounded-md divide-y max-h-64 overflow-auto">
              <li
                v-for="p in saleProductHits"
                :key="p.id"
                class="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50"
              >
                <span>{{ p.name }} <span class="text-muted-foreground">({{ formatQty(p.quantity_on_hand) }} dispo)</span></span>
                <Button size="sm" variant="outline" @click="addToCart(p)">Ajouter</Button>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <ShoppingCart class="w-5 h-5" /> Panier
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-3">
            <div class="space-y-1">
              <Label>Nom du client</Label>
              <Input v-model="customerName" placeholder="Ex. Jean Bizimana" />
            </div>
            <Table v-if="cart.length">
              <TableHeader>
                <TableRow>
                  <TableHead>Produit</TableHead>
                  <TableHead class="w-24">Qté</TableHead>
                  <TableHead class="w-28">Prix</TableHead>
                  <TableHead class="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="(l, i) in cart" :key="l.inventory_product_id">
                  <TableCell>{{ l.name }}</TableCell>
                  <TableCell>
                    <Input v-model.number="l.quantity" type="number" min="1" class="h-8" />
                  </TableCell>
                  <TableCell>
                    <Input v-model.number="l.unit_price" type="number" step="1" min="0" class="h-8" />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" @click="removeLine(i)"><Trash2 class="w-4 h-4" /></Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p v-else class="text-sm text-muted-foreground">Ajoutez des produits depuis la recherche.</p>
            <div class="flex justify-between items-center">
              <span class="font-medium">Total : {{ formatFbu(cartTotal) }}</span>
              <Button :disabled="!cart.length" @click="submitSale">Valider la vente</Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="movements" class="mt-4 w-full">
        <!-- <Card> -->
          <!-- <CardHeader>
            <CardTitle class="flex items-center gap-2">
              <ArrowLeftRight class="w-5 h-5" /> Saisie mouvement
            </CardTitle>
          </CardHeader>
          <CardContent class="grid gap-3">
            <div class="space-y-1">
              <Label>ID produit</Label>
              <Input v-model="movementForm.inventory_product_id" type="number" placeholder="ID" />
            </div>
            <div class="space-y-1">
              <Label>Type</Label>
              <select v-model="movementForm.type" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="manual_in">Entrée manuelle</option>
                <option value="manual_out">Sortie manuelle</option>
                <option value="purchase_in">Réception / achat</option>
                <option value="loss">Perte / casse</option>
                <option value="adjustment">Ajustement (+/-)</option>
              </select>
            </div>
            <div class="space-y-1">
              <Label>Quantité</Label>
              <Input v-model="movementForm.quantity" type="number" step="1" min="1" />
            </div>
            <div class="space-y-1">
              <Label>Note</Label>
              <Input v-model="movementForm.note" />
            </div>
            <Button @click="submitMovement">Enregistrer</Button>
          </CardContent>
        </Card> -->
        <Card class="w-full">
          <CardHeader><CardTitle>Derniers mouvements</CardTitle></CardHeader>
          <CardContent class="max-h-[calc(100dvh-14rem)] overflow-auto">
            <Table v-if="movements.length" class="text-sm">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Produit</TableHead>
                  <TableHead>Qté</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="m in movements" :key="m.id">
                  <TableCell>{{ m.id }}</TableCell>
                  <TableCell>{{ movementTypeLabel(m.type) }}</TableCell>
                  <TableCell>{{ movementProductLabel(m) }}</TableCell>
                  <TableCell>{{ formatQty(m.quantity) }}</TableCell>
                  <TableCell>{{ m.created_at }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p v-else class="text-sm text-muted-foreground">Aucun mouvement.</p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="sales" class="mt-4">
        <Card>
          <CardHeader><CardTitle>Ventes récentes</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="s in sales" :key="s.id">
                  <TableCell>{{ s.id }}</TableCell>
                  <TableCell>{{ s.customer_name || '—' }}</TableCell>
                  <TableCell>{{ formatFbu(s.total) }}</TableCell>
                  <TableCell>{{ s.created_at }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="invoices" class="mt-4 space-y-4">
        <Card>
          <CardHeader><CardTitle>Créer une facture (depuis une vente)</CardTitle></CardHeader>
          <CardContent class="flex flex-wrap gap-2 items-end">
            <div class="space-y-1">
              <Label>ID vente</Label>
              <Input v-model="invoiceSaleId" type="number" class="w-40" />
            </div>
            <Button @click="createInvoice">Générer</Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Factures</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N°</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>PDF</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="inv in invoices" :key="inv.id">
                  <TableCell>{{ inv.invoice_number }}</TableCell>
                  <TableCell>{{ formatFbu(inv.total) }}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" @click="openPdf(inv.id)">
                      <FileText class="w-4 h-4 mr-1" /> PDF
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="stats" class="mt-4 w-full space-y-4">
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Produits</CardTitle>
            </CardHeader>
            <CardContent class="text-2xl font-semibold tabular-nums">{{ stats.product_count }}</CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Stock faible</CardTitle>
            </CardHeader>
            <CardContent class="text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
              {{ stats.low_stock_count }}
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">CA (période)</CardTitle>
            </CardHeader>
            <CardContent class="text-2xl font-semibold tabular-nums">{{ formatFbu(stats.sales_total) }}</CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground">Période</CardTitle>
            </CardHeader>
            <CardContent class="text-2xl font-semibold tabular-nums">{{ stats.revenue_period_days }} j</CardContent>
          </Card>
        </div>

        <div class="grid gap-4 xl:grid-cols-2">
          <Card class="w-full">
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <BarChart3 class="w-5 h-5" />
                Chiffre d’affaires par jour
              </CardTitle>
              <p class="text-xs text-muted-foreground">{{ statsPeriodCaption }} · {{ stats.revenue_period_days }} derniers jours</p>
            </CardHeader>
            <CardContent class="space-y-2">
              <svg
                v-if="revenueChart.points.length"
                class="w-full h-40 text-primary"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
                aria-label="Graphique du chiffre d’affaires par jour"
              >
                <path :d="revenueChart.areaD" fill="currentColor" class="opacity-[0.12]" />
                <path
                  :d="revenueChart.lineD"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="0.35"
                  vector-effect="non-scaling-stroke"
                />
                <g v-for="(p, i) in revenueChart.points" :key="i">
                  <circle :cx="p.x" :cy="p.y" r="0.9" fill="currentColor" class="opacity-90">
                    <title>{{ formatChartDay(p.day) }} — {{ formatFbu(p.total) }}</title>
                  </circle>
                </g>
              </svg>
              <p v-else class="text-sm text-muted-foreground">Aucune donnée sur la période.</p>
            </CardContent>
          </Card>

          <Card class="w-full">
            <CardHeader>
              <CardTitle>Top produits (quantités vendues)</CardTitle>
              <p class="text-xs text-muted-foreground">Sur la même période que le CA</p>
            </CardHeader>
            <CardContent class="space-y-3">
              <template v-if="topProductsBars.length">
                <div v-for="row in topProductsBars" :key="row.product_id" class="space-y-1">
                  <div class="flex justify-between gap-2 text-xs">
                    <span class="truncate font-medium">{{ row.name || '—' }}</span>
                    <span class="tabular-nums text-muted-foreground shrink-0">{{ formatQty(row.qty_sold) }}</span>
                  </div>
                  <div class="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      class="h-full rounded-full bg-primary transition-[width] duration-300"
                      :style="{ width: `${row.pct}%` }"
                    />
                  </div>
                </div>
              </template>
              <p v-else class="text-sm text-muted-foreground">Aucune vente sur la période.</p>
            </CardContent>
          </Card>
        </div>

        <Card class="w-full">
          <CardHeader>
            <CardTitle>Répartition du catalogue</CardTitle>
            <p class="text-xs text-muted-foreground">Produits au-dessus du seuil min. vs stock faible</p>
          </CardHeader>
          <CardContent class="space-y-2">
            <div v-if="stats.product_count" class="flex h-3 w-full overflow-hidden rounded-full border border-border">
              <div
                class="bg-emerald-500/85 dark:bg-emerald-500/70 transition-[width] duration-300"
                :style="{ width: `${stockOkPct}%` }"
                title="Stock OK"
              />
              <div
                class="bg-amber-500/85 dark:bg-amber-500/70 transition-[width] duration-300"
                :style="{ width: `${stockLowPct}%` }"
                title="Stock faible"
              />
            </div>
            <p v-else class="text-sm text-muted-foreground">Aucun produit enregistré.</p>
            <div class="flex flex-wrap gap-4 text-xs text-muted-foreground">
              <span class="inline-flex items-center gap-1.5">
                <span class="inline-block size-2 rounded-sm bg-emerald-500/85 dark:bg-emerald-500/70" />
                OK : <strong class="text-foreground">{{ stockOkCount }}</strong>
              </span>
              <span class="inline-flex items-center gap-1.5">
                <span class="inline-block size-2 rounded-sm bg-amber-500/85 dark:bg-amber-500/70" />
                Faible : <strong class="text-foreground">{{ stats.low_stock_count }}</strong>
              </span>
            </div>
          </CardContent>
        </Card>

        <div class="grid gap-4 lg:grid-cols-2">
          <Card class="w-full">
            <CardHeader><CardTitle>Alertes — stock faible</CardTitle></CardHeader>
            <CardContent class="max-h-[calc(100dvh-18rem)] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead class="text-right">Stock</TableHead>
                    <TableHead class="text-right">Seuil min.</TableHead>
                    <TableHead>SKU</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="p in alerts.low_stock" :key="p.id">
                    <TableCell class="font-medium">{{ p.name }}</TableCell>
                    <TableCell class="text-right tabular-nums">{{ formatQty(p.quantity_on_hand) }}</TableCell>
                    <TableCell class="text-right tabular-nums">{{ formatQty(p.min_stock) }}</TableCell>
                    <TableCell class="text-muted-foreground">{{ p.sku || '—' }}</TableCell>
                  </TableRow>
                  <TableRow v-if="!alerts.low_stock?.length">
                    <TableCell colspan="4" class="text-center text-muted-foreground">Aucune alerte</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card class="w-full">
            <CardHeader><CardTitle>Alertes — expiration proche</CardTitle></CardHeader>
            <CardContent class="max-h-[calc(100dvh-18rem)] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produit</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead class="text-right">Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="p in alerts.expiring_soon" :key="p.id">
                    <TableCell class="font-medium">{{ p.name }}</TableCell>
                    <TableCell class="tabular-nums">{{ p.expires_at }}</TableCell>
                    <TableCell class="text-right tabular-nums">{{ formatQty(p.quantity_on_hand) }}</TableCell>
                  </TableRow>
                  <TableRow v-if="!alerts.expiring_soon?.length">
                    <TableCell colspan="3" class="text-center text-muted-foreground">Aucune</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>

    <Dialog :open="showProductDialog" @update:open="(v) => (showProductDialog = v)">
      <DialogContent class="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{{ editingProduct ? 'Modifier produit' : 'Nouveau produit' }}</DialogTitle>
          <DialogDescription>Renseignez les informations du produit.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-3 py-2">
          <div class="space-y-1">
            <Label>Nom</Label>
            <Input v-model="productForm.name" />
          </div>
          <div class="space-y-1">
            <Label>SKU</Label>
            <Input v-model="productForm.sku" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <Label>Prix vente</Label>
              <Input v-model="productForm.sale_price" type="number" step="1" min="0" />
            </div>
            <div class="space-y-1">
              <Label>Prix achat</Label>
              <Input v-model="productForm.purchase_price" type="number" step="1" min="0" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <Label>Stock</Label>
              <Input v-model="productForm.quantity_on_hand" type="number" step="1" min="0" />
            </div>
            <div class="space-y-1">
              <Label>Stock min.</Label>
              <Input v-model="productForm.min_stock" type="number" step="1" min="0" />
            </div>
          </div>
          <Button @click="saveProduct">Enregistrer</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
