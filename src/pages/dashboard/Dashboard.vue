<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import {
  Users, Briefcase, Wallet, TrendingUp, ArrowUpRight,
  Calendar, ListChecks,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { toast } from 'vue-sonner'
import { dashboardService } from '@/services/dashboard'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const loading = ref(true)
const stats = ref([])
const projects = ref([])
const activities = ref([])

const iconMap = { Users, Briefcase, Wallet, TrendingUp }

onMounted(async () => {
  try {
    const response = await dashboardService.get()
    const data = response.data

    stats.value = (data.stats || []).map(s => ({
      ...s,
      icon: iconMap[s.icon] || Briefcase,
    }))
    projects.value = data.projects || []
    activities.value = data.activities || []
  } catch (error) {
    toast.error('Erreur lors du chargement du tableau de bord')
  } finally {
    loading.value = false
  }
})

function goTo(path) {
  router.push(path)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome -->
    <div class="flex flex-col md:flex-row justify-between items-end mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 leading-tight">Bonjour, {{ user?.name?.split(' ')[0] || 'Utilisateur' }}</h1>
        <p class="text-slate-500 font-medium">Voici ce qui se passe dans votre entreprise aujourd'hui.</p>
      </div>
      <div class="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-4 py-2 border border-slate-200 rounded-lg uppercase tracking-wider">
        <div class="w-2 h-2 rounded-full bg-emerald-500" />
        Système Opérationnel
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>

    <!-- Stats Grid -->
    <div v-if="!loading" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="(stat, i) in stats" :key="i" class="cursor-pointer" @click="goTo(stat.link)">
        <Card class="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm transition-all group relative hover:shadow-md hover:border-primary/20">
          <CardContent class="p-5">
            <div class="flex justify-between items-start mb-4">
              <div :class="stat.bg + ' p-3 rounded-lg transition-transform group-hover:scale-110'">
                <component :is="stat.icon" :class="stat.color + ' w-5 h-5'" />
              </div>
              <Badge variant="ghost" class="bg-slate-50 border-none text-[10px] font-bold">
                <ArrowUpRight class="w-3 h-3 mr-1 text-emerald-500" />
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

    <!-- Main Grid -->
    <div v-if="!loading" class="grid lg:grid-cols-3 gap-8">
      <!-- Active Projects -->
      <Card class="lg:col-span-2 border border-slate-200 bg-white rounded-xl shadow-sm">
        <CardHeader>
          <div class="flex justify-between items-center">
            <CardTitle class="font-bold text-lg text-slate-800">Projets Prioritaires</CardTitle>
            <Button variant="link" class="text-xs font-bold text-primary uppercase tracking-widest p-0 h-auto" @click="goTo('/projects')">
              Tout voir
            </Button>
          </div>
          <CardDescription class="text-slate-500 text-sm">Progression en temps réel des projets critiques.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div
            v-for="(project, i) in projects" :key="i"
            :class="cn('p-4 rounded-lg bg-white border border-slate-100 shadow-sm space-y-3 transition-all cursor-pointer border-l-3 hover:shadow-md', project.border)"
            @click="goTo('/projects')"
          >
            <div class="flex justify-between items-center">
              <h4 class="font-semibold text-slate-800 text-sm">{{ project.name }}</h4>
              <Badge
                :class="cn(
                  'text-[10px] font-bold uppercase tracking-wider',
                  project.isOverdue ? 'bg-orange-100 text-orange-700' :
                  project.status === 'Urgent' ? 'bg-red-100 text-red-700' :
                  project.status === 'En cours' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
                )"
              >
                {{ project.isOverdue ? 'EN RETARD' : project.status }}
              </Badge>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Progression</span>
                <span>{{ project.progress }}%</span>
              </div>
              <Progress :value="project.progress" class="h-1 bg-slate-100" />
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-1">
                <div v-if="project.members && project.members.length > 0" class="flex items-center -space-x-1.5">
                  <Avatar
                    v-for="member in project.members.slice(0, 4)" :key="member.id"
                    class="h-6 w-6 border-2 border-white"
                  >
                    <AvatarFallback class="text-[9px] font-bold bg-slate-100 text-slate-600">{{ member.initials }}</AvatarFallback>
                  </Avatar>
                  <Avatar v-if="project.members.length > 4" class="h-6 w-6 border-2 border-white">
                    <AvatarFallback class="text-[9px] font-bold bg-slate-200 text-slate-500">+{{ project.members.length - 4 }}</AvatarFallback>
                  </Avatar>
                </div>
                <span v-else class="text-[10px] text-slate-400">Aucun membre</span>
              </div>
              <div class="flex items-center gap-3 text-[10px] text-slate-400 font-bold">
                <span v-if="project.tasks_count !== undefined" class="flex items-center gap-1">
                  <ListChecks class="w-3 h-3" />{{ project.tasks_count }}
                </span>
                <span v-if="project.deadline" class="flex items-center gap-1">
                  <Calendar class="w-3 h-3" />{{ project.deadline }}
                </span>
              </div>
            </div>
          </div>
          <div v-if="projects.length === 0" class="text-center py-8 text-slate-400 text-sm">Aucun projet actif</div>
        </CardContent>
      </Card>

      <!-- Activity Feed -->
      <Card class="border border-slate-200 bg-white rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle class="font-bold text-lg text-slate-800">Activité Récente</CardTitle>
          <CardDescription class="text-slate-500 text-sm">Mises à jour des équipes.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-5">
          <div v-for="(activity, i) in activities" :key="i" class="flex gap-4 group items-center">
            <div class="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-600 border border-slate-200 shrink-0">
              {{ activity.avatar }}
            </div>
            <div class="space-y-0.5">
              <p class="text-xs font-medium text-slate-600">
                <span class="font-bold text-slate-900">{{ activity.user }}</span> {{ activity.action }} <span class="text-primary font-bold">{{ activity.target }}</span>
              </p>
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest"> {{ activity.time }}</p>
            </div>
          </div>
          <Button variant="outline" class="w-full text-[10px] font-bold uppercase tracking-widest" @click="goTo('/tasks')">
            Voir tout le registre
          </Button>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
