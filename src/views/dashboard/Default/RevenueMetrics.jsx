import { useEffect, useState, useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MainCard from 'ui-component/cards/MainCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import orderApi from '../../../api/orderApi';

// Component thống kê doanh thu chi tiết
export default function RevenueMetrics() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getOrders({ page: 0, size: 5000 });
        const fetchedOrders = (res && res.content) || (res && res.data && res.data.content) || [];
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Error fetching orders for revenue metrics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getDateOnly = (iso) => (iso ? String(iso).split('T')[0] : '');
  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // 1. AOV - Average Order Value
  const aov = useMemo(() => {
    const completedOrders = orders.filter((o) => String(o.status).toUpperCase() === 'COMPLETED');
    if (completedOrders.length === 0) return 0;
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    return Math.round(totalRevenue / completedOrders.length);
  }, [orders]);

  // 2. Doanh thu hôm nay vs hôm qua
  const revenueComparison = useMemo(() => {
    const todayOrders = orders.filter((o) => getDateOnly(o.createdAt) === todayStr && String(o.status).toUpperCase() === 'COMPLETED');
    const yesterdayOrders = orders.filter(
      (o) => getDateOnly(o.createdAt) === yesterdayStr && String(o.status).toUpperCase() === 'COMPLETED'
    );

    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const percentChange = yesterdayRevenue === 0 ? 0 : ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;

    return {
      today: todayRevenue,
      yesterday: yesterdayRevenue,
      percentChange: Math.round(percentChange * 10) / 10,
      isIncrease: percentChange >= 0
    };
  }, [orders, todayStr, yesterdayStr]);

  // 3. Giờ cao điểm (peak hour)
  const peakHour = useMemo(() => {
    const hourRevenue = Array.from({ length: 24 }, () => 0);

    orders.forEach((o) => {
      if (!o.createdAt || String(o.status).toUpperCase() !== 'COMPLETED') return;
      const hour = new Date(o.createdAt).getHours();
      hourRevenue[hour] += o.totalPrice || 0;
    });

    const maxRevenue = Math.max(...hourRevenue);
    const peakHourIndex = hourRevenue.indexOf(maxRevenue);

    return {
      hour: peakHourIndex,
      revenue: maxRevenue,
      timeRange: `${peakHourIndex}:00 - ${peakHourIndex + 1}:00`
    };
  }, [orders]);

  if (loading) {
    return (
      <MainCard>
        <Typography>Loading...</Typography>
      </MainCard>
    );
  }

  return (
    <>
      {/* AOV Card */}
      <Grid item xs={12} md={4}>
        <MainCard>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AttachMoneyIcon color="primary" />
            <Typography variant="subtitle2" color="text.secondary">
              Average Order Value
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#1e88e5' }}>
            ${(aov / 25000).toFixed(2)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            AOV
          </Typography>
        </MainCard>
      </Grid>

      {/* Today vs Yesterday */}
      <Grid item xs={12} md={4}>
        <MainCard>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {revenueComparison.isIncrease ? (
              <TrendingUpIcon sx={{ color: 'success.main' }} />
            ) : (
              <TrendingDownIcon sx={{ color: 'error.main' }} />
            )}
            <Typography variant="subtitle2" color="text.secondary">
              Today's Revenue
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            ${(revenueComparison.today / 25000).toFixed(2)}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: revenueComparison.isIncrease ? 'success.main' : 'error.main',
                fontWeight: 600
              }}
            >
              {revenueComparison.isIncrease ? '+' : ''}
              {revenueComparison.percentChange}%
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs yesterday
            </Typography>
          </Box>
        </MainCard>
      </Grid>

      {/* Peak Hour */}
      <Grid item xs={12} md={4}>
        <MainCard>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AccessTimeIcon color="warning" />
            <Typography variant="subtitle2" color="text.secondary">
              Peak Hour
            </Typography>
          </Box>
          <Typography variant="h3" sx={{ fontWeight: 700, color: '#f57c00' }}>
            {peakHour.timeRange}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Revenue: ${(peakHour.revenue / 25000).toFixed(2)}
          </Typography>
        </MainCard>
      </Grid>
    </>
  );
}
