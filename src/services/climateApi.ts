export interface ClimatePalette {
  id: string
  label: string
  color: string
}

export interface ClimateLayer {
  id: string
  label: string
  source: string
  unit: string
  yMin: number
  yMax: number
  openMeteoVar: string
  color: string
  palettes: ClimatePalette[]
}

export const CLIMATE_LAYERS: ClimateLayer[] = [
  {
    id: 'temperature',
    label: 'Temperature (2 m)',
    source: 'ERA5 / Open-Meteo',
    unit: '°C',
    yMin: -40,
    yMax: 50,
    openMeteoVar: 'temperature_2m_mean',
    color: '#E05252',
    palettes: [
      { id: 'thermal',  label: 'Thermal',  color: '#E05252' },
      { id: 'coolwarm', label: 'Coolwarm', color: '#9C59D1' },
      { id: 'reds',     label: 'Reds',     color: '#FF8080' },
    ],
  },
  {
    id: 'precipitation',
    label: 'Precipitation',
    source: 'ERA5 / Open-Meteo',
    unit: 'mm',
    yMin: 0,
    yMax: 100,
    openMeteoVar: 'precipitation_sum',
    color: '#4DA6FF',
    palettes: [
      { id: 'blues',   label: 'Blues',   color: '#4DA6FF' },
      { id: 'ylgnbu',  label: 'YlGnBu',  color: '#26A69A' },
      { id: 'wetdry',  label: 'Wet/Dry', color: '#0077CC' },
    ],
  },
  {
    id: 'et0',
    label: 'Evapotranspiration (ET₀)',
    source: 'ERA5 / Open-Meteo',
    unit: 'mm',
    yMin: 0,
    yMax: 20,
    openMeteoVar: 'et0_fao_evapotranspiration',
    color: '#3BAE70',
    palettes: [
      { id: 'greens', label: 'Greens', color: '#3BAE70' },
      { id: 'ylgn',   label: 'YlGn',   color: '#8BC34A' },
      { id: 'teal',   label: 'Teal',   color: '#26A69A' },
    ],
  },
  {
    id: 'wind',
    label: 'Wind Speed (10 m)',
    source: 'ERA5 / Open-Meteo',
    unit: 'm/s',
    yMin: 0,
    yMax: 30,
    openMeteoVar: 'wind_speed_10m_max',
    color: '#8A9BB0',
    palettes: [
      { id: 'greys',   label: 'Greys',   color: '#8A9BB0' },
      { id: 'steel',   label: 'Steel',   color: '#607D8B' },
      { id: 'breeze',  label: 'Breeze',  color: '#B0BEC5' },
    ],
  },
  {
    id: 'solar',
    label: 'Solar Radiation',
    source: 'ERA5 / Open-Meteo',
    unit: 'MJ/m²',
    yMin: 0,
    yMax: 40,
    openMeteoVar: 'shortwave_radiation_sum',
    color: '#FF4757',
    palettes: [
      { id: 'fire',    label: 'Fire',    color: '#FF4757' },
      { id: 'oranges', label: 'Oranges', color: '#FF8C00' },
      { id: 'ylord',   label: 'YlOrRd', color: '#FF6B35' },
    ],
  },
]

export interface ClimatePoint {
  date: string
  value: number | null
}

export async function fetchClimateTimeSeries(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string,
  layerId: string,
): Promise<ClimatePoint[]> {
  const layer = CLIMATE_LAYERS.find(l => l.id === layerId)
  if (!layer) return []

  const params = new URLSearchParams({
    latitude: lat.toFixed(4),
    longitude: lon.toFixed(4),
    start_date: startDate,
    end_date: endDate,
    daily: layer.openMeteoVar,
    timezone: 'UTC',
  })

  const res = await fetch(`https://archive-api.open-meteo.com/v1/archive?${params.toString()}`)
  if (!res.ok) throw new Error(`Climate API error: HTTP ${res.status}`)

  const json = await res.json() as {
    daily: Record<string, (number | null)[] | string[]>
  }

  const times = json.daily['time'] as string[]
  const values = json.daily[layer.openMeteoVar] as (number | null)[]

  return times.map((date, i) => ({ date, value: values[i] ?? null }))
}
