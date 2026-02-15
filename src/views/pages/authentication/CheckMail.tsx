import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

// material-ui
import { Theme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import AuthWrapper1 from './AuthWrapper1';
import AuthCardWrapper from './AuthCardWrapper';
import ViewOnlyAlert from './ViewOnlyAlert';
import LoginProvider from './LoginProvider';

import Logo from 'ui-component/Logo';
import AnimateButton from 'ui-component/extended/AnimateButton';
import AuthFooter from 'ui-component/cards/AuthFooter';

import useAuth from 'hooks/useAuth';
import { APP_AUTH } from 'config';

// ==============================|| AUTH3 - CHECK MAIL ||============================== //

export default function CheckMail() {
  const downMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  const { isLoggedIn, resendVerificationEmail } = useAuth();

  const [searchParams] = useSearchParams();
  const auth = searchParams.get('auth');
  const email = searchParams.get('email');

  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const handleResendEmail = async () => {
    if (!email || !resendVerificationEmail) return;

    setResending(true);
    setResendError(null);
    setResendSuccess(false);

    try {
      await resendVerificationEmail(email);
      setResendSuccess(true);
    } catch (err: any) {
      console.error('Failed to resend verification email:', err);
      if (err.message?.includes('rate limit') || err.message?.includes('Too Many Requests')) {
        setResendError('Too many attempts. Please wait a few minutes before trying again.');
      } else {
        setResendError(err.message || 'Failed to resend verification email. Please try again.');
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthWrapper1>
      <Grid container direction="column" sx={{ justifyContent: 'flex-end', minHeight: '100vh' }}>
        <Grid size={12}>
          <Grid container sx={{ justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 68px)' }}>
            <Grid sx={{ m: { xs: 1, sm: 3 }, mb: 0 }}>
              {!isLoggedIn && <ViewOnlyAlert />}
              <AuthCardWrapper>
                <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                  <Grid sx={{ mb: 3 }}>
                    <Link to="#" aria-label="theme logo">
                      <Logo />
                    </Link>
                  </Grid>
                  <Grid size={12}>
                    <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                      <Grid size={12}>
                        <Typography gutterBottom variant={downMD ? 'h3' : 'h2'} sx={{ color: 'secondary.main' }}>
                          Hi, Check Your Mail
                        </Typography>
                      </Grid>
                      <Grid size={12}>
                        <Typography variant="caption" sx={{ fontSize: '16px', textAlign: { xs: 'center', md: 'inherit' } }}>
                          We have sent a verification link to your email. Please check your inbox and click the link to verify your account.
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  {resendSuccess && (
                    <Grid size={12}>
                      <Alert severity="success">
                        Verification email sent! Please check your inbox.
                      </Alert>
                    </Grid>
                  )}
                  {resendError && (
                    <Grid size={12}>
                      <Alert severity="error">{resendError}</Alert>
                    </Grid>
                  )}
                  {email && (
                    <Grid size={12}>
                      <AnimateButton>
                        <Button
                          onClick={handleResendEmail}
                          disabled={resending || resendSuccess}
                          disableElevation
                          fullWidth
                          size="large"
                          variant="contained"
                          color="secondary"
                          startIcon={resending ? <CircularProgress size={20} color="inherit" /> : undefined}
                        >
                          {resending ? 'Sending...' : resendSuccess ? 'Email Sent!' : 'Resend Verification Email'}
                        </Button>
                      </AnimateButton>
                    </Grid>
                  )}
                  <Grid size={12}>
                    <Button
                      component={Link}
                      to={auth ? `/login?auth=${auth}` : '/login'}
                      disableElevation
                      fullWidth
                      size="large"
                      variant="outlined"
                      color="secondary"
                    >
                      Back to Login
                    </Button>
                  </Grid>
                </Grid>
              </AuthCardWrapper>
              {!isLoggedIn && (
                <Box
                  sx={{
                    maxWidth: { xs: 400, lg: 475 },
                    margin: { xs: 2.5, md: 3 },
                    '& > *': {
                      flexGrow: 1,
                      flexBasis: '50%'
                    }
                  }}
                >
                  <LoginProvider currentLoginWith={APP_AUTH} />
                </Box>
              )}
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
