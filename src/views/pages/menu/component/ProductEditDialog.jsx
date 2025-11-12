import DeleteIcon from '@mui/icons-material/Delete';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useSnackbar } from 'contexts/SnackbarProvider';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

const ProductEditDialog = ({ open, onClose, onSave, initialData = null, categories = [] }) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      price: initialData?.price || 0,
      description: initialData?.description || '',
      status: initialData?.status || 'ACTIVE',
      categoryId: initialData?.category?.id || ''
    }
  });

  const { showSnackbar } = useSnackbar();

  const [existingImages, setExistingImages] = React.useState(initialData?.images || []);
  const [removedImageIds, setRemovedImageIds] = React.useState([]);
  // newFiles: array of { id, file }
  const [newFiles, setNewFiles] = React.useState([]);
  // previews: array of { id, url }
  const [previews, setPreviews] = React.useState([]);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState(null);

  React.useEffect(() => {
    reset({
      name: initialData?.name || '',
      price: initialData?.price || 0,
      description: initialData?.description || '',
      status: initialData?.status || 'ACTIVE',
      categoryId: initialData?.category?.id || ''
    });
    setExistingImages(initialData?.images || []);
    setRemovedImageIds([]);
    setNewFiles([]);
    setPreviews([]);
  }, [initialData, reset]);

  React.useEffect(() => {
    const urls = newFiles.map((n) => ({ id: n.id, url: URL.createObjectURL(n.file) }));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u.url));
  }, [newFiles]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const currentCount = (existingImages?.length || 0) + (newFiles?.length || 0);
    const remaining = 5 - currentCount;
    if (remaining <= 0) {
      showSnackbar({ message: 'Maximum 5 images allowed', severity: 'warning' });
      e.target.value = null;
      return;
    }
    const toAddFiles = files.slice(0, remaining);
    if (toAddFiles.length < files.length) {
      showSnackbar({ message: `Only ${remaining} image(s) can be added (limit 5)`, severity: 'warning' });
    }
    const toAdd = toAddFiles.map((f) => ({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, file: f }));
    setNewFiles((p) => [...p, ...toAdd]);
    e.target.value = null;
  };

  const removeExistingImage = (img) => {
    if (img?.id) {
      setRemovedImageIds((p) => [...p, img.id]);
      setExistingImages((p) => p.filter((x) => x.id !== img.id));
    } else {
      setExistingImages((p) => p.filter((x) => x !== img));
    }
  };

  const removeNewFile = (id) => setNewFiles((p) => p.filter((x) => x.id !== id));

  const submit = (data) => {
    const payload = {
      ...initialData,
      name: data.name,
      price: data.price,
      description: data.description,
      status: data.status,
      category: categories.find((c) => c.id === data.categoryId) || null
    };
    onSave(payload, initialData ? 'edit' : 'create', { files: newFiles, removedImageIds });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle sx={{ pb: 0 }}>{initialData ? 'Edit product' : 'Create product'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <form id="product-form" onSubmit={handleSubmit(submit)}>
            <Grid item xs={12} md={8}>
              <Stack spacing={2}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Name" fullWidth size="small" />}
                />
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Price"
                        type="number"
                        size="small"
                        fullWidth
                        InputProps={{ endAdornment: <InputAdornment position="end">VND</InputAdornment> }}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="category-label">Category</InputLabel>
                    <Controller
                      name="categoryId"
                      control={control}
                      render={({ field }) => (
                        <Select labelId="category-label" label="Category" {...field}>
                          <MenuItem value="">None</MenuItem>
                          {categories.map((cat) => (
                            <MenuItem key={cat.id} value={cat.id}>
                              {cat.name}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                </Grid>

                <Controller
                  name="description"
                  control={control}
                  render={({ field }) => <TextField {...field} label="Description" fullWidth multiline rows={4} size="small" />}
                />
              </Stack>
            </Grid>

            <Grid item xs={12} md={4}>
              <Stack spacing={1}>
                <Typography variant="body1" sx={{ pt: 3, fontWeight: 'bold' }}>
                  Images
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  Upload up to 5 images. Click the X to remove.
                </Typography>

                <Divider sx={{ my: 1 }} />

                <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 1, minHeight: 140 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {(() => {
                      const combined = [
                        ...existingImages.map((e) => ({ type: 'existing', data: e })),
                        ...previews.map((p) => ({ type: 'preview', data: p }))
                      ];
                      return Array.from({ length: 5 }).map((_, slotIndex) => {
                        const item = combined[slotIndex] || null;
                        return (
                          <Box
                            key={slotIndex}
                            sx={{
                              position: 'relative',
                              width: 100,
                              height: 100,
                              flex: '0 0 auto',
                              bgcolor: 'background.default',
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              overflow: 'hidden'
                            }}
                          >
                            {item ? (
                              <>
                                <Avatar
                                  src={item.data.url}
                                  variant="rounded"
                                  sx={{ width: 100, height: 100, cursor: 'pointer' }}
                                  onClick={() => {
                                    setPreviewUrl(item.data.url);
                                    setPreviewOpen(true);
                                  }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    if (item.type === 'existing') {
                                      removeExistingImage(item.data);
                                    } else {
                                      removeNewFile(item.data.id);
                                    }
                                  }}
                                  sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'background.paper' }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </>
                            ) : (
                              <Box
                                sx={{
                                  width: 100,
                                  height: 100,
                                  borderRadius: 1,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  color: 'text.secondary',
                                  border: '1px dashed',
                                  cursor: existingImages.length + newFiles.length >= 5 ? 'not-allowed' : 'pointer',
                                  position: 'relative',
                                  overflow: 'hidden'
                                }}
                              >
                                +
                                <input
                                  type="file"
                                  accept="image/*"
                                  multiple
                                  onChange={handleFileChange}
                                  disabled={existingImages.length + newFiles.length >= 5}
                                  style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                    opacity: 0,
                                    cursor: existingImages.length + newFiles.length >= 5 ? 'not-allowed' : 'pointer'
                                  }}
                                />
                              </Box>
                            )}
                          </Box>
                        );
                      });
                    })()}
                  </Box>
                </Box>

                <Button
                  variant="outlined"
                  component="label"
                  size="small"
                  sx={{ mt: 1 }}
                  disabled={existingImages.length + newFiles.length >= 5}
                >
                  Select images
                  <input hidden accept="image/*" multiple type="file" onChange={handleFileChange} />
                </Button>

                <Box>
                  {existingImages.length + newFiles.length > 0 && (
                    <Chip label={`${existingImages.length + newFiles.length} image(s)`} size="small" />
                  )}
                </Box>
              </Stack>
            </Grid>
          </form>
        </Box>
      </DialogContent>
      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogContent dividers sx={{ p: 0, display: 'flex', justifyContent: 'center' }}>
          {previewUrl && <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '80vh' }} />}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="product-form" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProductEditDialog;
