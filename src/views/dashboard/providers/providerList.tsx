import React from 'react';

// material-ui
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import FilterListIcon from '@mui/icons-material/FilterList';

// assets
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import { providerService } from '../../../services/providerService';
import { Provider } from '../../../types/provider';
import ProviderDetailDrawer from './ProviderDetailDrawer';

// ==============================|| PROVIDER LIST ||============================== //

export default function ProviderList() {
  const [data, setData] = React.useState<Provider[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = React.useState<Provider | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedBusinessTypes, setSelectedBusinessTypes] = React.useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>([]);

  const handleViewDetails = (provider: Provider) => {
    setSelectedProvider(provider);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedProvider(null);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Get unique business types and regions from all providers
  const { businessTypes, regions } = React.useMemo(() => {
    const businessTypesSet = new Set<string>();
    const regionsSet = new Set<string>();

    data.forEach((provider) => {
      provider.businessType.forEach((type) => businessTypesSet.add(type));
      provider.regionsServed.forEach((region) => regionsSet.add(region));
    });

    return {
      businessTypes: Array.from(businessTypesSet).sort(),
      regions: Array.from(regionsSet).sort(),
    };
  }, [data]);

  // Filter providers based on search query and filters
  const filteredData = React.useMemo(() => {
    return data.filter((provider) => {
      // Search query filter
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        const matchesName = provider.nonprofitName.toLowerCase().includes(lowerQuery);
        const matchesContact =
          provider.contactInformation &&
          provider.contactInformation.length > 0 &&
          provider.contactInformation.some((contact) => {
            return (
              (contact.officePhone && contact.officePhone.toLowerCase().includes(lowerQuery)) ||
              (contact.generalEmail && contact.generalEmail.toLowerCase().includes(lowerQuery)) ||
              (contact.crisisHotline && contact.crisisHotline.toLowerCase().includes(lowerQuery))
            );
          });

        if (!matchesName && !matchesContact) {
          return false;
        }
      }

      // Business type filter
      if (selectedBusinessTypes.length > 0) {
        const hasMatchingBusinessType = provider.businessType.some((type) => selectedBusinessTypes.includes(type));
        if (!hasMatchingBusinessType) {
          return false;
        }
      }

      // Region filter
      if (selectedRegions.length > 0) {
        const hasMatchingRegion = provider.regionsServed.some((region) => selectedRegions.includes(region));
        if (!hasMatchingRegion) {
          return false;
        }
      }

      return true;
    });
  }, [data, searchQuery, selectedBusinessTypes, selectedRegions]);

  React.useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const providers = await providerService.getAllProviders();
        setData(providers);
        setError(null);
      } catch (err) {
        console.error('Error fetching providers:', err);
        setError('Failed to load providers. Please make sure the API server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <>
      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          {/* Search Box */}
          <Box sx={{ flex: { xs: 1, md: 2 } }}>
            <TextField
              fullWidth
              placeholder="Search providers by name or contact info..."
              value={searchQuery}
              onChange={handleSearchChange}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
              variant="outlined"
            />
          </Box>

          {/* Business Type Filter */}
          <Box sx={{ flex: 1 }}>
            <Autocomplete
              multiple
              options={businessTypes}
              value={selectedBusinessTypes}
              onChange={(_, newValue) => setSelectedBusinessTypes(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Filter by Business Type"
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <FilterListIcon />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
              slotProps={{
                chip: {
                  size: 'small',
                },
              }}
            />
          </Box>

          {/* Regions Filter */}
          <Box sx={{ flex: 1 }}>
            <Autocomplete
              multiple
              options={regions}
              value={selectedRegions}
              onChange={(_, newValue) => setSelectedRegions(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Filter by Region"
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <InputAdornment position="start">
                            <FilterListIcon />
                          </InputAdornment>
                          {params.InputProps.startAdornment}
                        </>
                      ),
                    },
                  }}
                />
              )}
              slotProps={{
                chip: {
                  size: 'small',
                  color: 'primary',
                },
              }}
            />
          </Box>
        </Stack>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 3 }}>Provider Name</TableCell>
              <TableCell>Business Type</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Regions Served</TableCell>
              <TableCell align="center" sx={{ pr: 3 }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData && filteredData.length > 0 ? (
              filteredData.map((row) => (
                <TableRow hover key={row.id}>
                  <TableCell sx={{ pl: 3 }}>
                    <Stack direction="column" spacing={0.5}>
                      <Typography variant="subtitle2" noWrap>
                        {row.nonprofitName}
                      </Typography>
                      {row.websites && row.websites.length > 0 && (
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {row.websites[0]}
                        </Typography>
                      )}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {row.businessType.slice(0, 2).map((type, idx) => (
                        <Chip key={idx} label={type} size="small" variant="outlined" />
                      ))}
                      {row.businessType.length > 2 && <Chip label={`+${row.businessType.length - 2}`} size="small" variant="outlined" />}
                    </Stack>
                  </TableCell>
                  <TableCell>
                    {row.contactInformation && row.contactInformation.length > 0 ? (
                      <Stack direction="column" spacing={0.5}>
                        {row.contactInformation[0].officePhone && (
                          <Typography variant="caption">{row.contactInformation[0].officePhone}</Typography>
                        )}
                        {row.contactInformation[0].generalEmail && (
                          <Typography variant="caption" color="text.secondary">
                            {row.contactInformation[0].generalEmail}
                          </Typography>
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No contact info
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap">
                      {row.regionsServed.slice(0, 2).map((region, idx) => (
                        <Chip key={idx} label={region} size="small" color="primary" variant="outlined" />
                      ))}
                      {row.regionsServed.length > 2 && <Chip label={`+${row.regionsServed.length - 2}`} size="small" variant="outlined" />}
                    </Stack>
                  </TableCell>
                  <TableCell align="center" sx={{ pr: 3 }}>
                    <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
                      <Tooltip placement="top" title="View Details">
                        <IconButton color="primary" aria-label="view" size="large" onClick={() => handleViewDetails(row)}>
                          <VisibilityTwoToneIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip placement="top" title="Edit">
                        <IconButton color="secondary" aria-label="edit" size="large">
                          <EditTwoToneIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography variant="body2" color="text.secondary">
                    {searchQuery || selectedBusinessTypes.length > 0 || selectedRegions.length > 0
                      ? 'No providers match your filters'
                      : 'No providers found'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Provider Detail Drawer */}
      <ProviderDetailDrawer open={drawerOpen} onClose={handleCloseDrawer} provider={selectedProvider} />
    </>
  );
}
