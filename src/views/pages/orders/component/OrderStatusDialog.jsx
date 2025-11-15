import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography
} from '@mui/material';
import React from 'react';

const ORDER_STATUS_FLOW = {
  WAITING_FOR_PAYMENT: {
    label: 'Waiting Payment',
    color: 'warning',
    next: ['PENDING', 'CANCELED'],
    description: 'Order is waiting for payment'
  },
  PENDING: {
    label: 'Pending',
    color: 'info',
    next: ['CONFIRMED', 'CANCELED'],
    description: 'New order, waiting for restaurant confirmation'
  },
  CONFIRMED: {
    label: 'Confirmed',
    color: 'primary',
    next: ['SHIPPING', 'CANCELED'],
    description: 'Order has been confirmed and being prepared'
  },
  SHIPPING: {
    label: 'Shipping',
    color: 'secondary',
    next: ['DELIVERED', 'CANCELED'],
    description: 'Order is being delivered to customer'
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'success',
    next: ['COMPLETED'],
    description: 'Order has been delivered successfully'
  },
  COMPLETED: {
    label: 'Completed',
    color: 'success',
    next: [],
    description: 'Order is complete'
  },
  CANCELED: {
    label: 'Canceled',
    color: 'error',
    next: [],
    description: 'Order has been canceled'
  }
};

const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'COMPLETED'];

export default function OrderStatusDialog({ open, order, onClose, onSave }) {
  const [newStatus, setNewStatus] = React.useState(order?.status || '');
  const [note, setNote] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (order) {
      setNewStatus(order.status);
      setNote('');
    }
  }, [order]);

  const currentStatusConfig = ORDER_STATUS_FLOW[order?.status] || {};
  const allowedStatuses = currentStatusConfig.next || [];
  const isStatusChanged = newStatus !== order?.status;

  const getActiveStep = (status) => {
    const index = STATUS_STEPS.indexOf(status);
    return index >= 0 ? index : -1;
  };

  const handleSave = async () => {
    if (order && newStatus && isStatusChanged) {
      setLoading(true);
      try {
        await onSave(order.orderId, newStatus, note);
      } finally {
        setLoading(false);
      }
    }
  };

  const canTransitionTo = (targetStatus) => {
    return allowedStatuses.includes(targetStatus);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Update Order Status</Typography>
          <Chip label={`#${order?.orderId}`} color="primary" size="small" />
        </Stack>
      </DialogTitle>
      <DialogContent>
        {/* Current Status Info */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Current Status
          </Typography>
          <Chip label={currentStatusConfig.label} color={currentStatusConfig.color} sx={{ fontWeight: 600, fontSize: '0.875rem' }} />
          <Typography variant="caption" display="block" sx={{ mt: 1 }} color="text.secondary">
            {currentStatusConfig.description}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Status Timeline */}
        {order?.status !== 'CANCELED' && order?.status !== 'WAITING_FOR_PAYMENT' && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Order Progress
            </Typography>
            <Stepper activeStep={getActiveStep(order?.status)} alternativeLabel sx={{ mt: 2 }}>
              {STATUS_STEPS.map((status) => (
                <Step key={status}>
                  <StepLabel>{ORDER_STATUS_FLOW[status].label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Status Selection */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
            Select New Status
          </Typography>

          {allowedStatuses.length === 0 ? (
            <Alert severity="info">This order is in final status and cannot be changed</Alert>
          ) : (
            <FormControl component="fieldset" fullWidth>
              <RadioGroup value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <Stack spacing={1.5}>
                  {Object.entries(ORDER_STATUS_FLOW)
                    .filter(([status]) => canTransitionTo(status))
                    .map(([status, config]) => {
                      const isSelected = newStatus === status;
                      return (
                        <Box
                          key={status}
                          sx={{
                            p: 2,
                            border: 1,
                            borderColor: isSelected ? `${config.color}.main` : 'divider',
                            borderRadius: 2,
                            bgcolor: isSelected ? `${config.color}.lighter` : 'background.paper',
                            transition: 'all 0.2s',
                            '&:hover': {
                              borderColor: `${config.color}.main`,
                              bgcolor: `${config.color}.lighter`
                            }
                          }}
                        >
                          <FormControlLabel
                            value={status}
                            control={
                              <Radio
                                icon={<RadioButtonUncheckedIcon />}
                                checkedIcon={<CheckCircleIcon />}
                                sx={{ color: `${config.color}.main` }}
                              />
                            }
                            label={
                              <Box sx={{ ml: 1 }}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="body1" fontWeight={isSelected ? 600 : 400}>
                                    {config.label}
                                  </Typography>
                                  <Chip
                                    label={status}
                                    size="small"
                                    color={config.color}
                                    variant={isSelected ? 'filled' : 'outlined'}
                                    sx={{ fontSize: '0.7rem' }}
                                  />
                                </Stack>
                                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                                  {config.description}
                                </Typography>
                              </Box>
                            }
                            sx={{ m: 0, width: '100%' }}
                          />
                        </Box>
                      );
                    })}
                </Stack>
              </RadioGroup>
            </FormControl>
          )}
        </Box>

        {/* Note Field */}
        {isStatusChanged && (
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Note (optional)"
              placeholder="Add note about status change..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              multiline
              rows={3}
              size="small"
            />
          </Box>
        )}

        {/* Warning for cancel */}
        {newStatus === 'CANCELED' && isStatusChanged && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Warning: Canceling order is an irreversible action!
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Close
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={!isStatusChanged || loading || allowedStatuses.length === 0}
        >
          {loading ? 'Saving...' : 'Update Status'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
