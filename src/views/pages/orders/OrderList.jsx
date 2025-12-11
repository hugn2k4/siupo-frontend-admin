import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import FilterListIcon from '@mui/icons-material/FilterList';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useSnackbar } from 'contexts/SnackbarProvider';
import React from 'react';
import orderService from 'services/orderService';
import DeleteConfirmDialog from '../menu/component/DeleteConfirmDialog';
import OrderDetailDialog from './component/OrderDetailDialog';
import OrderStatusDialog from './component/OrderStatusDialog';

const ORDER_STATUS_MAP = {
  WAITING_FOR_PAYMENT: { label: 'Waiting Payment', color: 'warning' },
  PENDING: { label: 'Pending', color: 'info' },
  CONFIRMED: { label: 'Confirmed', color: 'primary' },
  SHIPPING: { label: 'Shipping', color: 'secondary' },
  DELIVERED: { label: 'Delivered', color: 'success' },
  COMPLETED: { label: 'Completed', color: 'success' },
  CANCELED: { label: 'Canceled', color: 'error' }
};

export default function OrderList() {
  const [orders, setOrders] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [totalElements, setTotalElements] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const { showSnackbar } = useSnackbar();

  // Filter states
  const [statusFilter, setStatusFilter] = React.useState('');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterExpanded, setFilterExpanded] = React.useState(false);

  // Dialog states
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [selectedOrderId, setSelectedOrderId] = React.useState(null);
  const [statusDialogOpen, setStatusDialogOpen] = React.useState(false);
  const [editingOrder, setEditingOrder] = React.useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleteOrderId, setDeleteOrderId] = React.useState(null);
  const [deleteOrderName, setDeleteOrderName] = React.useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const opts = {
        page,
        size: rowsPerPage,
        sortBy: 'createdAt,desc'
      };
      if (statusFilter) {
        opts.status = statusFilter;
      }
      if (searchQuery) {
        opts.search = searchQuery;
      }
      const res = await orderService.getOrders(opts);
      if (res && res.data) {
        setOrders(res.data.content || []);
        setTotalElements(res.data.totalElements || 0);
      }
    } catch (error) {
      showSnackbar({ message: error?.message || 'Không thể tải danh sách đơn hàng', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const timer = setTimeout(
      () => {
        fetchOrders();
      },
      searchQuery ? 500 : 0
    );
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, statusFilter, searchQuery]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleRefresh = () => {
    fetchOrders();
  };

  const handleClearFilters = () => {
    setStatusFilter('');
    setSearchQuery('');
    setPage(0);
  };

  const getStatusColor = (status) => {
    return ORDER_STATUS_MAP[status]?.color || 'default';
  };

  const getStatusLabel = (status) => {
    return ORDER_STATUS_MAP[status]?.label || status;
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
  };

  const handleViewDetail = (orderId) => {
    setSelectedOrderId(orderId);
    setDetailOpen(true);
  };

  const handleEditStatus = (order) => {
    setEditingOrder(order);
    setStatusDialogOpen(true);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await orderService.updateOrderStatus(orderId, newStatus);
      if (res && res.success) {
        showSnackbar({ message: 'Status updated successfully', severity: 'success' });
        fetchOrders();
        setStatusDialogOpen(false);
      } else {
        showSnackbar({ message: res?.message || 'Cập nhật thất bại', severity: 'error' });
      }
    } catch (error) {
      showSnackbar({ message: error?.message || 'Lỗi khi cập nhật trạng thái', severity: 'error' });
    }
  };

  const handleDelete = (orderId) => {
    setDeleteOrderId(orderId);
    setDeleteOrderName(`Order #${orderId}`);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (orderId) => {
    setDeleteDialogOpen(false);
    const previousOrders = orders;
    setOrders((prev) => prev.filter((o) => o.orderId !== orderId));
    try {
      const res = await orderService.deleteOrder(orderId);
      if (res && res.success !== false) {
        showSnackbar({ message: 'Order deleted successfully', severity: 'success' });
      } else {
        showSnackbar({ message: res?.message || 'Delete failed', severity: 'error' });
        setOrders(previousOrders);
      }
    } catch (error) {
      setOrders(previousOrders);
      showSnackbar({ message: error?.message || 'Error deleting order', severity: 'error' });
    }
  };

  // Statistics cards data
  const stats = React.useMemo(() => {
    const statusCounts = {};
    orders.forEach((order) => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
    });
    return [
      { label: 'Total Orders', value: totalElements, color: 'primary' },
      { label: 'Pending', value: statusCounts['PENDING'] || 0, color: 'info' },
      { label: 'Shipping', value: statusCounts['SHIPPING'] || 0, color: 'secondary' },
      { label: 'Completed', value: statusCounts['COMPLETED'] || 0, color: 'success' }
    ];
  }, [orders, totalElements]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>
            Order Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track customer orders
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} size="small" color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Filters">
            <IconButton onClick={() => setFilterExpanded(!filterExpanded)} size="small" color="primary">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {stat.label}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }} color={`${stat.color}.main`}>
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Table Card */}
      <Card>
        <CardContent>
          {/* Search and Filters */}
          <Box sx={{ mb: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <TextField
                placeholder="Search by order ID, customer..."
                value={searchQuery}
                onChange={handleSearchChange}
                size="small"
                sx={{ flexGrow: 1 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  )
                }}
              />
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select labelId="status-filter-label" value={statusFilter} label="Status" onChange={handleStatusFilterChange}>
                  <MenuItem value="">All</MenuItem>
                  {Object.keys(ORDER_STATUS_MAP).map((status) => (
                    <MenuItem key={status} value={status}>
                      <Chip
                        label={ORDER_STATUS_MAP[status].label}
                        color={ORDER_STATUS_MAP[status].color}
                        size="small"
                        sx={{ minWidth: 100 }}
                      />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            {(statusFilter || searchQuery) && (
              <Box>
                <Button size="small" onClick={handleClearFilters} startIcon={<FilterListIcon />}>
                  Clear Filters
                </Button>
              </Box>
            )}
          </Box>

          {/* Orders Table */}
          <TableContainer component={Paper} sx={{ mt: 2, boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Order ID</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Payment</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={40} />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No orders found
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.orderId} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          #{order.orderId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>{order.userName?.charAt(0) || 'U'}</Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={500}>
                              {order.userName || 'Guest'}
                            </Typography>
                            {order.userEmail && (
                              <Typography variant="caption" color="text.secondary">
                                {order.userEmail}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(order.totalPrice)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ship: {formatCurrency(order.shippingFee)} | VAT: {formatCurrency(order.vat)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={order.paymentMethod || 'N/A'} size="small" variant="outlined" sx={{ borderRadius: 1 }} />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusLabel(order.status)}
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{ minWidth: 100, fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(order.createdAt)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={0.5} justifyContent="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handleViewDetail(order.orderId)}
                              sx={{ '&:hover': { bgcolor: 'info.lighter' } }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {order.status !== 'COMPLETED' && order.status !== 'CANCELED' && (
                            <Tooltip title="Update Status">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleEditStatus(order)}
                                sx={{ '&:hover': { bgcolor: 'primary.lighter' } }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {order.status === 'CANCELED' && (
                            <Tooltip title="Delete Order">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleDelete(order.orderId)}
                                sx={{ '&:hover': { bgcolor: 'error.lighter' } }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalElements}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Rows per page:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`}
            />
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialogs */}
      {detailOpen && <OrderDetailDialog open={detailOpen} orderId={selectedOrderId} onClose={() => setDetailOpen(false)} />}

      {statusDialogOpen && editingOrder && (
        <OrderStatusDialog
          open={statusDialogOpen}
          order={editingOrder}
          onClose={() => setStatusDialogOpen(false)}
          onSave={handleStatusUpdate}
        />
      )}

      {deleteDialogOpen && (
        <DeleteConfirmDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={() => handleConfirmDelete(deleteOrderId)}
          itemName={deleteOrderName}
          title="Confirm Delete Order"
        />
      )}
    </Box>
  );
}
