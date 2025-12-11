import AddIcon from '@mui/icons-material/Add';
import { Alert, Box, Button, Card, CardContent, Grid, Pagination, Snackbar, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import voucherApi from '../../../api/voucherApi';
import VoucherFormDialog from './VoucherFormDialog';
import VoucherTable from './VoucherTable';

const VoucherManagement = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentVoucher, setCurrentVoucher] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    type: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '',
    maxDiscountAmount: '',
    usageLimit: '',
    usageLimitPerUser: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
    isPublic: true
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [pagination, setPagination] = useState({
    page: 0,
    size: 10,
    totalPages: 0,
    totalElements: 0
  });

  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await voucherApi.getAll({
        page: pagination.page,
        size: pagination.size,
        sortBy: 'id',
        sortDir: 'desc'
      });
      setVouchers(response.data.content || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages || 0,
        totalElements: response.data.totalElements || 0
      }));
    } catch (error) {
      console.error('Error fetching vouchers:', error);
      showNotification('Lỗi khi tải danh sách voucher', 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleAdd = () => {
    setCurrentVoucher(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      type: 'PERCENTAGE',
      discountValue: '',
      minOrderValue: '',
      maxDiscountAmount: '',
      usageLimit: '',
      usageLimitPerUser: '',
      startDate: '',
      endDate: '',
      status: 'ACTIVE',
      isPublic: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (voucher) => {
    setCurrentVoucher(voucher);
    setFormData({
      code: voucher.code,
      name: voucher.name,
      description: voucher.description || '',
      type: voucher.type,
      discountValue: voucher.discountValue,
      minOrderValue: voucher.minOrderValue || '',
      maxDiscountAmount: voucher.maxDiscountAmount || '',
      usageLimit: voucher.usageLimit || '',
      usageLimitPerUser: voucher.usageLimitPerUser || '',
      startDate: voucher.startDate ? voucher.startDate.split('T')[0] : '',
      endDate: voucher.endDate ? voucher.endDate.split('T')[0] : '',
      status: voucher.status,
      isPublic: voucher.isPublic
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa voucher này?')) {
      try {
        await voucherApi.delete(id);
        showNotification('Xóa voucher thành công', 'success');
        fetchVouchers();
      } catch (error) {
        console.error('Error deleting voucher:', error);
        showNotification('Lỗi khi xóa voucher', 'error');
      }
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await voucherApi.toggleStatus(id);
      showNotification('Cập nhật trạng thái thành công', 'success');
      fetchVouchers();
    } catch (error) {
      console.error('Error toggling status:', error);
      showNotification('Lỗi khi cập nhật trạng thái', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      code: formData.code.toUpperCase(),
      name: formData.name,
      description: formData.description,
      type: formData.type,
      discountValue: parseFloat(formData.discountValue),
      minOrderValue: formData.minOrderValue ? parseFloat(formData.minOrderValue) : null,
      maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
      usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
      usageLimitPerUser: formData.usageLimitPerUser ? parseInt(formData.usageLimitPerUser) : null,
      startDate: formData.startDate ? `${formData.startDate}T00:00:00` : null,
      endDate: formData.endDate ? `${formData.endDate}T23:59:59` : null,
      status: formData.status,
      isPublic: formData.isPublic
    };

    try {
      if (currentVoucher) {
        await voucherApi.update(currentVoucher.id, payload);
        showNotification('Cập nhật voucher thành công', 'success');
      } else {
        await voucherApi.create(payload);
        showNotification('Thêm voucher thành công', 'success');
      }
      setIsModalOpen(false);
      fetchVouchers();
    } catch (error) {
      console.error('Error saving voucher:', error);
      showNotification(error.response?.data?.message || 'Lỗi khi lưu voucher', 'error');
    }
  };

  const handlePageChange = (event, value) => {
    setPagination((prev) => ({ ...prev, page: value - 1 }));
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Quản Lý Voucher
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý mã giảm giá và khuyến mãi
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
          Thêm Voucher Mới
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tổng Voucher
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {pagination.totalElements}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Đang Hoạt Động
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
                {vouchers.filter((v) => v.status === 'ACTIVE').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Tạm Dừng
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: 'error.main' }}>
                {vouchers.filter((v) => v.status === 'INACTIVE').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table */}
      <VoucherTable vouchers={vouchers} loading={loading} onEdit={handleEdit} onDelete={handleDelete} onToggleStatus={handleToggleStatus} />

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={pagination.totalPages} page={pagination.page + 1} onChange={handlePageChange} color="primary" />
        </Box>
      )}

      {/* Modal */}
      <VoucherFormDialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        currentVoucher={currentVoucher}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />
    </Box>
  );
};

export default VoucherManagement;
