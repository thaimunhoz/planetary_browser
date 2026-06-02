export interface ClimateLayer {
  id: string
  label: string
  source: string
  unit: string
  yMin: number
  yMax: number
  openMeteoVar: string
  color: string
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
    color: '#FF8C42',
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
  },
  {
    id: 'et0',
    label: 'Evapotranspiration (ET₀)',
    source: 'ERA5 / Open-Meteo',
    unit: 'mm',
    yMin: 0,
    yMax: 20,
    openMeteoVar: 'et0_fao_evapotranspiration',
    color: '#36E2A4',
  },
  {
    id: 'wind',
    label: 'Wind Speed (10 m)',
    source: 'ERA5 / Open-Meteo',
    unit: 'm/s',
    yMin: 0,
    yMax: 30,
    openMeteoVar: 'wind_speed_10m_max',
    color: '#C084FC',
  },
  {
    id: 'solar',
    label: 'Solar Radiation',
    source: 'ERA5 / Open-Meteo',
    unit: 'MJ/m²',
    yMin: 0,
    yMax: 40,
    openMeteoVar: 'shortwave_radiation_sum',
    color: '#FACC15',
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
