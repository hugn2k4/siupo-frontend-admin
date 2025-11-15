import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import ReceiptIcon from '@mui/icons-material/Receipt';
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography
} from '@mui/material';
import { useSnackbar } from 'contexts/SnackbarProvider';
import React from 'react';
import orderService from 'services/orderService';

const ORDER_STATUS_MAP = {
  WAITING_FOR_PAYMENT: { label: 'Waiting Payment', color: 'warning' },
  PENDING: { label: 'Pending', color: 'info' },
  CONFIRMED: { label: 'Confirmed', color: 'primary' },
  SHIPPING: { label: 'Shipping', color: 'secondary' },
  DELIVERED: { label: 'Delivered', color: 'success' },
  COMPLETED: { label: 'Completed', color: 'success' },
  CANCELED: { label: 'Canceled', color: 'error' }
};

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'COMPLETED'];

export default function OrderDetailDialog({ open, orderId, onClose }) {
  const [order, setOrder] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const { showSnackbar } = useSnackbar();

  React.useEffect(() => {
    if (open && orderId) {
      fetchOrderDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, orderId]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const res = await orderService.getOrderDetail(orderId);
      if (res && res.data) {
        setOrder(res.data);
      }
    } catch (error) {
      showSnackbar({ message: error?.message || 'Failed to fetch order detail', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getActiveStep = (status) => {
    const index = STATUS_STEPS.indexOf(status);
    return index >= 0 ? index : -1;
  };

  const calculateSubtotal = () => {
    if (!order?.items) return 0;
    return order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ pb: 1, bgcolor: 'primary.lighter' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
              <ReceiptIcon sx={{ fontSize: 20 }} />
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Order Details
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Order ID: #{orderId}
              </Typography>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small" sx={{ bgcolor: 'background.paper' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ p: 3, bgcolor: 'grey.50' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <CircularProgress />
          </Box>
        ) : order ? (
          <Stack spacing={2.5}>
            {/* Status Section */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={600} color="text.secondary">
                    Order Status
                  </Typography>
                  <Chip
                    label={ORDER_STATUS_MAP[order.status]?.label || order.status}
                    color={ORDER_STATUS_MAP[order.status]?.color || 'default'}
                    sx={{ fontWeight: 600, height: 28 }}
                  />
                </Stack>

                {order.status !== 'CANCELED' && order.status !== 'WAITING_FOR_PAYMENT' && (
                  <Stepper activeStep={getActiveStep(order.status)} alternativeLabel>
                    {STATUS_STEPS.map((status) => (
                      <Step key={status}>
                        <StepLabel
                          sx={{
                            '& .MuiStepLabel-label': {
                              fontSize: '0.75rem',
                              mt: 0.5
                            }
                          }}
                        >
                          {ORDER_STATUS_MAP[status].label}
                        </StepLabel>
                      </Step>
                    ))}
                  </Stepper>
                )}

                <Divider />

                <Stack direction="row" spacing={3} flexWrap="wrap" sx={{ '& > *': { minWidth: 'fit-content' } }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      Created: {formatDate(order.createdAt)}
                    </Typography>
                  </Stack>
                  {order.updatedAt && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        Updated: {formatDate(order.updatedAt)}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Paper>

            {/* Customer Info */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon color="primary" sx={{ fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Customer Information
                  </Typography>
                </Stack>

                <Stack spacing={1.5}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36, fontSize: '1rem' }}>{order.userName?.[0] || 'K'}</Avatar>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {order.userName || 'Customer'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {order.userId || 'N/A'}
                      </Typography>
                    </Box>
                  </Stack>

                  {order.customer?.phone && (
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ pl: 1, py: 0.5, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <PhoneIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2">{order.customer.phone}</Typography>
                    </Stack>
                  )}

                  {order.deliveryAddress && (
                    <Stack direction="row" spacing={1.5} alignItems="start" sx={{ pl: 1, py: 0.75, bgcolor: 'grey.100', borderRadius: 1 }}>
                      <LocationOnIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.25 }} />
                      <Typography variant="body2" flex={1}>
                        {order.deliveryAddress}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Paper>

            {/* Order Items */}
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Order Items ({order.items?.length || 0})
              </Typography>

              {order.items && order.items.length > 0 ? (
                <Stack spacing={1.5}>
                  {order.items.map((item, idx) => (
                    <Stack
                      key={idx}
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{
                        p: 1.5,
                        bgcolor: 'background.paper',
                        borderRadius: 1.5,
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    >
                      <Avatar src={item.productImageUrl} variant="rounded" sx={{ width: 56, height: 56 }} />

                      <Box flex={1} minWidth={0}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {item.productName || 'N/A'}
                        </Typography>
                        {item.productCategoryName && (
                          <Typography variant="caption" color="text.secondary">
                            {item.productCategoryName}
                          </Typography>
                        )}
                      </Box>

                      <Stack alignItems="center" sx={{ minWidth: 60 }}>
                        <Chip label={`x${item.quantity}`} size="small" color="primary" variant="outlined" />
                      </Stack>

                      <Stack alignItems="flex-end" sx={{ minWidth: 100 }}>
                        <Typography variant="body2" fontWeight={600} color="primary.main">
                          {formatCurrency(item.price * item.quantity)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatCurrency(item.price)}/item
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No items
                </Typography>
              )}
            </Paper>

            {/* Payment Summary */}
            <Paper
              elevation={0}
              sx={{ p: 2.5, borderRadius: 2, border: '2px solid', borderColor: 'primary.main', bgcolor: 'primary.lighter' }}
            >
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <PaymentIcon color="primary" sx={{ fontSize: 20 }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Payment
                  </Typography>
                </Stack>

                <Stack spacing={1} sx={{ px: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Subtotal:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(calculateSubtotal())}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Shipping Fee:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(order.shippingFee)}
                    </Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      VAT:
                    </Typography>
                    <Typography variant="body2" fontWeight={500}>
                      {formatCurrency(order.vat)}
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 1 }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.5 }}>
                    <Typography variant="h6" fontWeight={700}>
                      Total:
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {formatCurrency(order.totalPrice)}
                    </Typography>
                  </Stack>

                  <Divider sx={{ my: 0.5 }} />

                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Payment Method:
                    </Typography>
                    <Chip label={order.paymentMethod || 'Not specified'} size="small" color="info" />
                  </Stack>

                  {order.shippingMethod && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary">
                        Shipping:
                      </Typography>
                      <Typography variant="caption" fontWeight={500}>
                        {order.shippingMethod}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
            <Typography variant="body1" color="text.secondary">
              Order not found
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
