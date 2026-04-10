import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useJsApiLoader, GoogleMap, PolygonF, PolylineF } from '@react-google-maps/api'
import { adminGetDeliveryConfig, adminUpdateDeliveryConfig } from '@/services/handlers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  Loader2,
  Save,
  Trash2,
  MapPin,
  Hexagon,
} from 'lucide-react'

const LIBRARIES = ['places', 'marker']
const MAP_STYLE = { width: '100%', height: '100%', borderRadius: '0.5rem' }
const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 }

const ZONE_COLORS = [
  '#4285F4', '#EA4335', '#FBBC04', '#34A853', '#FF6D01', '#46BDC6', '#9334E6', '#E91E63',
]

function getZoneColor(index) {
  return ZONE_COLORS[index % ZONE_COLORS.length]
}

export default function AdminZonasPage() {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [storeLat, setStoreLat] = useState(DEFAULT_CENTER.lat)
  const [storeLng, setStoreLng] = useState(DEFAULT_CENTER.lng)
  const [storeAddress, setStoreAddress] = useState('')
  const [addressQuery, setAddressQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [zones, setZones] = useState([])
  const [drawingMode, setDrawingMode] = useState(false)
  const [drawingPoints, setDrawingPoints] = useState([])

  const mapRef = useRef(null)
  const storeMarkerRef = useRef(null)
  const drawingMarkersRef = useRef([])
  const debounceRef = useRef(null)
  const colorCounterRef = useRef(0)
  const wrapperRef = useRef(null)
  const userTypedRef = useRef(false)

  useEffect(() => {
    let stale = false
    async function loadConfig() {
      try {
        setLoading(true)
        const data = await adminGetDeliveryConfig()
        if (stale) return
        setStoreLat(data.storeLat)
        setStoreLng(data.storeLng)
        setStoreAddress(data.storeAddress || '')
        setAddressQuery(data.storeAddress || '')
        const loaded = data.zones || []
        setZones(loaded.map((z, i) => ({ ...z, colorIndex: z.colorIndex ?? i })))
        const maxIdx = loaded.reduce((max, z, i) => Math.max(max, z.colorIndex ?? i), -1)
        colorCounterRef.current = maxIdx + 1
      } catch {
        if (!stale) setError('Error al cargar la configuración de delivery')
      } finally {
        if (!stale) setLoading(false)
      }
    }
    loadConfig()
    return () => { stale = true }
  }, [])

  const onMapLoad = useCallback((map) => {
    mapRef.current = map
  }, [])

  // Store marker (AdvancedMarkerElement)
  useEffect(() => {
    const map = mapRef.current
    if (!map || !isLoaded) return
    if (storeMarkerRef.current) storeMarkerRef.current.map = null
    storeMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: storeLat, lng: storeLng },
      title: 'Ubicaci\u00f3n del local',
    })
    return () => { if (storeMarkerRef.current) storeMarkerRef.current.map = null }
  }, [isLoaded, storeLat, storeLng])

  // Drawing point markers (AdvancedMarkerElement)
  useEffect(() => {
    const map = mapRef.current
    // Clean previous markers
    drawingMarkersRef.current.forEach((m) => { m.map = null })
    drawingMarkersRef.current = []
    if (!map || !isLoaded || drawingPoints.length === 0) return
    const color = getZoneColor(colorCounterRef.current)
    drawingPoints.forEach((pt, idx) => {
      const isFirst = idx === 0 && drawingPoints.length >= 3
      const size = isFirst ? 16 : 12
      const dot = document.createElement('div')
      dot.style.cssText = `width:${size}px;height:${size}px;border-radius:50%;background:${isFirst ? '#fff' : color};border:${isFirst ? 3 : 2}px solid ${isFirst ? color : '#fff'};box-shadow:0 1px 3px rgba(0,0,0,.3)${isFirst ? ';cursor:pointer' : ''}`
      if (isFirst) dot.title = 'Click para cerrar el pol\u00edgono'
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: pt,
        content: dot,
      })
      drawingMarkersRef.current.push(marker)
    })
    return () => {
      drawingMarkersRef.current.forEach((m) => { m.map = null })
      drawingMarkersRef.current = []
    }
  }, [isLoaded, drawingPoints])

  // Close suggestions on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch suggestions as user types
  useEffect(() => {
    if (!isLoaded || !userTypedRef.current || addressQuery.length < 3) {
      setSuggestions([])
      return
    }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const { suggestions: results } =
          await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: addressQuery,
            language: 'es',
            includedRegionCodes: ['ar'],
            locationBias: { center: DEFAULT_CENTER, radius: 50000 },
          })
        setSuggestions(results || [])
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [isLoaded, addressQuery])

  async function handleSelectSuggestion(suggestion) {
    const prediction = suggestion.placePrediction
    userTypedRef.current = false
    setAddressQuery(prediction.text.text)
    setShowSuggestions(false)
    setSuggestions([])
    try {
      const place = new google.maps.places.Place({ id: prediction.placeId })
      await place.fetchFields({
        fields: ['formattedAddress', 'location'],
      })
      const lat = place.location.lat()
      const lng = place.location.lng()
      setStoreLat(lat)
      setStoreLng(lng)
      setStoreAddress(place.formattedAddress || prediction.text.text)
      mapRef.current?.panTo({ lat, lng })
      mapRef.current?.setZoom(15)
    } catch (err) {
      console.error('Place details error:', err)
    }
  }

  // Memoize map center so drawing clicks don't re-center the map
  const mapCenter = useMemo(() => ({ lat: storeLat, lng: storeLng }), [storeLat, storeLng])

  function handleMapClick(e) {
    if (!drawingMode) return
    const newPoint = { lat: e.latLng.lat(), lng: e.latLng.lng() }

    // Snap-to-close: if ≥3 points and click is near the first point, auto-confirm
    if (drawingPoints.length >= 3) {
      const first = drawingPoints[0]
      const map = mapRef.current
      if (map) {
        const bounds = map.getBounds()
        if (bounds) {
          const ne = bounds.getNorthEast()
          const sw = bounds.getSouthWest()
          const mapSpan = Math.max(
            Math.abs(ne.lat() - sw.lat()),
            Math.abs(ne.lng() - sw.lng()),
          )
          const threshold = mapSpan * 0.02
          if (
            Math.abs(newPoint.lat - first.lat) < threshold &&
            Math.abs(newPoint.lng - first.lng) < threshold
          ) {
            handleDrawingConfirm()
            return
          }
        }
      }
    }

    setDrawingPoints((prev) => [...prev, newPoint])
  }

  function handleDrawingConfirm() {
    if (drawingPoints.length < 3) return
    const newZone = {
      id: crypto.randomUUID().slice(0, 8),
      name: `Zona ${zones.length + 1}`,
      type: 'polygon',
      polygon: drawingPoints,
      colorIndex: colorCounterRef.current++,
      cost: 0,
      estimatedMinutes: 30,
      enabled: true,
    }
    setZones((prev) => [...prev, newZone])
    setDrawingPoints([])
    setDrawingMode(false)
  }

  function cancelDrawing() {
    setDrawingPoints([])
    setDrawingMode(false)
  }

  function undoLastPoint() {
    setDrawingPoints((prev) => prev.slice(0, -1))
  }

  function updateZone(index, field, value) {
    setZones((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  function removeZone(index) {
    setZones((prev) => prev.filter((_, i) => i !== index))
  }

  function toggleZone(index) {
    setZones((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], enabled: !copy[index].enabled }
      return copy
    })
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await adminUpdateDeliveryConfig({
        storeLat,
        storeLng,
        storeAddress,
        zones: zones.map((z) => ({
          ...z,
          cost: Number(z.cost),
          estimatedMinutes: z.estimatedMinutes ? Number(z.estimatedMinutes) : null,
        })),
      })
      setSuccess('Configuración guardada correctamente')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Zonas de delivery</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Guardar configuración
        </Button>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}
      {success && (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-600 dark:bg-green-950 dark:text-green-400">
          {success}
        </p>
      )}

      {/* Main two-column layout: map + zones side by side on desktop */}
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 xl:grid-cols-[1fr_400px]">
        {/* Left column: Map */}
        <Card className="flex flex-col">
          <CardContent className="flex flex-1 flex-col gap-4 pt-4">
            {/* Address + max radius row */}
            <div className="flex gap-3">
              <div className="flex-1" ref={wrapperRef}>
                <Label htmlFor="storeAddress">Domicilio del local</Label>
                <div className="relative mt-1.5">
                  <Input
                    id="storeAddress"
                    type="text"
                    value={addressQuery}
                    onChange={(e) => {
                      userTypedRef.current = true
                      setAddressQuery(e.target.value)
                      setStoreAddress(e.target.value)
                    }}
                    placeholder="Ej: Av. Corrientes 1234, CABA"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                      {suggestions.map((s, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => handleSelectSuggestion(s)}
                          >
                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
                            <span>{s.placePrediction.text.text}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            <div className="min-h-[300px] flex-1">
              <GoogleMap
                mapContainerStyle={MAP_STYLE}
                center={mapCenter}
                zoom={13}
                onLoad={onMapLoad}
                onClick={handleMapClick}
                options={{ streetViewControl: false, fullscreenControl: false, mapTypeControl: false, mapId: 'DEMO_MAP_ID', draggableCursor: drawingMode ? 'crosshair' : undefined }}
              >
                {zones.map((zone) => {
                  if (!zone.enabled) return null
                  if (!zone.polygon || zone.polygon.length < 3) return null
                  const color = getZoneColor(zone.colorIndex ?? 0)
                  return (
                    <PolygonF
                      key={zone.id}
                      paths={zone.polygon}
                      options={{
                        strokeColor: color,
                        strokeOpacity: 0.8,
                        strokeWeight: 2,
                        fillColor: color,
                        fillOpacity: 0.2,
                        clickable: !drawingMode,
                      }}
                    />
                  )
                })}

                {drawingPoints.length > 0 && (
                  <PolylineF
                    path={drawingPoints}
                    options={{
                      strokeColor: getZoneColor(colorCounterRef.current),
                      strokeOpacity: 0.8,
                      strokeWeight: 2,
                      clickable: false,
                    }}
                  />
                )}
              </GoogleMap>

            </div>

            <div className="flex gap-2">
              {drawingMode ? (
                <>
                  <Button
                    size="sm"
                    onClick={handleDrawingConfirm}
                    disabled={drawingPoints.length < 3}
                  >
                    <Hexagon className="mr-2 h-4 w-4" />
                    Confirmar polígono ({drawingPoints.length} puntos)
                  </Button>
                  {drawingPoints.length > 0 && (
                    <Button variant="outline" size="sm" onClick={undoLastPoint}>
                      Deshacer punto
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={cancelDrawing}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setDrawingMode(true)}>
                  <Hexagon className="mr-2 h-4 w-4" />
                  Dibujar polígono
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right column: Zone list */}
        <Card className="h-fit max-xl:max-h-none xl:overflow-y-auto">
          <CardHeader>
            <CardTitle>Zonas ({zones.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {zones.length === 0 ? (
              <p className="text-sm text-gray-500">No hay zonas configuradas. Usá el botón "Dibujar polígono" en el mapa para crear una zona.</p>
            ) : null}
            {zones.map((zone, i) => {
              const color = getZoneColor(zone.colorIndex ?? i)
              return (
                <div
                  key={zone.id}
                  className={cn(
                    'rounded-lg border p-3 space-y-2',
                    !zone.enabled && 'opacity-50',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm font-medium">Polígono</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeZone(i)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Nombre</Label>
                      <Input
                        value={zone.name}
                        onChange={(e) => updateZone(i, 'name', e.target.value)}
                        placeholder="Nombre"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Costo ($)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={zone.cost}
                        onChange={(e) => updateZone(i, 'cost', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Tiempo (min)</Label>
                      <Input
                        type="number"
                        min="0"
                        value={zone.estimatedMinutes || ''}
                        onChange={(e) => updateZone(i, 'estimatedMinutes', e.target.value)}
                        placeholder="30"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                    <Label className="text-xs text-muted-foreground cursor-pointer" htmlFor={`zone-enabled-${zone.id}`}>
                      {zone.enabled ? 'Activa' : 'Desactivada'}
                    </Label>
                    <button
                      id={`zone-enabled-${zone.id}`}
                      type="button"
                      role="switch"
                      aria-checked={zone.enabled}
                      onClick={() => toggleZone(i)}
                      className={cn(
                        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 transition-colors',
                        zone.enabled ? 'bg-gray-900 border-gray-900 dark:bg-white dark:border-white' : 'bg-gray-300 border-gray-300 dark:bg-gray-600 dark:border-gray-600',
                      )}
                    >
                      <span
                        className={cn(
                          'pointer-events-none block h-4 w-4 rounded-full bg-white dark:bg-gray-900 shadow-sm transition-transform',
                          zone.enabled ? 'translate-x-4' : 'translate-x-0',
                        )}
                      />
                    </button>
                  </div>
                </div>
              )
            })}

          </CardContent>
        </Card>
      </div>
    </div>
  )
}
