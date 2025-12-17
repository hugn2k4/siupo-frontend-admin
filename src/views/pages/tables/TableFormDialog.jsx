import CloseIcon from '@mui/icons-material/Close';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useSnackbar } from 'contexts/SnackbarProvider';
import { useEffect, useState } from 'react';

export default function TableFormDialog({ open, onClose, onSuccess, editData }) {
  const { showSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({
    tableNumber: '',
    seat: 4
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editData) {
      setFormData({
        tableNumber: editData.tableNumber || '',
        seat: editData.seat || 4
      });
    } else {
      setFormData({
        tableNumber: '',
        seat: 4
      });
    }
    setErrors({});
  }, [editData, open]);

  const handleChange = (field) => (e) => {
    const value = field === 'seat' ? parseInt(e.target.value, 10) : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.tableNumber || formData.tableNumber.trim() === '') {
      newErrors.tableNumber = 'Số bàn không được để trống';
    }
    if (!formData.seat || formData.seat < 1) {
      newErrors.seat = 'Số chỗ ngồi phải lớn hơn 0';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      await onSuccess(formData);
      handleClose();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra';
      showSnackbar(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({ tableNumber: '', seat: 4 });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editData ? 'Cập nhật bàn' : 'Tạo bàn mới'}
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <TextField
          autoFocus
          margin="dense"
          label="Số bàn"
          type="text"
          fullWidth
          variant="outlined"
          value={formData.tableNumber}
          onChange={handleChange('tableNumber')}
          error={!!errors.tableNumber}
          helperText={errors.tableNumber}
          placeholder="Ví dụ: Bàn 1, Bàn VIP 1..."
        />

        <FormControl fullWidth margin="dense" variant="outlined" error={!!errors.seat}>
          <InputLabel>Số chỗ ngồi</InputLabel>
          <Select value={formData.seat} onChange={handleChange('seat')} label="Số chỗ ngồi">
            <MenuItem value={2}>2 chỗ</MenuItem>
            <MenuItem value={4}>4 chỗ</MenuItem>
            <MenuItem value={6}>6 chỗ</MenuItem>
            <MenuItem value={8}>8 chỗ</MenuItem>
            <MenuItem value={10}>10 chỗ</MenuItem>
            <MenuItem value={12}>12 chỗ</MenuItem>
          </Select>
          {errors.seat && <span style={{ color: '#d32f2f', fontSize: '0.75rem', marginTop: 4 }}>{errors.seat}</span>}
        </FormControl>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Hủy
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" disabled={submitting}>
          {submitting ? 'Đang xử lý...' : editData ? 'Cập nhật' : 'Tạo mới'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
