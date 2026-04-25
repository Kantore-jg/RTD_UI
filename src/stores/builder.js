import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBuilderStore = defineStore('builder', () => {
  const modules = ref([
    {
      id: 1, name: 'Inventaire de Stock', description: 'Suivi des stocks et produits',
      icon: 'Database', showInSidebar: true,
      fields: [
        { id: 1, label: 'Nom du produit', type: 'text', required: true, options: [] },
        { id: 2, label: 'Quantité', type: 'number', required: true, options: [] },
        { id: 3, label: 'Catégorie', type: 'select', required: false, options: ['Électronique', 'Alimentaire', 'Textile', 'Autre'] },
        { id: 4, label: "Date d'entrée", type: 'date', required: true, options: [] },
        { id: 5, label: 'Description', type: 'textarea', required: false, options: [] },
        { id: 6, label: 'En stock', type: 'checkbox', required: false, options: [] },
      ],
      entries: [
        { id: 1, data: { 'Nom du produit': 'Laptop HP ProBook', 'Quantité': '25', 'Catégorie': 'Électronique', "Date d'entrée": '2026-04-10', 'Description': 'Laptops pour le département IT', 'En stock': true }, submittedAt: '2026-04-10 09:30', submittedBy: 'Marc Kouassi' },
        { id: 2, data: { 'Nom du produit': 'Riz 25kg', 'Quantité': '200', 'Catégorie': 'Alimentaire', "Date d'entrée": '2026-04-15', 'Description': 'Stock cantine', 'En stock': true }, submittedAt: '2026-04-15 14:00', submittedBy: 'Alice Mensah' },
        { id: 3, data: { 'Nom du produit': 'Câbles réseau Cat6', 'Quantité': '150', 'Catégorie': 'Électronique', "Date d'entrée": '2026-04-18', 'Description': '', 'En stock': false }, submittedAt: '2026-04-18 11:20', submittedBy: 'Paul Atreides' },
      ],
      createdAt: '2026-03-10',
    },
    {
      id: 2, name: 'Réclamations Clients', description: 'Gestion des réclamations reçues',
      icon: 'FormInput', showInSidebar: true,
      fields: [
        { id: 1, label: 'Nom du client', type: 'text', required: true, options: [] },
        { id: 2, label: 'Type de réclamation', type: 'select', required: true, options: ['Produit défectueux', 'Retard livraison', 'Service client', 'Facturation'] },
        { id: 3, label: 'Description', type: 'textarea', required: true, options: [] },
        { id: 4, label: 'Date', type: 'date', required: true, options: [] },
        { id: 5, label: 'Urgente', type: 'checkbox', required: false, options: [] },
      ],
      entries: [
        { id: 1, data: { 'Nom du client': 'Jean-Pierre Habimana', 'Type de réclamation': 'Retard livraison', 'Description': 'Commande #1234 non livrée après 5 jours', 'Date': '2026-04-20', 'Urgente': true }, submittedAt: '2026-04-20 16:45', submittedBy: 'Sarah Lawson' },
        { id: 2, data: { 'Nom du client': 'Marie Ndayisaba', 'Type de réclamation': 'Facturation', 'Description': 'Facture incorrecte pour le mois de mars', 'Date': '2026-04-19', 'Urgente': false }, submittedAt: '2026-04-19 10:30', submittedBy: 'Sarah Lawson' },
      ],
      createdAt: '2026-02-20',
    },
  ])

  let nextModuleId = 3
  let nextFieldId = 100
  let nextEntryId = 100

  function getModule(id) {
    return modules.value.find(m => m.id === Number(id))
  }

  const sidebarModules = computed(() =>
    modules.value.filter(m => m.showInSidebar)
  )

  function addModule(name, description, showInSidebar = true) {
    const mod = {
      id: nextModuleId++,
      name,
      description,
      icon: 'Database',
      showInSidebar,
      fields: [],
      entries: [],
      createdAt: new Date().toISOString().split('T')[0],
    }
    modules.value.push(mod)
    return mod
  }

  function toggleSidebar(moduleId) {
    const mod = getModule(moduleId)
    if (mod) mod.showInSidebar = !mod.showInSidebar
  }

  function deleteModule(id) {
    modules.value = modules.value.filter(m => m.id !== Number(id))
  }

  function addField(moduleId, fieldData) {
    const mod = getModule(moduleId)
    if (!mod) return
    mod.fields.push({ id: nextFieldId++, ...fieldData })
  }

  function updateField(moduleId, fieldIndex, fieldData) {
    const mod = getModule(moduleId)
    if (!mod || !mod.fields[fieldIndex]) return
    Object.assign(mod.fields[fieldIndex], fieldData)
  }

  function removeField(moduleId, fieldIndex) {
    const mod = getModule(moduleId)
    if (!mod) return
    mod.fields.splice(fieldIndex, 1)
  }

  function moveField(moduleId, fieldIndex, direction) {
    const mod = getModule(moduleId)
    if (!mod) return
    const newIndex = fieldIndex + direction
    if (newIndex < 0 || newIndex >= mod.fields.length) return
    const temp = mod.fields[fieldIndex]
    mod.fields[fieldIndex] = mod.fields[newIndex]
    mod.fields[newIndex] = temp
  }

  function addEntry(moduleId, data, submittedBy) {
    const mod = getModule(moduleId)
    if (!mod) return
    mod.entries.push({
      id: nextEntryId++,
      data: { ...data },
      submittedAt: new Date().toLocaleString('fr-FR'),
      submittedBy: submittedBy || 'Moi',
    })
  }

  function deleteEntry(moduleId, entryId) {
    const mod = getModule(moduleId)
    if (!mod) return
    mod.entries = mod.entries.filter(e => e.id !== entryId)
  }

  return {
    modules,
    sidebarModules,
    getModule,
    addModule,
    deleteModule,
    toggleSidebar,
    addField,
    updateField,
    removeField,
    moveField,
    addEntry,
    deleteEntry,
  }
}, {
  persist: {
    key: 'builder-storage',
  },
})
