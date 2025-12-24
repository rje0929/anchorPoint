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
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// assets
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { providerService } from '../../../services/providerService';
import { Provider } from '../../../types/provider';
import ProviderDetailDrawer from './ProviderDetailDrawer';
import ProviderEditForm from './ProviderEditForm';
import ProviderAddForm from './ProviderAddForm';

// ==============================|| PROVIDER LIST ||============================== //

interface ProviderListProps {
  showAddForm?: boolean;
  setShowAddForm?: (show: boolean) => void;
}

export default function ProviderList({ showAddForm = false, setShowAddForm }: ProviderListProps) {
  const [data, setData] = React.useState<Provider[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = React.useState<Provider | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedBusinessTypes, setSelectedBusinessTypes] = React.useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = React.useState<string[]>([]);
  const [showEmergencyShelterOnly, setShowEmergencyShelterOnly] = React.useState(false);
  const [showLongTermServicesOnly, setShowLongTermServicesOnly] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [providerToDelete, setProviderToDelete] = React.useState<Provider | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const handleViewDetails = (provider: Provider) => {
    setSelectedProvider(provider);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedProvider(null);
  };

  const handleEditProvider = (provider: Provider) => {
    setSelectedProvider(provider);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setSelectedProvider(null);
  };

  const handleSaveSuccess = async () => {
    // Refresh the provider list
    const providers = await providerService.getAllProviders();
    setData(providers);

    // Return to list view
    setIsEditing(false);
    if (setShowAddForm) {
      setShowAddForm(false);
    }
    setSelectedProvider(null);
  };

  const handleCancelAdd = () => {
    if (setShowAddForm) {
      setShowAddForm(false);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleDeleteClick = (provider: Provider) => {
    setProviderToDelete(provider);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setProviderToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!providerToDelete) return;

    try {
      setDeleting(true);
      await providerService.deleteProvider(providerToDelete.id);

      // Refresh the provider list
      const providers = await providerService.getAllProviders();
      setData(providers);

      setDeleteDialogOpen(false);
      setProviderToDelete(null);
    } catch (err) {
      console.error('Error deleting provider:', err);
      setError('Failed to delete provider. Please try again.');
    } finally {
      setDeleting(false);
    }
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
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesName = provider.nonprofitName.toLowerCase().includes(searchLower);
        const matchesContact =
          provider.contactInformation?.some(
            (contact) =>
              contact.officePhone?.toLowerCase().includes(searchLower) ||
              contact.generalEmail?.toLowerCase().includes(searchLower) ||
              contact.crisisHotline?.toLowerCase().includes(searchLower)
          ) || false;

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

      // Emergency shelter filter
      if (showEmergencyShelterOnly) {
        if (!provider.crisisAndShelterServices?.emergencyShelter) {
          return false;
        }
      }

      // Long-term services filter
      if (showLongTermServicesOnly) {
        const longTermCategories = ['Housing Assistance', 'Case Management', 'Employment Services', 'Education/Training'];
        const hasLongTermServices = provider.servicesOffered?.serviceCategories.some(
          (category) => longTermCategories.includes(category)
        );
        if (!hasLongTermServices) {
          return false;
        }
      }

      return true;
    });
  }, [data, searchQuery, selectedBusinessTypes, selectedRegions, showEmergencyShelterOnly, showLongTermServicesOnly]);

  React.useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const providers = await providerService.getAllProviders();
        setData(providers);
        setError(null);
      } catch (err) {
        console.error('Error fetching providers:', err);
        setError('Failed to load providers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // If adding, show the add form (check this first, before loading/error states)
  if (showAddForm) {
    return <ProviderAddForm onCancel={handleCancelAdd} onSaveSuccess={handleSaveSuccess} />;
  }

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

  // If editing, show the edit form instead of the list
  if (isEditing && selectedProvider) {
    return <ProviderEditForm provider={selectedProvider} onCancel={handleCancelEdit} onSaveSuccess={handleSaveSuccess} />;
  }

  // Otherwise, show the list view
  return (
    <>
      {/* Search and Filters */}
      <Box sx={{ mb: 3, p: 2 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            {/* Search Box */}
            <Box sx={{ flex: { xs: 1, md: 2 } }}>
              <TextField
                fullWidth
                size="small"
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
                size="small"
                options={businessTypes}
                value={selectedBusinessTypes}
                onChange={(_, newValue) => setSelectedBusinessTypes(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
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
              />
            </Box>

            {/* Regions Filter */}
            <Box sx={{ flex: 1 }}>
              <Autocomplete
                multiple
                size="small"
                options={regions}
                value={selectedRegions}
                onChange={(_, newValue) => setSelectedRegions(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
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
              />
            </Box>
          </Stack>

          {/* Service Type Toggles */}
          <Stack direction="row" spacing={3} sx={{ pl: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={showEmergencyShelterOnly}
                  onChange={(e) => setShowEmergencyShelterOnly(e.target.checked)}
                  color="primary"
                />
              }
              label="Emergency Shelter Available"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={showLongTermServicesOnly}
                  onChange={(e) => setShowLongTermServicesOnly(e.target.checked)}
                  color="primary"
                />
              }
              label="Long-Term Services Available"
            />
          </Stack>
        </Stack>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 3 }}>Provider Name</TableCell>
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
                    <Typography variant="subtitle2">{row.nonprofitName}</Typography>
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
                    {row.regionsServed && row.regionsServed.length > 0 ? (
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {row.regionsServed.slice(0, 2).map((region, index) => (
                          <Chip key={index} label={region} size="small" variant="outlined" />
                        ))}
                        {row.regionsServed.length > 2 && (
                          <Chip label={`+${row.regionsServed.length - 2}`} size="small" variant="outlined" />
                        )}
                      </Stack>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        No regions listed
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center" sx={{ pr: 3 }}>
                    <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
                      <Tooltip placement="top" title="View Details">
                        <IconButton color="primary" aria-label="view" size="large" onClick={() => handleViewDetails(row)}>
                          <VisibilityTwoToneIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip placement="top" title="Edit">
                        <IconButton color="secondary" aria-label="edit" size="large" onClick={() => handleEditProvider(row)}>
                          <EditTwoToneIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip placement="top" title="Delete">
                        <IconButton color="error" aria-label="delete" size="large" onClick={() => handleDeleteClick(row)}>
                          <DeleteTwoToneIcon sx={{ fontSize: '1.1rem' }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} align="center">
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Provider</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{providerToDelete?.nonprofitName}</strong>? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} disabled={deleting}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
