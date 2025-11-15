import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

export default function DeleteConfirmDialog({ open, onClose, onConfirm, id, name, title = 'Xác nhận xóa' }) {
  const handleConfirm = () => {
    if (typeof onConfirm === 'function') onConfirm(id);
  };

  const computedMessage = name ? `Bạn có chắc chắn muốn xóa người dùng "${name}"?` : 'Bạn có chắc chắn muốn xóa mục này không?';

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{computedMessage}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" color="error" onClick={handleConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
