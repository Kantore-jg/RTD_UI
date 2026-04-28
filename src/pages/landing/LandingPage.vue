<script setup>
import { BarChart3, CheckCircle2, Globe, LayoutDashboard, ShieldCheck, Users, Zap, ChevronRight, ArrowRight } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const features = [
  {
    icon: Users,
    title: 'Gestion des Employés',
    description: 'Suivez vos équipes, gérez les présences et centralisez toutes les informations RH en un seul endroit.',
  },
  {
    icon: LayoutDashboard,
    title: 'Tableau de Bord Intelligent',
    description: 'Visualisez vos KPIs en temps réel avec des tableaux de bord personnalisables et interactifs.',
  },
  {
    icon: BarChart3,
    title: 'Rapports & Analyses',
    description: "Générez des rapports détaillés et prenez des décisions éclairées grâce à l'analyse de données.",
  },
]

const builderFeatures = [
  { text: 'Formulaires personnalisés par glisser-déposer' },
  { text: 'Workflows automatisés sans code' },
  { text: 'Intégrations avec vos outils existants' },
  { text: 'Templates prêts à l\'emploi' },
]

const stats = [
  { value: '99.9%', label: 'Disponibilité' },
  { value: 'Archivage', label: 'stockage des données de votre entreprise' },
  { value: 'Communication', label: 'communication avec vos collaborateurs' },
]
</script>

