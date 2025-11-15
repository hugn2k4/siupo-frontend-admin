import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export default function DeleteConfirmDialog({ open, onClose, onConfirm, id, name, title = 'Xác nhận xóa', message }) {
  const handleConfirm = () => {
    // Call provided onConfirm callback with the id (if callback expects it)
    if (typeof onConfirm === 'function') onConfirm(id);
  };

  // If a custom message is provided, use it; otherwise include the item name when available
  const computedMessage = message ?? (name ? `Bạn có chắc chắn muốn xóa sản phẩm "${name}"?` : 'Bạn có chắc chắn muốn xóa mục này không?');

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>

      <DialogContent>
        <DialogContentText>{computedMessage}</DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" color="error" onClick={handleConfirm}>
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
}
