import { useState, useEffect } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// material-ui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import GlobalStyles from '@mui/material/GlobalStyles';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { providerService } from 'services/providerService';
import { Provider } from 'types/provider';

// assets
import { IconMapPin } from '@tabler/icons-react';

const MAPBOX_TOKEN = import.meta.env.VITE_APP_MAPBOX_ACCESS_TOKEN;

// North Carolina coordinates
const NC_CENTER = {
  latitude: 35.7596,
  longitude: -79.0193,
  zoom: 6.5
};

interface ProviderWithCoordinates extends Provider {
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export default function ProviderMap() {
  const [providers, setProviders] = useState<ProviderWithCoordinates[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<ProviderWithCoordinates | null>(null);
  const [viewState, setViewState] = useState(NC_CENTER);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await providerService.getAllProviders();

      // Geocode addresses to get coordinates
      const providersWithCoords = await Promise.all(
        data.map(async (provider) => {
          if (provider.address) {
            const { streetAddress, city, state, zipCode } = provider.address;
            const fullAddress = `${streetAddress}, ${city}, ${state} ${zipCode}`;

            try {
              // Use Mapbox Geocoding API
              const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
              const response = await fetch(geocodeUrl);
              const geocodeData = await response.json();

              if (geocodeData.features && geocodeData.features.length > 0) {
                const [longitude, latitude] = geocodeData.features[0].center;
                return {
                  ...provider,
                  coordinates: { latitude, longitude }
                };
              }
            } catch (err) {
              console.error(`Failed to geocode address for ${provider.nonprofitName}:`, err);
            }
          }
          return provider;
        })
      );

      setProviders(providersWithCoords);
      setError(null);
    } catch (err) {
      console.error('Failed to load providers:', err);
      setError('Failed to load providers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainCard title="Provider Map">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  if (error) {
    return (
      <MainCard title="Provider Map">
        <Alert severity="error">{error}</Alert>
      </MainCard>
    );
  }

  const providersWithLocations = providers.filter(p => p.coordinates);

  return (
    <MainCard title="Provider Map">
      <GlobalStyles
        styles={{
          '.mapboxgl-popup-content': {
            padding: '0 !important',
            boxShadow: 'none !important',
            background: 'transparent !important'
          },
          '.mapboxgl-popup-tip': {
            display: 'none !important'
          },
          '.mapboxgl-popup-close-button': {
            fontSize: '20px',
            padding: '8px',
            color: '#666',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.05)',
              color: '#000'
            }
          }
        }}
      />
      <Box sx={{ height: 600, width: '100%', position: 'relative' }}>
        <Map
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: '100%', height: '100%' }}
        >
          {/* Navigation Controls */}
          <NavigationControl position="top-right" />
          <FullscreenControl position="top-right" />

          {/* Provider Markers */}
          {providersWithLocations.map((provider) => (
            <Marker
              key={provider.id}
              latitude={provider.coordinates!.latitude}
              longitude={provider.coordinates!.longitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedProvider(provider);
              }}
            >
              <Box
                sx={{
                  cursor: 'pointer',
                  color: 'primary.main',
                  '&:hover': {
                    color: 'primary.dark',
                    transform: 'scale(1.2)',
                    transition: 'all 0.2s'
                  }
                }}
              >
                <IconMapPin size={32} />
              </Box>
            </Marker>
          ))}

          {/* Popup for selected provider */}
          {selectedProvider && selectedProvider.coordinates && (
            <Popup
              latitude={selectedProvider.coordinates.latitude}
              longitude={selectedProvider.coordinates.longitude}
              anchor="top"
              onClose={() => setSelectedProvider(null)}
              closeButton={true}
              closeOnClick={false}
            >
              <Card elevation={3} sx={{ minWidth: 250, maxWidth: 350 }}>
                <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                  <Typography variant="h4" gutterBottom>
                    {selectedProvider.nonprofitName}
                  </Typography>

                  {selectedProvider.address && (
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {selectedProvider.address.streetAddress}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedProvider.address.city}, {selectedProvider.address.state} {selectedProvider.address.zipCode}
                      </Typography>
                    </Box>
                  )}

                  {selectedProvider.contactInformation && selectedProvider.contactInformation.length > 0 && (
                    <Box sx={{ mb: 1 }}>
                      {selectedProvider.contactInformation[0].officePhone && (
                        <Typography variant="body2">
                          Phone: {selectedProvider.contactInformation[0].officePhone}
                        </Typography>
                      )}
                      {selectedProvider.contactInformation[0].generalEmail && (
                        <Typography variant="body2">
                          Email: {selectedProvider.contactInformation[0].generalEmail}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {selectedProvider.description && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {selectedProvider.description.length > 150
                        ? `${selectedProvider.description.substring(0, 150)}...`
                        : selectedProvider.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Popup>
          )}
        </Map>

        {/* Stats */}
        <Box
          sx={{
            position: 'absolute',
            bottom: 16,
            left: 16,
            backgroundColor: 'background.paper',
            padding: 2,
            borderRadius: 1,
            boxShadow: 2
          }}
        >
          <Typography variant="body2">
            <strong>{providersWithLocations.length}</strong> of <strong>{providers.length}</strong> providers shown on map
          </Typography>
        </Box>
      </Box>
    </MainCard>
  );
}
