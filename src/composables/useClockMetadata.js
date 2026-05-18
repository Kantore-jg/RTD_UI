/**
 * Collecte GPS (optionnel) et infos appareil pour le pointage.
 */
export function useClockMetadata() {
  function getDeviceInfo() {
    const ua = navigator.userAgent || ''
    const platform = navigator.platform || ''
    return `${platform} | ${ua}`.slice(0, 500)
  }

  function getGeolocation(timeoutMs = 8000) {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        resolve({ latitude: null, longitude: null })
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          })
        },
        () => resolve({ latitude: null, longitude: null }),
        { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 0 },
      )
    })
  }

  async function collect() {
    const [geo] = await Promise.all([getGeolocation()])
    return {
      ...geo,
      device: getDeviceInfo(),
    }
  }

  return { collect, getDeviceInfo, getGeolocation }
}
