import { useNavigate } from 'react-router-dom';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';

import Logo from 'ui-component/Logo';
import AnimateButton from 'ui-component/extended/AnimateButton';
import AuthFooter from 'ui-component/cards/AuthFooter';

import useAuth from 'hooks/useAuth';

// assets
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

// ==============================|| PENDING VERIFICATION ||============================== //

export default function PendingVerification() {
  const downMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthWrapper1>
      <Grid container direction="column" sx={{ justifyContent: 'flex-end', minHeight: '100vh' }}>
        <Grid size={12}>
          <Grid container sx={{ justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 68px)' }}>
            <Grid sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              <AuthCardWrapper>
                <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Grid sx={{ mb: 3 }}>
                    <Logo />
                  </Grid>
                  <Grid size={12}>
                    <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      <Grid size={12}>
                        <HourglassEmptyIcon sx={{ fontSize: 60, color: 'warning.main', mb: 2 }} />
                      </Grid>
                      <Grid size={12}>
                        <Typography gutterBottom variant={downMD ? 'h3' : 'h2'} sx={{ color: 'secondary.main' }}>
                          Account Pending Approval
                        </Typography>
                      </Grid>
                      <Grid size={12}>
                        <Typography variant="body1" sx={{ fontSize: '16px', textAlign: 'center', mb: 2 }}>
                          Your account has been created successfully, but it needs to be approved by an administrator before you can access the system.
                        </Typography>
                        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                          Please contact your administrator if you need immediate access.
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid size={12} sx={{ mt: 3 }}>
                    <AnimateButton>
                      <Button
                        disableElevation
                        fullWidth
                        size="large"
                        variant="contained"
                        color="secondary"
                        onClick={handleLogout}
                      >
                        Sign Out
                      </Button>
                    </AnimateButton>
                  </Grid>
                </Grid>
              </AuthCardWrapper>
            </Grid>
          </Grid>
        </Grid>
        <Grid sx={{ px: 3, my: 3 }} size={12}>
          <AuthFooter />
        </Grid>
      </Grid>
    </AuthWrapper1>
  );
}
