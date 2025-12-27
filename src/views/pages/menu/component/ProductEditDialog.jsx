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
import tagService from '../../../../services/tagService';

const ProductEditDialog = ({ open, onClose, onSave, initialData = null, categories = [] }) => {
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      price: initialData?.price || 0,
      description: initialData?.description || '',
      categoryId: initialData?.category?.id || initialData?.categoryId || '',
      images: initialData?.images || [],
      tags: initialData?.tags || []
    }
  });

  const { showSnackbar } = useSnackbar();

  // helper to extract a usable image URL from various shapes returned by the backend
  const getImageUrl = (img) => {
    if (!img) return '';
    if (typeof img === 'string') return img;
    return img.url || img.path || img.imageUrl || img.src || img.link || '';
  };

  const [existingImages, setExistingImages] = React.useState(() => {
    const arr = initialData?.images ?? initialData?.imageUrls ?? [];
    if (!arr) return [];
    return Array.isArray(arr)
      ? arr.map((img, idx) => {
          if (typeof img === 'string') {
            return { id: `existing-${idx}`, url: img };
          }
          return { id: img.id ?? `existing-${idx}`, url: getImageUrl(img) };
        })
      : [];
  });
  const [removedImageIds, setRemovedImageIds] = React.useState([]);
  // newFiles: array of { id, file }
  const [newFiles, setNewFiles] = React.useState([]);
  // previews: array of { id, url }
  const [previews, setPreviews] = React.useState([]);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState(null);
  const [availableTags, setAvailableTags] = React.useState([]);
  const [selectedTags, setSelectedTags] = React.useState(initialData?.tags || []);

  // Load available tags
  React.useEffect(() => {
    const loadTags = async () => {
      try {
        const response = await tagService.getAllTags();
        const tagList = response.data || response || [];
        setAvailableTags(tagList);
      } catch (error) {
        console.error('Error loading tags:', error);
      }
    };
    loadTags();
  }, []);

  React.useEffect(() => {
    const rawCategoryId = initialData?.category?.id || initialData?.categoryId || '';
    reset({
      name: initialData?.name || '',
      price: initialData?.price || 0,
      description: initialData?.description || '',
      categoryId: rawCategoryId !== '' ? Number(rawCategoryId) : '',
      images: initialData?.imageUrls || [],
      tags: initialData?.tags || []
    });
    setSelectedTags(initialData?.tags || []);
    // normalize existing images into objects { id, url }
    const arr = initialData?.images ?? initialData?.imageUrls ?? [];
    const normalized = Array.isArray(arr)
      ? arr.map((img, idx) => {
          if (typeof img === 'string') {
            return { id: `existing-${idx}`, url: img };
          }
          return { id: img.id ?? `existing-${idx}`, url: getImageUrl(img) };
        })
      : [];
    setExistingImages(normalized);
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
      ...(initialData && initialData.id ? { id: initialData.id } : {}),
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId ? Number(data.categoryId) : (initialData?.category?.id ?? null),
      imageUrls: existingImages.map((img) => getImageUrl(img)),
      tags: selectedTags
    };

    // include raw File[] for upload when present
    const filesToSend = newFiles.map((n) => n.file);
    try {
      // call parent's onSave with payload matching ProductRequest and raw files + removed ids
      if (typeof onSave === 'function') {
        onSave(payload, initialData ? 'edit' : 'create', { files: filesToSend, removedImageIds });
      }
    } catch (e) {
      // still close the dialog; parent will surface errors via snackbar
      console.error('onSave error', e);
    }
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
                        InputProps={{ endAdornment: <InputAdornment position="end">$</InputAdornment> }}
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

                {/* Tags Section */}
                <Box>
                  <FormControl fullWidth size="small">
                    <InputLabel id="tags-label">Tags</InputLabel>
                    <Select
                      labelId="tags-label"
                      multiple
                      value={selectedTags}
                      onChange={(e) => setSelectedTags(e.target.value)}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                      label="Tags"
                    >
                      {availableTags.map((tag) => (
                        <MenuItem key={tag.id} value={tag.name}>
                          {tag.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  {availableTags.length === 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      No tags available. Create tags in Manage Tags page first.
                    </Typography>
                  )}
                </Box>
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
                                  src={getImageUrl(item.data)}
                                  variant="rounded"
                                  sx={{ width: 100, height: 100, cursor: 'pointer' }}
                                  onClick={() => {
                                    setPreviewUrl(getImageUrl(item.data));
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
