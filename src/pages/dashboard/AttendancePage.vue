<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { cn, storageUrl } from '@/lib/utils'
import {
  Clock, MapPin, Calendar, AlertCircle,
  CheckCircle2, Zap, BarChart3, Search, Download, Camera, ImageIcon,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'vue-sonner'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { attendanceService } from '@/services/attendance'
import AttendancePhotoCapture from '@/components/attendance/AttendancePhotoCapture.vue'
import { useClockMetadata } from '@/composables/useClockMetadata'

const authStore = useAuthStore()
const { user, isAdmin, isEmployee, employeeId } = storeToRefs(authStore)
const { collect: collectMetadata } = useClockMetadata()

const loading = ref(false)
const clockSubmitting = ref(false)
const attendanceData = ref([])

const isClockedIn = ref(false)
const isDayComplete = ref(false)
const clockInTime = ref(null)
const clockOutTime = ref(null)
const photoDialogOpen = ref(false)
const photoCaptureMode = ref('arrivee')
const previewPhoto = ref(null)
const gpsLabel = ref(null)
const currentTime = ref(
  new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
)
const activeTab = ref('today')
const filterPeriod = ref('week')
const searchTerm = ref('')

let timer = null

function localToday() {
  return new Date().toLocaleDateString('en-CA')
}

function normalizeDate(value) {
  if (!value) return ''
  const str = String(value)
  if (str.includes('T')) {
    const d = new Date(str)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-CA')
    }
  }
  return str.length >= 10 ? str.slice(0, 10) : str
}

function formatTime(value) {
  if (value == null || value === '' || value === '—') return '—'
  const s = String(value)
  return s.length >= 5 ? s.slice(0, 5) : s
}

function sameEmployeeId(a, b) {
  if (a == null || b == null) return false
  return Number(a) === Number(b)
}

function mapAttendanceRecord(r) {
  return {
    ...r,
    date: normalizeDate(r.date),
    nom: r.employee?.name || r.nom || 'Inconnu',
    employeeId: r.employee_id ?? r.employeeId,
    poste: r.poste || '',
    arrivee: formatTime(r.arrivee),
    depart: r.depart ? formatTime(r.depart) : '—',
    arriveePhotoUrl: r.arrivee_photo_url || storageUrl(r.arrivee_photo_path) || null,
    departPhotoUrl: r.depart_photo_url || storageUrl(r.depart_photo_path) || null,
  }
}

function upsertAttendanceRecord(raw) {
  if (!raw) return
  const mapped = mapAttendanceRecord(raw)
  const idx = attendanceData.value.findIndex(
    (r) =>
      (mapped.id && r.id === mapped.id) ||
      (normalizeDate(r.date) === mapped.date && sameEmployeeId(r.employeeId, mapped.employeeId)),
  )
  if (idx >= 0) {
    attendanceData.value[idx] = { ...attendanceData.value[idx], ...mapped }
  } else {
    attendanceData.value.unshift(mapped)
  }
  syncClockState()
}

function syncClockState() {
  const myEmpId = employeeId.value
  const today = localToday()
  const myTodayRecord = attendanceData.value.find(
    (r) => normalizeDate(r.date) === today && sameEmployeeId(r.employeeId, myEmpId),
  )

  if (!myTodayRecord?.arrivee || myTodayRecord.arrivee === '—') {
    isClockedIn.value = false
    isDayComplete.value = false
    clockInTime.value = null
    clockOutTime.value = null
    return
  }

  clockInTime.value = myTodayRecord.arrivee
  const hasDepart = myTodayRecord.depart && myTodayRecord.depart !== '—'
  isDayComplete.value = hasDepart
  isClockedIn.value = !hasDepart
  clockOutTime.value = hasDepart ? myTodayRecord.depart : null
}

async function fetchAttendance({ bustCache = false } = {}) {
  try {
    loading.value = true
    const params = { per_page: 500 }
    if (isEmployee.value && employeeId.value) {
      params.employee_id = employeeId.value
    }
    if (bustCache) {
      params._refresh = Date.now()
    }
    const response = await attendanceService.list(params)
    const raw = response.data.data || response.data
    attendanceData.value = (Array.isArray(raw) ? raw : []).map(mapAttendanceRecord)
    syncClockState()
  } catch (err) {
    toast.error('Erreur lors du chargement des présences')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  timer = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }, 1000)

  await fetchAttendance()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

