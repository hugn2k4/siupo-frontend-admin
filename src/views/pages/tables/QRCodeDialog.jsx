import CloseIcon from '@mui/icons-material/Close';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

export default function QRCodeDialog({ open, onClose, tableData }) {
  if (!tableData) return null;

  // Generate URL for QR code - points to customer frontend
  const orderUrl = `http://localhost:5173/order-at-table?tableId=${tableData.id}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Mã QR - {tableData.tableNumber}</Typography>
          <IconButton aria-label="close" onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ py: 4, textAlign: 'center', bgcolor: '#f5f5f5' }}>
        <Box
          sx={{
            bgcolor: 'white',
            p: 3,
            borderRadius: 2,
            display: 'inline-block',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <QRCodeSVG value={orderUrl} size={280} level="H" includeMargin={true} />
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
          Mã bàn: <strong>{tableData.qr}</strong>
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
          Quét mã QR để đặt món tại bàn
        </Typography>
      </DialogContent>
    </Dialog>
  );
}
