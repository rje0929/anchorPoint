import React from 'react';

// material-ui
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Link from '@mui/material/Link';

// assets
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LanguageIcon from '@mui/icons-material/Language';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessibleIcon from '@mui/icons-material/Accessible';
import SchoolIcon from '@mui/icons-material/School';

// types
import { Provider } from '../../../types/provider';

interface ProviderDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  provider: Provider | null;
}

const ProviderDetailDrawer: React.FC<ProviderDetailDrawerProps> = ({ open, onClose, provider }) => {
  if (!provider) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 600, md: 700 },
          p: 3
        }
      }}
    >
      <Box>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Box flex={1}>
            <Typography variant="h4" gutterBottom>
              {provider.nonprofitName}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              {provider.businessType.map((type, idx) => (
                <Chip key={idx} label={type} size="small" color="primary" variant="outlined" icon={<BusinessIcon />} />
              ))}
            </Stack>
          </Box>
          <IconButton onClick={onClose} sx={{ ml: 2 }}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Description */}
        {provider.description && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              About
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {provider.description}
            </Typography>
          </Box>
        )}

        {/* Address */}
        {provider.address && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Address
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="body2">{provider.address.streetAddress}</Typography>
                <Typography variant="body2">
                  {provider.address.city}, {provider.address.state} {provider.address.zipCode}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Websites */}
        {provider.websites && provider.websites.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              <LanguageIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Websites
            </Typography>
            <Stack spacing={1}>
              {provider.websites.map((website, idx) => (
                <Link key={idx} href={website} target="_blank" rel="noopener noreferrer" variant="body2">
                  {website}
                </Link>
              ))}
            </Stack>
          </Box>
        )}

        {/* Contact Information */}
        {provider.contactInformation && provider.contactInformation.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Contact Information
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Box>
                  {provider.contactInformation.map((contact, idx) => (
                    <Box key={idx} sx={{ mb: idx < provider.contactInformation!.length - 1 ? 2 : 0 }}>
                      <Stack spacing={1}>
                        {contact.officePhone && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PhoneIcon fontSize="small" color="action" />
                            <Typography variant="body2">Office: {contact.officePhone}</Typography>
                          </Stack>
                        )}
                        {contact.generalEmail && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <EmailIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              <Link href={`mailto:${contact.generalEmail}`}>{contact.generalEmail}</Link>
                            </Typography>
                          </Stack>
                        )}
                        {contact.crisisHotline && (
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <PhoneIcon fontSize="small" color="error" />
                            <Typography variant="body2" color="error">
                              Crisis Hotline: {contact.crisisHotline}
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Primary Contacts */}
        {provider.contacts && provider.contacts.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Primary Contacts
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <List disablePadding>
                  {provider.contacts.map((contact, idx) => (
                    <ListItem key={idx} disableGutters>
                      <ListItemText
                        primary={contact.primaryContact}
                        secondary={
                          <Stack spacing={0.5}>
                            <Typography variant="body2" color="text.secondary">
                              {contact.description}
                            </Typography>
                            {contact.phone && (
                              <Typography variant="caption" color="text.secondary">
                                Phone: {contact.phone}
                              </Typography>
                            )}
                            {contact.email && (
                              <Typography variant="caption" color="text.secondary">
                                Email: <Link href={`mailto:${contact.email}`}>{contact.email}</Link>
                              </Typography>
                            )}
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Regions Served */}
        {provider.regionsServed && provider.regionsServed.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              <LocationOnIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Regions Served
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {provider.regionsServed.map((region, idx) => (
                <Chip key={idx} label={region} size="small" color="primary" />
              ))}
            </Box>
          </Box>
        )}

        {/* Services Offered */}
        {provider.servicesOffered && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Services Offered
            </Typography>
            <Card variant="outlined">
              <CardContent>
                {provider.servicesOffered.available247 && (
                  <Chip label="Available 24/7" size="small" color="success" sx={{ mb: 2 }} />
                )}
                {provider.servicesOffered.description && (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {provider.servicesOffered.description}
                  </Typography>
                )}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Service Categories
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {provider.servicesOffered.serviceCategories.map((category, idx) => (
                        <Chip key={idx} label={category} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Languages Available
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {provider.servicesOffered.languagesAvailable.map((language, idx) => (
                        <Chip key={idx} label={language} size="small" variant="outlined" />
                      ))}
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Fees & Payment Options
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {provider.servicesOffered.feesAndPaymentOptions.map((option, idx) => (
                      <Chip key={idx} label={option} size="small" color="info" />
                    ))}
                  </Box>
                </Box>
                {provider.servicesOffered.translationServices && (
                  <Box>
                    <Chip label="Translation Services Available" size="small" color="secondary" />
                  </Box>
                )}
              </Box>
            </CardContent>
          </Card>
          </Box>
        )}

        {/* Demographics & Populations */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
          {provider.demographics && provider.demographics.length > 0 && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Demographics Served
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {provider.demographics.map((demo, idx) => (
                  <Chip key={idx} label={demo} size="small" variant="outlined" />
                ))}
              </Box>
            </Box>
          )}
          {provider.specificPopulations && provider.specificPopulations.length > 0 && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                Specific Populations
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {provider.specificPopulations.map((pop, idx) => (
                  <Chip key={idx} label={pop} size="small" variant="outlined" color="secondary" />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Training & Education */}
        {provider.trainingAndEducation && provider.trainingAndEducation.workshopsAndTrainingOffered && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              <SchoolIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Training & Education
            </Typography>
            <Card variant="outlined">
              <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {provider.trainingAndEducation.topicsCovered.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Topics Covered
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {provider.trainingAndEducation.topicsCovered.map((topic, idx) => (
                        <Typography key={idx} variant="body2" color="text.secondary">
                          • {topic}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                )}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                  {provider.trainingAndEducation.targetAudience.length > 0 && (
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Target Audience
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {provider.trainingAndEducation.targetAudience.map((audience, idx) => (
                          <Chip key={idx} label={audience} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {provider.trainingAndEducation.trainingFormat.length > 0 && (
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Training Format
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {provider.trainingAndEducation.trainingFormat.map((format, idx) => (
                          <Chip key={idx} label={format} size="small" color="info" />
                        ))}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
          </Box>
        )}

        {/* Accessibility & Inclusion */}
        {provider.accessibilityAndInclusion && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              <AccessibleIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Accessibility & Inclusion
            </Typography>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={1}>
                  {provider.accessibilityAndInclusion.adaCompliant && (
                    <Chip label="ADA Compliant" size="small" color="success" />
                  )}
                  {provider.accessibilityAndInclusion.disabilityAccomadations && (
                    <Chip label="Disability Accommodations Available" size="small" color="success" />
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Collaborations */}
        {provider.collaborationAndPartnerships && provider.collaborationAndPartnerships.length > 0 && (
          <Box mb={3}>
            <Typography variant="h6" gutterBottom>
              Collaborations & Partnerships
            </Typography>
            <Stack spacing={0.5}>
              {provider.collaborationAndPartnerships.map((collab, idx) => (
                <Typography key={idx} variant="body2" color="text.secondary">
                  • {collab}
                </Typography>
              ))}
            </Stack>
          </Box>
        )}

        {/* Survivor Leadership */}
        {provider.survivorLeadershipAndMentorship && (
          <Box mb={3}>
            <Chip label="Survivor Leadership & Mentorship Programs Available" color="primary" />
          </Box>
        )}

        {/* Metadata */}
        <Divider sx={{ my: 2 }} />
        <Typography variant="caption" color="text.secondary">
          Provider ID: {provider.id} | Last Updated:{' '}
          {new Date(provider.updatedAt).toLocaleDateString()}
        </Typography>
      </Box>
    </Drawer>
  );
};

export default ProviderDetailDrawer;
