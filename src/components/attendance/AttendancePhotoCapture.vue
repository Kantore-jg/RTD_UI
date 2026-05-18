<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { Camera, RotateCcw, Check, X, AlertCircle } from 'lucide-vue-next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const props = defineProps({
  open: { type: Boolean, default: false },
  mode: {
    type: String,
    default: 'arrivee',
    validator: (v) => ['arrivee', 'depart'].includes(v),
  },
  loading: { type: Boolean, default: false },
})

const emit = defineEmits(['update:open', 'capture', 'cancel'])

const videoRef = ref(null)
const streamRef = ref(null)
const previewUrl = ref(null)
const capturedBlob = ref(null)
const cameraError = ref('')
const isStarting = ref(false)
const facingMode = ref('user')

const title = () => (props.mode === 'arrivee' ? "Photo d'arrivée" : 'Photo de départ')
const description = () =>
  props.mode === 'arrivee'
    ? 'Prenez une photo pour confirmer votre identité à l\'arrivée.'
    : 'Prenez une photo pour confirmer votre identité au départ.'

async function startCamera() {
  stopCamera()
  cameraError.value = ''
  isStarting.value = true
  previewUrl.value = null
  capturedBlob.value = null

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facingMode.value, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    })
    streamRef.value = stream
    if (videoRef.value) {
      videoRef.value.srcObject = stream
      await videoRef.value.play()
    }
  } catch {
    cameraError.value =
      'Impossible d\'accéder à la caméra. Autorisez l\'accès dans les paramètres du navigateur.'
  } finally {
    isStarting.value = false
  }
}

function stopCamera() {
  if (streamRef.value) {
    streamRef.value.getTracks().forEach((t) => t.stop())
    streamRef.value = null
  }
  if (videoRef.value) {
    videoRef.value.srcObject = null
  }
}

function takePhoto() {
  const video = videoRef.value
  if (!video?.videoWidth) return

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext('2d')
  ctx.drawImage(video, 0, 0)

  canvas.toBlob(
    (blob) => {
      if (!blob) return
      capturedBlob.value = blob
      if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = URL.createObjectURL(blob)
      stopCamera()
    },
    'image/jpeg',
    0.88,
  )
}

function retake() {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }
  capturedBlob.value = null
  startCamera()
}

async function switchCamera() {
  facingMode.value = facingMode.value === 'user' ? 'environment' : 'user'
  await startCamera()
}

function confirm() {
  if (!capturedBlob.value) return
  const file = new File([capturedBlob.value], `pointage-${props.mode}-${Date.now()}.jpg`, {
    type: 'image/jpeg',
  })
  emit('capture', file)
}

function close() {
  emit('update:open', false)
  emit('cancel')
}

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      startCamera()
    } else {
      stopCamera()
      if (previewUrl.value) {
        URL.revokeObjectURL(previewUrl.value)
        previewUrl.value = null
      }
      capturedBlob.value = null
      cameraError.value = ''
    }
  },
)

onUnmounted(() => {
  stopCamera()
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})
</script>

<template>
  <Dialog :open="open" @update:open="(v) => !v && close()">
    <DialogContent class="sm:max-w-md p-0 gap-0 overflow-hidden">
      <DialogHeader class="p-6 pb-4">
        <DialogTitle class="flex items-center gap-2">
          <Camera class="w-5 h-5 text-primary" />
          {{ title() }}
        </DialogTitle>
        <DialogDescription>{{ description() }}</DialogDescription>
      </DialogHeader>

      <div class="relative aspect-[4/3] bg-black mx-6 rounded-xl overflow-hidden">
        <video
          v-show="!previewUrl && !cameraError"
          ref="videoRef"
          class="w-full h-full object-cover mirror"
          playsinline
          muted
        />
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt="Aperçu"
          class="w-full h-full object-cover"
        />
        <div
          v-if="cameraError"
          class="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white bg-black/80"
        >
          <AlertCircle class="w-10 h-10 text-destructive" />
          <p class="text-sm">{{ cameraError }}</p>
          <Button variant="secondary" size="sm" @click="startCamera">Réessayer</Button>
        </div>
        <div
          v-else-if="isStarting && !previewUrl"
          class="absolute inset-0 flex items-center justify-center text-white text-sm"
        >
          Ouverture de la caméra…
        </div>
      </div>

      <div class="flex flex-wrap gap-2 p-6 pt-4">
        <template v-if="previewUrl">
          <Button variant="outline" class="flex-1" :disabled="loading" @click="retake">
            <RotateCcw class="w-4 h-4 mr-2" />
            Reprendre
          </Button>
          <Button class="flex-1" :disabled="loading" @click="confirm">
            <Check class="w-4 h-4 mr-2" />
            {{ loading ? 'Enregistrement…' : 'Confirmer' }}
          </Button>
        </template>
        <template v-else-if="!cameraError">
          <Button variant="outline" size="sm" :disabled="isStarting" @click="switchCamera">
            <RotateCcw class="w-4 h-4" />
          </Button>
          <Button class="flex-1" :disabled="isStarting || loading" @click="takePhoto">
            <Camera class="w-4 h-4 mr-2" />
            Prendre la photo
          </Button>
        </template>
        <Button variant="ghost" class="w-full" :disabled="loading" @click="close">
          <X class="w-4 h-4 mr-2" />
          Annuler
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<style scoped>
.mirror {
  transform: scaleX(-1);
}
</style>
