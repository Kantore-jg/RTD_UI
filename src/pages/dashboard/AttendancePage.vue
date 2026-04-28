<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { cn } from '@/lib/utils'
import {
  Clock, MapPin, QrCode, Calendar, AlertCircle,
  CheckCircle2, Zap, BarChart3, TrendingUp, Filter,
  Users, ArrowUpRight, Search, Download,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { attendanceService } from '@/services/attendance'

const authStore = useAuthStore()
const { user, isAdmin, isEmployee } = storeToRefs(authStore)

const today = new Date().toISOString().split('T')[0]

const loading = ref(false)
const attendanceData = ref([])
const apiStats = ref(null)

const isClockedIn = ref(false)
const clockInTime = ref(null)
const currentTime = ref(
  new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
)
const activeTab = ref('today')
const filterPeriod = ref('week')
const searchTerm = ref('')

let timer = null

async function fetchAttendance() {
  try {
    loading.value = true
    const response = await attendanceService.list()
    const raw = response.data.data || response.data
    attendanceData.value = (Array.isArray(raw) ? raw : []).map(r => ({
      ...r,
      nom: r.employee?.name || r.nom || 'Inconnu',
      employeeId: r.employee_id || r.employeeId,
      poste: r.poste || '',
      arrivee: r.arrivee || '—',
      depart: r.depart || '—',
    }))
  } catch (err) {
    toast.error('Erreur lors du chargement des présences')
  } finally {
    loading.value = false
  }
}

async function fetchStats() {
  try {
    const response = await attendanceService.stats({ period: filterPeriod.value })
    apiStats.value = response.data.data || response.data
  } catch {
    apiStats.value = null
  }
}

onMounted(async () => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, 1000)

  await fetchAttendance()

  const myEmpId = user.value?.employee?.id || user.value?.employee_id
  const myTodayRecord = attendanceData.value.find(
    r => r.date === today && (r.employee_id === myEmpId || r.employeeId === myEmpId)
  )
  if (myTodayRecord && myTodayRecord.arrivee && myTodayRecord.arrivee !== '—') {
    isClockedIn.value = !myTodayRecord.depart || myTodayRecord.depart === '—'
    clockInTime.value = myTodayRecord.arrivee
  }

  await fetchStats()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

async function toggleClock() {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  if (!isClockedIn.value) {
    try {
      await attendanceService.clockIn({ poste: user.value?.poste || 'Employé' })
      isClockedIn.value = true
      clockInTime.value = timeStr
      toast.success(`Arrivée enregistrée à ${timeStr}`)
      await fetchAttendance()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du pointage d\'arrivée')
    }
  } else {
    try {
      await attendanceService.clockOut()
      isClockedIn.value = false
      toast.success(`Sortie enregistrée à ${timeStr}`)
      await fetchAttendance()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors du pointage de sortie')
    }
  }
}

function handleQrScan() {
  toast.info('Scan QR Code en cours de developpement... we\'re trying to do our best to make it work on the application mobile.')
}

function applyRoleFilter(records) {
  if (isEmployee.value && user.value?.employeeId) {
    return records.filter(r => r.employeeId === user.value.employeeId)
  }
  return records
}

const todayRecords = computed(() => {
  let records = attendanceData.value.filter(e => e.date === today)
  records = applyRoleFilter(records)
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    records = records.filter(r => r.nom.toLowerCase().includes(term) || r.poste.toLowerCase().includes(term))
  }
  return records
})

const filteredRecords = computed(() => {
  const now = new Date()
  let records = attendanceData.value.filter(e => {
    const d = new Date(e.date)
    const diffDays = (now - d) / (1000 * 60 * 60 * 24)
    if (filterPeriod.value === 'day') return diffDays < 1
    if (filterPeriod.value === 'week') return diffDays <= 7
    if (filterPeriod.value === 'month') return diffDays <= 30
    if (filterPeriod.value === 'year') return diffDays <= 365
    return true
  })
  records = applyRoleFilter(records)
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()
    records = records.filter(r => r.nom.toLowerCase().includes(term) || r.poste.toLowerCase().includes(term))
  }
  return records.sort((a, b) => b.date.localeCompare(a.date))
})

