import { useState, useEffect } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import { userService } from 'services/userService';
import { DbUserProfile, UserRole } from 'types/auth';

// assets
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

// ==============================|| USER MANAGEMENT ||============================== //

export default function UserManagement() {
  const [users, setUsers] = useState<DbUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    message: string;
    action: (() => Promise<void>) | null;
  }>({
    open: false,
    title: '',
    message: '',
    action: null
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleVerifyUser = async (userId: string, userName: string) => {
    setConfirmDialog({
      open: true,
      title: 'Verify User',
      message: `Are you sure you want to verify ${userName || 'this user'}? They will be able to access the system.`,
      action: async () => {
        try {
          await userService.verifyUser(userId);
          await fetchUsers();
        } catch (err) {
          console.error('Failed to verify user:', err);
          setError('Failed to verify user');
        }
      }
    });
  };

  const handleRoleChange = async (userId: string, newRole: UserRole, userName: string) => {
    setConfirmDialog({
      open: true,
      title: 'Change User Role',
      message: `Are you sure you want to change ${userName || 'this user'}'s role to ${newRole}?`,
      action: async () => {
        try {
          await userService.updateUserRole(userId, newRole);
          await fetchUsers();
        } catch (err) {
          console.error('Failed to update user role:', err);
          setError('Failed to update user role');
        }
      }
    });
  };

  const handleRevokeAccess = async (userId: string, userName: string) => {
    setConfirmDialog({
      open: true,
      title: 'Revoke Access',
      message: `Are you sure you want to revoke access for ${userName || 'this user'}? They will no longer be able to access the system until verified again.`,
      action: async () => {
        try {
          await userService.unverifyUser(userId);
          await fetchUsers();
        } catch (err) {
          console.error('Failed to revoke user access:', err);
          setError('Failed to revoke user access');
        }
      }
    });
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    setConfirmDialog({
      open: true,
      title: 'Delete User',
      message: `Are you sure you want to permanently delete ${userName || 'this user'}? This action cannot be undone and will remove them from both the database and authentication system.`,
      action: async () => {
        try {
          await userService.deleteUser(userId);
          await fetchUsers();
        } catch (err: any) {
          console.error('Failed to delete user:', err);
          const errorMessage = err.response?.data?.error || 'Failed to delete user';
          setError(errorMessage);
        }
      }
    });
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.action) {
      await confirmDialog.action();
    }
    setConfirmDialog({ ...confirmDialog, open: false, action: null });
  };

  const handleCloseDialog = () => {
    setConfirmDialog({ ...confirmDialog, open: false, action: null });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <MainCard title="User Management">
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </MainCard>
    );
  }

  return (
    <>
      <MainCard
        title={
          <Grid container spacing={gridSpacing} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Grid>
              <Typography variant="h3">User Management</Typography>
            </Grid>
          </Grid>
        }
        content={false}
      >
        {error && (
          <Box sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name || '-'}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {user.isVerified ? (
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select
                          value={user.role}
                          onChange={(e: SelectChangeEvent) =>
                            handleRoleChange(user.id, e.target.value as UserRole, user.name || user.email)
                          }
                          size="small"
                        >
                          <MenuItem value="ADMIN">Admin</MenuItem>
                          <MenuItem value="READ_ONLY">Read Only</MenuItem>
                        </Select>
                      </FormControl>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {user.role === 'ADMIN' ? 'Admin' : 'Read Only'}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.isVerified ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Verified"
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        icon={<HourglassEmptyIcon />}
                        label="Pending"
                        color="warning"
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </TableCell>
                  <TableCell>{formatDate(user.createdAt)}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
                      {!user.isVerified && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => handleVerifyUser(user.id, user.name || user.email)}
                        >
                          Verify
                        </Button>
                      )}
                      {user.role === 'READ_ONLY' && (
                        <>
                          <Button
                            variant="outlined"
                            color="warning"
                            size="small"
                            onClick={() => handleRevokeAccess(user.id, user.name || user.email)}
                          >
                            Revoke
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                      No users found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialog.open} onClose={handleCloseDialog}>
        <DialogTitle>{confirmDialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{confirmDialog.message}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleConfirmAction} variant="contained" color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
