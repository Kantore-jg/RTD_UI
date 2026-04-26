<script setup>
import { ref } from 'vue'
import { toast } from 'vue-sonner'
import { Zap, ArrowLeft, Send, Mail, Phone, MapPin, Clock } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { contactService } from '@/services/contact'

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  subject: '',
  message: '',
})

const isSubmitting = ref(false)

const subjects = [
  'Demande d\'information générale',
  'Demande de démonstration',
  'Demande de devis',
  'Support technique',
  'Partenariat',
  'Autre',
]

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function handleSubmit() {
  if (!form.value.firstName.trim() || !form.value.lastName.trim()) {
    toast.error('Veuillez renseigner votre nom et prénom.')
    return
  }
  if (!form.value.email.trim() || !validateEmail(form.value.email)) {
    toast.error('Veuillez renseigner une adresse email valide.')
    return
  }
  if (!form.value.subject) {
    toast.error('Veuillez sélectionner un sujet.')
    return
  }
  if (!form.value.message.trim()) {
    toast.error('Veuillez rédiger votre message.')
    return
  }

  isSubmitting.value = true
  try {
    await contactService.send({
      first_name: form.value.firstName,
      last_name: form.value.lastName,
      email: form.value.email,
      phone: form.value.phone,
      company: form.value.company,
      subject: form.value.subject,
      message: form.value.message,
    })
    toast.success('Message envoyé avec succès !', {
      description: 'Notre équipe vous répondra dans les plus brefs délais.',
    })
    form.value = {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      subject: '',
      message: '',
    }
  } catch {
    toast.error('Erreur lors de l\'envoi du message. Veuillez réessayer.')
  } finally {
    isSubmitting.value = false
  }
}

const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    value: import.meta.env.VITE_CONTACT_EMAIL || 'contact@rdt-platform.com',
    description: 'Réponse sous 24h ouvrées',
  },
  {
    icon: Phone,
    title: 'Téléphone',
    value: import.meta.env.VITE_CONTACT_PHONE || '+257 00 000 000',
    description: 'Lun - Ven, 9h - 18h',
  },
  {
    icon: MapPin,
    title: 'Adresse',
    value: import.meta.env.VITE_CONTACT_ADDRESS || 'Burundi, Bujumbura',
    description: 'Sur rendez-vous uniquement',
  },
  {
    icon: Clock,
    title: 'Horaires',
    value: 'Lun - Ven',
    description: '8h00 - 18h00 (UTC+2)',
  },
]
</script>

<template>
  <div class="flex flex-col min-h-screen bg-background selection:bg-primary selection:text-primary-foreground">
    <!-- Navigation -->
    <header class="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-2">
          <div class="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Zap class="text-white w-5 h-5" />
          </div>
          <span class="font-bold text-xl tracking-tight">Registre Dynamique</span>
        </router-link>
        <div class="flex items-center gap-4">
          <Button variant="ghost">
            <router-link to="/">
              <ArrowLeft class="w-4 h-4 mr-1 inline" />
              Retour
            </router-link>
          </Button>
          <Button>
            <router-link to="/login">Connexion</router-link>
          </Button>
        </div>
      </div>
    </header>

    <main class="flex-1 pt-16">
      <!-- Hero -->
      <section class="relative overflow-hidden py-16 md:py-20">
        <div class="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5" />
        <div class="container mx-auto px-4 relative">
          <div class="max-w-2xl mx-auto text-center space-y-4">
            <h1 class="text-3xl md:text-5xl font-bold tracking-tight">
              Contactez-nous
            </h1>
            <p class="text-lg text-muted-foreground leading-relaxed">
              Vous n'avez pas encore de compte ? Vous souhaitez en savoir plus sur notre plateforme ?
              Notre équipe est à votre disposition pour répondre à toutes vos questions.
            </p>
          </div>
        </div>
      </section>

      <!-- Content -->
      <section class="pb-24">
        <div class="container mx-auto px-4">
          <div class="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <!-- Contact Info Cards -->
            <div class="space-y-4">
              <Card
                v-for="(info, i) in contactInfo"
                :key="i"
                class="hover:shadow-md transition-shadow"
              >
                <CardContent class="flex items-start gap-4 p-5">
                  <div class="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <component :is="info.icon" class="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p class="font-medium text-sm">{{ info.title }}</p>
                    <p class="text-sm font-semibold mt-0.5">{{ info.value }}</p>
                    <p class="text-xs text-muted-foreground mt-1">{{ info.description }}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <!-- Contact Form -->
            <div class="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle class="text-xl">Envoyez-nous un message</CardTitle>
                  <CardDescription>
                    Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form @submit.prevent="handleSubmit" class="space-y-6">
                    <div class="grid sm:grid-cols-2 gap-4">
                      <div class="space-y-2">
                        <Label for="firstName">Prénom *</Label>
                        <Input
                          id="firstName"
                          v-model="form.firstName"
                          placeholder="Votre prénom"
                        />
                      </div>
                      <div class="space-y-2">
                        <Label for="lastName">Nom *</Label>
                        <Input
                          id="lastName"
                          v-model="form.lastName"
                          placeholder="Votre nom"
                        />
                      </div>
                    </div>

                    <div class="grid sm:grid-cols-2 gap-4">
                      <div class="space-y-2">
                        <Label for="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          v-model="form.email"
                          placeholder="votre@email.com"
                        />
                      </div>
                      <div class="space-y-2">
                        <Label for="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          v-model="form.phone"
                          placeholder="+33 6 00 00 00 00"
                        />
                      </div>
                    </div>

                    <div class="space-y-2">
                      <Label for="company">Entreprise</Label>
                      <Input
                        id="company"
                        v-model="form.company"
                        placeholder="Nom de votre entreprise"
                      />
                    </div>

                    <div class="space-y-2">
                      <Label for="subject">Sujet *</Label>
                      <select
                        id="subject"
                        v-model="form.subject"
                        class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="" disabled>Sélectionnez un sujet</option>
                        <option v-for="s in subjects" :key="s" :value="s">{{ s }}</option>
                      </select>
                    </div>

                    <div class="space-y-2">
                      <Label for="message">Message *</Label>
                      <Textarea
                        id="message"
                        v-model="form.message"
                        placeholder="Décrivez votre demande en détail..."
                        class="min-h-[140px] resize-y"
                      />
                    </div>

                    <div class="flex items-center justify-between pt-2">
                      <p class="text-xs text-muted-foreground">* Champs obligatoires</p>
                      <Button type="submit" :disabled="isSubmitting" class="px-8">
                        <Send v-if="!isSubmitting" class="w-4 h-4 mr-2" />
                        <span v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent inline-block" />
                        {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le message' }}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>

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
          <p class="text-sm text-muted-foreground">
            &copy; {{ new Date().getFullYear() }} Registre Dynamique de Travail. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>
