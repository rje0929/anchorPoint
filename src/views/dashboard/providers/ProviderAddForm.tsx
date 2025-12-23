import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

// icons
import AddIcon from '@mui/icons-material/Add';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { providerService } from 'services/providerService';

interface ProviderAddFormProps {
  onCancel: () => void;
  onSaveSuccess: () => void;
}

export default function ProviderAddForm({ onCancel, onSaveSuccess }: ProviderAddFormProps) {
  const [formData, setFormData] = useState({
    nonprofitName: '',
    description: '',
    businessType: [] as string[],
    regionsServed: [] as string[],
    websites: [] as string[],
    demographics: [] as string[],
    specificPopulations: [] as string[],
    collaborationAndPartnerships: [] as string[],
    address: {
      streetAddress1: '',
      streetAddress2: '',
      city: '',
      state: 'NC',
      zipCode: '',
    },
    contactInformation: [
      {
        officePhone: '',
        generalEmail: '',
        crisisHotline: '',
      },
    ],
    contacts: [
      {
        primaryContact: '',
        description: '',
        phone: '',
        email: '',
      },
    ],
    servicesOffered: {
      available247: false,
      serviceCategories: [] as string[],
      languagesAvailable: [] as string[],
      description: '',
      translationServices: false,
      feesAndPaymentOptions: [] as string[],
    },
    crisisAndShelterServices: {
      immediateCrisisResponse: false,
      responseTime: '',
      emergencyShelter: false,
      emergencyShelterInfo: '',
    },
    survivorLeadershipAndMentorship: {
      survivorsInLeadership: false,
      peerMentorshipProgram: false,
    },
    trainingAndEducation: {
      workshopsAndTrainingOffered: false,
      topicsCovered: [] as string[],
      targetAudience: [] as string[],
      trainingFormat: [] as string[],
    },
    accessibilityAndInclusion: {
      adaCompliant: false,
      disabilityAccommodations: false,
      culturallyResponsiveServices: false,
    },
  });

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Temporary input states for array fields
  const [newBusinessType, setNewBusinessType] = useState('');
  const [newRegion, setNewRegion] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newDemographic, setNewDemographic] = useState('');
  const [newPopulation, setNewPopulation] = useState('');
  const [newCollaboration, setNewCollaboration] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [newFeeOption, setNewFeeOption] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newAudience, setNewAudience] = useState('');
  const [newFormat, setNewFormat] = useState('');

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveError(null);

      await providerService.createProvider(formData as any);

      setSuccess(true);
      setTimeout(() => {
        onSaveSuccess();
      }, 1500);
    } catch (err) {
      console.error('Failed to create provider:', err);
      setSaveError('Failed to create provider. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Helper functions for array fields
  const addToArray = (field: string, value: string, setter: (val: string) => void) => {
    if (!value.trim()) return;
    setFormData({
      ...formData,
      [field]: [...(formData[field as keyof typeof formData] as string[]), value.trim()],
    });
    setter('');
  };

  const removeFromArray = (field: string, index: number) => {
    const array = formData[field as keyof typeof formData] as string[];
    setFormData({
      ...formData,
      [field]: array.filter((_, i) => i !== index),
    });
  };

  const addToNestedArray = (parent: string, field: string, value: string, setter: (val: string) => void) => {
    if (!value.trim()) return;
    const parentData = formData[parent as keyof typeof formData] as any;
    setFormData({
      ...formData,
      [parent]: {
        ...parentData,
        [field]: [...parentData[field], value.trim()],
      },
    });
    setter('');
  };

  const removeFromNestedArray = (parent: string, field: string, index: number) => {
    const parentData = formData[parent as keyof typeof formData] as any;
    setFormData({
      ...formData,
      [parent]: {
        ...parentData,
        [field]: parentData[field].filter((_: any, i: number) => i !== index),
      },
    });
  };

  return (
    <MainCard title="Add New Provider">
      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* Provider Information Section */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h3" gutterBottom>
                Provider Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Nonprofit Name"
                    value={formData.nonprofitName}
                    onChange={(e) => setFormData({ ...formData, nonprofitName: e.target.value })}
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>

                {/* Business Types */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Business Types
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add business type"
                      value={newBusinessType}
                      onChange={(e) => setNewBusinessType(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('businessType', newBusinessType, setNewBusinessType);
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => addToArray('businessType', newBusinessType, setNewBusinessType)}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.businessType.map((type, index) => (
                      <Chip
                        key={index}
                        label={type}
                        onDelete={() => removeFromArray('businessType', index)}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Regions Served */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Regions Served
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add region"
                      value={newRegion}
                      onChange={(e) => setNewRegion(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('regionsServed', newRegion, setNewRegion);
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => addToArray('regionsServed', newRegion, setNewRegion)}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.regionsServed.map((region, index) => (
                      <Chip
                        key={index}
                        label={region}
                        onDelete={() => removeFromArray('regionsServed', index)}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Websites */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Websites
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add website URL"
                      value={newWebsite}
                      onChange={(e) => setNewWebsite(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('websites', newWebsite, setNewWebsite);
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => addToArray('websites', newWebsite, setNewWebsite)}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.websites.map((website, index) => (
                      <Chip
                        key={index}
                        label={website}
                        onDelete={() => removeFromArray('websites', index)}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Address Section */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h3" gutterBottom>
                Address
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Street Address 1"
                    value={formData.address.streetAddress1}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, streetAddress1: e.target.value },
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Street Address 2"
                    value={formData.address.streetAddress2}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, streetAddress2: e.target.value },
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="City"
                    value={formData.address.city}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, city: e.target.value },
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="State"
                    value={formData.address.state}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, state: e.target.value },
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <TextField
                    fullWidth
                    label="Zip Code"
                    value={formData.address.zipCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        address: { ...formData.address, zipCode: e.target.value },
                      })
                    }
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Contact Information Section */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h3" gutterBottom>
                Contact Information
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Office Phone"
                    value={formData.contactInformation[0].officePhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactInformation: [{ ...formData.contactInformation[0], officePhone: e.target.value }],
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="General Email"
                    value={formData.contactInformation[0].generalEmail}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactInformation: [{ ...formData.contactInformation[0], generalEmail: e.target.value }],
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <TextField
                    fullWidth
                    label="Crisis Hotline"
                    value={formData.contactInformation[0].crisisHotline}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactInformation: [{ ...formData.contactInformation[0], crisisHotline: e.target.value }],
                      })
                    }
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Primary Contact Section */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h3" gutterBottom>
                Primary Contact
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Contact Name"
                    value={formData.contacts[0].primaryContact}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contacts: [{ ...formData.contacts[0], primaryContact: e.target.value }],
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Title/Position"
                    value={formData.contacts[0].description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contacts: [{ ...formData.contacts[0], description: e.target.value }],
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={formData.contacts[0].phone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contacts: [{ ...formData.contacts[0], phone: e.target.value }],
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={formData.contacts[0].email}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contacts: [{ ...formData.contacts[0], email: e.target.value }],
                      })
                    }
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Populations Served Section */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h3" gutterBottom>
                Populations Served
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                {/* Demographics */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Demographics
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add demographic"
                      value={newDemographic}
                      onChange={(e) => setNewDemographic(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('demographics', newDemographic, setNewDemographic);
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => addToArray('demographics', newDemographic, setNewDemographic)}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.demographics.map((demo, index) => (
                      <Chip key={index} label={demo} onDelete={() => removeFromArray('demographics', index)} />
                    ))}
                  </Box>
                </Grid>

                {/* Specific Populations */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Specific Populations
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add population"
                      value={newPopulation}
                      onChange={(e) => setNewPopulation(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToArray('specificPopulations', newPopulation, setNewPopulation);
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => addToArray('specificPopulations', newPopulation, setNewPopulation)}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.specificPopulations.map((pop, index) => (
                      <Chip
                        key={index}
                        label={pop}
                        onDelete={() => removeFromArray('specificPopulations', index)}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Collaboration Section */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h3" gutterBottom>
                Collaboration & Partnerships
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Add collaboration or partnership"
                  value={newCollaboration}
                  onChange={(e) => setNewCollaboration(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('collaborationAndPartnerships', newCollaboration, setNewCollaboration);
                    }
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={() => addToArray('collaborationAndPartnerships', newCollaboration, setNewCollaboration)}
                >
                  Add
                </Button>
              </Stack>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {formData.collaborationAndPartnerships.map((collab, index) => (
                  <Chip
                    key={index}
                    label={collab}
                    onDelete={() => removeFromArray('collaborationAndPartnerships', index)}
                  />
                ))}
              </Box>
            </Paper>
          </Grid>

          {/* Services Offered Section */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h3" gutterBottom>
                Services Offered
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.servicesOffered.available247}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            servicesOffered: { ...formData.servicesOffered, available247: e.target.checked },
                          })
                        }
                      />
                    }
                    label="Available 24/7"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.servicesOffered.translationServices}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            servicesOffered: { ...formData.servicesOffered, translationServices: e.target.checked },
                          })
                        }
                      />
                    }
                    label="Translation Services"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Services Description"
                    value={formData.servicesOffered.description}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        servicesOffered: { ...formData.servicesOffered, description: e.target.value },
                      })
                    }
                  />
                </Grid>

                {/* Service Categories */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Service Categories
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add service category"
                      value={newServiceCategory}
                      onChange={(e) => setNewServiceCategory(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToNestedArray('servicesOffered', 'serviceCategories', newServiceCategory, setNewServiceCategory);
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => addToNestedArray('servicesOffered', 'serviceCategories', newServiceCategory, setNewServiceCategory)}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.servicesOffered.serviceCategories.map((category, index) => (
                      <Chip
                        key={index}
                        label={category}
                        onDelete={() => removeFromNestedArray('servicesOffered', 'serviceCategories', index)}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Languages Available */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Languages Available
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add language"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToNestedArray('servicesOffered', 'languagesAvailable', newLanguage, setNewLanguage);
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => addToNestedArray('servicesOffered', 'languagesAvailable', newLanguage, setNewLanguage)}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.servicesOffered.languagesAvailable.map((lang, index) => (
                      <Chip
                        key={index}
                        label={lang}
                        onDelete={() => removeFromNestedArray('servicesOffered', 'languagesAvailable', index)}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Fee Options */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Fees & Payment Options
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add fee/payment option"
                      value={newFeeOption}
                      onChange={(e) => setNewFeeOption(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToNestedArray('servicesOffered', 'feesAndPaymentOptions', newFeeOption, setNewFeeOption);
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => addToNestedArray('servicesOffered', 'feesAndPaymentOptions', newFeeOption, setNewFeeOption)}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.servicesOffered.feesAndPaymentOptions.map((option, index) => (
                      <Chip
                        key={index}
                        label={option}
                        onDelete={() => removeFromNestedArray('servicesOffered', 'feesAndPaymentOptions', index)}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Crisis & Shelter Services Section */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h3" gutterBottom>
                Crisis & Shelter Services
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.crisisAndShelterServices.immediateCrisisResponse}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            crisisAndShelterServices: {
                              ...formData.crisisAndShelterServices,
                              immediateCrisisResponse: e.target.checked,
                            },
                          })
                        }
                      />
                    }
                    label="Immediate Crisis Response"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.crisisAndShelterServices.emergencyShelter}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            crisisAndShelterServices: {
                              ...formData.crisisAndShelterServices,
                              emergencyShelter: e.target.checked,
                            },
                          })
                        }
                      />
                    }
                    label="Emergency Shelter"
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Response Time"
                    value={formData.crisisAndShelterServices.responseTime}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        crisisAndShelterServices: {
                          ...formData.crisisAndShelterServices,
                          responseTime: e.target.value,
                        },
                      })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Emergency Shelter Info"
                    value={formData.crisisAndShelterServices.emergencyShelterInfo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        crisisAndShelterServices: {
                          ...formData.crisisAndShelterServices,
                          emergencyShelterInfo: e.target.value,
                        },
                      })
                    }
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Survivor Leadership Section */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h3" gutterBottom>
                Survivor Leadership & Mentorship
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.survivorLeadershipAndMentorship.survivorsInLeadership}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            survivorLeadershipAndMentorship: {
                              ...formData.survivorLeadershipAndMentorship,
                              survivorsInLeadership: e.target.checked,
                            },
                          })
                        }
                      />
                    }
                    label="Survivors in Leadership"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.survivorLeadershipAndMentorship.peerMentorshipProgram}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            survivorLeadershipAndMentorship: {
                              ...formData.survivorLeadershipAndMentorship,
                              peerMentorshipProgram: e.target.checked,
                            },
                          })
                        }
                      />
                    }
                    label="Peer Mentorship Program"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Training & Education Section */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h3" gutterBottom>
                Training & Education
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.trainingAndEducation.workshopsAndTrainingOffered}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            trainingAndEducation: {
                              ...formData.trainingAndEducation,
                              workshopsAndTrainingOffered: e.target.checked,
                            },
                          })
                        }
                      />
                    }
                    label="Workshops & Training Offered"
                  />
                </Grid>

                {/* Topics Covered */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Topics Covered
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add topic"
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToNestedArray('trainingAndEducation', 'topicsCovered', newTopic, setNewTopic);
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => addToNestedArray('trainingAndEducation', 'topicsCovered', newTopic, setNewTopic)}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.trainingAndEducation.topicsCovered.map((topic, index) => (
                      <Chip
                        key={index}
                        label={topic}
                        onDelete={() => removeFromNestedArray('trainingAndEducation', 'topicsCovered', index)}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Target Audience */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Target Audience
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add audience"
                      value={newAudience}
                      onChange={(e) => setNewAudience(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToNestedArray('trainingAndEducation', 'targetAudience', newAudience, setNewAudience);
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => addToNestedArray('trainingAndEducation', 'targetAudience', newAudience, setNewAudience)}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.trainingAndEducation.targetAudience.map((audience, index) => (
                      <Chip
                        key={index}
                        label={audience}
                        onDelete={() => removeFromNestedArray('trainingAndEducation', 'targetAudience', index)}
                      />
                    ))}
                  </Box>
                </Grid>

                {/* Training Format */}
                <Grid size={{ xs: 12 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Training Format
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Add format"
                      value={newFormat}
                      onChange={(e) => setNewFormat(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addToNestedArray('trainingAndEducation', 'trainingFormat', newFormat, setNewFormat);
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => addToNestedArray('trainingAndEducation', 'trainingFormat', newFormat, setNewFormat)}
                    >
                      Add
                    </Button>
                  </Stack>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.trainingAndEducation.trainingFormat.map((format, index) => (
                      <Chip
                        key={index}
                        label={format}
                        onDelete={() => removeFromNestedArray('trainingAndEducation', 'trainingFormat', index)}
                      />
                    ))}
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Accessibility & Inclusion Section */}
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h3" gutterBottom>
                Accessibility & Inclusion
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.accessibilityAndInclusion.adaCompliant}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            accessibilityAndInclusion: {
                              ...formData.accessibilityAndInclusion,
                              adaCompliant: e.target.checked,
                            },
                          })
                        }
                      />
                    }
                    label="ADA Compliant"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.accessibilityAndInclusion.disabilityAccommodations}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            accessibilityAndInclusion: {
                              ...formData.accessibilityAndInclusion,
                              disabilityAccommodations: e.target.checked,
                            },
                          })
                        }
                      />
                    }
                    label="Disability Accommodations"
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.accessibilityAndInclusion.culturallyResponsiveServices}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            accessibilityAndInclusion: {
                              ...formData.accessibilityAndInclusion,
                              culturallyResponsiveServices: e.target.checked,
                            },
                          })
                        }
                      />
                    }
                    label="Culturally Responsive Services"
                  />
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Action Buttons */}
          <Grid size={{ xs: 12 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={onCancel} disabled={saving}>
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSave} disabled={saving || !formData.nonprofitName}>
                {saving ? 'Creating...' : 'Create Provider'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={() => setSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled">
          Provider created successfully!
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!saveError}
        autoHideDuration={6000}
        onClose={() => setSaveError(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={() => setSaveError(null)}>
          {saveError}
        </Alert>
      </Snackbar>
    </MainCard>
  );
}
