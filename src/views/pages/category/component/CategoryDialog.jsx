import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
// Sửa import: Gọi uploadService thay vì uploadApi
import uploadService from 'services/uploadService';

const CategoryDialog = ({ open, onClose, onSave, initialData = null }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initialData?.image?.url || '');
  const [isUploading, setIsUploading] = useState(false);

  // Thêm watch để kiểm tra điều kiện nút Save
  const { control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      name: initialData?.name || '',
      imageUrl: initialData?.image?.url || '',
      imageName: initialData?.image?.name || ''
    }
  });

  const [nameValue, imageUrlValue] = watch(['name', 'imageUrl']);

  React.useEffect(() => {
    reset({
      name: initialData?.name || '',
      imageUrl: initialData?.image?.url || '',
      imageName: initialData?.image?.name || ''
    });
    setPreviewUrl(initialData?.image?.url || '');
    setSelectedFile(null);
  }, [initialData, reset]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const submit = async (data) => {
    let finalImageUrl = data.imageUrl;
    let finalImageName = data.imageName;

    if (selectedFile) {
      setIsUploading(true);
      try {
        // Sửa logic upload: Gọi uploadService.uploadMultiple và truyền mảng file
        // Mặc dù chúng ta chỉ có 1 file, nhưng chúng ta dùng hàm tồn tại:
        const uploadedUrls = await uploadService.uploadMultiple([selectedFile]);

        if (uploadedUrls && uploadedUrls.length > 0) {
          finalImageUrl = uploadedUrls[0];
          finalImageName = selectedFile.name;
        } else {
          // Xử lý trường hợp upload thành công nhưng không trả về URL
          throw new Error('Upload succeeded but returned no URL.');
        }
      } catch (error) {
        console.error('Upload failed:', error);
        setIsUploading(false);
        alert('Upload ảnh thất bại! Vui lòng kiểm tra console.');
        return;
      } finally {
        setIsUploading(false);
      }
    } else if (!data.imageUrl && !initialData) {
      finalImageUrl = null;
      finalImageName = null;
    }

    const payload = {
      id: initialData?.id,
      name: data.name,
      imageUrl: finalImageUrl,
      imageName: finalImageName
    };

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
              rules={{ required: 'Name is required' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Name"
                  fullWidth
                  size="small"
                  error={!!fieldState.error}
                  helperText={fieldState.error ? fieldState.error.message : null}
                />
              )}
            />

            <Box sx={{ my: 2, textAlign: 'center' }}>
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Category Preview"
                  style={{ maxWidth: '100%', maxHeight: 200, border: '1px solid #ccc', objectFit: 'cover' }}
                />
              ) : (
                <Box sx={{ p: 4, border: '1px dashed #ccc', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  No Image Selected
                </Box>
              )}
            </Box>

            <Button variant="outlined" component="label" fullWidth disabled={isUploading}>
              {selectedFile ? `File: ${selectedFile.name}` : 'Select New Image'}
              <input type="file" hidden accept="image/*" onChange={handleFileChange} />
            </Button>
          </form>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isUploading}>
          Cancel
        </Button>
        <Button
          type="submit"
          form="category-form"
          variant="contained"
          disabled={isUploading || (!nameValue && !selectedFile && !imageUrlValue)}
        >
          {isUploading ? 'Uploading...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CategoryDialog;
