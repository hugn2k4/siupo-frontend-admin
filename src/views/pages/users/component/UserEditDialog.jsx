import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import React from 'react';

const UserEditDialog = ({ open, onClose, onSave, initialData = null }) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      gender: initialData?.gender || '',
      status: initialData?.status || 'ACTIVE'
    }
  });

  React.useEffect(() => {
    reset({
      fullName: initialData?.fullName || '',
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
      dateOfBirth: initialData?.dateOfBirth || '',
      gender: initialData?.gender || '',
      status: initialData?.status || 'ACTIVE'
    });
  }, [initialData, reset]);

  const submit = (data) => {
    const payload = initialData?.id ? { id: initialData.id, ...data } : data;
    if (typeof onSave === 'function') {
      onSave(payload, initialData ? 'edit' : 'create');
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit user' : 'Add user'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <form id="user-form" onSubmit={handleSubmit(submit)}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Controller
                  name="fullName"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Fullname" fullWidth size="small" />}
                />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Email" type="email" fullWidth size="small" />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="phoneNumber"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Phone number" fullWidth size="small" />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <TextField {...field} label="Date of birth" type="date" fullWidth size="small" InputLabelProps={{ shrink: true }} />
                  )}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Gender</InputLabel>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Gender">
                        <MenuItem value="">None</MenuItem>
                        <MenuItem value="MALE">Male</MenuItem>
                        <MenuItem value="FEMALE">Female</MenuItem>
                        <MenuItem value="OTHER">Other</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} label="Status">
                        <MenuItem value="ACTIVE">Active</MenuItem>
                        <MenuItem value="INACTIVE">Inactive</MenuItem>
                        <MenuItem value="SUSPENDED">Suspended</MenuItem>
                        <MenuItem value="DELETED">Deleted</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>
              </Grid>
            </Grid>
          </form>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="user-form" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserEditDialog;
