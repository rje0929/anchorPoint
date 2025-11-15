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

// assets
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import EditTwoToneIcon from '@mui/icons-material/EditTwoTone';
import { providerService } from '../../../services/providerService';
import { Provider } from '../../../types/provider';

// ==============================|| PROVIDER LIST ||============================== //

export default function ProviderList() {
  const [data, setData] = React.useState<Provider[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ pl: 3 }}>#</TableCell>
            <TableCell>Provider Name</TableCell>
            <TableCell>Business Type</TableCell>
            <TableCell>Contact</TableCell>
            <TableCell>Regions Served</TableCell>
            <TableCell>Services</TableCell>
            <TableCell align="center" sx={{ pr: 3 }}>
              Actions
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data && data.length > 0 ? (
            data.map((row) => (
              <TableRow hover key={row.id}>
                <TableCell sx={{ pl: 3 }}>{row.id}</TableCell>
                <TableCell>
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
                    {row.businessType.length > 2 && (
                      <Chip label={`+${row.businessType.length - 2}`} size="small" variant="outlined" />
                    )}
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
                    {row.regionsServed.length > 2 && (
                      <Chip label={`+${row.regionsServed.length - 2}`} size="small" variant="outlined" />
                    )}
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {row.servicesOffered?.available247 && <Chip label="24/7" size="small" color="success" />}
                    {row.servicesOffered && row.servicesOffered.serviceCategories.length > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        {row.servicesOffered.serviceCategories.length} services
                      </Typography>
                    )}
                  </Stack>
                </TableCell>
                <TableCell align="center" sx={{ pr: 3 }}>
                  <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Tooltip placement="top" title="View Details">
                      <IconButton color="primary" aria-label="view" size="large">
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
              <TableCell colSpan={7} align="center">
                <Typography variant="body2" color="text.secondary">
                  No providers found
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