const stats = computed(() => {
  if (apiStats.value) return apiStats.value
  const records = filteredRecords.value
  const total = records.length
  const present = records.filter(r => r.statut === 'Présent').length
  const absent = records.filter(r => r.statut === 'Absent').length
  const late = records.filter(r => r.statut === 'Retard').length
  return {
    total,
    present,
    absent,
    late,
    punctuality: total > 0 ? Math.round((present / total) * 100) : 0,
    absentRate: total > 0 ? Math.round((absent / total) * 100) : 0,
  }
})

const weeklyStats = computed(() => {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven']
  const now = new Date()
  const dayOfWeek = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  const uniqueEmployees = new Set(attendanceData.value.map(r => r.employeeId))
  const totalEmployees = uniqueEmployees.size

  return days.map((day, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = d.toISOString().split('T')[0]
    let dayRecords = attendanceData.value.filter(r => r.date === dateStr)
    if (isEmployee.value && user.value?.employeeId) {
      dayRecords = dayRecords.filter(r => r.employeeId === user.value.employeeId)
    }
    const present = dayRecords.filter(r => r.statut === 'Présent' || r.statut === 'Retard').length
    const total = isEmployee.value ? 1 : totalEmployees
    return { day, present, total, date: dateStr }
  })
})

async function exportAttendance() {
  try {
    const response = await attendanceService.exportCsv({ period: filterPeriod.value })
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `presence_${filterPeriod.value}_${today}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    toast.success('Données de présence exportées')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Erreur lors de l\'export')
  }
}

function statutVariant(statut) {
  switch (statut) {
    case 'Présent': return 'default'
    case 'Absent': return 'destructive'
    case 'Retard': return 'secondary'
    default: return 'outline'
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">{{ isEmployee ? 'Ma Présence' : 'Présence' }}</h1>
        <p class="text-muted-foreground">{{ isEmployee ? 'Suivez vos pointages et votre historique de présence.' : 'Suivi des pointages et de la présence du personnel.' }}</p>
      </div>
      <div class="flex items-center gap-2">
        <Button v-if="isAdmin" variant="outline" class="font-bold border-2" @click="exportAttendance">
          <Download class="w-4 h-4 mr-2" />Exporter
        </Button>
        <Badge variant="outline" class="text-sm px-3 py-1">
          <Calendar class="mr-2 h-3.5 w-3.5" />
          {{ new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
        </Badge>
      </div>
    </div>

    <!-- Main Grid -->
    <div class="grid gap-6 lg:grid-cols-3">
      <!-- Quick Clock Card -->
      <Card class="lg:col-span-1">
        <CardHeader>
          <CardTitle>Pointage Rapide</CardTitle>
          <CardDescription>Enregistrez votre arrivée ou départ</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col items-center gap-6">
          <div class="flex flex-col items-center gap-2">
            <div class="text-5xl font-bold tracking-tight tabular-nums">{{ currentTime }}</div>
            <div class="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin class="h-3.5 w-3.5" />
              <span>Siège — Bâtiment A</span>
            </div>
          </div>
          <Badge :variant="isClockedIn ? 'default' : 'secondary'" class="text-sm px-4 py-1">
            <component :is="isClockedIn ? CheckCircle2 : Clock" class="mr-2 h-3.5 w-3.5" />
            {{ isClockedIn ? `Pointé à ${clockInTime} — En service` : 'Non pointé' }}
          </Badge>
          <div class="flex flex-col gap-3 w-full">
            <Button
              :class="cn('w-full', isClockedIn ? 'bg-red-600 hover:bg-red-700' : '')"
              @click="toggleClock"
            >
              <Zap class="mr-2 h-4 w-4" />
              {{ isClockedIn ? 'Pointer la sortie' : "Pointer l'arrivée" }}
            </Button>
            <Button variant="outline" class="w-full" @click="handleQrScan">
              <QrCode class="mr-2 h-4 w-4" />
              Scanner QR Code
            </Button>
          </div>
        </CardContent>
      </Card>

      <!-- Day Register Table -->
      <Card class="lg:col-span-2">
        <CardHeader>
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle>Registre du Jour</CardTitle>
              <CardDescription>{{ isEmployee ? 'Votre pointage aujourd\'hui' : 'Présence de l\'ensemble du personnel' }}</CardDescription>
            </div>
            <div v-if="isAdmin" class="relative w-full sm:w-48">
              <Search class="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
              <Input v-model="searchTerm" placeholder="Rechercher..." class="pl-8 h-9 text-xs border-2" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Poste</TableHead>
                <TableHead>Arrivée</TableHead>
                <TableHead>Départ</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="entry in todayRecords" :key="entry.id">
                <TableCell class="font-medium">{{ entry.nom }}</TableCell>
                <TableCell class="text-sm text-muted-foreground">{{ entry.poste }}</TableCell>
                <TableCell class="font-mono text-sm">{{ entry.arrivee }}</TableCell>
                <TableCell class="font-mono text-sm">{{ entry.depart }}</TableCell>
                <TableCell>
                  <Badge :variant="statutVariant(entry.statut)">{{ entry.statut }}</Badge>
                </TableCell>
              </TableRow>
              <TableRow v-if="todayRecords.length === 0">
                <TableCell colspan="5" class="text-center py-8 text-muted-foreground">Aucun enregistrement aujourd'hui</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>

    <!-- Statistics Section -->
    <Tabs v-model="activeTab" class="space-y-6">
      <TabsList class="bg-muted p-1 border h-11 rounded-xl gap-1">
        <TabsTrigger value="today" class="font-bold data-[state=active]:bg-background rounded-lg px-4 text-xs">Aujourd'hui</TabsTrigger>
        <TabsTrigger value="stats" class="font-bold data-[state=active]:bg-background rounded-lg px-4 text-xs">
          <BarChart3 class="w-3.5 h-3.5 mr-1.5" />Statistiques
        </TabsTrigger>
        <TabsTrigger value="history" class="font-bold data-[state=active]:bg-background rounded-lg px-4 text-xs">Historique</TabsTrigger>
      </TabsList>

      <TabsContent value="today">
        <div class="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Ponctualité</CardTitle>
              <CheckCircle2 class="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stats.punctuality }}%</div>
              <p class="text-xs text-muted-foreground">Taux de ponctualité</p>
              <Progress :value="stats.punctuality" class="h-1.5 mt-2" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Absences</CardTitle>
              <AlertCircle class="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stats.absent }}</div>
              <p class="text-xs text-muted-foreground">{{ isEmployee ? 'Jours d\'absence' : 'Employés absents aujourd\'hui' }}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle class="text-sm font-medium">Retards</CardTitle>
              <Clock class="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div class="text-2xl font-bold">{{ stats.late }}</div>
              <p class="text-xs text-muted-foreground">{{ isEmployee ? 'Retards enregistrés' : 'Employés en retard aujourd\'hui' }}</p>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="stats">
        <div class="space-y-6">
          <div class="flex items-center gap-3">
            <select v-model="filterPeriod" class="h-10 px-3 rounded-md border-2 text-sm bg-white font-bold">
              <option value="day">Aujourd'hui</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
              <option value="year">Cette année</option>
            </select>
            <Input v-if="isAdmin" v-model="searchTerm" placeholder="Filtrer par nom..." class="max-w-xs border-2" />
          </div>

          <div class="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent class="pt-6">
                <div class="text-center">
                  <p class="text-3xl font-bold text-emerald-600">{{ stats.punctuality }}%</p>
                  <p class="text-xs text-muted-foreground mt-1">Taux de ponctualité</p>
                  <Progress :value="stats.punctuality" class="h-2 mt-3" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent class="pt-6">
                <div class="text-center">
                  <p class="text-3xl font-bold text-blue-600">{{ stats.present }}</p>
                  <p class="text-xs text-muted-foreground mt-1">Présences</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent class="pt-6">
                <div class="text-center">
                  <p class="text-3xl font-bold text-red-600">{{ stats.absent }}</p>
                  <p class="text-xs text-muted-foreground mt-1">Absences</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent class="pt-6">
                <div class="text-center">
                  <p class="text-3xl font-bold text-orange-600">{{ stats.late }}</p>
                  <p class="text-xs text-muted-foreground mt-1">Retards</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <!-- Weekly chart -->
          <Card>
            <CardHeader>
              <CardTitle class="text-sm font-bold">Présence hebdomadaire</CardTitle>
              <CardDescription>{{ isEmployee ? 'Votre présence cette semaine' : 'Vue d\'ensemble de la semaine en cours' }}</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="flex items-end gap-6 h-48 justify-center pb-2">
                <div v-for="(d, i) in weeklyStats" :key="i" class="flex flex-col items-center gap-2 flex-1 max-w-[80px]">
                  <div class="text-xs font-bold" :class="d.present > 0 ? 'text-emerald-600' : 'text-slate-400'">
                    {{ d.total > 0 ? Math.round(d.present / d.total * 100) : 0 }}%
                  </div>
                  <div class="w-full bg-slate-100 rounded-t-lg relative" style="height: 120px">
                    <div
                      class="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg transition-all"
                      :style="{ height: d.total > 0 ? (d.present / d.total * 100) + '%' : '0%' }"
                    />
                  </div>
                  <span class="text-xs font-bold text-slate-500">{{ d.day }}</span>
                  <span class="text-[10px] text-slate-400">{{ d.present }}/{{ d.total }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="history">
        <Card>
          <CardHeader>
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <CardTitle class="text-sm font-bold">Historique complet</CardTitle>
              <div class="flex items-center gap-2">
                <Input v-if="isAdmin" v-model="searchTerm" placeholder="Rechercher..." class="h-9 w-48 border text-xs" />
                <select v-model="filterPeriod" class="h-9 px-3 rounded-md border text-sm bg-white">
                  <option value="day">Aujourd'hui</option>
                  <option value="week">7 derniers jours</option>
                  <option value="month">30 derniers jours</option>
                  <option value="year">Cette année</option>
                </select>
                <Button v-if="isAdmin" variant="outline" size="sm" class="h-9 text-xs font-bold" @click="exportAttendance">
                  <Download class="w-3.5 h-3.5 mr-1" />CSV
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Nom</TableHead>
                  <TableHead>Poste</TableHead>
                  <TableHead>Arrivée</TableHead>
                  <TableHead>Départ</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="entry in filteredRecords" :key="entry.id">
                  <TableCell class="font-medium text-xs">{{ entry.date }}</TableCell>
                  <TableCell class="font-medium">{{ entry.nom }}</TableCell>
                  <TableCell class="text-sm text-muted-foreground">{{ entry.poste }}</TableCell>
                  <TableCell class="font-mono text-sm">{{ entry.arrivee }}</TableCell>
                  <TableCell class="font-mono text-sm">{{ entry.depart }}</TableCell>
                  <TableCell>
                    <Badge :variant="statutVariant(entry.statut)">{{ entry.statut }}</Badge>
                  </TableCell>
                </TableRow>
                <TableRow v-if="filteredRecords.length === 0">
                  <TableCell colspan="6" class="text-center py-8 text-muted-foreground">Aucun enregistrement trouvé</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
