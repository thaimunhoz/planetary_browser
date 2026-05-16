<template>
  <div class="home" :data-theme="appStore.effectiveTheme === 'light' ? 'light' : undefined">
    <aside class="sidebar">
      <div class="brand">
        <img src="/favicon.svg" alt="Logo" class="logo" />
        <div>
          <h1 class="app-title">Planetary Computer TS Browser</h1>
          <p class="app-sub">Sentinel-2 Time-Series Explorer</p>
        </div>
      </div>

      <section class="card">
        <div class="card-header">
          <span class="card-title">Data source</span>
          <span class="badge badge-ok">Ready</span>
        </div>
        <p class="hint connected-hint">
          Sentinel-2 L2A imagery and point values are loaded directly from Microsoft Planetary Computer.
        </p>
      </section>

      <section class="card">
        <div class="card-title">Date range</div>
        <div class="date-row">
          <div class="field">
            <label>Start</label>
            <input v-model="startDate" type="date" />
          </div>
          <div class="field">
            <label>End</label>
            <input v-model="endDate" type="date" />
          </div>
        </div>
      </section>

      <section class="card coord-card">
        <div class="card-title">Location</div>
        <p v-if="picked" class="coord-text">{{ picked[1].toFixed(5) }} deg N, {{ picked[0].toFixed(5) }} deg E</p>
        <p v-else class="hint">Click on the map to choose a location.</p>
      </section>

      <button class="btn btn-accent btn-full btn-open" :disabled="!picked" @click="open">
        Open in Browser
      </button>
    </aside>

    <div ref="mapEl" class="map"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useAppStore } from '../stores/app'
import { serialiseUrl } from '../utils/url'
import { basemapUrl } from '../utils/basemap'

const appStore = useAppStore()

const startDate = ref(appStore.startDate)
const endDate = ref(appStore.endDate)

const mapEl = ref<HTMLDivElement | null>(null)
const picked = ref<[number, number] | null>(null)

let map: L.Map | null = null
let marker: L.CircleMarker | null = null

onMounted(() => {
  if (!mapEl.value) return
  map = L.map(mapEl.value, { zoomControl: true, attributionControl: false }).setView([20, 0], 2)
  L.tileLayer(basemapUrl(), { maxZoom: 19 }).addTo(map)

  map.on('click', (e: L.LeafletMouseEvent) => {
    const { lng: lon, lat } = e.latlng.wrap()
    picked.value = [lon, lat]
    if (!map) return
    if (marker) {
      marker.setLatLng([lat, lon])
    } else {
      marker = L.circleMarker([lat, lon], {
        radius: 7,
        color: 'var(--accent)',
        fillColor: 'var(--accent)',
        fillOpacity: 0.9,
        weight: 2,
      }).addTo(map)
    }
  })
})

watch(() => appStore.effectiveTheme, () => {
  map?.eachLayer(l => { if (l instanceof L.TileLayer) l.setUrl(basemapUrl()) })
})

onUnmounted(() => { map?.remove(); map = null })

function open() {
  if (!picked.value) return
  const [lon, lat] = picked.value
  const qs = serialiseUrl({ lon, lat, start: startDate.value, end: endDate.value, selected: null })
  window.location.href = qs
}
</script>

<style scoped>
.home {
  display: grid;
  grid-template-columns: 360px 1fr;
  height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: inherit;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px 20px;
  background: var(--bg-panel);
  border-right: 1px solid var(--border);
  overflow-y: auto;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 4px;
}

.logo {
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}

.app-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
}

.app-sub {
  margin: 2px 0 0;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-sub);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.badge {
  font-size: 0.72rem;
  padding: 2px 8px;
  border-radius: 99px;
  font-weight: 600;
}

.badge-ok { background: var(--bg-success); color: var(--green); }

.hint {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.55;
  margin: 0;
}

.connected-hint { color: var(--text-sub); }

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field label {
  font-size: 0.78rem;
  color: var(--text-sub);
}

.field input {
  background: var(--bg-input);
  border: 1px solid var(--border-mid);
  border-radius: 4px;
  color: var(--text);
  padding: 7px 10px;
  font-size: 0.88rem;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  color-scheme: dark;
}

.field input:focus { border-color: var(--accent); }

[data-theme="light"] .field input { color-scheme: light; }

.date-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.coord-card { min-height: 60px; }

.coord-text {
  margin: 0;
  font-size: 0.9rem;
  font-family: monospace;
  color: var(--accent);
}

.btn {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.88rem;
  padding: 9px 16px;
  font-weight: 600;
  transition: opacity 0.1s;
}

.btn:disabled { opacity: 0.4; cursor: not-allowed; }

.btn-accent {
  background: var(--accent);
  color: var(--bg-panel);
}

.btn-accent:not(:disabled):hover { opacity: 0.85; }

.btn-full { width: 100%; }

.btn-open { margin-top: auto; }

.map {
  height: 100%;
  cursor: crosshair;
}
</style>
