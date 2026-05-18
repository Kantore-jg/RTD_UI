<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { BookOpen, Plus, Trash2, UserPlus, Library, BarChart3, BookMarked, Users, AlertTriangle } from 'lucide-vue-next'
import LineChart from '@/components/charts/LineChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import DoughnutChart from '@/components/charts/DoughnutChart.vue'
import { getChartColors, withAlpha } from '@/lib/chart'
import { formatQty } from '@/lib/utils'
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
import { libraryService } from '@/services/library'

const tab = ref('books')
const books = ref([])
const members = ref([])
const borrowings = ref([])
const categories = ref([])
const authors = ref([])
const stats = ref({
  book_count: 0,
  member_count: 0,
  active_borrowings: 0,
  overdue_count: 0,
  period_days: 30,
  popular_books: [],
  borrowings_by_day: [],
  copies: { total: 0, available: 0, on_loan: 0 },
  borrowing_status: [],
  books_by_category: [],
})

const bookSearch = ref('')
const showBookDialog = ref(false)
const editingBook = ref(null)
const bookForm = ref({
  title: '', isbn: '', year: '', language: '', description: '', copies_total: 1, copies_available: 1,
  library_book_category_id: '', author_ids: [],
})

const memberSearch = ref('')
const showMemberDialog = ref(false)
const memberForm = ref({ name: '', card_number: '', email: '', phone: '', member_type: 'reader' })

const borrowForm = ref({ library_book_id: '', library_member_id: '', notes: '' })
const bookQuery = ref('')
const bookHits = ref([])

function unwrapPaginated(res) {
  return res.data?.data ?? res.data
}

async function fetchCategories() {
  const { data } = await libraryService.bookCategories()
  categories.value = Array.isArray(data) ? data : []
}

async function fetchAuthors() {
  const { data } = await libraryService.authors({ per_page: 100 })
  const body = data.data || data
  authors.value = body.data || body || []
}

async function fetchBooks() {
  try {
    const res = await libraryService.books({ search: bookSearch.value || undefined })
    const body = unwrapPaginated(res)
    books.value = body.data || body
  } catch {
    toast.error('Erreur chargement livres')
  }
}

async function fetchMembers() {
  try {
    const res = await libraryService.members({ search: memberSearch.value || undefined })
    const body = unwrapPaginated(res)
    members.value = body.data || body
  } catch {
    toast.error('Erreur membres')
  }
}

async function fetchBorrowings() {
  try {
    const res = await libraryService.borrowings({ active: 1 })
    const body = unwrapPaginated(res)
    borrowings.value = body.data || body
  } catch {
    toast.error('Erreur emprunts')
  }
}

async function fetchStats() {
  try {
    const { data } = await libraryService.stats()
    stats.value = data.data || data
  } catch { /* ignore */ }
}

onMounted(async () => {
  await fetchCategories()
  await fetchAuthors()
  await fetchBooks()
})

watch(tab, async (t) => {
  if (t === 'members') await fetchMembers()
  if (t === 'borrow') await fetchMembers()
  if (t === 'borrow') await fetchBooks()
  if (t === 'borrowings') await fetchBorrowings()
  if (t === 'stats') await fetchStats()
})

let bookListTimer
watch(bookSearch, () => {
  clearTimeout(bookListTimer)
  bookListTimer = setTimeout(fetchBooks, 350)
})

let memberSearchTimer
watch(memberSearch, () => {
  clearTimeout(memberSearchTimer)
  memberSearchTimer = setTimeout(fetchMembers, 350)
})

function openNewBook() {
  editingBook.value = null
  bookForm.value = {
    title: '', isbn: '', year: '', language: '', description: '', copies_total: 1, copies_available: 1,
    library_book_category_id: '', author_ids: [],
  }
  showBookDialog.value = true
}

function openEditBook(b) {
  editingBook.value = b
  bookForm.value = {
    title: b.title,
    isbn: b.isbn || '',
    year: b.year ? String(b.year) : '',
    language: b.language || '',
    description: b.description || '',
    copies_total: b.copies_total,
    copies_available: b.copies_available,
    library_book_category_id: b.library_book_category_id || '',
    author_ids: (b.authors || []).map((a) => a.id),
  }
  showBookDialog.value = true
}

