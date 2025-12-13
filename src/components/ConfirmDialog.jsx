import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

const ConfirmDialog = ({
  open,
  title = 'Xác nhận',
  content = '',
  onClose,
  onConfirm,
  loading = false,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy'
}) => {
  return (
    <Dialog open={!!open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      {content ? (
        <DialogContent>
          <Typography>{content}</Typography>
        </DialogContent>
      ) : null}
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>
        <Button variant="contained" color="primary" onClick={onConfirm} disabled={loading}>
          {loading ? <CircularProgress size={16} /> : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
