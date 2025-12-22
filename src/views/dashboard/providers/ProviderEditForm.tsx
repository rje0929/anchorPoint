import React from 'react';

// material-ui
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

// icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

// types
import { Provider } from '../../../types/provider';
import { providerService } from '../../../services/providerService';

// US States
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];

interface ProviderEditFormProps {
  provider: Provider;
  onCancel: () => void;
  onSaveSuccess: () => void;
  onDeleteSuccess?: () => void;
}

export default function ProviderEditForm({ provider, onCancel, onSaveSuccess, onDeleteSuccess }: ProviderEditFormProps) {
  const [formData, setFormData] = React.useState<Partial<Provider>>({
    nonprofitName: provider.nonprofitName,
    description: provider.description,
    businessType: provider.businessType,
    regionsServed: provider.regionsServed,
    websites: provider.websites,
    demographics: provider.demographics,
    specificPopulations: provider.specificPopulations,
    collaborationAndPartnerships: provider.collaborationAndPartnerships,
    address: provider.address || undefined,
    contactInformation: provider.contactInformation || [],
    contacts: provider.contacts || [],
    servicesOffered: provider.servicesOffered || undefined,
    crisisAndShelterServices: provider.crisisAndShelterServices || undefined,
    survivorLeadershipAndMentorship: provider.survivorLeadershipAndMentorship || undefined,
    accessibilityAndInclusion: provider.accessibilityAndInclusion || undefined,
  });
  const [saving, setSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleSaveProvider = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      await providerService.updateProvider(provider.id, formData);

      setSuccess(true);

      // Return to list view after a short delay
      setTimeout(() => {
        onSaveSuccess();
      }, 1000);
    } catch (err) {
      console.error('Error updating provider:', err);
      setSaveError('Failed to update provider. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeleting(true);
      await providerService.deleteProvider(provider.id);

      setDeleteDialogOpen(false);

      // Return to list view after deletion
      setTimeout(() => {
        if (onDeleteSuccess) {
          onDeleteSuccess();
        } else {
          onSaveSuccess();
        }
      }, 500);
    } catch (err) {
      console.error('Error deleting provider:', err);
      setSaveError('Failed to delete provider. Please try again.');
      setDeleteDialogOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <IconButton onClick={onCancel} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h3">Edit Provider</Typography>
        </Stack>

        <Divider />
      </Box>

      {/* Error Alert */}
      {saveError && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      )}

      {/* Form */}
      <Box sx={{ mb: 3 }}>
        <Stack spacing={3}>
          {/* Nonprofit Name */}
          <TextField
            label="Nonprofit Name"
            fullWidth
            required
            value={formData.nonprofitName || ''}
            onChange={(e) => setFormData({ ...formData, nonprofitName: e.target.value })}
          />

          {/* Description */}
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <Divider sx={{ my: 2 }} />

          {/* Provider Information Section */}
          <Typography variant="h6" gutterBottom>
            Provider Information
          </Typography>

          {/* Business Type */}
          <Autocomplete
            multiple
            freeSolo
            options={[
              'Nonprofit',
              'Government Agency',
              'Community Organization',
              'Healthcare Provider',
              'Legal Services',
              'Educational Institution',
            ]}
            value={formData.businessType || []}
            onChange={(_, newValue) => setFormData({ ...formData, businessType: newValue })}
            renderInput={(params) => <TextField {...params} label="Business Type" />}
          />

          {/* Websites */}
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={formData.websites || []}
            onChange={(_, newValue) => setFormData({ ...formData, websites: newValue })}
            renderInput={(params) => <TextField {...params} label="Websites" placeholder="Press enter to add a website" />}
          />

          {/* Regions Served */}
          <Autocomplete
            multiple
            freeSolo
            options={[
              'Statewide',
              'Durham County',
              'Wake County',
              'Orange County',
              'Mecklenburg County',
              'Guilford County',
              'Forsyth County',
              'Buncombe County',
              'Cumberland County',
              'New Hanover County',
            ]}
            value={formData.regionsServed || []}
            onChange={(_, newValue) => setFormData({ ...formData, regionsServed: newValue })}
            renderInput={(params) => <TextField {...params} label="Regions Served" />}
          />

          <Divider sx={{ my: 2 }} />

          {/* Address Section */}
          <Typography variant="h6" gutterBottom>
            Address
          </Typography>

          <TextField
            label="Street Address Line 1"
            fullWidth
            value={formData.address?.streetAddress1 || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: {
                  ...formData.address,
                  id: formData.address?.id || '',
                  streetAddress1: e.target.value,
                  city: formData.address?.city || '',
                  state: formData.address?.state || 'NC',
                  zipCode: formData.address?.zipCode || '',
                  providerId: provider?.id || 0,
                },
              })
            }
          />

          <TextField
            label="Street Address Line 2"
            fullWidth
            value={formData.address?.streetAddress2 || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                address: {
                  ...formData.address,
                  id: formData.address?.id || '',
                  streetAddress1: formData.address?.streetAddress1 || '',
                  streetAddress2: e.target.value,
                  city: formData.address?.city || '',
                  state: formData.address?.state || 'NC',
                  zipCode: formData.address?.zipCode || '',
                  providerId: provider?.id || 0,
                },
              })
            }
          />

          <Stack direction="row" spacing={2}>
            <TextField
              label="City"
              fullWidth
              value={formData.address?.city || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: {
                    ...formData.address,
                    id: formData.address?.id || '',
                    streetAddress1: formData.address?.streetAddress1 || '',
                    city: e.target.value,
                    state: formData.address?.state || 'NC',
                    zipCode: formData.address?.zipCode || '',
                    providerId: provider?.id || 0,
                  },
                })
              }
            />

            <FormControl sx={{ width: '30%' }}>
              <InputLabel>State</InputLabel>
              <Select
                value={formData.address?.state || 'NC'}
                label="State"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: {
                      ...formData.address,
                      id: formData.address?.id || '',
                      streetAddress1: formData.address?.streetAddress1 || '',
                      city: formData.address?.city || '',
                      state: e.target.value,
                      zipCode: formData.address?.zipCode || '',
                      providerId: provider?.id || 0,
                    },
                  })
                }
              >
                {US_STATES.map((state) => (
                  <MenuItem key={state} value={state}>
                    {state}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="ZIP Code"
              sx={{ width: '30%' }}
              value={formData.address?.zipCode || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: {
                    ...formData.address,
                    id: formData.address?.id || '',
                    streetAddress1: formData.address?.streetAddress1 || '',
                    city: formData.address?.city || '',
                    state: formData.address?.state || 'NC',
                    zipCode: e.target.value,
                    providerId: provider?.id || 0,
                  },
                })
              }
            />
          </Stack>

          <Divider sx={{ my: 2 }} />

          {/* Contact Information Section */}
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>

          <TextField
            label="Office Phone"
            fullWidth
            value={formData.contactInformation?.[0]?.officePhone || ''}
            onChange={(e) => {
              const contact = formData.contactInformation?.[0];
              const updatedContact = {
                id: contact?.id || '',
                officePhone: e.target.value,
                generalEmail: contact?.generalEmail || null,
                crisisHotline: contact?.crisisHotline || null,
                providerId: provider?.id || 0,
              };
              setFormData({
                ...formData,
                contactInformation: [updatedContact],
              });
            }}
            placeholder="e.g., (919) 555-1234"
          />

          <TextField
            label="General Email"
            fullWidth
            type="email"
            value={formData.contactInformation?.[0]?.generalEmail || ''}
            onChange={(e) => {
              const contact = formData.contactInformation?.[0];
              const updatedContact = {
                id: contact?.id || '',
                officePhone: contact?.officePhone || null,
                generalEmail: e.target.value,
                crisisHotline: contact?.crisisHotline || null,
                providerId: provider?.id || 0,
              };
              setFormData({
                ...formData,
                contactInformation: [updatedContact],
              });
            }}
            placeholder="e.g., info@example.org"
          />

          <TextField
            label="Crisis Hotline"
            fullWidth
            value={formData.contactInformation?.[0]?.crisisHotline || ''}
            onChange={(e) => {
              const contact = formData.contactInformation?.[0];
              const updatedContact = {
                id: contact?.id || '',
                officePhone: contact?.officePhone || null,
                generalEmail: contact?.generalEmail || null,
                crisisHotline: e.target.value,
                providerId: provider?.id || 0,
              };
              setFormData({
                ...formData,
                contactInformation: [updatedContact],
              });
            }}
            placeholder="e.g., 1-800-555-0000"
          />

          <Divider sx={{ my: 2 }} />

          {/* Contacts Section */}
          <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Contacts</Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => {
                  const newContact = {
                    id: '',
                    primaryContact: '',
                    description: '',
                    phone: null,
                    email: null,
                    providerId: provider?.id || 0,
                  };
                  setFormData({
                    ...formData,
                    contacts: [...(formData.contacts || []), newContact],
                  });
                }}
              >
                Add Contact
              </Button>
            </Stack>

            {formData.contacts && formData.contacts.length > 0 ? (
              <Stack spacing={3}>
                {formData.contacts.map((contact, index) => (
                  <Box key={index} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle2" color="text.secondary">
                          Contact {index + 1}
                        </Typography>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => {
                            const updatedContacts = formData.contacts?.filter((_, i) => i !== index) || [];
                            setFormData({
                              ...formData,
                              contacts: updatedContacts,
                            });
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>

                      <TextField
                        label="Primary Contact Name"
                        fullWidth
                        required
                        value={contact.primaryContact}
                        onChange={(e) => {
                          const updatedContacts = [...(formData.contacts || [])];
                          updatedContacts[index] = {
                            ...updatedContacts[index],
                            primaryContact: e.target.value,
                          };
                          setFormData({
                            ...formData,
                            contacts: updatedContacts,
                          });
                        }}
                        placeholder="e.g., John Doe"
                      />

                      <TextField
                        label="Description/Title"
                        fullWidth
                        required
                        value={contact.description}
                        onChange={(e) => {
                          const updatedContacts = [...(formData.contacts || [])];
                          updatedContacts[index] = {
                            ...updatedContacts[index],
                            description: e.target.value,
                          };
                          setFormData({
                            ...formData,
                            contacts: updatedContacts,
                          });
                        }}
                        placeholder="e.g., Executive Director"
                      />

                      <Stack direction="row" spacing={2}>
                        <TextField
                          label="Phone"
                          fullWidth
                          value={contact.phone || ''}
                          onChange={(e) => {
                            const updatedContacts = [...(formData.contacts || [])];
                            updatedContacts[index] = {
                              ...updatedContacts[index],
                              phone: e.target.value || null,
                            };
                            setFormData({
                              ...formData,
                              contacts: updatedContacts,
                            });
                          }}
                          placeholder="e.g., (919) 555-1234"
                        />

                        <TextField
                          label="Email"
                          fullWidth
                          type="email"
                          value={contact.email || ''}
                          onChange={(e) => {
                            const updatedContacts = [...(formData.contacts || [])];
                            updatedContacts[index] = {
                              ...updatedContacts[index],
                              email: e.target.value || null,
                            };
                            setFormData({
                              ...formData,
                              contacts: updatedContacts,
                            });
                          }}
                          placeholder="e.g., john@example.org"
                        />
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                No contacts added yet. Click "Add Contact" to add one.
              </Typography>
            )}
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Populations Served Section */}
          <Typography variant="h6" gutterBottom>
            Populations Served
          </Typography>

          {/* Demographics */}
          <Autocomplete
            multiple
            freeSolo
            options={[
              'Women',
              'Men',
              'Children',
              'Teens',
              'Adults',
              'Seniors',
              'LGBTQ+',
              'Immigrants',
              'Refugees',
            ]}
            value={formData.demographics || []}
            onChange={(_, newValue) => setFormData({ ...formData, demographics: newValue })}
            renderInput={(params) => <TextField {...params} label="Demographics Served" />}
          />

          {/* Specific Populations */}
          <Autocomplete
            multiple
            freeSolo
            options={[
              'Domestic Violence Survivors',
              'Sexual Assault Survivors',
              'Human Trafficking Survivors',
              'Homeless Individuals',
              'Low Income Families',
              'Veterans',
              'People with Disabilities',
            ]}
            value={formData.specificPopulations || []}
            onChange={(_, newValue) => setFormData({ ...formData, specificPopulations: newValue })}
            renderInput={(params) => <TextField {...params} label="Specific Populations" />}
          />

          <Divider sx={{ my: 2 }} />

          {/* Collaboration Section */}
          <Typography variant="h6" gutterBottom>
            Collaboration
          </Typography>

          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={formData.collaborationAndPartnerships || []}
            onChange={(_, newValue) => setFormData({ ...formData, collaborationAndPartnerships: newValue })}
            renderInput={(params) => <TextField {...params} label="Collaborations & Partnerships" placeholder="Press enter to add" />}
          />

          <Divider sx={{ my: 2 }} />

          {/* Services Offered */}
          <Typography variant="h6" gutterBottom>
            Services Offered
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.servicesOffered?.available247 || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    servicesOffered: {
                      ...formData.servicesOffered,
                      id: formData.servicesOffered?.id || '',
                      available247: e.target.checked,
                      serviceCategories: formData.servicesOffered?.serviceCategories || [],
                      languagesAvailable: formData.servicesOffered?.languagesAvailable || [],
                      description: formData.servicesOffered?.description || '',
                      translationServices: formData.servicesOffered?.translationServices || false,
                      feesAndPaymentOptions: formData.servicesOffered?.feesAndPaymentOptions || [],
                      providerId: provider?.id || 0,
                    },
                  })
                }
              />
            }
            label="Available 24/7"
          />

          <Autocomplete
            multiple
            freeSolo
            options={[
              'Crisis Intervention',
              'Emergency Shelter',
              'Counseling/Therapy',
              'Legal Advocacy',
              'Medical Advocacy',
              'Case Management',
              'Support Groups',
              'Housing Assistance',
              'Financial Assistance',
              'Employment Services',
              'Education/Training',
            ]}
            value={formData.servicesOffered?.serviceCategories || []}
            onChange={(_, newValue) =>
              setFormData({
                ...formData,
                servicesOffered: {
                  ...formData.servicesOffered,
                  id: formData.servicesOffered?.id || '',
                  available247: formData.servicesOffered?.available247 || false,
                  serviceCategories: newValue,
                  languagesAvailable: formData.servicesOffered?.languagesAvailable || [],
                  description: formData.servicesOffered?.description || '',
                  translationServices: formData.servicesOffered?.translationServices || false,
                  feesAndPaymentOptions: formData.servicesOffered?.feesAndPaymentOptions || [],
                  providerId: provider?.id || 0,
                },
              })
            }
            renderInput={(params) => <TextField {...params} label="Service Categories" placeholder="Select or add service categories" />}
          />

          <Autocomplete
            multiple
            freeSolo
            options={['English', 'Spanish', 'French', 'Chinese', 'Arabic', 'Vietnamese', 'Korean', 'Tagalog', 'Russian', 'Portuguese']}
            value={formData.servicesOffered?.languagesAvailable || []}
            onChange={(_, newValue) =>
              setFormData({
                ...formData,
                servicesOffered: {
                  ...formData.servicesOffered,
                  id: formData.servicesOffered?.id || '',
                  available247: formData.servicesOffered?.available247 || false,
                  serviceCategories: formData.servicesOffered?.serviceCategories || [],
                  languagesAvailable: newValue,
                  description: formData.servicesOffered?.description || '',
                  translationServices: formData.servicesOffered?.translationServices || false,
                  feesAndPaymentOptions: formData.servicesOffered?.feesAndPaymentOptions || [],
                  providerId: provider?.id || 0,
                },
              })
            }
            renderInput={(params) => <TextField {...params} label="Languages Available" placeholder="Select or add languages" />}
          />

          <TextField
            label="Services Description"
            fullWidth
            multiline
            rows={3}
            value={formData.servicesOffered?.description || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                servicesOffered: {
                  ...formData.servicesOffered,
                  id: formData.servicesOffered?.id || '',
                  available247: formData.servicesOffered?.available247 || false,
                  serviceCategories: formData.servicesOffered?.serviceCategories || [],
                  languagesAvailable: formData.servicesOffered?.languagesAvailable || [],
                  description: e.target.value,
                  translationServices: formData.servicesOffered?.translationServices || false,
                  feesAndPaymentOptions: formData.servicesOffered?.feesAndPaymentOptions || [],
                  providerId: provider?.id || 0,
                },
              })
            }
            placeholder="Describe the services offered..."
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.servicesOffered?.translationServices || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    servicesOffered: {
                      ...formData.servicesOffered,
                      id: formData.servicesOffered?.id || '',
                      available247: formData.servicesOffered?.available247 || false,
                      serviceCategories: formData.servicesOffered?.serviceCategories || [],
                      languagesAvailable: formData.servicesOffered?.languagesAvailable || [],
                      description: formData.servicesOffered?.description || '',
                      translationServices: e.target.checked,
                      feesAndPaymentOptions: formData.servicesOffered?.feesAndPaymentOptions || [],
                      providerId: provider?.id || 0,
                    },
                  })
                }
              />
            }
            label="Translation Services Available"
          />

          <Autocomplete
            multiple
            freeSolo
            options={['Free', 'Sliding Scale', 'Insurance Accepted', 'Medicaid', 'Medicare', 'Private Pay', 'Grants Available']}
            value={formData.servicesOffered?.feesAndPaymentOptions || []}
            onChange={(_, newValue) =>
              setFormData({
                ...formData,
                servicesOffered: {
                  ...formData.servicesOffered,
                  id: formData.servicesOffered?.id || '',
                  available247: formData.servicesOffered?.available247 || false,
                  serviceCategories: formData.servicesOffered?.serviceCategories || [],
                  languagesAvailable: formData.servicesOffered?.languagesAvailable || [],
                  description: formData.servicesOffered?.description || '',
                  translationServices: formData.servicesOffered?.translationServices || false,
                  feesAndPaymentOptions: newValue,
                  providerId: provider?.id || 0,
                },
              })
            }
            renderInput={(params) => <TextField {...params} label="Fees & Payment Options" placeholder="Select or add payment options" />}
          />

          <Divider sx={{ my: 2 }} />

          {/* Crisis & Shelter Services */}
          <Typography variant="h6" gutterBottom>
            Crisis & Shelter Services
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.crisisAndShelterServices?.immediateCrisisResponse || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    crisisAndShelterServices: {
                      ...formData.crisisAndShelterServices,
                      id: formData.crisisAndShelterServices?.id || '',
                      immediateCrisisResponse: e.target.checked,
                      responseTime: formData.crisisAndShelterServices?.responseTime || '',
                      emergencyShelter: formData.crisisAndShelterServices?.emergencyShelter || false,
                      emergencyShelterInfo: formData.crisisAndShelterServices?.emergencyShelterInfo || '',
                      providerId: provider?.id || 0,
                    },
                  })
                }
              />
            }
            label="Immediate Crisis Response Available"
          />

          <TextField
            label="Response Time"
            fullWidth
            value={formData.crisisAndShelterServices?.responseTime || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                crisisAndShelterServices: {
                  ...formData.crisisAndShelterServices,
                  id: formData.crisisAndShelterServices?.id || '',
                  immediateCrisisResponse: formData.crisisAndShelterServices?.immediateCrisisResponse || false,
                  responseTime: e.target.value,
                  emergencyShelter: formData.crisisAndShelterServices?.emergencyShelter || false,
                  emergencyShelterInfo: formData.crisisAndShelterServices?.emergencyShelterInfo || '',
                  providerId: provider?.id || 0,
                },
              })
            }
            placeholder="e.g., 24 hours, Within 2 hours"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.crisisAndShelterServices?.emergencyShelter || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    crisisAndShelterServices: {
                      ...formData.crisisAndShelterServices,
                      id: formData.crisisAndShelterServices?.id || '',
                      immediateCrisisResponse: formData.crisisAndShelterServices?.immediateCrisisResponse || false,
                      responseTime: formData.crisisAndShelterServices?.responseTime || '',
                      emergencyShelter: e.target.checked,
                      emergencyShelterInfo: formData.crisisAndShelterServices?.emergencyShelterInfo || '',
                      providerId: provider?.id || 0,
                    },
                  })
                }
              />
            }
            label="Emergency Shelter Available"
          />

          <TextField
            label="Emergency Shelter Information"
            fullWidth
            multiline
            rows={2}
            value={formData.crisisAndShelterServices?.emergencyShelterInfo || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                crisisAndShelterServices: {
                  ...formData.crisisAndShelterServices,
                  id: formData.crisisAndShelterServices?.id || '',
                  immediateCrisisResponse: formData.crisisAndShelterServices?.immediateCrisisResponse || false,
                  responseTime: formData.crisisAndShelterServices?.responseTime || '',
                  emergencyShelter: formData.crisisAndShelterServices?.emergencyShelter || false,
                  emergencyShelterInfo: e.target.value,
                  providerId: provider?.id || 0,
                },
              })
            }
          />

          <Divider sx={{ my: 2 }} />

          {/* Survivor Leadership & Mentorship */}
          <Typography variant="h6" gutterBottom>
            Survivor Leadership & Mentorship
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.survivorLeadershipAndMentorship?.survivorsInLeadership || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    survivorLeadershipAndMentorship: {
                      ...formData.survivorLeadershipAndMentorship,
                      id: formData.survivorLeadershipAndMentorship?.id || '',
                      survivorsInLeadership: e.target.checked,
                      peerMentorshipProgram: formData.survivorLeadershipAndMentorship?.peerMentorshipProgram || false,
                      providerId: provider?.id || 0,
                    },
                  })
                }
              />
            }
            label="Survivors in Leadership Roles"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.survivorLeadershipAndMentorship?.peerMentorshipProgram || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    survivorLeadershipAndMentorship: {
                      ...formData.survivorLeadershipAndMentorship,
                      id: formData.survivorLeadershipAndMentorship?.id || '',
                      survivorsInLeadership: formData.survivorLeadershipAndMentorship?.survivorsInLeadership || false,
                      peerMentorshipProgram: e.target.checked,
                      providerId: provider?.id || 0,
                    },
                  })
                }
              />
            }
            label="Peer Mentorship Program Available"
          />

          <Divider sx={{ my: 2 }} />

          {/* Accessibility & Inclusion */}
          <Typography variant="h6" gutterBottom>
            Accessibility & Inclusion
          </Typography>

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.accessibilityAndInclusion?.adaCompliant || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accessibilityAndInclusion: {
                      ...formData.accessibilityAndInclusion,
                      id: formData.accessibilityAndInclusion?.id || '',
                      adaCompliant: e.target.checked,
                      disabilityAccommodations: formData.accessibilityAndInclusion?.disabilityAccommodations || false,
                      culturallyResponsiveServices: formData.accessibilityAndInclusion?.culturallyResponsiveServices || false,
                      providerId: provider?.id || 0,
                    },
                  })
                }
              />
            }
            label="ADA Compliant"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.accessibilityAndInclusion?.disabilityAccommodations || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accessibilityAndInclusion: {
                      ...formData.accessibilityAndInclusion,
                      id: formData.accessibilityAndInclusion?.id || '',
                      adaCompliant: formData.accessibilityAndInclusion?.adaCompliant || false,
                      disabilityAccommodations: e.target.checked,
                      culturallyResponsiveServices: formData.accessibilityAndInclusion?.culturallyResponsiveServices || false,
                      providerId: provider?.id || 0,
                    },
                  })
                }
              />
            }
            label="Disability Accommodations Available"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.accessibilityAndInclusion?.culturallyResponsiveServices || false}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    accessibilityAndInclusion: {
                      ...formData.accessibilityAndInclusion,
                      id: formData.accessibilityAndInclusion?.id || '',
                      adaCompliant: formData.accessibilityAndInclusion?.adaCompliant || false,
                      disabilityAccommodations: formData.accessibilityAndInclusion?.disabilityAccommodations || false,
                      culturallyResponsiveServices: e.target.checked,
                      providerId: provider?.id || 0,
                    },
                  })
                }
              />
            }
            label="Culturally Responsive Services"
          />
        </Stack>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper', pt: 2, pb: 2, mt: 2 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between">
          <Button variant="outlined" color="error" onClick={handleDeleteClick} disabled={saving || deleting} startIcon={<DeleteIcon />}>
            Delete Provider
          </Button>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" onClick={onCancel} disabled={saving || deleting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleSaveProvider}
              disabled={saving || deleting || !formData.nonprofitName}
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess(false)}>
          Provider updated successfully!
        </Alert>
      </Snackbar>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Provider</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{provider.nonprofitName}</strong>? This action cannot be undone and will
            permanently remove all associated data including contacts, services, and other information.
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
    </Box>
  );
}
