import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, AlertCircle, RefreshCw } from 'lucide-react';

// Global type declaration
declare global {
  interface Window {
    google: any;
    googleMapsReady: boolean;
    initGoogleMaps: () => void;
  }
}

interface GoogleMapProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  height?: string;
  showControls?: boolean;
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  latitude = 41.2995, // Toshkent default koordinatalari
  longitude = 69.2401,
  onLocationSelect,
  height = '400px',
  showControls = true
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState({ lat: latitude, lng: longitude });

  const createMap = () => {
    if (!mapRef.current || !window.google?.maps) {
      console.log('❌ Map container or Google Maps not ready');
      return;
    }

    try {
      console.log('🗺️ Creating Google Map...');

      // Create map
      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: { lat: latitude, lng: longitude },
        zoom: 15,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      // Create marker
      const markerInstance = new window.google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: mapInstance,
        draggable: true,
        title: 'Yotoqxona joylashuvi',
      });

      // InfoWindow
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px;">
            <h4>🏠 Yotoqxona</h4>
            <p>Markerni suring yoki xaritani bosing</p>
          </div>
        `
      });

      // Events
      markerInstance.addListener('click', () => {
        infoWindow.open(mapInstance, markerInstance);
      });

      markerInstance.addListener('dragend', () => {
        const position = markerInstance.getPosition();
        if (position) {
          const lat = position.lat();
          const lng = position.lng();
          setCurrentLocation({ lat, lng });

          if (onLocationSelect) {
            onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }
        }
      });

      mapInstance.addListener('click', (event: any) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();

          markerInstance.setPosition({ lat, lng });
          setCurrentLocation({ lat, lng });

          if (onLocationSelect) {
            onLocationSelect(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }
        }
      });

      setMap(mapInstance);
      setMarker(markerInstance);
      setIsLoading(false);
      setError('');

      console.log('✅ Google Map created successfully');
    } catch (err) {
      console.error('❌ Error creating map:', err);
      setError('Xaritani yaratishda xatolik');
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 GoogleMap useEffect triggered');

    const initMap = () => {
      if (window.google?.maps && mapRef.current) {
        createMap();
      } else {
        console.log('⏳ Waiting for Google Maps API or DOM...');
      }
    };

    // Check if already loaded
    if (window.google?.maps) {
      console.log('✅ Google Maps already loaded');
      setTimeout(initMap, 100); // Small delay for DOM
    } else {
      // Listen for load event
      const handleLoad = () => {
        console.log('📡 Google Maps loaded via event');
        setTimeout(initMap, 100);
      };

      const handleError = () => {
        console.error('❌ Google Maps failed to load');
        setError('Google Maps yuklanmadi');
        setIsLoading(false);
      };

      window.addEventListener('google-maps-ready', handleLoad);
      window.addEventListener('google-maps-error', handleError);

      // Timeout
      const timeout = setTimeout(() => {
        if (!window.google?.maps) {
          setError('Google Maps yuklash vaqti tugadi');
          setIsLoading(false);
        }
      }, 10000);

      return () => {
        window.removeEventListener('google-maps-ready', handleLoad);
        window.removeEventListener('google-maps-error', handleError);
        clearTimeout(timeout);
      };
    }
  }, []);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation qo\'llab-quvvatlanmaydi');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        if (map && marker) {
          map.setCenter({ lat, lng });
          marker.setPosition({ lat, lng });
          setCurrentLocation({ lat, lng });

          if (onLocationSelect) {
            const geocoder = new window.google.maps.Geocoder();
            geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
              const address = (status === 'OK' && results?.[0])
                ? results[0].formatted_address
                : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
              onLocationSelect(lat, lng, address);
            });
          }
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setError('Joylashuvni aniqlab bo\'lmadi');
      }
    );
  };

  const centerMap = () => {
    if (map && marker) {
      const position = marker.getPosition();
      if (position) {
        map.setCenter(position);
      }
    }
  };

  const retryLoad = () => {
    setError('');
    setIsLoading(true);

    if (window.google?.maps) {
      createMap();
    } else {
      window.location.reload();
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Xarita yuklanmoqda...</p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Google Maps API kutilmoqda</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"
        style={{ height }}
      >
        <div className="text-center text-red-600 dark:text-red-400 p-4">
          <AlertCircle className="w-12 h-12 mx-auto mb-3" />
          <h3 className="font-semibold mb-2">Xarita yuklanmadi</h3>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={retryLoad}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Qayta yuklash
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
        style={{ height }}
      />

      {showControls && (
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button
            onClick={getCurrentLocation}
            className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Joriy joylashuvni aniqlash"
          >
            <Navigation className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>

          <button
            onClick={centerMap}
            className="bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            title="Markerni markazga qaytarish"
          >
            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </button>
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-white dark:bg-gray-800 px-3 py-2 rounded-lg shadow-md text-xs border border-gray-200 dark:border-gray-700">
        <div className="text-gray-600 dark:text-gray-400 font-medium">Koordinatalar:</div>
        <div className="text-blue-600 dark:text-blue-400 font-mono">
          {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
        </div>
      </div>
    </div>
  );
};

export default GoogleMap;