async function saveBook() {
  try {
    const payload = {
      title: bookForm.value.title,
      isbn: bookForm.value.isbn || null,
      year: bookForm.value.year ? Number(bookForm.value.year) : null,
      language: bookForm.value.language || null,
      description: bookForm.value.description || null,
      copies_total: Number(bookForm.value.copies_total) || 1,
      copies_available: Number(bookForm.value.copies_available) || Number(bookForm.value.copies_total) || 1,
      library_book_category_id: bookForm.value.library_book_category_id || null,
      author_ids: bookForm.value.author_ids?.length ? bookForm.value.author_ids : [],
    }
    if (editingBook.value) {
      await libraryService.updateBook(editingBook.value.id, payload)
      toast.success('Livre mis à jour')
    } else {
      await libraryService.createBook(payload)
      toast.success('Livre créé')
    }
    showBookDialog.value = false
    await fetchBooks()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erreur')
  }
}

async function deleteBook(b) {
  if (!confirm(`Supprimer « ${b.title} » ?`)) return
  try {
    await libraryService.deleteBook(b.id)
    toast.success('Supprimé')
    await fetchBooks()
  } catch {
    toast.error('Suppression impossible')
  }
}

async function searchBooksForBorrow() {
  if (!bookQuery.value.trim()) {
    bookHits.value = []
    return
  }
  try {
    const { data } = await libraryService.searchBooks(bookQuery.value)
    bookHits.value = Array.isArray(data) ? data : []
  } catch {
    bookHits.value = []
  }
}

async function saveMember() {
  try {
    await libraryService.createMember(memberForm.value)
    toast.success('Membre créé')
    showMemberDialog.value = false
    memberForm.value = { name: '', card_number: '', email: '', phone: '', member_type: 'reader' }
    await fetchMembers()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erreur')
  }
}

async function submitBorrow() {
  try {
    await libraryService.createBorrowing({
      library_book_id: Number(borrowForm.value.library_book_id),
      library_member_id: Number(borrowForm.value.library_member_id),
      notes: borrowForm.value.notes || undefined,
    })
    toast.success('Emprunt enregistré')
    borrowForm.value = { library_book_id: '', library_member_id: '', notes: '' }
    await fetchBorrowings()
    await fetchBooks()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erreur emprunt')
  }
}

async function returnBorrowing(id) {
  try {
    await libraryService.returnBorrowing(id)
    toast.success('Retour enregistré')
    await fetchBorrowings()
    await fetchBooks()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Erreur retour')
  }
}

function pickBookForBorrow(b) {
  borrowForm.value.library_book_id = String(b.id)
}

const chartDayFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })

function formatChartDay(iso) {
  if (!iso) return ''
  const d = new Date(`${iso}T12:00:00`)
  if (Number.isNaN(d.getTime())) return iso
  return chartDayFormatter.format(d)
}

const borrowingsChartLabels = computed(() =>
  (stats.value.borrowings_by_day || []).map((d) => formatChartDay(d.day)),
)

const borrowingsChartDatasets = computed(() => {
  const color = getChartColors(1)[0]
  return [{
    label: 'Nouveaux emprunts',
    data: (stats.value.borrowings_by_day || []).map((d) => d.count),
    borderColor: color,
    backgroundColor: withAlpha(color, 0.15),
    fill: true,
    tension: 0.35,
    pointRadius: 3,
    pointHoverRadius: 5,
  }]
})

const popularChartLabels = computed(() =>
  (stats.value.popular_books || []).map((p) => p.title || '—'),
)

const popularChartDatasets = computed(() => {
  const color = getChartColors(1)[0]
  return [{
    label: 'Emprunts',
    data: (stats.value.popular_books || []).map((p) => p.borrow_count),
    backgroundColor: withAlpha(color, 0.85),
    borderRadius: 6,
  }]
})

