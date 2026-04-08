import { useState, useRef, useEffect } from 'react'
import { useJsApiLoader, GoogleMap, MarkerF } from '@react-google-maps/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Loader2, MapPin } from 'lucide-react'

const LIBRARIES = ['places']
const DEFAULT_CENTER = { lat: -34.6037, lng: -58.3816 }
const MAP_STYLE = { width: '100%', height: '300px', borderRadius: '0.5rem' }

function extractFromAddressComponents(components) {
  const get = (type) =>
    components.find((c) => c.types.includes(type))?.longText || ''

  const route = get('route')
  const streetNumber = get('street_number')
  const street = streetNumber ? `${route} ${streetNumber}` : route
  const neighborhood =
    get('sublocality_level_1') || get('sublocality') || get('neighborhood') || ''
  const city = get('locality') || get('administrative_area_level_1') || ''

  return { street, neighborhood, city }
}

export default function AddressForm({ initial, onSubmit, onCancel, loading }) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES,
  })

  const [alias, setAlias] = useState(initial?.alias || '')
  const [floor, setFloor] = useState(initial?.floor || '')
  const [apartment, setApartment] = useState(initial?.apartment || '')
  const [comment, setComment] = useState(initial?.comment || '')
  const [error, setError] = useState('')

  const [query, setQuery] = useState(initial?.street || '')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const [selected, setSelected] = useState(() => {
    if (initial?.lat && initial?.lng) {
      return {
        street: initial.street || '',
        neighborhood: initial.neighborhood || '',
        city: initial.city || '',
        lat: Number(initial.lat),
        lng: Number(initial.lng),
        formattedAddress: initial.street || '',
      }
    }
    return null
  })

  const mapRef = useRef(null)
  const debounceRef = useRef(null)
  const wrapperRef = useRef(null)

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

  // Pan + zoom map on selection
  useEffect(() => {
    if (mapRef.current && selected) {
      mapRef.current.panTo({ lat: selected.lat, lng: selected.lng })
      mapRef.current.setZoom(15)
    }
  }, [selected])

  // Fetch suggestions as user types
  useEffect(() => {
    if (!isLoaded || query.length < 3) {
      setSuggestions([])
      return
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const { suggestions: results } =
          await google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions(
            {
              input: query,
              language: 'es',
              includedRegionCodes: ['ar'],
              locationBias: {
                center: DEFAULT_CENTER,
                radius: 50000,
              },
            },
          )
        setSuggestions(results || [])
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(debounceRef.current)
  }, [isLoaded, query])

  async function handleSelectSuggestion(suggestion) {
    const prediction = suggestion.placePrediction
    setQuery(prediction.text.text)
    setShowSuggestions(false)
    setSuggestions([])

    try {
      const place = new google.maps.places.Place({ id: prediction.placeId })
      await place.fetchFields({
        fields: ['addressComponents', 'formattedAddress', 'location'],
      })

      const lat = place.location.lat()
      const lng = place.location.lng()
      const { street, neighborhood, city } = extractFromAddressComponents(
        place.addressComponents || [],
      )

      setSelected({
        street: street || place.formattedAddress,
        neighborhood,
        city,
        lat,
        lng,
        formattedAddress: place.formattedAddress,
      })
    } catch (err) {
      console.error('Place details error:', err)
    }
  }

  function handleQueryChange(e) {
    setQuery(e.target.value)
    if (selected) setSelected(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!alias.trim()) {
      setError('El alias es obligatorio')
      return
    }

    if (!selected) {
      setError('Seleccioná una dirección del buscador')
      return
    }

    try {
      await onSubmit({
        alias: alias.trim(),
        street: selected.street,
        neighborhood: selected.neighborhood,
        city: selected.city,
        lat: selected.lat,
        lng: selected.lng,
        floor: floor.trim(),
        apartment: apartment.trim(),
        comment: comment.trim(),
      })
    } catch (err) {
      setError(err.message)
    }
  }

  const isEdit = !!initial
  const center = selected
    ? { lat: selected.lat, lng: selected.lng }
    : DEFAULT_CENTER

  if (!isLoaded) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-gray-400" />
          <span className="text-gray-500">Cargando mapa...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">
          {isEdit ? 'Editar dirección' : 'Nueva dirección'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {error && (
            <p className="rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <Label htmlFor="alias">Alias</Label>
            <Input
              id="alias"
              placeholder="Ej: Casa, Trabajo"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Dirección</Label>
            <div ref={wrapperRef} className="relative">
              <Input
                placeholder="Buscar dirección..."
                value={query}
                onChange={handleQueryChange}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                  {suggestions.map((s, i) => (
                    <li
                      key={i}
                      className="flex cursor-pointer items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                      onMouseDown={() => handleSelectSuggestion(s)}
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                      <div>
                        <span className="font-medium">
                          {s.placePrediction.mainText.text}
                        </span>
                        <span className="ml-1 text-gray-500 dark:text-gray-400">
                          {s.placePrediction.secondaryText?.text}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selected && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selected.formattedAddress}
              </p>
            )}
          </div>

          <GoogleMap
            mapContainerStyle={MAP_STYLE}
            center={center}
            zoom={selected ? 15 : 12}
            onLoad={(map) => { mapRef.current = map }}
            options={{
              disableDefaultUI: true,
              zoomControl: true,
              clickBehavior: 'none',
            }}
          >
            {selected && (
              <MarkerF position={{ lat: selected.lat, lng: selected.lng }} />
            )}
          </GoogleMap>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="floor">
                Piso{' '}
                <span className="text-gray-400 dark:text-gray-500">
                  (opcional)
                </span>
              </Label>
              <Input
                id="floor"
                placeholder="3"
                value={floor}
                onChange={(e) => setFloor(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apartment">
                Depto{' '}
                <span className="text-gray-400 dark:text-gray-500">
                  (opcional)
                </span>
              </Label>
              <Input
                id="apartment"
                placeholder="B"
                value={apartment}
                onChange={(e) => setApartment(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">
              Comentario{' '}
              <span className="text-gray-400 dark:text-gray-500">
                (opcional)
              </span>
            </Label>
            <Textarea
              id="comment"
              placeholder="Timbre, referencias..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Guardando...' : isEdit ? 'Guardar' : 'Agregar'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Cancelar
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  )
}
