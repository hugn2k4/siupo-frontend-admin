import CloseIcon from '@mui/icons-material/Close';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SaveIcon from '@mui/icons-material/Save';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';

const VoucherFormDialog = ({ open, onClose, currentVoucher, formData, setFormData, onSubmit }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          mt: 2,
          maxHeight: 'calc(100vh - 100px)'
        }
      }}
    >
      <DialogTitle>
        <Stack direction="row" spacing={1} alignItems="center">
          <LocalOfferIcon />
          <Typography variant="h6">{currentVoucher ? 'Edit Voucher' : 'Add New Voucher'}</Typography>
        </Stack>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: (theme) => theme.palette.grey[500] }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <form onSubmit={onSubmit}>
        <DialogContent dividers sx={{ p: 3 }}>
          <Stack spacing={2}>
            {/* Voucher Code */}
            <TextField
              fullWidth
              size="small"
              label="Voucher Code *"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              disabled={!!currentVoucher}
              placeholder="E.g: NEWYEAR2024"
            />

            {/* Voucher Name */}
            <TextField
              fullWidth
              size="small"
              label="Voucher Name *"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="E.g: New Year Discount"
            />

            {/* Description */}
            <TextField
              fullWidth
              size="small"
              label="Description"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description about voucher..."
            />

            {/* Row: Voucher Type + Status + Public */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Voucher Type *</InputLabel>
                <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} label="Voucher Type *">
                  <MenuItem value="PERCENTAGE">Percentage Off</MenuItem>
                  <MenuItem value="FIXED_AMOUNT">Fixed Amount</MenuItem>
                  <MenuItem value="FREE_SHIPPING">Free Shipping</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" required>
                <InputLabel>Status *</InputLabel>
                <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} label="Status *">
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="INACTIVE">Inactive</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={<Switch checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} />}
                label="Public"
                sx={{ ml: 0, minWidth: '130px' }}
              />
            </Stack>

            {/* Row: Value + Min Order + Max Discount */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                label={
                  formData.type === 'PERCENTAGE' ? 'Value (%) *' : formData.type === 'FREE_SHIPPING' ? 'Shipping Value ($)' : 'Value ($) *'
                }
                type="number"
                required={formData.type !== 'FREE_SHIPPING'}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                inputProps={{ min: 0, step: formData.type === 'PERCENTAGE' ? 1 : 1 }}
                disabled={formData.type === 'FREE_SHIPPING'}
              />

              <TextField
                fullWidth
                size="small"
                label="Min Order ($)"
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                inputProps={{ min: 0, step: 1 }}
                placeholder="0"
              />

              <TextField
                fullWidth
                size="small"
                label="Max Discount ($)"
                type="number"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                inputProps={{ min: 0, step: 1 }}
                placeholder="Unlimited"
              />
            </Stack>

            {/* Row: Total Usage Limit + Per User Limit */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="Total Usage Limit"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                inputProps={{ min: 0 }}
                placeholder="Unlimited"
              />

              <TextField
                fullWidth
                size="small"
                label="Limit Per User"
                type="number"
                value={formData.usageLimitPerUser}
                onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
                inputProps={{ min: 0 }}
                placeholder="Unlimited"
              />
            </Stack>

            {/* Row: Start Date + End Date */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="Start Date *"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                size="small"
                label="End Date *"
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} startIcon={<CloseIcon />} variant="outlined">
            Cancel
          </Button>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} color="primary">
            {currentVoucher ? 'Update' : 'Create Voucher'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default VoucherFormDialog;
