<script setup>
import { useRouter } from 'vue-router'
import {
  Users, Briefcase, Wallet, TrendingUp, ArrowUpRight,
} from 'lucide-vue-next'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const router = useRouter()

const stats = [
  { label: 'Employés actifs', value: '128', icon: Users, change: '+12%', color: 'text-blue-500', bg: 'bg-blue-500/10', link: '/employees' },
  { label: 'Projets en cours', value: '14', icon: Briefcase, change: '+3', color: 'text-purple-500', bg: 'bg-purple-500/10', link: '/projects' },
  { label: 'Trésorerie Mensuelle', value: '45.2M BIF', icon: Wallet, change: '+8.5%', color: 'text-emerald-500', bg: 'bg-emerald-500/10', link: '/finance' },
  { label: 'Productivité', value: '94%', icon: TrendingUp, change: '+2%', color: 'text-orange-500', bg: 'bg-orange-500/10', link: '/tasks' },
]

const projects = [
  { name: 'Refonte ERP V2', progress: 75, status: 'Active', deadline: '15 Mai', border: 'border-l-blue-400' },
  { name: 'Lancement Mobile App', progress: 42, status: 'Delay', deadline: '2 Juin', border: 'border-l-orange-400' },
  { name: 'Audit Sécurité Biométrique', progress: 90, status: 'Active', deadline: '10 Mai', border: 'border-l-emerald-400' },
]

const activities = [
  { user: 'Sarah L.', action: 'a terminé la tâche', target: 'Interface Dashboard', time: '12m', avatar: 'SL' },
  { user: 'Marc K.', action: 'a créé un projet', target: 'Logistique Portuaire', time: '45m', avatar: 'MK' },
  { user: 'Alice M.', action: 'a suggéré une idée', target: 'Boîte à suggestions', time: '2h', avatar: 'AM' },
  { user: 'Système', action: 'Sauvegarde', target: 'Réussie', time: '4h', avatar: 'S' },
]

function goTo(path) {
  router.push(path)
}
</script>

<template>
  <div class="space-y-8">
    <!-- Welcome -->
    <div class="flex flex-col md:flex-row justify-between items-end mb-6">
      <div>
        <h1 class="text-2xl font-bold text-slate-900 leading-tight">Bonjour, Jean</h1>
        <p class="text-slate-500 font-medium">Voici ce qui se passe dans votre entreprise aujourd'hui.</p>
      </div>
      <div class="flex items-center gap-2 text-xs font-bold text-slate-400 bg-white px-4 py-2 border border-slate-200 rounded-lg uppercase tracking-wider">
        <div class="w-2 h-2 rounded-full bg-emerald-500" />
        Système Opérationnel
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    <div class="grid lg:grid-cols-3 gap-8">
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
            :class="cn('p-4 rounded-lg bg-white border border-slate-100 shadow-sm space-y-4 transition-all cursor-pointer border-l-3 hover:shadow-md', project.border)"
            @click="goTo('/projects')"
          >
            <div class="flex justify-between items-center">
              <h4 class="font-semibold text-slate-800 text-sm">{{ project.name }}</h4>
              <Badge
                :class="cn(
                  'text-[10px] font-bold uppercase tracking-wider',
                  project.status === 'Delay' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                )"
              >
                {{ project.status === 'Delay' ? 'EN RETARD' : 'ACTIF' }}
              </Badge>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Progression</span>
                <span>{{ project.progress }}%</span>
              </div>
              <Progress :value="project.progress" class="h-1 bg-slate-100" />
            </div>
          </div>
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
              <p class="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Il y a {{ activity.time }}</p>
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