function openPhotoCapture() {
  if (!employeeId.value) {
    toast.error('Aucun profil employé associé à votre compte.')
    return
  }
  if (isDayComplete.value) {
    toast.info('Votre pointage du jour est déjà terminé. Aucune modification possible.')
    return
  }
  if (!isClockedIn.value && attendanceData.value.some(
    (r) => normalizeDate(r.date) === localToday() && sameEmployeeId(r.employeeId, employeeId.value),
  )) {
    toast.error('Pointage d\'arrivée déjà enregistré aujourd\'hui.')
    syncClockState()
    return
  }
  photoCaptureMode.value = isClockedIn.value ? 'depart' : 'arrivee'
  photoDialogOpen.value = true
}

async function handlePhotoCapture(photoFile) {
  clockSubmitting.value = true
  const now = new Date()
  const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

  try {
    const meta = await collectMetadata()
    const formData = new FormData()
    formData.append('photo', photoFile)
    formData.append('poste', user.value?.employee?.role || user.value?.poste || 'Employé')
    if (meta.latitude != null) formData.append('latitude', String(meta.latitude))
    if (meta.longitude != null) formData.append('longitude', String(meta.longitude))
    if (meta.device) formData.append('device', meta.device)

    if (photoCaptureMode.value === 'arrivee') {
      const { data } = await attendanceService.clockIn(formData)
      upsertAttendanceRecord(data.data ?? data)
      toast.success(`Arrivée enregistrée à ${clockInTime.value || timeStr} avec photo`)
    } else {
      const { data } = await attendanceService.clockOut(formData)
      upsertAttendanceRecord(data.data ?? data)
      toast.success(`Sortie enregistrée à ${clockOutTime.value || timeStr} avec photo`)
    }

    if (meta.latitude != null && meta.longitude != null) {
      gpsLabel.value = `${meta.latitude.toFixed(5)}, ${meta.longitude.toFixed(5)}`
    }

    photoDialogOpen.value = false
    await fetchAttendance({ bustCache: true })
  } catch (err) {
    const msg = err.response?.data?.message
    const photoErr = err.response?.data?.errors?.photo?.[0]
    toast.error(photoErr || msg || 'Erreur lors du pointage')
  } finally {
    clockSubmitting.value = false
  }
}

function showPhoto(url, label) {
  if (!url) return
  previewPhoto.value = { url, label }
}

function applyRoleFilter(records) {
  if (isEmployee.value && employeeId.value) {
    return records.filter((r) => sameEmployeeId(r.employeeId, employeeId.value))
  }
  return records
}