const copiesChartLabels = computed(() => ['Disponibles', 'En prêt'])

const copiesChartDatasets = computed(() => {
  const colors = getChartColors(2)
  const c = stats.value.copies || {}
  return [{
    data: [c.available || 0, c.on_loan || 0],
    backgroundColor: [withAlpha(colors[0], 0.9), withAlpha(colors[1], 0.9)],
    borderWidth: 0,
  }]
})

const statusChartLabels = computed(() =>
  (stats.value.borrowing_status || []).map((s) => s.label),
)

const statusChartDatasets = computed(() => {
  const colors = getChartColors(3)
  return [{
    data: (stats.value.borrowing_status || []).map((s) => s.count),
    backgroundColor: colors.map((c) => withAlpha(c, 0.9)),
    borderWidth: 0,
  }]
})

const categoryChartLabels = computed(() =>
  (stats.value.books_by_category || []).map((c) => c.name),
)

const categoryChartDatasets = computed(() => {
  const colors = getChartColors((stats.value.books_by_category || []).length || 1)
  return [{
    label: 'Titres',
    data: (stats.value.books_by_category || []).map((c) => c.book_count),
    backgroundColor: colors.map((c) => withAlpha(c, 0.85)),
    borderRadius: 6,
  }]
})
</script>

<template>
  <div class="space-y-6 w-full min-h-0">
    <div>
      <h1 class="text-2xl font-bold tracking-tight flex items-center gap-2">
        <Library class="w-7 h-7 text-primary" />
        Bibliothèque
      </h1>
      <p class="text-muted-foreground text-sm">Livres, membres et emprunts.</p>
    </div>

    <Tabs v-model="tab" class="w-full">
      <TabsList class="flex flex-wrap h-auto gap-1">
        <TabsTrigger value="books">Livres</TabsTrigger>
        <TabsTrigger value="members">Membres</TabsTrigger>
        <TabsTrigger value="borrow">Nouvel emprunt</TabsTrigger>
        <TabsTrigger value="borrowings">Emprunts en cours</TabsTrigger>
        <TabsTrigger value="stats">Statistiques</TabsTrigger>
      </TabsList>

      <TabsContent value="books" class="mt-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between gap-4">
            <CardTitle class="flex items-center gap-2"><BookOpen class="w-5 h-5" /> Catalogue</CardTitle>
            <div class="flex gap-2">
              <Input v-model="bookSearch" placeholder="Rechercher…" class="w-48" />
              <Button @click="openNewBook"><Plus class="w-4 h-4 mr-1" /> Livre</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead>ISBN</TableHead>
                  <TableHead class="text-right">Dispo / Total</TableHead>
                  <TableHead class="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="b in books" :key="b.id">
                  <TableCell>{{ b.title }}</TableCell>
                  <TableCell class="text-muted-foreground">{{ b.isbn || '—' }}</TableCell>
                  <TableCell class="text-right">{{ b.copies_available }} / {{ b.copies_total }}</TableCell>
                  <TableCell class="text-right space-x-1">
                    <Button variant="ghost" size="sm" @click="openEditBook(b)">Modifier</Button>
                    <Button variant="ghost" size="sm" class="text-destructive" @click="deleteBook(b)">
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="members" class="mt-4">
        <Card>
          <CardHeader class="flex flex-row items-center justify-between gap-4">
            <CardTitle class="flex items-center gap-2"><UserPlus class="w-5 h-5" /> Membres</CardTitle>
            <div class="flex gap-2">
              <Input v-model="memberSearch" placeholder="Rechercher…" class="w-48" />
              <Button @click="showMemberDialog = true"><Plus class="w-4 h-4 mr-1" /> Membre</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Carte</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="m in members" :key="m.id">
                  <TableCell>{{ m.name }}</TableCell>
                  <TableCell>{{ m.card_number || '—' }}</TableCell>
                  <TableCell>{{ m.member_type }}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="borrow" class="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recherche livre</CardTitle></CardHeader>
          <CardContent class="space-y-3">
            <div class="flex gap-2">
              <Input v-model="bookQuery" placeholder="Titre, ISBN, auteur…" @keyup.enter="searchBooksForBorrow" />
              <Button type="button" variant="secondary" @click="searchBooksForBorrow">Chercher</Button>
            </div>
            <ul class="border rounded-md divide-y max-h-64 overflow-auto text-sm">
              <li
                v-for="b in bookHits"
                :key="b.id"
                class="flex items-center justify-between px-3 py-2 hover:bg-muted/50"
              >
                <span>{{ b.title }} <span class="text-muted-foreground">({{ b.copies_available }} dispo)</span></span>
                <Button size="sm" variant="outline" @click="pickBookForBorrow(b)">Sélectionner</Button>
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Emprunt</CardTitle></CardHeader>
          <CardContent class="grid gap-3">
            <div class="space-y-1">
              <Label>ID livre sélectionné</Label>
              <Input v-model="borrowForm.library_book_id" type="number" placeholder="ID livre" />
            </div>
            <div class="space-y-1">
              <Label>ID membre</Label>
              <Input v-model="borrowForm.library_member_id" type="number" placeholder="ID membre" />
            </div>
            <div class="space-y-1">
              <Label>Notes</Label>
              <Input v-model="borrowForm.notes" />
            </div>
            <Button @click="submitBorrow">Valider l'emprunt</Button>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="borrowings" class="mt-4">
        <Card>
          <CardHeader><CardTitle>Emprunts actifs</CardTitle></CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Livre</TableHead>
                  <TableHead>Membre</TableHead>
                  <TableHead>Retour prévu</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead class="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="br in borrowings" :key="br.id">
                  <TableCell>{{ br.book?.title }}</TableCell>
                  <TableCell>{{ br.member?.name }}</TableCell>
                  <TableCell>{{ br.due_at }}</TableCell>
                  <TableCell>{{ br.status }}</TableCell>
                  <TableCell>
                    <Button
                      v-if="br.status !== 'returned'"
                      size="sm"
                      variant="outline"
                      @click="returnBorrowing(br.id)"
                    >
                      Retour
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
              <CardTitle class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookMarked class="w-4 h-4" /> Titres
              </CardTitle>
            </CardHeader>
            <CardContent class="text-2xl font-semibold tabular-nums">{{ stats.book_count }}</CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users class="w-4 h-4" /> Membres
              </CardTitle>
            </CardHeader>
            <CardContent class="text-2xl font-semibold tabular-nums">{{ stats.member_count }}</CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <BookOpen class="w-4 h-4" /> Emprunts actifs
              </CardTitle>
            </CardHeader>
            <CardContent class="text-2xl font-semibold tabular-nums">{{ stats.active_borrowings }}</CardContent>
          </Card>
          <Card>
            <CardHeader class="pb-2">
              <CardTitle class="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle class="w-4 h-4" /> Retards
              </CardTitle>
            </CardHeader>
            <CardContent class="text-2xl font-semibold tabular-nums text-amber-600 dark:text-amber-400">
              {{ stats.overdue_count }}
            </CardContent>
          </Card>
        </div>

        <div class="grid gap-4 xl:grid-cols-2">
          <Card class="w-full">
            <CardHeader>
              <CardTitle class="flex items-center gap-2">
                <BarChart3 class="w-5 h-5" />
                Emprunts par jour
              </CardTitle>
              <p class="text-xs text-muted-foreground">{{ stats.period_days }} derniers jours</p>
            </CardHeader>
            <CardContent>
              <LineChart
                v-if="borrowingsChartLabels.length"
                :labels="borrowingsChartLabels"
                :datasets="borrowingsChartDatasets"
              />
              <p v-else class="text-sm text-muted-foreground">Aucun emprunt sur la période.</p>
            </CardContent>
          </Card>

          <Card class="w-full">
            <CardHeader>
              <CardTitle>Livres les plus empruntés</CardTitle>
              <p class="text-xs text-muted-foreground">Top 5 sur la période</p>
            </CardHeader>
            <CardContent>
              <BarChart
                v-if="popularChartLabels.length"
                :labels="popularChartLabels"
                :datasets="popularChartDatasets"
                horizontal
              />
              <p v-else class="text-sm text-muted-foreground">Aucune donnée.</p>
            </CardContent>
          </Card>
        </div>

        <div class="grid gap-4 lg:grid-cols-3">
          <Card class="w-full">
            <CardHeader>
              <CardTitle>Exemplaires</CardTitle>
              <p class="text-xs text-muted-foreground">
                {{ formatQty(stats.copies?.total) }} au total
              </p>
            </CardHeader>
            <CardContent>
              <DoughnutChart
                v-if="(stats.copies?.total || 0) > 0"
                :labels="copiesChartLabels"
                :datasets="copiesChartDatasets"
              />
              <p v-else class="text-sm text-muted-foreground">Aucun exemplaire.</p>
            </CardContent>
          </Card>

          <Card class="w-full">
            <CardHeader>
              <CardTitle>État des emprunts</CardTitle>
            </CardHeader>
            <CardContent>
              <DoughnutChart
                v-if="statusChartLabels.length"
                :labels="statusChartLabels"
                :datasets="statusChartDatasets"
              />
              <p v-else class="text-sm text-muted-foreground">Aucun emprunt.</p>
            </CardContent>
          </Card>

          <Card class="w-full">
            <CardHeader>
              <CardTitle>Catalogue par catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                v-if="categoryChartLabels.length"
                :labels="categoryChartLabels"
                :datasets="categoryChartDatasets"
              />
              <p v-else class="text-sm text-muted-foreground">Aucune catégorie.</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>

    <Dialog :open="showBookDialog" @update:open="(v) => (showBookDialog = v)">
      <DialogContent class="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{{ editingBook ? 'Modifier livre' : 'Nouveau livre' }}</DialogTitle>
          <DialogDescription>Informations du document.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-3 py-2">
          <div class="space-y-1">
            <Label>Titre</Label>
            <Input v-model="bookForm.title" />
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <Label>ISBN</Label>
              <Input v-model="bookForm.isbn" />
            </div>
            <div class="space-y-1">
              <Label>Année</Label>
              <Input v-model="bookForm.year" type="number" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2">
            <div class="space-y-1">
              <Label>Exemplaires total</Label>
              <Input v-model.number="bookForm.copies_total" type="number" min="1" />
            </div>
            <div class="space-y-1">
              <Label>Disponibles</Label>
              <Input v-model.number="bookForm.copies_available" type="number" min="0" />
            </div>
          </div>
          <div class="space-y-1">
            <Label>Catégorie</Label>
            <select v-model="bookForm.library_book_category_id" class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">
              <option value="">—</option>
              <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>
          <div class="space-y-1">
            <Label>Auteurs</Label>
            <div class="border rounded-md p-2 max-h-32 overflow-y-auto text-sm space-y-1">
              <label v-for="a in authors" :key="a.id" class="flex items-center gap-2">
                <input
                  v-model="bookForm.author_ids"
                  type="checkbox"
                  :value="a.id"
                  class="rounded"
                >
                <span>{{ a.name }}</span>
              </label>
            </div>
          </div>
          <Button @click="saveBook">Enregistrer</Button>
        </div>
      </DialogContent>
    </Dialog>

    <Dialog :open="showMemberDialog" @update:open="(v) => (showMemberDialog = v)">
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau membre</DialogTitle>
          <DialogDescription>Lecteur ou abonné.</DialogDescription>
        </DialogHeader>
        <div class="grid gap-3 py-2">
          <div class="space-y-1"><Label>Nom</Label><Input v-model="memberForm.name" /></div>
          <div class="space-y-1"><Label>N° carte</Label><Input v-model="memberForm.card_number" /></div>
          <div class="space-y-1"><Label>Email</Label><Input v-model="memberForm.email" /></div>
          <div class="space-y-1"><Label>Téléphone</Label><Input v-model="memberForm.phone" /></div>
          <Button @click="saveMember">Créer</Button>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
