import { useEffect, useState, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MainCard from 'ui-component/cards/MainCard';
import CancelIcon from '@mui/icons-material/Cancel';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import orderApi from '../../../api/orderApi';
import managePlaceTable from '../../../api/managePlaceTable';

// Component thống kê tỉ lệ hủy đơn
export default function CancelRateMetrics() {
  const [orders, setOrders] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch orders
        const ordersRes = await orderApi.getOrders({ page: 0, size: 5000 });
        const fetchedOrders = (ordersRes && ordersRes.content) || (ordersRes && ordersRes.data && ordersRes.data.content) || [];
        setOrders(fetchedOrders);

        // Fetch bookings (customer + guest)
        const [customerRes, guestRes] = await Promise.all([
          managePlaceTable.getAllCustomerBookings(),
          managePlaceTable.getAllGuestBookings()
        ]);

        const customerBookings = customerRes?.data || [];
        const guestBookings = guestRes?.data || [];
        const allBookings = [...customerBookings, ...guestBookings];
        setBookings(allBookings);
      } catch (err) {
        console.error('Error fetching data for cancel rate metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 1. Tỉ lệ hủy đơn hàng (Orders)
  const orderCancelRate = useMemo(() => {
    if (orders.length === 0) return { rate: 0, canceled: 0, total: 0 };

    const canceledOrders = orders.filter(
      (o) => String(o.status).toUpperCase() === 'CANCELLED' || String(o.status).toUpperCase() === 'CANCELED'
    );

    const rate = (canceledOrders.length / orders.length) * 100;

    return {
      rate: Math.round(rate * 10) / 10,
      canceled: canceledOrders.length,
      total: orders.length
    };
  }, [orders]);

  // 2. Tỉ lệ no-show (Bookings)
  const noShowRate = useMemo(() => {
    if (bookings.length === 0) return { rate: 0, noShow: 0, total: 0 };

    const noShowBookings = bookings.filter(
      (b) =>
        String(b.status).toUpperCase() === 'NO_SHOW' ||
        String(b.status).toUpperCase() === 'NOSHOW' ||
        String(b.status).toUpperCase() === 'NO-SHOW'
    );

    const rate = (noShowBookings.length / bookings.length) * 100;

    return {
      rate: Math.round(rate * 10) / 10,
      noShow: noShowBookings.length,
      total: bookings.length
    };
  }, [bookings]);

  // 3. Tỉ lệ hủy booking
  const bookingCancelRate = useMemo(() => {
    if (bookings.length === 0) return { rate: 0, canceled: 0, total: 0 };

    const canceledBookings = bookings.filter(
      (b) => String(b.status).toUpperCase() === 'CANCELLED' || String(b.status).toUpperCase() === 'CANCELED'
    );

    const rate = (canceledBookings.length / bookings.length) * 100;

    return {
      rate: Math.round(rate * 10) / 10,
      canceled: canceledBookings.length,
      total: bookings.length
    };
  }, [bookings]);

  if (loading) {
    return (
      <MainCard>
        <Typography>Loading...</Typography>
      </MainCard>
    );
  }

  return (
    <>
      {/* Order Cancel Rate */}
      <Grid item xs={12} md={4}>
        <MainCard>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CancelIcon sx={{ color: '#d32f2f' }} />
            <Typography variant="subtitle2" color="text.secondary">
              Order Cancel Rate
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#d32f2f' }}>
            {orderCancelRate.rate}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {orderCancelRate.canceled}/{orderCancelRate.total} orders canceled
          </Typography>
        </MainCard>
      </Grid>

      {/* No-show Rate */}
      <Grid item xs={12} md={4}>
        <MainCard>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <EventBusyIcon sx={{ color: '#f57c00' }} />
            <Typography variant="subtitle2" color="text.secondary">
              No-show Rate
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#f57c00' }}>
            {noShowRate.rate}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {noShowRate.noShow}/{noShowRate.total} bookings no-show
          </Typography>
        </MainCard>
      </Grid>

      {/* Booking Cancel Rate */}
      <Grid item xs={12} md={4}>
        <MainCard>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <CancelIcon sx={{ color: '#e91e63' }} />
            <Typography variant="subtitle2" color="text.secondary">
              Booking Cancel Rate
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#e91e63' }}>
            {bookingCancelRate.rate}%
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {bookingCancelRate.canceled}/{bookingCancelRate.total} bookings canceled
          </Typography>
        </MainCard>
      </Grid>
    </>
  );
}