<template>
  <div class="flex flex-col min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
    <!-- Navigation -->
    <header class="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap class="text-white w-5 h-5" />
          </div>
          <!-- favicon -->
          <span class="font-bold text-xl tracking-tight">Registre Dynamique</span>
        </div>
        <nav class="hidden md:flex items-center gap-8">
          <a href="#features" class="text-sm font-medium hover:text-primary transition-colors">Fonctionnalités</a>
          <a href="#solutions" class="text-sm font-medium hover:text-primary transition-colors">Solutions</a>
          <!-- <a href="#pricing" class="text-sm font-medium hover:text-primary transition-colors">Tarifs</a> -->
          <router-link to="/contact" class="text-sm font-medium hover:text-primary transition-colors">Contact</router-link>
        </nav>
        <div class="flex items-center gap-4">
          <Button variant="ghost">
            <router-link to="/login">Connexion</router-link>
          </Button>
          <Button>
            <router-link to="/login">Essayer Gratuitement</router-link>
          </Button>
        </div>
      </div>
    </header>

    <main class="flex-1 pt-16">
      <!-- Hero Section -->
      <section class="relative overflow-hidden py-24 md:py-32">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div class="container mx-auto px-4 relative">
          <div class="max-w-3xl mx-auto text-center space-y-8">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium">
              <Zap class="w-4 h-4" />
              Nouveau : Constructeur de registres dynamiques
            </div>
            <h1 class="text-4xl md:text-6xl font-bold tracking-tight leading-tight">
              Gerer bien vos entreprises avec
              <span class="text-primary">Registre Dynamique,gestion dynamiques des taches et prograssions desprojets</span>
            </h1>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              La plateforme tout-en-un , suivre vos projets et optimiser vos processus métier. Simple, puissant, et conçu pour les équipes modernes.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center">
              <router-link
                to="/login"
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-11 px-8 cursor-pointer"
              >
                Commencer 
                <ArrowRight class="w-4 h-4" />
              </router-link>
              <a
                href="#features"
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm h-11 px-8 cursor-pointer"
              >
                Découvrir les fonctionnalités
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- Features Preview -->
      <section id="features" class="py-24 bg-muted/30">
        <div class="container mx-auto px-4">
          <div class="text-center space-y-4 mb-16">
            <h2 class="text-3xl md:text-4xl font-bold tracking-tight">
              Tout ce dont vous avez besoin
            </h2>
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
              Des outils puissants pour chaque aspect de la gestion de votre entreprise.  
              vous pouvez aussi gerer les documents de vos entreprises et les communications avec vos collaborateurs.
            </p>
          </div>
          <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div
              v-for="(feature, i) in features"
              :key="i"
              class="group relative bg-background rounded-2xl border p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                <component :is="feature.icon" class="w-6 h-6 text-primary" />
              </div>
              <h3 class="text-xl font-semibold mb-3">{{ feature.title }}</h3>
              <p class="text-muted-foreground leading-relaxed">{{ feature.description }}</p>
              <div class="mt-6">
                <router-link to="/login" class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:gap-2 transition-all">
                  En savoir plus
                  <ChevronRight class="w-4 h-4" />
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Dynamic Builder Teaser -->
      <section id="solutions" class="py-24">
        <div class="container mx-auto px-4">
          <div class="grid md:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div class="space-y-8">
              <div class="space-y-4">
                <div class="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full text-primary text-sm font-medium">
                  Nouveau
                </div>
                <h2 class="text-3xl md:text-4xl font-bold tracking-tight">
                  Constructeur de Registres Dynamiques
                </h2>
                <p class="text-lg text-muted-foreground leading-relaxed">
                  Créez des registres personnalisés adaptés à vos besoins spécifiques, sans aucune compétence technique requise.
                </p>
              </div>
              <div class="space-y-4">
                <div
                  v-for="(item, i) in builderFeatures"
                  :key="i"
                  class="flex items-center gap-3"
                >
                  <div class="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 class="w-4 h-4 text-primary" />
                  </div>
                  <span class="text-muted-foreground">{{ item.text }}</span>
                </div>
              </div>
              <router-link
                to="/login"
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-10 px-8 cursor-pointer"
              >
                Essayer le constructeur
                <ArrowRight class="w-4 h-4" />
              </router-link>
            </div>
            <div class="relative">
              <div class="bg-gradient-to-br from-primary/5 to-primary/10 rounded-2xl border p-8 aspect-[4/3] flex items-center justify-center">
                <div class="space-y-4 w-full max-w-sm">
                  <div class="h-8 bg-primary/20 rounded-lg w-3/4" />
                  <div class="h-8 bg-primary/15 rounded-lg w-full" />
                  <div class="h-8 bg-primary/10 rounded-lg w-5/6" />
                  <div class="grid grid-cols-2 gap-4 mt-6">
                    <div class="h-20 bg-primary/10 rounded-xl" />
                    <div class="h-20 bg-primary/15 rounded-xl" />
                  </div>
                  <div class="h-10 bg-primary rounded-lg w-1/2 mx-auto mt-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Global Scalability -->
      <section class="py-24 bg-foreground text-background">
        <div class="container mx-auto px-4">
          <div class="text-center space-y-4 mb-16">
            <div class="inline-flex items-center gap-2 mx-auto">
              <Globe class="w-5 h-5" />
              <span class="text-sm font-medium uppercase tracking-wider">juste un peut d'abonnement par mois, le service est disponible partout dans le monde</span>
            </div>
            <h2 class="text-3xl md:text-4xl font-bold tracking-tight">
              Conçu pour la performance et la sécurité
            </h2>
            <p class="text-lg opacity-80 max-w-2xl mx-auto">
              Une infrastructure robuste qui garantit la disponibilité et la protection de vos données.
            </p>
          </div>
          <div class="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div
              v-for="(stat, i) in stats"
              :key="i"
              class="text-center space-y-2"
            >
              <div class="flex items-center justify-center gap-2 mb-2">
                <ShieldCheck class="w-5 h-5 opacity-60" />
              </div>
              <div class="text-4xl font-bold">{{ stat.value }}</div>
              <div class="text-sm opacity-60">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- CTA Contact -->
    <section class="py-20 bg-muted/30">
      <div class="container mx-auto px-4 text-center space-y-6">
        <h2 class="text-2xl md:text-3xl font-bold tracking-tight">
          Pas encore de compte ? Contactez-nous
        </h2>
        <p class="text-muted-foreground max-w-xl mx-auto">
          Notre équipe est disponible pour répondre à vos questions, organiser une démonstration ou vous accompagner dans la mise en place de la plateforme.
        </p>
        <router-link
          to="/contact"
          class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm h-11 px-8 cursor-pointer"
        >
          Nous contacter
          <ArrowRight class="w-4 h-4" />
        </router-link>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t py-12 bg-muted/30">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center justify-between gap-4">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <Zap class="text-white w-3.5 h-3.5" />
            </div>
            <span class="font-semibold text-sm">Registre Dynamique</span>
          </div>
          <div class="flex items-center gap-6">
            <router-link to="/contact" class="text-sm text-muted-foreground hover:text-primary transition-colors">Contact</router-link>
            <p class="text-sm text-muted-foreground">
              &copy; {{ new Date().getFullYear() }} Registre Dynamique de Travail. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
