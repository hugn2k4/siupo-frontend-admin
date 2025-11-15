import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

const CategoryDialog = ({ open, onClose, onSave, initialData = null }) => {
  const { control, handleSubmit, reset } = useForm({ defaultValues: { name: initialData?.name || '' } });

  React.useEffect(() => {
    reset({ name: initialData?.name || '' });
  }, [initialData, reset]);

  const submit = (data) => {
    const payload = { ...initialData, name: data.name };
    onSave(payload, initialData ? 'edit' : 'create');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialData ? 'Edit Category' : 'Create Category'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <form id="category-form" onSubmit={handleSubmit(submit)}>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <TextField {...field} label="Name" fullWidth size="small" />}
            />
          </form>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="category-form" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryDialog;
