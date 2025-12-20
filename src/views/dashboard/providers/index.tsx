import React from 'react';

// material-ui
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

// assets
import { IconSearch } from '@tabler/icons-react';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ProviderList from './providerList';
import AddIcon from '@mui/icons-material/Add';

// ==============================|| USER LIST STYLE 1 ||============================== //

export default function Providers() {
  const [anchorEl, setAnchorEl] = React.useState<Element | (() => Element) | null | undefined>(null);
  const [showAddForm, setShowAddForm] = React.useState(false);

  const handleClick = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAddProvider = () => {
    setShowAddForm(true);
  };

  return (
    <MainCard
      title={
        <Grid container spacing={gridSpacing} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h3">Anchor Point Providers</Typography>
          </Grid>
          <Grid>
            <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={handleAddProvider}>
              Add New Provider
            </Button>
          </Grid>
        </Grid>
      }
      content={false}
    >
      <ProviderList showAddForm={showAddForm} setShowAddForm={setShowAddForm} />
    </MainCard>
  );
}
