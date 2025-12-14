import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';

// project imports
import EarningCard from './EarningCard';
import PopularCard from './PopularCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import BookingStatsCard from './BookingStatsCard';
import TotalIncomeLightCard from '../../../ui-component/cards/TotalIncomeLightCard';
import orderApi from '../../../api/orderApi';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import MiniBookingCalendar from './MiniBookingCalendar';

import { gridSpacing } from 'store/constant';

// assets
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';

// ==============================|| DEFAULT DASHBOARD ||============================== //

export default function Dashboard() {
  const [isLoading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await orderApi.getOrders({ page: 0, size: 1000, status: 'COMPLETED' });
        const orders = (res && res.content) || (res && res.data && res.data.content) || [];
        if (Array.isArray(orders) && orders.length) {
          const total = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
          setTotalRevenue(total);
        }
      } catch (err) {
        console.error('Failed to fetch revenue', err);
      }
    };

    fetchRevenue();
  }, []);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <Grid container spacing={gridSpacing}>
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <EarningCard isLoading={isLoading} />
          </Grid>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <TotalOrderLineChartCard isLoading={isLoading} />
          </Grid>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <BookingStatsCard isLoading={isLoading} />
          </Grid>
          <Grid size={{ lg: 4, md: 12, sm: 12, xs: 12 }}>
            <Grid container spacing={gridSpacing}>
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeLightCard
                  {...{
                    isLoading: isLoading,
                    total: totalRevenue,
                    label: 'Total Revenue',
                    icon: <StorefrontTwoToneIcon fontSize="inherit" />
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TotalGrowthBarChart isLoading={isLoading} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <PopularCard isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 12, lg: 12 }}>
            <MiniBookingCalendar isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}
