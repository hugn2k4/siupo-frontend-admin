import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import MainCard from 'ui-component/cards/MainCard';
import managePlaceTable from '../../../api/managePlaceTable';
import SkeletonTotalOrderCard from 'ui-component/cards/Skeleton/EarningCard';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GroupIcon from '@mui/icons-material/Group';
import TodayIcon from '@mui/icons-material/Today';

export default function BookingStatsCard({ isLoading: propIsLoading }) {
  const theme = useTheme();
  const [stats, setStats] = useState(null);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const s = await managePlaceTable.getBookingStatistics();
        const today = await managePlaceTable.getTodayBookings();
        setStats(s || {});
        setTodayCount(Array.isArray(today) ? today.length : today?.count || 0);
      } catch (err) {
        console.error('Error fetching booking stats', err);
        setStats({});
        setTodayCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  if (loading || propIsLoading) return <SkeletonTotalOrderCard />;

  const guest = stats.guest || {};
  const customer = stats.customer || {};

  return (
    <MainCard
      border={false}
      content={false}
      sx={{
        bgcolor: 'secondary.dark',
        color: '#fff',
        overflow: 'hidden',
        position: 'relative',
        '&>div': { position: 'relative', zIndex: 5 },
        '&:after': {
          content: '""',
          position: 'absolute',
          width: 210,
          height: 210,
          background: theme.palette.secondary[800],
          borderRadius: '50%',
          top: { xs: -85 },
          right: { xs: -95 }
        },
        '&:before': {
          content: '""',
          position: 'absolute',
          width: 210,
          height: 210,
          background: theme.palette.secondary[800],
          borderRadius: '50%',
          top: { xs: -125 },
          right: { xs: -15 },
          opacity: 0.5
        }
      }}
    >
      <Box sx={{ p: 4.5 }}>
        <Grid container direction="column" spacing={2}>
          {/* Header */}
          <Grid item>
            <Grid container justifyContent="space-between" alignItems="center">
              <Grid item>
                <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'secondary.200' }}>Booking Overview</Typography>
              </Grid>
              <Grid item></Grid>
            </Grid>
          </Grid>

          {/* Stats */}
          <Grid item>
            <Grid container spacing={3}>
              {/* Guest Bookings */}
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '2.125rem', fontWeight: 500 }}>{(guest.total ?? 0).toLocaleString()}</Typography>
                    <Avatar
                      sx={{
                        ...theme.typography.smallAvatar,
                        bgcolor: 'secondary.200',
                        color: 'secondary.dark'
                      }}
                    >
                      <PersonOutlineIcon fontSize="inherit" />
                    </Avatar>
                  </Box>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'secondary.200' }}>Guest bookings</Typography>
                </Box>
              </Grid>

              {/* Customer Bookings */}
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '2.125rem', fontWeight: 500 }}>{(customer.total ?? 0).toLocaleString()}</Typography>
                    <Avatar
                      sx={{
                        ...theme.typography.smallAvatar,
                        bgcolor: 'secondary.200',
                        color: 'secondary.dark'
                      }}
                    >
                      <GroupIcon fontSize="inherit" />
                    </Avatar>
                  </Box>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'secondary.200' }}>Customer bookings</Typography>
                </Box>
              </Grid>

              {/* Today's Bookings */}
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography sx={{ fontSize: '2.125rem', fontWeight: 500 }}>{todayCount.toLocaleString()}</Typography>
                    <Avatar
                      sx={{
                        ...theme.typography.smallAvatar,
                        bgcolor: 'secondary.200',
                        color: 'secondary.dark'
                      }}
                    >
                      <TodayIcon fontSize="inherit" />
                    </Avatar>
                  </Box>
                  <Typography sx={{ fontSize: '1rem', fontWeight: 500, color: 'secondary.200' }}>Today's bookings</Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </MainCard>
  );
}