const todayRecords = computed(() => {
  const today = localToday()
  let records = attendanceData.value.filter(e => normalizeDate(e.date) === today)
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

const statsSource = computed(() => {
  if (activeTab.value === 'today') return todayRecords.value
  return filteredRecords.value
})

const stats = computed(() => {
  const records = statsSource.value
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
    let dayRecords = attendanceData.value.filter(r => normalizeDate(r.date) === dateStr)
    if (isEmployee.value && employeeId.value) {
      dayRecords = dayRecords.filter(r => r.employeeId === employeeId.value)
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
    link.download = `presence_${filterPeriod.value}_${localToday()}.csv`
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
        <p class="text-muted-foreground">
          {{ isEmployee
            ? 'Pointage sécurisé par photo à l\'arrivée et au départ.'
            : 'Suivi des pointages avec vérification photo du personnel.' }}
        </p>
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
          <CardTitle>Pointage sécurisé</CardTitle>
          <CardDescription>Photo obligatoire à l'arrivée et au départ</CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col items-center gap-6">
          <div class="flex flex-col items-center gap-2">
            <div class="text-5xl font-bold tracking-tight tabular-nums">{{ currentTime }}</div>
            <div class="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin class="h-3.5 w-3.5" />
              <span>{{ gpsLabel || 'GPS enregistré si autorisé' }}</span>
            </div>
          </div>
          <Badge
            :variant="isDayComplete ? 'outline' : isClockedIn ? 'default' : 'secondary'"
            class="text-sm px-4 py-1"
          >
            <component :is="isDayComplete ? CheckCircle2 : isClockedIn ? CheckCircle2 : Clock" class="mr-2 h-3.5 w-3.5" />
            <template v-if="isDayComplete">
              Journée terminée — {{ clockInTime }} → {{ clockOutTime }}
            </template>
            <template v-else-if="isClockedIn">
              Pointé à {{ clockInTime }} — En service
            </template>
            <template v-else>
              Non pointé
            </template>
          </Badge>
          <div class="flex flex-col gap-3 w-full">
            <Button
              v-if="!isDayComplete"
              :class="cn('w-full', isClockedIn ? 'bg-red-600 hover:bg-red-700' : '')"
              :disabled="clockSubmitting || loading"
              @click="openPhotoCapture"
            >
              <Camera class="mr-2 h-4 w-4" />
              {{ isClockedIn ? 'Pointer la sortie' : "Pointer l'arrivée" }}
            </Button>
            <div
              v-else
              class="w-full rounded-lg border border-dashed px-4 py-3 text-center text-sm text-muted-foreground"
            >
              Pointage du jour enregistré. Les pointages ne peuvent pas être modifiés.
            </div>
            <p v-if="!isDayComplete" class="text-xs text-center text-muted-foreground">
              Une photo sera demandée pour confirmer votre identité
            </p>
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
                <TableHead class="text-center">Photos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-if="loading">
                <TableCell colspan="6" class="text-center py-8 text-muted-foreground">
                  Chargement du registre…
                </TableCell>
              </TableRow>
              <TableRow v-for="entry in todayRecords" :key="entry.id">
                <TableCell class="font-medium">{{ entry.nom }}</TableCell>
                <TableCell class="text-sm text-muted-foreground">{{ entry.poste }}</TableCell>
                <TableCell class="font-mono text-sm">{{ entry.arrivee }}</TableCell>
                <TableCell class="font-mono text-sm">{{ entry.depart }}</TableCell>
                <TableCell>
                  <Badge :variant="statutVariant(entry.statut)">{{ entry.statut }}</Badge>
                </TableCell>
                <TableCell>
                  <div class="flex justify-center gap-1">
                    <Button
                      v-if="entry.arriveePhotoUrl"
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8"
                      title="Photo arrivée"
                      @click="showPhoto(entry.arriveePhotoUrl, `Arrivée — ${entry.nom}`)"
                    >
                      <ImageIcon class="h-4 w-4 text-emerald-600" />
                    </Button>
                    <Button
                      v-if="entry.departPhotoUrl"
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8"
                      title="Photo départ"
                      @click="showPhoto(entry.departPhotoUrl, `Départ — ${entry.nom}`)"
                    >
                      <ImageIcon class="h-4 w-4 text-red-600" />
                    </Button>
                    <span v-if="!entry.arriveePhotoUrl && !entry.departPhotoUrl" class="text-xs text-muted-foreground">—</span>
                  </div>
                </TableCell>
              </TableRow>
              <TableRow v-if="todayRecords.length === 0">
                <TableCell colspan="6" class="text-center py-8 text-muted-foreground">Aucun enregistrement aujourd'hui</TableCell>
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
                  <TableHead class="text-center">Photos</TableHead>
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
                  <TableCell>
                    <div class="flex justify-center gap-1">
                      <Button
                        v-if="entry.arriveePhotoUrl"
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8"
                        @click="showPhoto(entry.arriveePhotoUrl, `Arrivée — ${entry.nom} (${entry.date})`)"
                      >
                        <ImageIcon class="h-4 w-4 text-emerald-600" />
                      </Button>
                      <Button
                        v-if="entry.departPhotoUrl"
                        variant="ghost"
                        size="icon"
                        class="h-8 w-8"
                        @click="showPhoto(entry.departPhotoUrl, `Départ — ${entry.nom} (${entry.date})`)"
                      >
                        <ImageIcon class="h-4 w-4 text-red-600" />
                      </Button>
                      <span v-if="!entry.arriveePhotoUrl && !entry.departPhotoUrl" class="text-xs text-muted-foreground">—</span>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow v-if="filteredRecords.length === 0">
                  <TableCell colspan="7" class="text-center py-8 text-muted-foreground">Aucun enregistrement trouvé</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>

    <AttendancePhotoCapture
      :open="photoDialogOpen"
      :mode="photoCaptureMode"
      :loading="clockSubmitting"
      @update:open="(v) => (photoDialogOpen = v)"
      @capture="handlePhotoCapture"
    />

    <Dialog :open="!!previewPhoto" @update:open="(v) => !v && (previewPhoto = null)">
      <DialogContent class="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{{ previewPhoto?.label }}</DialogTitle>
        </DialogHeader>
        <img
          v-if="previewPhoto?.url"
          :src="previewPhoto.url"
          :alt="previewPhoto.label"
          class="w-full rounded-lg border object-contain max-h-[70vh]"
        />
      </DialogContent>
    </Dialog>
  </div>
</template>
