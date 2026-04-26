import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { moduleService } from '@/services/builder'

export const useBuilderStore = defineStore('builder', () => {
  const modules = ref([])
  const loaded = ref(false)

  const sidebarModules = computed(() =>
    modules.value.filter(m => m.showInSidebar)
  )

  async function fetchModules() {
    try {
      const { data } = await moduleService.list()
      modules.value = (data.data ?? data).map(normalize)
      loaded.value = true
    } catch {
      // silent — sidebar simply stays empty
    }
  }

  function normalize(m) {
    return {
      ...m,
      fields: m.fields || [],
      entriesCount: m.entries_count ?? 0,
      showInSidebar: m.show_in_sidebar ?? true,
    }
  }

  function updateLocal(id, patch) {
    const mod = modules.value.find(m => m.id === id)
    if (mod) Object.assign(mod, patch)
  }

  function removeLocal(id) {
    modules.value = modules.value.filter(m => m.id !== id)
  }

  async function toggleSidebar(moduleId) {
    const mod = modules.value.find(m => m.id === moduleId)
    if (!mod) return
    const newVal = !mod.showInSidebar
    mod.showInSidebar = newVal
    try {
      await moduleService.update(moduleId, { show_in_sidebar: newVal })
    } catch {
      mod.showInSidebar = !newVal
    }
  }

  return {
    modules,
    loaded,
    sidebarModules,
    fetchModules,
    normalize,
    updateLocal,
    removeLocal,
    toggleSidebar,
  }
})
