<script setup>
import { ShieldCheck, Users, Zap, ArrowRight, LayoutDashboard, Database, FolderOpen, Lock, Activity, Bell, Settings, Mail } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const stats = [
  { value: '99.9%', label: 'Disponibilité' },
  { value: 'Centralisé', label: 'Stockage sécurisé des données' },
  { value: 'Fluide', label: 'Communication avec vos collaborateurs' },
]

const features = [
  { id: 'rh', label: 'Ressources Humaines' },
  { id: 'projects', label: 'Gestion de Projets' },
  { id: 'builder', label: 'Constructeur Dynamique' },
  { id: 'communication', label: 'Communication' }
]
</script>

<template>
  <div class="flex flex-col min-h-screen bg-slate-50 selection:bg-primary selection:text-primary-foreground dark:bg-slate-950 text-slate-900 dark:text-slate-100">
    <!-- Navigation -->
    <header class="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Zap class="text-white w-5 h-5" />
          </div>
          <span class="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">Registre Dynamique</span>
        </div>
        <nav class="hidden md:flex items-center gap-8">
          <a href="#roles" class="text-sm font-medium hover:text-primary transition-colors">Plateforme</a>
          <a href="#rh" class="text-sm font-medium hover:text-primary transition-colors">RH</a>
          <a href="#projects" class="text-sm font-medium hover:text-primary transition-colors">Projets</a>
          <a href="#builder" class="text-sm font-medium hover:text-primary transition-colors">Constructeur</a>
          <router-link to="/contact" class="text-sm font-medium hover:text-primary transition-colors">Contact</router-link>
        </nav>
        <div class="flex items-center gap-4">
          <Button variant="ghost" class="hidden sm:inline-flex">
            <router-link to="/login">Connexion</router-link>
          </Button>
          <Button class="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-105">
            <router-link to="/login">Essayer Gratuitement</router-link>
          </Button>
        </div>
      </div>
    </header>

    <main class="flex-1 pt-16">
      <!-- Hero Section -->
      <section class="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-32">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div class="container mx-auto px-4 relative">
          <div class="max-w-4xl mx-auto text-center space-y-8">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold ring-1 ring-primary/20 animate-fade-in">
              <Zap class="w-4 h-4" />
              Plateforme tout-en-un pour entreprises modernes
            </div>
            <h1 class="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Gérez votre entreprise avec
              <span class="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 mt-2">Registre Dynamique</span>
            </h1>
            <p class="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              De la gestion des ressources humaines à la communication interne, en passant par le suivi des tâches et notre constructeur de modules sur-mesure.
            </p>
            <div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <router-link
                to="/login"
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/25 h-14 px-8 transition-all hover:-translate-y-1"
              >
                Commencer l'expérience
                <ArrowRight class="w-5 h-5" />
              </router-link>
              <a
                href="#roles"
                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold border-2 border-input bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground shadow-sm h-14 px-8 transition-all hover:-translate-y-1"
              >
                Découvrir la plateforme
              </a>
            </div>
          </div>
          
          <!-- Hero Dashboard Preview -->
          <div class="mt-20 relative max-w-6xl mx-auto">
            <div class="absolute -inset-1 bg-gradient-to-r from-primary to-blue-500 rounded-[2rem] blur opacity-20"></div>
            <div class="relative bg-background rounded-3xl border border-border/50 shadow-2xl overflow-hidden ring-1 ring-white/10">
              <div class="flex items-center px-4 py-3 border-b bg-muted/30">
                <div class="flex space-x-2">
                  <div class="w-3 h-3 rounded-full bg-red-400"></div>
                  <div class="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div class="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
              </div>
              <img src="/images_presentation/interface_admin_entreprise.png" alt="Interface Admin" class="w-full h-auto object-cover object-top" />
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Multi-rôles & Sécurité -->
      <section id="roles" class="py-24 relative bg-slate-50 dark:bg-slate-900/50">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row gap-16 items-center">
            <div class="md:w-1/2 space-y-6">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium">
                <ShieldCheck class="w-4 h-4" /> Sécurité & Contrôle
              </div>
              <h2 class="text-3xl md:text-5xl font-bold tracking-tight">Espaces dédiés et accès sécurisés</h2>
              <p class="text-lg text-muted-foreground leading-relaxed">
                Notre plateforme s'adapte à votre hiérarchie. Profitez d'interfaces spécifiques pour le Super Administrateur, l'Administration de l'Entreprise, et chaque Employé.
              </p>
              <ul class="space-y-4 pt-4">
                <li class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center mt-1"><Lock class="w-3 h-3 text-blue-600" /></div>
                  <div>
                    <h4 class="font-semibold">Gestion des rôles granulaire</h4>
                    <p class="text-muted-foreground text-sm">Définissez précisément qui a accès à quoi.</p>
                  </div>
                </li>
                <li class="flex items-start gap-3">
                  <div class="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center mt-1"><LayoutDashboard class="w-3 h-3 text-blue-600" /></div>
                  <div>
                    <h4 class="font-semibold">Tableaux de bord personnalisés</h4>
                    <p class="text-muted-foreground text-sm">Chaque utilisateur voit ce qui est pertinent pour lui.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div class="md:w-1/2 relative">
              <div class="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full"></div>
              <div class="grid grid-cols-2 gap-4 relative">
                <div class="space-y-4 mt-8">
                  <img src="/images_presentation/interface_super_admin.png" alt="Super Admin" class="rounded-xl shadow-lg border border-border/50 hover:scale-105 transition-transform duration-500" />
                  <img src="/images_presentation/securites_accees.png" alt="Securite" class="rounded-xl shadow-lg border border-border/50 hover:scale-105 transition-transform duration-500" />
                </div>
                <div class="space-y-4">
                  <img src="/images_presentation/interface_employe.png" alt="Interface Employe" class="rounded-xl shadow-lg border border-border/50 hover:scale-105 transition-transform duration-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Ressources Humaines & Présences -->
      <section id="rh" class="py-24 relative overflow-hidden">
        <div class="absolute right-0 top-0 w-1/2 h-full bg-primary/5 rounded-l-[100px] -z-10"></div>
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row-reverse gap-16 items-center">
            <div class="md:w-1/2 space-y-6">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full text-sm font-medium">
                <Users class="w-4 h-4" /> Ressources Humaines
              </div>
              <h2 class="text-3xl md:text-5xl font-bold tracking-tight">Gestion simplifiée de vos équipes</h2>
              <p class="text-lg text-muted-foreground leading-relaxed">
                Centralisez toutes les informations de vos employés. Suivez les présences, gérez les entrées et sorties en temps réel, et simplifiez vos processus administratifs.
              </p>
              <div class="flex flex-wrap gap-3 pt-4">
                <span class="px-3 py-1 bg-background border rounded-full text-sm font-medium">Gestion des employés</span>
                <span class="px-3 py-1 bg-background border rounded-full text-sm font-medium">Suivi des présences</span>
                <span class="px-3 py-1 bg-background border rounded-full text-sm font-medium">Registre Entrées/Sorties</span>
              </div>
            </div>
            <div class="md:w-1/2 relative group">
              <div class="relative rounded-2xl overflow-hidden shadow-2xl border bg-background/50 backdrop-blur-sm p-2">
                <img src="/images_presentation/gestion_employes.png" alt="Gestion Employés" class="rounded-xl w-full" />
              </div>
              <!-- Floating UI element -->
              <div class="absolute -bottom-6 -right-6 w-2/3 rounded-xl overflow-hidden shadow-2xl border group-hover:-translate-y-4 transition-transform duration-500">
                <img src="/images_presentation/gestion_presences.png" alt="Présences" class="w-full" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Gestion de Projets & Tâches -->
      <section id="projects" class="py-24 relative bg-slate-50 dark:bg-slate-900/50">
        <div class="container mx-auto px-4">
          <div class="flex flex-col md:flex-row gap-16 items-center">
            <div class="md:w-1/2 space-y-6">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-full text-sm font-medium">
                <Activity class="w-4 h-4" /> Productivité
              </div>
              <h2 class="text-3xl md:text-5xl font-bold tracking-tight">Pilotez vos projets avec agilité</h2>
              <p class="text-lg text-muted-foreground leading-relaxed">
                De l'assignation des tâches au suivi de la progression. Ayez une vue claire sur l'avancement de vos projets et maximisez la productivité de vos équipes.
              </p>
              <div class="grid grid-cols-2 gap-6 pt-4">
                <div class="p-4 bg-background rounded-xl border shadow-sm">
                  <h4 class="font-bold mb-1">Assignation</h4>
                  <p class="text-sm text-muted-foreground">Distribuez les tâches efficacement.</p>
                </div>
                <div class="p-4 bg-background rounded-xl border shadow-sm">
                  <h4 class="font-bold mb-1">Progression</h4>
                  <p class="text-sm text-muted-foreground">Suivi de l'avancement en temps réel.</p>
                </div>
              </div>
            </div>
            <div class="md:w-1/2">
              <div class="grid gap-4">
                <img src="/images_presentation/project_management.png" alt="Gestion Projets" class="rounded-xl shadow-lg border w-full hover:scale-[1.02] transition-transform" />
                <div class="grid grid-cols-2 gap-4">
                  <img src="/images_presentation/gestion_taches_et_assignation.png" alt="Assignation" class="rounded-xl shadow-lg border w-full hover:scale-105 transition-transform" />
                  <img src="/images_presentation/progression_project.png" alt="Progression" class="rounded-xl shadow-lg border w-full hover:scale-105 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Constructeur Dynamique -->
      <section id="builder" class="py-24 relative overflow-hidden bg-primary text-primary-foreground">
        <div class="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiNmZmYiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-20 mix-blend-overlay"></div>
        <div class="container mx-auto px-4 relative">
          <div class="text-center max-w-3xl mx-auto space-y-6 mb-16">
            <div class="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm font-semibold backdrop-blur-md">
              <Zap class="w-4 h-4 text-yellow-300" /> Innovation Exclusive
            </div>
            <h2 class="text-3xl md:text-5xl font-bold tracking-tight">Constructeur de Modules Dynamiques</h2>
            <p class="text-lg opacity-90 leading-relaxed">
              Ne soyez plus limité par votre logiciel. Créez vos propres modules, formulaires et registres sur-mesure en quelques clics, sans écrire une seule ligne de code.
            </p>
          </div>
          
          <div class="relative max-w-5xl mx-auto">
            <div class="bg-background/10 backdrop-blur-xl rounded-3xl p-4 md:p-8 border border-white/20 shadow-2xl">
              <div class="grid md:grid-cols-2 gap-8 items-center">
                <div class="space-y-6">
                  <div class="flex gap-4 items-start">
                    <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold">1</div>
                    <div>
                      <h4 class="font-bold text-xl mb-2">Créez le module</h4>
                      <p class="opacity-80">Définissez le nom, l'icône et les paramètres d'accès de votre nouveau registre.</p>
                    </div>
                  </div>
                  <div class="flex gap-4 items-start">
                    <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold">2</div>
                    <div>
                      <h4 class="font-bold text-xl mb-2">Ajoutez des champs</h4>
                      <p class="opacity-80">Texte, date, sélection, fichiers... Glissez-déposez les champs dont vous avez besoin.</p>
                    </div>
                  </div>
                  <div class="flex gap-4 items-start">
                    <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold">3</div>
                    <div>
                      <h4 class="font-bold text-xl mb-2">Commencez à l'utiliser</h4>
                      <p class="opacity-80">Le module est immédiatement disponible pour vos équipes selon les permissions.</p>
                    </div>
                  </div>
                </div>
                <div class="relative">
                  <img src="/images_presentation/dynamic_builder.png" alt="Dynamic Builder" class="rounded-xl shadow-2xl border border-white/20" />
                  <img src="/images_presentation/creation_module.png" alt="Création Module" class="absolute -bottom-8 -left-8 w-2/3 rounded-xl shadow-2xl border border-white/20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Communication & Archivage -->
      <section class="py-24 relative">
        <div class="container mx-auto px-4">
          <div class="text-center space-y-4 mb-16">
            <h2 class="text-3xl md:text-5xl font-bold tracking-tight">Collaboration au cœur de l'entreprise</h2>
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
              Fluidifiez les échanges et gardez une trace sécurisée de tous vos documents importants.
            </p>
          </div>
          
          <div class="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <!-- Communication -->
            <div class="group bg-muted/30 rounded-3xl p-8 border hover:bg-muted/50 transition-colors">
              <div class="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6">
                <Bell class="w-7 h-7 text-amber-600" />
              </div>
              <h3 class="text-2xl font-bold mb-4">Communication Interne</h3>
              <p class="text-muted-foreground mb-8">Newsletter, boîte à suggestions, notifications temps réel et messagerie intégrée pour garder vos équipes connectées.</p>
              <img src="/images_presentation/gestion_communication_dans_entreprise.png" alt="Communication" class="rounded-xl shadow-lg border group-hover:-translate-y-2 transition-transform duration-500 w-full" />
            </div>
            
            <!-- Archivage -->
            <div class="group bg-muted/30 rounded-3xl p-8 border hover:bg-muted/50 transition-colors">
              <div class="w-14 h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6">
                <FolderOpen class="w-7 h-7 text-indigo-600" />
              </div>
              <h3 class="text-2xl font-bold mb-4">Archivage Sécurisé</h3>
              <p class="text-muted-foreground mb-8">Stockage de documents, gestion de dossiers administratifs et accès rapide aux archives de l'entreprise.</p>
              <img src="/images_presentation/gestion_et_archivages_des_documents_entreprise.png" alt="Archivage" class="rounded-xl shadow-lg border group-hover:-translate-y-2 transition-transform duration-500 w-full" />
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Personnalisation & Déploiement -->
      <section id="customization" class="py-24 relative bg-slate-50 dark:bg-slate-900/50">
        <div class="container mx-auto px-4">
          <div class="text-center space-y-4 mb-16">
            <h2 class="text-3xl md:text-5xl font-bold tracking-tight">Une plateforme qui s'adapte à vous</h2>
            <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
              Activez uniquement les modules dont vous avez besoin et profitez d'un déploiement instantané.
            </p>
          </div>
          
          <div class="flex flex-col md:flex-row gap-16 items-center mb-24">
            <div class="md:w-1/2 space-y-6">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-full text-sm font-medium">
                <Settings class="w-4 h-4" /> Modules à la carte
              </div>
              <h3 class="text-2xl md:text-4xl font-bold tracking-tight">Chaque entreprise a ses propres modules</h3>
              <p class="text-lg text-muted-foreground leading-relaxed">
                Pourquoi payer pour des fonctionnalités que vous n'utilisez pas ? Notre gestionnaire de modules permet à chaque entreprise de choisir et d'activer uniquement les outils nécessaires à son fonctionnement.
              </p>
              <ul class="space-y-3 pt-2">
                <li class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span>Activation et désactivation en un clic</span>
                </li>
                <li class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span>Interface épurée et personnalisée</span>
                </li>
              </ul>
            </div>
            <div class="md:w-1/2">
              <img src="/images_presentation/gestion_modules.png" alt="Gestion des Modules" class="rounded-xl shadow-2xl border w-full hover:scale-[1.02] transition-transform duration-500" />
            </div>
          </div>

          <div class="flex flex-col md:flex-row-reverse gap-16 items-center">
            <div class="md:w-1/2 space-y-6">
              <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full text-sm font-medium">
                <Mail class="w-4 h-4" /> Onboarding Instantané
              </div>
              <h3 class="text-2xl md:text-4xl font-bold tracking-tight">Déploiement immédiat</h3>
              <p class="text-lg text-muted-foreground leading-relaxed">
                Dès l'inscription de votre entreprise sur la plateforme, un email automatique de bienvenue est envoyé avec toutes les informations nécessaires. Vos équipes sont opérationnelles immédiatement.
              </p>
            </div>
            <div class="md:w-1/2 relative">
              <div class="absolute inset-0 bg-emerald-500/10 blur-3xl rounded-full"></div>
              <img src="/images_presentation/mail_message_when_entreprise_is_registered.png" alt="Email de bienvenue" class="rounded-xl shadow-2xl border relative z-10 w-full hover:scale-[1.02] transition-transform duration-500" />
            </div>
          </div>
        </div>
      </section>

      <!-- Global Scalability -->
      <section class="py-24 bg-foreground text-background">
        <div class="container mx-auto px-4">
          <div class="text-center space-y-4 mb-16">
            <h2 class="text-3xl md:text-4xl font-bold tracking-tight">
              Conçu pour la performance et la sécurité
            </h2>
            <p class="text-lg opacity-80 max-w-2xl mx-auto">
              Une infrastructure robuste qui garantit la disponibilité et la protection de vos données, accessible partout dans le monde via un abonnement flexible.
            </p>
          </div>
          <div class="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div
              v-for="(stat, i) in stats"
              :key="i"
              class="text-center space-y-2 p-6 rounded-2xl bg-background/5 border border-white/10 backdrop-blur-sm"
            >
              <div class="flex items-center justify-center gap-2 mb-4">
                <ShieldCheck class="w-8 h-8 text-primary" />
              </div>
              <div class="text-4xl font-bold text-white">{{ stat.value }}</div>
              <div class="text-sm opacity-80">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- CTA Contact -->
    <section class="py-24 relative overflow-hidden">
      <div class="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5"></div>
      <div class="container mx-auto px-4 relative text-center space-y-8">
        <h2 class="text-3xl md:text-5xl font-bold tracking-tight">
          Prêt à transformer votre gestion ?
        </h2>
        <p class="text-lg text-muted-foreground max-w-2xl mx-auto">
          Rejoignez les entreprises qui utilisent déjà Registre Dynamique pour optimiser leurs processus et gagner en productivité.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <!-- <router-link
            to="/login"
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/25 h-14 px-8 transition-transform hover:scale-105"
          >
            Créer un compte gratuit
          </router-link> -->
          <router-link
            to="/contact"
            class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-base font-semibold border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm h-14 px-8 transition-transform hover:scale-105"
          >
            Contacter l'équipe
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t py-12 bg-background">
      <div class="container mx-auto px-4">
        <div class="flex flex-col md:flex-row items-center justify-between gap-6">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <Zap class="text-white w-4 h-4" />
            </div>
            <span class="font-bold text-lg">Registre Dynamique</span>
          </div>
          <div class="flex items-center gap-8">
            <router-link to="/contact" class="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Contact</router-link>
            <router-link to="/login" class="text-sm text-muted-foreground hover:text-primary transition-colors font-medium">Connexion</router-link>
          </div>
          <div class="text-sm text-muted-foreground">
            &copy; {{ new Date().getFullYear() }} Registre Dynamique de Travail. Tous droits réservés.
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
html {
  scroll-behavior: smooth;
}
.animate-fade-in {
  animation: fadeIn 1s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
