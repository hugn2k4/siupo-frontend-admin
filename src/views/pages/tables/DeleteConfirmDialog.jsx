import DeleteIcon from '@mui/icons-material/Delete';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography, Box } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function DeleteConfirmDialog({ open, onClose, onConfirm, tableName, loading }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <WarningAmberIcon color="warning" />
          <span>Xác nhận xóa</span>
        </Box>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          Bạn có chắc chắn muốn xóa <strong>{tableName}</strong>?
        </DialogContentText>
        <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
          Hành động này không thể hoàn tác!
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error" disabled={loading} startIcon={<DeleteIcon />}>
          {loading ? 'Đang xóa...' : 'Xóa'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
