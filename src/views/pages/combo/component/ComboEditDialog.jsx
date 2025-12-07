import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import productService from '../../../../services/productService';
import uploadService from '../../../../services/uploadService';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250
    }
  }
};

export default function ComboEditDialog({ open, onClose, onSave, mode = 'create', data = null }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: 0,
    imageUrls: [],
    items: []
  });

  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [existingImages, setExistingImages] = useState([]); // URLs from server
  const [newImageFiles, setNewImageFiles] = useState([]); // New files to upload
  const [errors, setErrors] = useState({});
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      loadProducts();
      if (mode === 'edit' && data) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          basePrice: data.basePrice || 0,
          imageUrls: data.imageUrls || [],
          items: data.items || []
        });
        // Set existing images from server
        setExistingImages(data.imageUrls || []);
        setNewImageFiles([]);

        // Set selected products and quantities
        if (data.items && Array.isArray(data.items)) {
          const prodIds = data.items.map((item) => item.product?.id || item.productId);
          setSelectedProducts(prodIds);

          const quantities = {};
          data.items.forEach((item) => {
            const pid = item.product?.id || item.productId;
            quantities[pid] = item.quantity;
          });
          setProductQuantities(quantities);
        }
      } else {
        resetForm();
      }
    }
  }, [open, mode, data]);

  const loadProducts = async () => {
    try {
      const result = await productService.getProducts(0, 1000);
      console.log('Products API result:', result);

      // Backend returns: { success, code, message, data: Page<ProductDTO> }
      // Page object has: { content: [], totalElements, totalPages, etc. }
      if (result && result.data && result.data.content) {
        console.log('Setting products from result.data.content:', result.data.content);
        setProducts(result.data.content || []);
      } else if (result && result.content) {
        console.log('Setting products from result.content:', result.content);
        setProducts(result.content || []);
      } else if (Array.isArray(result)) {
        console.log('Setting products from array:', result);
        setProducts(result);
      } else {
        console.warn('Unexpected products response format:', result);
        setProducts([]);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: 0,
      imageUrls: [],
      items: []
    });
    setSelectedProducts([]);
    setProductQuantities({});
    setExistingImages([]);
    setNewImageFiles([]);
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleProductSelection = (event) => {
    const value = event.target.value;
    setSelectedProducts(typeof value === 'string' ? value.split(',') : value);

    // Initialize quantity to 1 for newly selected products
    const newQuantities = { ...productQuantities };
    value.forEach((prodId) => {
      if (!newQuantities[prodId]) {
        newQuantities[prodId] = 1;
      }
    });
    setProductQuantities(newQuantities);
  };

  const handleQuantityChange = (productId, quantity) => {
    const qty = parseInt(quantity) || 1;
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: qty > 0 ? qty : 1
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setNewImageFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((img) => img !== url));
  };

  const handleRemoveNewImage = (index) => {
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Tên combo không được để trống';
    }
    if (formData.basePrice < 0) {
      newErrors.basePrice = 'Giá combo phải >= 0';
    }
    if (selectedProducts.length === 0) {
      newErrors.items = 'Combo phải có ít nhất 1 sản phẩm';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setUploading(true);
    try {
      // Start with existing images that weren't removed
      let finalImageUrls = [...existingImages];

      // Upload new images if any using Cloudinary
      if (newImageFiles.length > 0) {
        console.log('Uploading files to Cloudinary:', newImageFiles);

        // uploadService.uploadMultiple expects array of files and returns array of URLs
        const uploadedUrls = await uploadService.uploadMultiple(newImageFiles);
        console.log('Cloudinary upload result (URLs):', uploadedUrls);

        if (Array.isArray(uploadedUrls) && uploadedUrls.length > 0) {
          finalImageUrls = [...finalImageUrls, ...uploadedUrls];
        }
      }

      // Build items array
      const items = selectedProducts.map((productId, index) => ({
        productId: parseInt(productId),
        quantity: productQuantities[productId] || 1,
        displayOrder: index
      }));

      const payload = {
        name: formData.name,
        description: formData.description,
        basePrice: parseFloat(formData.basePrice),
        imageUrls: finalImageUrls,
        items: items
      };

      console.log('Saving combo with payload:', payload);
      await onSave(payload, mode);
      handleClose();
    } catch (error) {
      console.error('Error saving combo:', error);
      setErrors({ submit: error.message || 'Lỗi khi lưu combo' });
    } finally {
      setUploading(false);
    }
  };
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getProductName = (productId) => {
    const product = products.find((p) => p.id === parseInt(productId));
    return product ? product.name : `Product ${productId}`;
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Tạo Combo Mới' : 'Chỉnh Sửa Combo'}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Name */}
          <TextField
            label="Tên Combo"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name}
            fullWidth
            required
          />

          {/* Description */}
          <TextField
            label="Mô Tả"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            multiline
            rows={3}
            fullWidth
          />

          {/* Base Price */}
          <TextField
            label="Giá Combo"
            type="number"
            value={formData.basePrice}
            onChange={(e) => handleChange('basePrice', e.target.value)}
            error={Boolean(errors.basePrice)}
            helperText={errors.basePrice}
            InputProps={{
              endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>
            }}
            fullWidth
            required
          />

          {/* Product Selection */}
          <FormControl fullWidth error={Boolean(errors.items)}>
            <InputLabel>Chọn Sản Phẩm</InputLabel>
            <Select
              multiple
              value={selectedProducts}
              onChange={handleProductSelection}
              input={<OutlinedInput label="Chọn Sản Phẩm" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip key={value} label={getProductName(value)} size="small" />
                  ))}
                </Box>
              )}
              MenuProps={MenuProps}
            >
              {products.length === 0 ? (
                <MenuItem disabled>Đang tải sản phẩm...</MenuItem>
              ) : (
                products.map((product) => (
                  <MenuItem key={product.id} value={product.id}>
                    {product.name} - {product.price?.toLocaleString('vi-VN')} VNĐ
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.items && (
              <Typography color="error" variant="caption">
                {errors.items}
              </Typography>
            )}
            {products.length > 0 && (
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                Tìm thấy {products.length} sản phẩm
              </Typography>
            )}
          </FormControl>

          {/* Product Quantities */}
          {selectedProducts.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Số Lượng Sản Phẩm:
              </Typography>
              {selectedProducts.map((productId) => (
                <Box key={productId} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Typography sx={{ flex: 1 }}>{getProductName(productId)}</Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={productQuantities[productId] || 1}
                    onChange={(e) => handleQuantityChange(productId, e.target.value)}
                    inputProps={{ min: 1 }}
                    sx={{ width: 100 }}
                  />
                </Box>
              ))}
            </Box>
          )}

          {/* Image Upload */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Hình Ảnh:
            </Typography>
            <Button variant="outlined" component="label" fullWidth>
              Chọn Hình Ảnh
              <input type="file" hidden multiple accept="image/*" onChange={handleImageChange} />
            </Button>

            {/* Display existing and new images */}
            {(existingImages.length > 0 || newImageFiles.length > 0) && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {/* Existing images from server */}
                {existingImages.map((url, index) => (
                  <Box key={`existing-${index}`} sx={{ position: 'relative', width: 100, height: 100 }}>
                    <img
                      src={url}
                      alt={`existing-${index}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 4,
                        border: '2px solid #4caf50'
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'background.paper'
                      }}
                      onClick={() => handleRemoveExistingImage(url)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}

                {/* New images to upload */}
                {newImageFiles.map((file, index) => (
                  <Box key={`new-${index}`} sx={{ position: 'relative', width: 100, height: 100 }}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`new-${index}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: 4,
                        border: '2px solid #2196f3'
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        bgcolor: 'background.paper'
                      }}
                      onClick={() => handleRemoveNewImage(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}

            {/* Legend */}
            {(existingImages.length > 0 || newImageFiles.length > 0) && (
              <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                {existingImages.length > 0 && (
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#4caf50', borderRadius: 0.5 }} />
                    Ảnh hiện tại ({existingImages.length})
                  </Typography>
                )}
                {newImageFiles.length > 0 && (
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, bgcolor: '#2196f3', borderRadius: 0.5 }} />
                    Ảnh mới ({newImageFiles.length})
                  </Typography>
                )}
              </Box>
            )}
          </Box>

          {errors.submit && (
            <Typography color="error" variant="body2">
              {errors.submit}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Hủy
        </Button>
        <Button onClick={handleSave} variant="contained" disabled={uploading}>
          {uploading ? 'Đang lưu...' : mode === 'create' ? 'Tạo Mới' : 'Cập Nhật'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
