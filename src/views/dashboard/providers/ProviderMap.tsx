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
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';

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
  const [selectedDemographics, setSelectedDemographics] = useState<string[]>([]);
  const [selectedBusinessTypes, setSelectedBusinessTypes] = useState<string[]>([]);
  const [availableDemographics, setAvailableDemographics] = useState<string[]>([]);
  const [availableBusinessTypes, setAvailableBusinessTypes] = useState<string[]>([]);

  useEffect(() => {
    loadProviders();
  }, []);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const data = await providerService.getAllProviders();

      // Use stored coordinates or geocode if needed
      const providersWithCoords = await Promise.all(
        data.map(async (provider) => {
          if (provider.address) {
            // Check if we already have stored coordinates
            if (provider.address.latitude && provider.address.longitude) {
              return {
                ...provider,
                coordinates: {
                  latitude: provider.address.latitude,
                  longitude: provider.address.longitude
                }
              };
            }

            // Only geocode if we don't have stored coordinates
            const { streetAddress1, streetAddress2, city, state, zipCode } = provider.address;
            const fullAddress = `${streetAddress1}${streetAddress2 ? ' ' + streetAddress2 : ''}, ${city}, ${state} ${zipCode}`;

            try {
              // Use Mapbox Geocoding API
              const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${MAPBOX_TOKEN}&limit=1`;
              const response = await fetch(geocodeUrl);
              const geocodeData = await response.json();

              if (geocodeData.features && geocodeData.features.length > 0) {
                const [longitude, latitude] = geocodeData.features[0].center;

                // TODO: Consider updating the backend to store these coordinates
                console.log(`Geocoded ${provider.nonprofitName}: ${latitude}, ${longitude}`);

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

      // Extract unique demographics and business types for filters
      const demographicsSet = new Set<string>();
      const businessTypesSet = new Set<string>();

      providersWithCoords.forEach((provider) => {
        provider.demographics?.forEach((demo) => demographicsSet.add(demo));
        provider.businessType?.forEach((type) => businessTypesSet.add(type));
      });

      setAvailableDemographics(Array.from(demographicsSet).sort());
      setAvailableBusinessTypes(Array.from(businessTypesSet).sort());
    } catch (err) {
      console.error('Failed to load providers:', err);
      setError('Failed to load providers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Filter providers based on selected criteria
  const filteredProviders = providers.filter((provider) => {
    // Filter by demographics
    if (selectedDemographics.length > 0) {
      const hasMatchingDemo = provider.demographics?.some((demo) => selectedDemographics.includes(demo));
      if (!hasMatchingDemo) return false;
    }

    // Filter by business type
    if (selectedBusinessTypes.length > 0) {
      const hasMatchingType = provider.businessType?.some((type) => selectedBusinessTypes.includes(type));
      if (!hasMatchingType) return false;
    }

    return true;
  });

  const handleClearFilters = () => {
    setSelectedDemographics([]);
    setSelectedBusinessTypes([]);
  };

  const handleRemoveDemographic = (demographic: string) => {
    setSelectedDemographics(selectedDemographics.filter(d => d !== demographic));
  };

  const handleRemoveBusinessType = (businessType: string) => {
    setSelectedBusinessTypes(selectedBusinessTypes.filter(t => t !== businessType));
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

  const providersWithLocations = filteredProviders.filter(p => p.coordinates);

  const hasActiveFilters = selectedDemographics.length > 0 || selectedBusinessTypes.length > 0;

  return (
    <MainCard title="Provider Map">
      {/* Filter Controls */}
      <Box sx={{ mb: 2, p: 2, backgroundColor: 'background.default', borderRadius: 1 }}>
        <Grid container spacing={2} sx={{ alignItems: 'center' }}>
          <Grid size={{ xs: 12, sm: 5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Demographics</InputLabel>
              <Select
                multiple
                size="small"
                value={selectedDemographics}
                onChange={(e) => setSelectedDemographics(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                input={<OutlinedInput label="Demographics" size="small" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {availableDemographics.map((demo) => (
                  <MenuItem key={demo} value={demo}>
                    {demo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 5 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Business Type</InputLabel>
              <Select
                multiple
                size="small"
                value={selectedBusinessTypes}
                onChange={(e) => setSelectedBusinessTypes(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                input={<OutlinedInput label="Business Type" size="small" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} size="small" />
                    ))}
                  </Box>
                )}
              >
                {availableBusinessTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={handleClearFilters}
              disabled={!hasActiveFilters}
              size="small"
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="body2" sx={{ mr: 1, alignSelf: 'center', fontWeight: 600 }}>
              Active Filters:
            </Typography>
            {selectedDemographics.map((demo) => (
              <Chip
                key={`demo-${demo}`}
                label={demo}
                onDelete={() => handleRemoveDemographic(demo)}
                color="primary"
                size="small"
                variant="outlined"
              />
            ))}
            {selectedBusinessTypes.map((type) => (
              <Chip
                key={`type-${type}`}
                label={type}
                onDelete={() => handleRemoveBusinessType(type)}
                color="secondary"
                size="small"
                variant="outlined"
              />
            ))}
          </Box>
        )}
      </Box>

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
                        {selectedProvider.address.streetAddress1}
                      </Typography>
                      {selectedProvider.address.streetAddress2 && (
                        <Typography variant="body2" color="text.secondary">
                          {selectedProvider.address.streetAddress2}
                        </Typography>
                      )}
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
            Showing <strong>{providersWithLocations.length}</strong> of <strong>{filteredProviders.length}</strong> filtered
            {hasActiveFilters && (
              <> ({providers.length} total)</>
            )}
          </Typography>
        </Box>
      </Box>
    </MainCard>
  );
}
