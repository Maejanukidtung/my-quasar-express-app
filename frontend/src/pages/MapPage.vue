<template>
  <div class="page-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <h1 class="sidebar-title">ข้อมูลราคาลำไย 🗓️</h1>

      <q-form @submit="onSubmit" class="form-container">
        <div class="form-group">
          <label for="placeName" class="form-label"> สถานที่ / จังหวัด </label>
          <q-input
            v-model="formData.placeName"
            id="placeName"
            outlined
            dense
            placeholder="ตลาด/ชื่อตำบล, จังหวัด"
            :rules="[(val) => !!val || 'กรุณากรอกข้อมูล']"
          />
        </div>

        <div class="form-row">
          <div class="form-col-half">
            <label class="form-label">ราคา (บาท/กก.)</label>
            <q-input
              v-model.number="formData.price"
              id="price"
              type="number"
              outlined
              dense
              step="0.01"
              placeholder="เช่น 35.50"
              :rules="[(val) => val > 0 || 'กรุณากรอกราคา']"
            />
          </div>
          <div class="form-col-half">
            <label class="form-label">วันที่สำรวจ</label>
            <q-input
              v-model="formData.date"
              id="date"
              type="date"
              outlined
              dense
              :rules="[(val) => !!val || 'กรุณาเลือกวันที่']"
            />
          </div>
        </div>

        <div class="form-group">
          <p class="form-hint">หรือกำหนดพิกัดเอง (ถ้ามี)</p>
          <div class="form-row">
            <q-input
              v-model.number="formData.lat"
              type="number"
              outlined
              dense
              step="any"
              placeholder="Latitude"
              class="form-col-half"
            />
            <q-input
              v-model.number="formData.lng"
              type="number"
              outlined
              dense
              step="any"
              placeholder="Longitude"
              class="form-col-half"
            />
          </div>
        </div>

        <q-btn
          type="submit"
          color="green"
          label="➕ เพิ่มจุดลำไยบนแผนที่"
          class="submit-btn"
          unelevated
        />
      </q-form>

      <p v-if="geocodeStatus" class="geocode-status">{{ geocodeStatus }}</p>

      <h2 class="list-title">รายการจุดที่บันทึก</h2>
      <div class="marker-list">
        <p v-if="longanData.length === 0" class="empty-message">ยังไม่มีจุดข้อมูล...</p>
        <div v-for="item in longanData" :key="item.id" class="marker-item">
          <div class="marker-place">📍 {{ item.place }}</div>
          <div class="marker-info">💰 ราคา: {{ item.price.toFixed(2) }} บาท/กก.</div>
          <div class="marker-info">📅 วันที่: {{ item.date }}</div>
        </div>
      </div>
    </div>

    <!-- Map -->
    <div id="longanMap" class="map-container"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

const NORTHERN_THAI_CENTER = [18.7883, 98.9853]
const INITIAL_ZOOM = 8

let map = null
const markers = ref([])
const longanData = ref([])
const geocodeStatus = ref('')

const formData = ref({
  placeName: '',
  price: null,
  date: '',
  lat: null,
  lng: null,
})

const createPopupContent = (data) => `
  <div class="p-1 font-semibold text-gray-800">📍 ${data.place}</div>
  <div class="text-xs text-gray-600">💰 ราคา: ${data.price.toFixed(2)} บาท/กก.</div>
  <div class="text-xs text-gray-600">📅 วันที่: ${data.date}</div>
`

const createMarker = (data) => {
  const icon = L.icon({
    iconUrl:
      'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M12%202C8.686%202%206%204.686%206%208c0%204.255%206%2014%206%2014s6-9.745%206-14c0-3.314-2.686-6-6-6zM12%2012a4%204%200%201%201%200-8%204%204%200%200%201%200%208z%22%20fill%3D%22%2310B981%22%2F%3E%3C%2Fsvg%3E',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
    popupAnchor: [0, -20],
  })

  const marker = L.marker([data.lat, data.lng], { icon }).addTo(map)
  marker.bindPopup(createPopupContent(data))
  markers.value.push(marker)
}

const redrawMarkers = () => {
  markers.value.forEach((m) => map.removeLayer(m))
  markers.value = []
  longanData.value.forEach(createMarker)
}

const fitMapToBounds = () => {
  if (markers.value.length === 0) return
  const bounds = L.latLngBounds(markers.value.map((m) => m.getLatLng()))
  map.fitBounds(bounds, { padding: [50, 50] })
}

const onSubmit = () => {
  const { placeName, price, date, lat, lng } = formData.value

  if (isNaN(lat) || isNaN(lng)) {
    geocodeStatus.value = 'กรุณากรอกพิกัดเอง เพราะเราไม่ได้เปิดใช้ Geocoding ในโค้ดนี้'
    return
  }

  longanData.value.push({
    id: Date.now(),
    place: placeName,
    price,
    date,
    lat,
    lng,
  })

  redrawMarkers()
  fitMapToBounds()

  // Reset form
  formData.value = {
    placeName: '',
    price: null,
    date: '',
    lat: null,
    lng: null,
  }
  geocodeStatus.value = ''
}

onMounted(() => {
  // Initialize map
  map = L.map('longanMap').setView(NORTHERN_THAI_CENTER, INITIAL_ZOOM)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
  }).addTo(map)

  // Sample data
  longanData.value = [
    { id: 1, place: 'เชียงใหม่', price: 35.5, date: '2023-08-15', lat: 18.7883, lng: 98.9853 },
    {
      id: 2,
      place: 'นายจักรพรรดิ์ เจริญ 6604101313',
      price: 38.0,
      date: '2023-09-01',
      lat: 18.8878,
      lng: 99.0186,
    },
    { id: 3, place: 'ลำพูน', price: 32.5, date: '2023-08-20', lat: 18.5878, lng: 99.0061 },
  ]

  redrawMarkers()
  fitMapToBounds()
})
</script>

<style scoped>
/* Page Layout */
.page-container {
  display: flex;
  padding: 16px;
  height: 100vh;
  overflow: hidden;
}

/* Sidebar */
.sidebar {
  width: 100%;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 24px;
  overflow-y: auto;
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #1f2937;
  margin-bottom: 24px;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

/* Form */
.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 4px;
}

.form-row {
  display: flex;
  gap: 8px;
}

.form-col-half {
  flex: 1;
}

.form-hint {
  font-size: 0.75rem;
  color: #6b7280;
  font-style: italic;
  margin: 0 0 8px 0;
}

.submit-btn {
  width: 100%;
  margin-top: 8px;
}

.geocode-status {
  margin-top: 16px;
  font-size: 0.75rem;
  color: #6b7280;
}

/* Marker List */
.list-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-top: 32px;
  margin-bottom: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.marker-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.empty-message {
  color: #6b7280;
  font-size: 0.875rem;
}

.marker-item {
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.marker-place {
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 4px;
}

.marker-info {
  font-size: 0.75rem;
  color: #4b5563;
  margin: 2px 0;
}

/* Map */
.map-container {
  flex-grow: 1;
  height: 100%;
  min-height: 400px;
}

/* Responsive */
@media (min-width: 768px) {
  .sidebar {
    width: 33.333%;
  }
}

@media (min-width: 1024px) {
  .sidebar {
    width: 25%;
  }
}

@media (min-width: 1280px) {
  .sidebar {
    width: 20%;
  }
}

/* Leaflet Popup Styles */
:deep(.leaflet-popup-content-wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

:deep(.leaflet-popup-content) {
  font-size: 0.875rem;
  padding: 0.3rem;
}

:deep(.leaflet-container .leaflet-marker-icon) {
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
}
</style>
