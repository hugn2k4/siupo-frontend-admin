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
          <Typography variant="h6">{currentVoucher ? 'Chỉnh Sửa Voucher' : 'Thêm Voucher Mới'}</Typography>
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
            {/* Mã Voucher */}
            <TextField
              fullWidth
              size="small"
              label="Mã Voucher *"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              disabled={!!currentVoucher}
              placeholder="VD: NEWYEAR2024"
            />

            {/* Tên Voucher */}
            <TextField
              fullWidth
              size="small"
              label="Tên Voucher *"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Giảm giá năm mới"
            />

            {/* Mô tả */}
            <TextField
              fullWidth
              size="small"
              label="Mô tả"
              multiline
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mô tả ngắn gọn về voucher..."
            />

            {/* Hàng: Loại Voucher + Trạng thái + Hiển thị công khai */}
            <Stack direction="row" spacing={2}>
              <FormControl fullWidth size="small" required>
                <InputLabel>Loại Voucher *</InputLabel>
                <Select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} label="Loại Voucher *">
                  <MenuItem value="PERCENTAGE">Giảm %</MenuItem>
                  <MenuItem value="FIXED_AMOUNT">Giảm tiền</MenuItem>
                  <MenuItem value="FREE_SHIPPING">Miễn phí ship</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small" required>
                <InputLabel>Trạng thái *</InputLabel>
                <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} label="Trạng thái *">
                  <MenuItem value="ACTIVE">Hoạt động</MenuItem>
                  <MenuItem value="INACTIVE">Tạm dừng</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={<Switch checked={formData.isPublic} onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })} />}
                label="Công khai"
                sx={{ ml: 0, minWidth: '130px' }}
              />
            </Stack>

            {/* Hàng: Giá trị + Tối thiểu + Tối đa */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                label={
                  formData.type === 'PERCENTAGE'
                    ? 'Giá trị (%) *'
                    : formData.type === 'FREE_SHIPPING'
                      ? 'Giá trị ship (VND)'
                      : 'Giá trị (VND) *'
                }
                type="number"
                required={formData.type !== 'FREE_SHIPPING'}
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                inputProps={{ min: 0, step: formData.type === 'PERCENTAGE' ? 1 : 1000 }}
                disabled={formData.type === 'FREE_SHIPPING'}
              />

              <TextField
                fullWidth
                size="small"
                label="Đơn tối thiểu (VND)"
                type="number"
                value={formData.minOrderValue}
                onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                inputProps={{ min: 0, step: 1000 }}
                placeholder="0"
              />

              <TextField
                fullWidth
                size="small"
                label="Giảm tối đa (VND)"
                type="number"
                value={formData.maxDiscountAmount}
                onChange={(e) => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                inputProps={{ min: 0, step: 1000 }}
                placeholder="Không giới hạn"
              />
            </Stack>

            {/* Hàng: Giới hạn tổng số lần + Giới hạn/người dùng */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="Giới hạn tổng số lần"
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                inputProps={{ min: 0 }}
                placeholder="Không giới hạn"
              />

              <TextField
                fullWidth
                size="small"
                label="Giới hạn/người dùng"
                type="number"
                value={formData.usageLimitPerUser}
                onChange={(e) => setFormData({ ...formData, usageLimitPerUser: e.target.value })}
                inputProps={{ min: 0 }}
                placeholder="Không giới hạn"
              />
            </Stack>

            {/* Hàng: Ngày bắt đầu + Ngày kết thúc */}
            <Stack direction="row" spacing={2}>
              <TextField
                fullWidth
                size="small"
                label="Ngày bắt đầu *"
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                size="small"
                label="Ngày kết thúc *"
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
            Hủy
          </Button>
          <Button type="submit" variant="contained" startIcon={<SaveIcon />} color="primary">
            {currentVoucher ? 'Cập Nhật' : 'Tạo Voucher'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default VoucherFormDialog;
