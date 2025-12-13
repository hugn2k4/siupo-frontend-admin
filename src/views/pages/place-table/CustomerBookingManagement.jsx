import { useState, useEffect, useMemo } from 'react';
import managePlaceTable from '../../../api/managePlaceTable';
import MainCard from 'ui-component/cards/MainCard';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';
import ConfirmDialog from '../../../components/ConfirmDialog';
import { useSnackbar } from '../../../contexts/SnackbarProvider';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RefreshIcon from '@mui/icons-material/Refresh';
import EventIcon from '@mui/icons-material/Event';
import SearchIcon from '@mui/icons-material/Search';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

const CustomerBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState('view');
  const [note, setNote] = useState('');
  const [statistics, setStatistics] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, denied: 0 });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSnackbar } = useSnackbar();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    fetchBookings();
    fetchStatistics();
  }, []);

  useEffect(() => {
    filterBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookings, selectedStatus, searchTerm]);

  const fetchBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await managePlaceTable.getAllCustomerBookings();
      setBookings(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error('Error fetching customer bookings:', err);
      setError('Không thể tải dữ liệu đơn đặt bàn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const stats = await managePlaceTable.getBookingStatistics();
      setStatistics(stats.customer || stats || {});
    } catch (err) {
      console.error('Error fetching statistics:', err);
    }
  };

  const fetchByDateRange = async () => {
    if (!dateRange.start || !dateRange.end) {
      showSnackbar({ message: 'Vui lòng chọn cả ngày bắt đầu và kết thúc', severity: 'warning' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await managePlaceTable.getCustomerBookingsByDateRange(dateRange.start + 'T00:00:00', dateRange.end + 'T23:59:59');
      setBookings(Array.isArray(data) ? data : data?.data || []);
    } catch (err) {
      console.error('Error fetching by date range:', err);
      setError('Không thể lọc theo khoảng thời gian. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((b) => String(b.status).toLowerCase() === String(selectedStatus).toLowerCase());
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (b) =>
          b.user?.fullname?.toLowerCase().includes(searchLower) ||
          b.user?.email?.toLowerCase().includes(searchLower) ||
          String(b.phoneNumber || '')?.includes(searchTerm)
      );
    }

    setFilteredBookings(filtered);
    calculateStatistics(filtered);
  };

  const calculateStatistics = (filtered) => {
    const stats = {
      total: filtered.length,
      pending: filtered.filter((b) => b.status === 'PENDING').length,
      confirmed: filtered.filter((b) => b.status === 'CONFIRMED').length,
      completed: filtered.filter((b) => b.status === 'COMPLETED').length,
      denied: filtered.filter((b) => b.status === 'DENIED').length
    };
    setStatistics(stats);
  };

  const handleConfirm = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await managePlaceTable.confirmCustomerBooking(selectedBooking.id, note || null);
      await fetchBookings();
      await fetchStatistics();
      handleCloseDialog();
      showSnackbar({ message: 'Đã xác nhận đơn đặt bàn', severity: 'success' });
    } catch (err) {
      console.error('Error confirming booking:', err);
      showSnackbar({ message: 'Lỗi khi xác nhận: ' + (err.response?.data?.message || err.message), severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!selectedBooking) return;
    if (!note || note.trim() === '') {
      showSnackbar({ message: 'Vui lòng nhập lý do từ chối', severity: 'warning' });
      return;
    }
    setActionLoading(true);
    try {
      await managePlaceTable.denyCustomerBooking(selectedBooking.id, note);
      await fetchBookings();
      await fetchStatistics();
      handleCloseDialog();
      showSnackbar({ message: 'Đã từ chối đơn đặt bàn', severity: 'info' });
    } catch (err) {
      console.error('Error denying booking:', err);
      showSnackbar({ message: 'Lỗi khi từ chối: ' + (err.response?.data?.message || err.message), severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (booking) => {
    setConfirmTarget(booking);
    setConfirmOpen(true);
  };

  const handleConfirmComplete = async () => {
    if (!confirmTarget) return;
    setActionLoading(true);
    try {
      await managePlaceTable.completeCustomerBooking(confirmTarget.id, null);
      await fetchBookings();
      await fetchStatistics();
      showSnackbar({ message: 'Đã hoàn thành đơn đặt bàn', severity: 'success' });
    } catch (err) {
      console.error('Error completing booking:', err);
      showSnackbar({ message: 'Lỗi khi hoàn thành: ' + (err.response?.data?.message || err.message), severity: 'error' });
    } finally {
      setActionLoading(false);
      setConfirmOpen(false);
      setConfirmTarget(null);
    }
  };

  const handleOpenDialog = (booking, action = 'view') => {
    setSelectedBooking(booking);
    setDialogAction(action);
    setShowDialog(true);
    setNote('');
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setSelectedBooking(null);
    setDialogAction('view');
    setNote('');
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="Chờ xác nhận" color="warning" size="small" />;
      case 'CONFIRMED':
        return <Chip label="Đã xác nhận" color="success" size="small" />;
      case 'COMPLETED':
        return <Chip label="Hoàn thành" color="default" size="small" />;
      case 'DENIED':
        return <Chip label="Từ chối" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (amount == null) return '0 VND';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const statsCards = useMemo(
    () => [
      { key: 'total', label: 'Tổng', value: statistics?.total || 0, color: 'info' },
      { key: 'pending', label: 'Chờ', value: statistics?.pending || 0, color: 'warning' },
      { key: 'confirmed', label: 'Xác nhận', value: statistics?.confirmed || 0, color: 'success' },
      { key: 'completed', label: 'Hoàn thành', value: statistics?.completed || 0, color: 'default' },
      { key: 'denied', label: 'Từ chối', value: statistics?.denied || 0, color: 'error' }
    ],
    [statistics]
  );

  return (
    <MainCard sx={{ height: '100%' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <div>
            <Typography variant="h3">Quản lý đơn đặt bàn - Khách hàng</Typography>
            <Typography variant="body2" color="text.secondary">
              Quản lý đơn đặt bàn từ khách có tài khoản
            </Typography>
          </div>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Tìm theo tên, email hoặc SĐT"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }}
          />
          <IconButton
            onClick={() => {
              fetchBookings();
              fetchStatistics();
            }}
            disabled={loading}
            title="Làm mới"
          >
            {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
          </IconButton>
        </Box>
      </Toolbar>

      {error && (
        <Box sx={{ p: 2 }}>
          <Chip label={error} color="error" />
        </Box>
      )}

      <Box sx={{ p: 2 }}>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {statsCards.map((s) => (
            <Grid item key={s.key} xs={6} sm={2}>
              <Paper
                variant="outlined"
                sx={{ p: 1, textAlign: 'center', cursor: 'pointer' }}
                onClick={() => setSelectedStatus(s.key === 'total' ? 'all' : s.key.toUpperCase())}
              >
                <Typography variant="caption" color="text.secondary">
                  {s.label}
                </Typography>
                <Typography variant="h6">{s.value}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          <TextField
            type="date"
            size="small"
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <TextField type="date" size="small" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
          <Button variant="outlined" size="small" onClick={fetchByDateRange} disabled={!dateRange.start || !dateRange.end}>
            Lọc theo ngày
          </Button>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Tên khách</TableCell>
                <TableCell>Liên hệ</TableCell>
                <TableCell>Ngày - Giờ</TableCell>
                <TableCell>Số khách</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                      <EventIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                      <Typography>Không có đơn đặt bàn nào</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id} hover>
                    <TableCell>#{booking.id}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 32, height: 32 }}>{booking.user?.fullname?.charAt(0)?.toUpperCase() || 'U'}</Avatar>
                        <Box>
                          <Typography variant="body2">{booking.user?.fullname || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {booking.user?.email || ''}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{booking.phoneNumber || '-'}</Typography>
                    </TableCell>
                    <TableCell>{formatDateTime(booking.startedAt)}</TableCell>
                    <TableCell>{booking.member || booking.memberInt || '-'} người</TableCell>
                    <TableCell>{getStatusChip(booking.status)}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <IconButton size="small" onClick={() => handleOpenDialog(booking, 'view')} title="Chi tiết">
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        {booking.status === 'PENDING' && (
                          <>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(booking, 'confirm')}
                              disabled={actionLoading}
                              title="Xác nhận"
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(booking, 'deny')}
                              disabled={actionLoading}
                              title="Từ chối"
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </>
                        )}
                        {booking.status === 'CONFIRMED' && (
                          <IconButton size="small" onClick={() => handleComplete(booking)} disabled={actionLoading} title="Hoàn thành">
                            <DoneAllIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredBookings.length}
          page={page}
          onPageChange={(e, p) => setPage(p)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Box>

      <Dialog open={showDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogAction === 'confirm' && 'Xác nhận đơn đặt bàn'}
          {dialogAction === 'deny' && 'Từ chối đơn đặt bàn'}
          {dialogAction === 'view' && `Chi tiết đơn đặt bàn #${selectedBooking?.id || ''}`}
        </DialogTitle>
        <DialogContent dividers>
          {selectedBooking ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1 }}>
              <Box>
                <Typography variant="subtitle2">Tên khách</Typography>
                <Typography>{selectedBooking.user?.fullname || '-'}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">SĐT</Typography>
                <Typography>{selectedBooking.phoneNumber || '-'}</Typography>
              </Box>
              {selectedBooking.user?.email && (
                <Box>
                  <Typography variant="subtitle2">Email</Typography>
                  <Typography>{selectedBooking.user.email}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="subtitle2">Ngày giờ</Typography>
                <Typography>{formatDateTime(selectedBooking.startedAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Số khách</Typography>
                <Typography>{selectedBooking.member || selectedBooking.memberInt || '-'} người</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Trạng thái</Typography>
                <Box sx={{ mt: 0.5 }}>{getStatusChip(selectedBooking.status)}</Box>
              </Box>
              {selectedBooking.note && (
                <Box>
                  <Typography variant="subtitle2">Ghi chú</Typography>
                  <Typography>{selectedBooking.note}</Typography>
                </Box>
              )}

              {/* Preorder items */}
              {selectedBooking.hasPreOrder && selectedBooking.items && selectedBooking.items.length > 0 && (
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <RestaurantMenuIcon />
                    <Typography>Món ăn đặt trước ({selectedBooking.items.length})</Typography>
                  </Box>
                  <Box>
                    {selectedBooking.items.map((item, idx) => (
                      <Box key={item.id || idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', my: 1 }}>
                        <Box
                          sx={{
                            width: 56,
                            height: 56,
                            background: '#f4f6f8',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {item.product?.imageUrl ? (
                            <img
                              src={item.product.imageUrl}
                              alt={item.product?.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <RestaurantMenuIcon />
                          )}
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">{item.product?.name || 'Món ăn'}</Typography>
                          {item.product?.description && (
                            <Typography variant="caption" color="text.secondary">
                              {item.product.description}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                            <Typography variant="caption">Số lượng: {item.quantity}</Typography>
                            <Typography variant="caption">{formatCurrency(item.price)}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                  {selectedBooking.totalPrice && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography>Tổng tiền:</Typography>
                      <Typography>{formatCurrency(selectedBooking.totalPrice)}</Typography>
                    </Box>
                  )}
                </Box>
              )}
            </Box>
          ) : (
            <Typography>Không có dữ liệu</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={actionLoading}>
            Hủy
          </Button>
          {dialogAction === 'confirm' && (
            <Button variant="contained" onClick={handleConfirm} disabled={actionLoading}>
              {actionLoading ? <CircularProgress size={16} /> : 'Xác nhận'}
            </Button>
          )}
          {dialogAction === 'deny' && (
            <Button variant="contained" color="error" onClick={handleDeny} disabled={actionLoading || !note.trim()}>
              {actionLoading ? <CircularProgress size={16} /> : 'Từ chối'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Xác nhận hoàn thành"
        content="Xác nhận hoàn thành đơn đặt bàn này?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmComplete}
        loading={actionLoading}
        confirmText="Hoàn thành"
      />
    </MainCard>
  );
};

export default CustomerBookingManagement;
