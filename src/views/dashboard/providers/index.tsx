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

// ==============================|| USER LIST STYLE 1 ||============================== //

export default function Providers() {
  const [anchorEl, setAnchorEl] = React.useState<Element | (() => Element) | null | undefined>(null);
  const handleClick = (event: React.MouseEvent) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <MainCard
      title={
        <Grid container spacing={gridSpacing} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Grid>
            <Typography variant="h3">Anchor Point Providers</Typography>
          </Grid>
        </Grid>
      }
      content={false}
    >
      <ProviderList />
      <Grid sx={{ p: 3 }} size={12}>
        <Grid container spacing={gridSpacing} sx={{ justifyContent: 'space-between' }}>
          <Grid>
            <Pagination count={10} color="primary" />
          </Grid>
          <Grid>
            <Button size="large" sx={{ color: 'grey.900' }} color="secondary" endIcon={<ExpandMoreRoundedIcon />} onClick={handleClick}>
              10 Rows
            </Button>
            {anchorEl && (
              <Menu
                id="menu-user-list-style1"
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleClose}
                variant="selectedMenu"
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                transformOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right'
                }}
              >
                <MenuItem onClick={handleClose}> 10 Rows</MenuItem>
                <MenuItem onClick={handleClose}> 20 Rows</MenuItem>
                <MenuItem onClick={handleClose}> 30 Rows </MenuItem>
              </Menu>
            )}
          </Grid>
        </Grid>
      </Grid>
    </MainCard>
  );
}
