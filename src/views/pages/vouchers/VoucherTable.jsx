import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PercentIcon from '@mui/icons-material/Percent';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography
} from '@mui/material';

const VoucherTable = ({ vouchers, loading, onEdit, onDelete, onToggleStatus }) => {
  const getVoucherTypeIcon = (type) => {
    switch (type) {
      case 'PERCENTAGE':
        return <PercentIcon fontSize="small" />;
      case 'FIXED_AMOUNT':
        return <MoneyOffIcon fontSize="small" />;
      case 'FREE_SHIPPING':
        return <LocalShippingIcon fontSize="small" />;
      default:
        return <LocalOfferIcon fontSize="small" />;
    }
  };

  const getVoucherTypeLabel = (type) => {
    switch (type) {
      case 'PERCENTAGE':
        return 'Percentage';
      case 'FIXED_AMOUNT':
        return 'Fixed Amount';
      case 'FREE_SHIPPING':
        return 'Free Shipping';
      default:
        return type;
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      ACTIVE: { label: 'Active', color: 'success' },
      INACTIVE: { label: 'Inactive', color: 'error' },
      EXPIRED: { label: 'Expired', color: 'default' }
    };
    const { label, color } = statusMap[status] || statusMap.INACTIVE;
    return <Chip label={label} color={color} size="small" />;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Value</TableCell>
            <TableCell>Used</TableCell>
            <TableCell>Duration</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                Loading...
              </TableCell>
            </TableRow>
          ) : vouchers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No vouchers available
              </TableCell>
            </TableRow>
          ) : (
            vouchers.map((voucher) => (
              <TableRow key={voucher.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <LocalOfferIcon fontSize="small" color="primary" />
                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                      {voucher.code}
                    </Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {voucher.name}
                  </Typography>
                  {voucher.description && (
                    <Typography variant="caption" color="text.secondary">
                      {voucher.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {getVoucherTypeIcon(voucher.type)}
                    <Typography variant="body2">{getVoucherTypeLabel(voucher.type)}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600} color="success.main">
                    {voucher.type === 'PERCENTAGE' && `${voucher.discountValue}%`}
                    {voucher.type === 'FIXED_AMOUNT' && formatCurrency(voucher.discountValue)}
                    {voucher.type === 'FREE_SHIPPING' && 'Miễn phí'}
                  </Typography>
                  {voucher.maxDiscountAmount && (
                    <Typography variant="caption" color="text.secondary">
                      Tối đa: {formatCurrency(voucher.maxDiscountAmount)}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {voucher.usedCount} / {voucher.usageLimit || '∞'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="flex-start">
                    <CalendarTodayIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="caption" display="block">
                        {new Date(voucher.startDate).toLocaleDateString('vi-VN')}
                      </Typography>
                      <Typography variant="caption" display="block">
                        {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                      </Typography>
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{getStatusChip(voucher.status)}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {voucher.status !== 'EXPIRED' && (
                      <Tooltip title={voucher.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}>
                        <IconButton
                          size="small"
                          color={voucher.status === 'ACTIVE' ? 'success' : 'error'}
                          onClick={() => onToggleStatus(voucher.id)}
                        >
                          {voucher.status === 'ACTIVE' ? <ToggleOnIcon /> : <ToggleOffIcon />}
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit">
                      <IconButton size="small" color="primary" onClick={() => onEdit(voucher)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => onDelete(voucher.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default VoucherTable;
