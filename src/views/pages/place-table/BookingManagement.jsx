import { useState, useEffect, useMemo } from 'react';
import managePlaceTable from '../../../api/managePlaceTable';
import MainCard from 'ui-component/cards/MainCard';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Tooltip from '@mui/material/Tooltip';
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
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
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
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group';

const BookingManagement = () => {
  const [bookingType, setBookingType] = useState('all'); // 'all', 'customer', 'guest'
  const [customerBookings, setCustomerBookings] = useState([]);
  const [guestBookings, setGuestBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState('view');
  const [note, setNote] = useState('');
  const [statistics, setStatistics] = useState({
    all: { total: 0, pending: 0, confirmed: 0, completed: 0, denied: 0 },
    customer: { total: 0, pending: 0, confirmed: 0, completed: 0, denied: 0 },
    guest: { total: 0, pending: 0, confirmed: 0, completed: 0, denied: 0 }
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showSnackbar } = useSnackbar();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null);

  useEffect(() => {
    fetchAllBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    filterBookings();
    setPage(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerBookings, guestBookings, bookingType, selectedStatus, searchQuery]);

  const fetchAllBookings = async () => {
    setLoading(true);
    setError(null);
    try {
      const [customerData, guestData] = await Promise.all([
        managePlaceTable.getAllCustomerBookings(),
        managePlaceTable.getAllGuestBookings(),
        managePlaceTable.getBookingStatistics()
      ]);

      const customers = Array.isArray(customerData) ? customerData : customerData?.data || [];
      const guests = Array.isArray(guestData) ? guestData : guestData?.data || [];

      setCustomerBookings(customers.map((b) => ({ ...b, type: 'customer' })));
      setGuestBookings(guests.map((b) => ({ ...b, type: 'guest' })));

      // Calculate statistics
      calculateAllStatistics(customers, guests);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Unable to load booking data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchByDateRange = async () => {
    if (!dateRange.start || !dateRange.end) {
      showSnackbar({ message: 'Please select both start and end dates', severity: 'warning' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const startDateTime = dateRange.start + 'T00:00:00';
      const endDateTime = dateRange.end + 'T23:59:59';

      const [customerData, guestData] = await Promise.all([
        managePlaceTable.getCustomerBookingsByDateRange(startDateTime, endDateTime),
        managePlaceTable.getGuestBookingsByDateRange(startDateTime, endDateTime)
      ]);

      const customers = Array.isArray(customerData) ? customerData : customerData?.data || [];
      const guests = Array.isArray(guestData) ? guestData : guestData?.data || [];

      setCustomerBookings(customers.map((b) => ({ ...b, type: 'customer' })));
      setGuestBookings(guests.map((b) => ({ ...b, type: 'guest' })));

      calculateAllStatistics(customers, guests);
    } catch (err) {
      console.error('Error fetching by date range:', err);
      setError('Unable to filter by date range. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateAllStatistics = (customers, guests) => {
    const calcStats = (bookings) => ({
      total: bookings.length,
      pending: bookings.filter((b) => b.status === 'PENDING').length,
      confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
      completed: bookings.filter((b) => b.status === 'COMPLETED').length,
      denied: bookings.filter((b) => b.status === 'DENIED').length
    });

    const customerStats = calcStats(customers);
    const guestStats = calcStats(guests);
    const allBookings = [...customers, ...guests];
    const allStats = calcStats(allBookings);

    setStatistics({
      all: allStats,
      customer: customerStats,
      guest: guestStats
    });
  };

  const filterBookings = () => {
    let allBookings = [];

    if (bookingType === 'all') {
      allBookings = [...customerBookings, ...guestBookings];
    } else if (bookingType === 'customer') {
      allBookings = [...customerBookings];
    } else if (bookingType === 'guest') {
      allBookings = [...guestBookings];
    }

    // Sort by date desc
    allBookings.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));

    if (selectedStatus !== 'all') {
      allBookings = allBookings.filter((b) => String(b.status).toLowerCase() === String(selectedStatus).toLowerCase());
    }

    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      allBookings = allBookings.filter((b) => {
        const name = b.type === 'customer' ? b.user?.fullname : b.fullname;
        const email = b.type === 'customer' ? b.user?.email : b.email;
        const phone = b.phoneNumber || '';

        return name?.toLowerCase().includes(searchLower) || email?.toLowerCase().includes(searchLower) || phone.includes(searchQuery);
      });
    }

    setFilteredBookings(allBookings);
  };

  const handleConfirm = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      if (selectedBooking.type === 'customer') {
        await managePlaceTable.confirmCustomerBooking(selectedBooking.id, note || null);
      } else {
        await managePlaceTable.confirmGuestBooking(selectedBooking.id, note || null);
      }
      await fetchAllBookings();
      handleCloseDialog();
      showSnackbar({ message: 'Booking confirmed successfully', severity: 'success' });
    } catch (err) {
      console.error('Error confirming booking:', err);
      showSnackbar({ message: 'Error confirming: ' + (err.response?.data?.message || err.message), severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!selectedBooking) return;
    if (!note || note.trim() === '') {
      showSnackbar({ message: 'Please enter a reason for denial', severity: 'warning' });
      return;
    }
    setActionLoading(true);
    try {
      if (selectedBooking.type === 'customer') {
        await managePlaceTable.denyCustomerBooking(selectedBooking.id, note);
      } else {
        await managePlaceTable.denyGuestBooking(selectedBooking.id, note);
      }
      await fetchAllBookings();
      handleCloseDialog();
      showSnackbar({ message: 'Booking denied successfully', severity: 'info' });
    } catch (err) {
      console.error('Error denying booking:', err);
      showSnackbar({ message: 'Error denying: ' + (err.response?.data?.message || err.message), severity: 'error' });
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
      if (confirmTarget.type === 'customer') {
        await managePlaceTable.completeCustomerBooking(confirmTarget.id, null);
      } else {
        await managePlaceTable.completeGuestBooking(confirmTarget.id, null);
      }
      await fetchAllBookings();
      showSnackbar({ message: 'Booking completed successfully', severity: 'success' });
    } catch (err) {
      console.error('Error completing booking:', err);
      showSnackbar({ message: 'Error completing: ' + (err.response?.data?.message || err.message), severity: 'error' });
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

  const exportCSV = () => {
    if (!filteredBookings || filteredBookings.length === 0) {
      showSnackbar({ message: 'No data to export', severity: 'info' });
      return;
    }
    const rows = filteredBookings.map((b) => {
      const name = b.type === 'customer' ? b.user?.fullname : b.fullname;
      const email = b.type === 'customer' ? b.user?.email : b.email;
      const members = b.type === 'customer' ? b.member || b.memberInt : b.memberInt;

      return {
        id: b.id,
        type: b.type === 'customer' ? 'Customer' : 'Walk-in',
        fullname: name || '',
        phone: b.phoneNumber || '',
        email: email || '',
        datetime: formatDateTime(b.startedAt),
        members: members || '',
        status: b.status
      };
    });

    const header = Object.keys(rows[0]);
    const csv = [header.join(','), ...rows.map((r) => header.map((h) => '"' + String(r[h] || '') + '"').join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bookings-${bookingType}-${new Date().toISOString()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case 'PENDING':
        return <Chip label="Pending" color="warning" size="small" />;
      case 'CONFIRMED':
        return <Chip label="Confirmed" color="success" size="small" />;
      case 'COMPLETED':
        return <Chip label="Completed" color="default" size="small" />;
      case 'DENIED':
        return <Chip label="Denied" color="error" size="small" />;
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
    if (amount == null) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const currentStats = statistics[bookingType] || statistics.all;

  const statsCards = useMemo(
    () => [
      { key: 'total', label: 'Total', value: currentStats?.total || 0, color: 'info' },
      { key: 'pending', label: 'Pending', value: currentStats?.pending || 0, color: 'warning' },
      { key: 'confirmed', label: 'Confirmed', value: currentStats?.confirmed || 0, color: 'success' },
      { key: 'completed', label: 'Completed', value: currentStats?.completed || 0, color: 'default' },
      { key: 'denied', label: 'Denied', value: currentStats?.denied || 0, color: 'error' }
    ],
    [currentStats]
  );

  const paginatedBookings = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredBookings.slice(start, start + rowsPerPage);
  }, [filteredBookings, page, rowsPerPage]);

  return (
    <MainCard sx={{ height: '100%' }}>
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, p: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <div>
            <Typography variant="h3">Booking Management</Typography>
            <Typography variant="body2" color="text.secondary">
              Manage all bookings from customers and walk-in guests
            </Typography>
          </div>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Search by name, email or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <SearchIcon fontSize="small" /> }}
          />

          <Tooltip title="Export CSV">
            <span>
              <IconButton size="small" onClick={exportCSV} disabled={loading || filteredBookings.length === 0}>
                <FileDownloadIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <IconButton
            onClick={() => {
              fetchAllBookings();
              setSearchTerm('');
              setSelectedStatus('all');
              setDateRange({ start: '', end: '' });
            }}
            disabled={loading}
            title="Refresh"
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
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={bookingType} onChange={(e, v) => setBookingType(v)}>
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon fontSize="small" />
                  All ({statistics.all.total})
                </Box>
              }
              value="all"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PersonIcon fontSize="small" />
                  Customers ({statistics.customer.total})
                </Box>
              }
              value="customer"
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EventIcon fontSize="small" />
                  Walk-in Guests ({statistics.guest.total})
                </Box>
              }
              value="guest"
            />
          </Tabs>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {statsCards.map((s) => (
            <Grid item key={s.key} xs={6} sm={2.4}>
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
            label="From Date"
            InputLabelProps={{ shrink: true }}
            value={dateRange.start}
            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
          />
          <TextField
            type="date"
            size="small"
            label="To Date"
            InputLabelProps={{ shrink: true }}
            value={dateRange.end}
            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
          />
          <Button variant="outlined" size="small" onClick={fetchByDateRange} disabled={!dateRange.start || !dateRange.end}>
            Filter by Date
          </Button>

          <Select size="small" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="all">All Statuses</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="CONFIRMED">Confirmed</MenuItem>
            <MenuItem value="COMPLETED">Completed</MenuItem>
            <MenuItem value="DENIED">Denied</MenuItem>
          </Select>
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Guest Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Date - Time</TableCell>
                <TableCell>Guests</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
                      <EventIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                      <Typography>No bookings found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBookings.map((booking) => {
                  const name = booking.type === 'customer' ? booking.user?.fullname : booking.fullname;
                  const email = booking.type === 'customer' ? booking.user?.email : booking.email;
                  const members = booking.type === 'customer' ? booking.member || booking.memberInt : booking.memberInt;

                  return (
                    <TableRow key={`${booking.type}-${booking.id}`} hover>
                      <TableCell>#{booking.id}</TableCell>
                      <TableCell>
                        <Chip
                          label={booking.type === 'customer' ? 'Customer' : 'Walk-in'}
                          size="small"
                          color={booking.type === 'customer' ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 32, height: 32 }}>{name?.charAt(0)?.toUpperCase() || 'U'}</Avatar>
                          <Box>
                            <Typography variant="body2">{name || '-'}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {email || ''}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{booking.phoneNumber || '-'}</Typography>
                      </TableCell>
                      <TableCell>{formatDateTime(booking.startedAt)}</TableCell>
                      <TableCell>{members || '-'} guests</TableCell>
                      <TableCell>{getStatusChip(booking.status)}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <IconButton size="small" onClick={() => handleOpenDialog(booking, 'view')} title="Details">
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          {booking.status === 'PENDING' && (
                            <>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(booking, 'confirm')}
                                disabled={actionLoading}
                                title="Confirm"
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenDialog(booking, 'deny')}
                                disabled={actionLoading}
                                title="Deny"
                              >
                                <CloseIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                          {booking.status === 'CONFIRMED' && (
                            <IconButton size="small" onClick={() => handleComplete(booking)} disabled={actionLoading} title="Complete">
                              <DoneAllIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
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
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Box>

      <Dialog open={showDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>
          {dialogAction === 'confirm' && 'Confirm Booking'}
          {dialogAction === 'deny' && 'Deny Booking'}
          {dialogAction === 'view' && `Booking Details #${selectedBooking?.id || ''}`}
        </DialogTitle>
        <DialogContent dividers>
          {selectedBooking ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 1.5 }}>
              <Box>
                <Typography variant="subtitle2">Guest Type</Typography>
                <Chip
                  label={selectedBooking.type === 'customer' ? 'Customer' : 'Walk-in Guest'}
                  size="small"
                  color={selectedBooking.type === 'customer' ? 'primary' : 'default'}
                />
              </Box>
              <Box>
                <Typography variant="subtitle2">Guest Name</Typography>
                <Typography>
                  {selectedBooking.type === 'customer' ? selectedBooking.user?.fullname : selectedBooking.fullname || '-'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Phone</Typography>
                <Typography>{selectedBooking.phoneNumber || '-'}</Typography>
              </Box>
              {(selectedBooking.user?.email || selectedBooking.email) && (
                <Box>
                  <Typography variant="subtitle2">Email</Typography>
                  <Typography>{selectedBooking.type === 'customer' ? selectedBooking.user.email : selectedBooking.email}</Typography>
                </Box>
              )}
              <Box>
                <Typography variant="subtitle2">Date & Time</Typography>
                <Typography>{formatDateTime(selectedBooking.startedAt)}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Number of Guests</Typography>
                <Typography>
                  {selectedBooking.type === 'customer'
                    ? selectedBooking.member || selectedBooking.memberInt || '-'
                    : selectedBooking.memberInt || '-'}{' '}
                  guests
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">Status</Typography>
                <Box sx={{ mt: 0.5 }}>{getStatusChip(selectedBooking.status)}</Box>
              </Box>
              {selectedBooking.note && (
                <Box>
                  <Typography variant="subtitle2">Note</Typography>
                  <Typography>{selectedBooking.note}</Typography>
                </Box>
              )}

              {/* Preorder items - only for customers */}
              {selectedBooking.type === 'customer' &&
                selectedBooking.hasPreOrder &&
                selectedBooking.items &&
                selectedBooking.items.length > 0 && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <RestaurantMenuIcon />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Pre-ordered Items ({selectedBooking.items.length})
                      </Typography>
                    </Box>
                    <Box>
                      {selectedBooking.items.map((item, idx) => (
                        <Box
                          key={item.id || idx}
                          sx={{
                            display: 'flex',
                            gap: 2,
                            alignItems: 'center',
                            mb: 2,
                            p: 1.5,
                            bgcolor: 'background.paper',
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        >
                          <Box
                            sx={{
                              width: 64,
                              height: 64,
                              flexShrink: 0,
                              background: '#f4f6f8',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 1,
                              overflow: 'hidden'
                            }}
                          >
                            {item.product?.imageUrl ? (
                              <img
                                src={item.product.imageUrl}
                                alt={item.product?.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <RestaurantMenuIcon sx={{ fontSize: 32, opacity: 0.3 }} />
                            )}
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" fontWeight="medium">
                              {item.product?.name || 'Dish'}
                            </Typography>
                            {item.product?.description && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                {item.product.description}
                              </Typography>
                            )}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                              <Typography variant="body2" color="text.secondary">
                                Quantity: <strong>{item.quantity}</strong>
                              </Typography>
                              <Typography variant="body2" color="primary" fontWeight="bold">
                                {formatCurrency(item.price)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                    {selectedBooking.totalPrice && (
                      <Box
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          mt: 2,
                          pt: 2,
                          borderTop: '2px solid',
                          borderColor: 'divider'
                        }}
                      >
                        <Typography variant="h3">Total Amount:</Typography>
                        <Typography variant="h3" color="primary" fontWeight="bold">
                          {formatCurrency(selectedBooking.totalPrice)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

              {(dialogAction === 'confirm' || dialogAction === 'deny') && (
                <TextField
                  multiline
                  minRows={3}
                  label={dialogAction === 'deny' ? 'Reason for denial (required)' : 'Admin Note'}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  fullWidth
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          ) : (
            <Typography>No data available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={actionLoading}>
            Cancel
          </Button>
          {dialogAction === 'confirm' && (
            <Button variant="contained" onClick={handleConfirm} disabled={actionLoading}>
              {actionLoading ? <CircularProgress size={16} /> : 'Confirm'}
            </Button>
          )}
          {dialogAction === 'deny' && (
            <Button variant="contained" color="error" onClick={handleDeny} disabled={actionLoading || !note.trim()}>
              {actionLoading ? <CircularProgress size={16} /> : 'Deny'}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        title="Confirm Completion"
        content="Confirm completion of this booking?"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmComplete}
        loading={actionLoading}
        confirmText="Complete"
      />
    </MainCard>
  );
};

export default BookingManagement;
