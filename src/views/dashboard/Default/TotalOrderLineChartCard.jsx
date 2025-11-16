// src/components/dashboard/TotalOrderLineChartCard.jsx

import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third party
import Chart from 'react-apexcharts';

// project imports
import ChartDataMonth from './chart-data/total-order-month-line-chart';
import ChartDataYear from './chart-data/total-order-year-line-chart';
import MainCard from 'ui-component/cards/MainCard';
import SkeletonTotalOrderCard from 'ui-component/cards/Skeleton/EarningCard';

// assets
import LocalMallOutlinedIcon from '@mui/icons-material/LocalMallOutlined';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

// API
import orderApi from '../../../api/orderApi';

export default function TotalOrderLineChartCard({ isLoading: propIsLoading }) {
  const theme = useTheme();

  const [timeValue, setTimeValue] = useState(false); // false = Year, true = Month
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleChangeTime = (event, newValue) => {
    setTimeValue(newValue);
  };

  // === GỌI API & TÍNH TỔNG ĐƠN HOÀN THÀNH ===
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);

        const response = await orderApi.getOrders({
          page: 0,
          size: 1000,
          status: 'COMPLETED'
        });

        if (response.success && response.data?.content) {
          const orders = response.data.content;
          const filterType = timeValue ? 'month' : 'year';
          const count = countCompletedOrders(orders, filterType);
          setTotalOrders(count);
        } else {
          setTotalOrders(0);
        }
      } catch (err) {
        console.error('API Error:', err);
        setTotalOrders(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [timeValue]);

  // === ĐẾM SỐ ĐƠN HOÀN THÀNH THEO THÁNG/NĂM ===
  const countCompletedOrders = (orders, filterType) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    const getDateOnly = (iso) => iso?.split('T')[0];

    if (filterType === 'month') {
      const monthStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
      return orders.filter((o) => getDateOnly(o.createdAt)?.startsWith(monthStr)).length;
    } else {
      return orders.filter((o) => getDateOnly(o.createdAt)?.startsWith(currentYear)).length;
    }
  };

  return (
    <>
      {isLoading || propIsLoading ? (
        <SkeletonTotalOrderCard />
      ) : (
        <MainCard
          border={false}
          content={false}
          sx={{
            bgcolor: 'primary.dark',
            color: '#fff',
            overflow: 'hidden',
            position: 'relative',
            '&>div': {
              position: 'relative',
              zIndex: 5
            },
            '&:after': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: theme.palette.primary[800],
              borderRadius: '50%',
              top: { xs: -85 },
              right: { xs: -95 }
            },
            '&:before': {
              content: '""',
              position: 'absolute',
              width: 210,
              height: 210,
              background: theme.palette.primary[800],
              borderRadius: '50%',
              top: { xs: -125 },
              right: { xs: -15 },
              opacity: 0.5
            }
          }}
        >
          <Box sx={{ p: 2.25 }}>
            <Grid container direction="column">
              <Grid>
                <Grid container sx={{ justifyContent: 'space-between' }}>
                  <Grid>
                    <Avatar
                      variant="rounded"
                      sx={{
                        ...theme.typography.commonAvatar,
                        ...theme.typography.largeAvatar,
                        bgcolor: 'primary.800',
                        color: '#fff',
                        mt: 1
                      }}
                    >
                      <LocalMallOutlinedIcon fontSize="inherit" />
                    </Avatar>
                  </Grid>
                  <Grid>
                    <Button
                      disableElevation
                      variant={timeValue ? 'contained' : 'text'}
                      size="small"
                      sx={{ color: 'inherit' }}
                      onClick={(e) => handleChangeTime(e, true)}
                    >
                      Month
                    </Button>
                    <Button
                      disableElevation
                      variant={!timeValue ? 'contained' : 'text'}
                      size="small"
                      sx={{ color: 'inherit' }}
                      onClick={(e) => handleChangeTime(e, false)}
                    >
                      Year
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid sx={{ mb: 0.75 }}>
                <Grid container sx={{ alignItems: 'center' }}>
                  <Grid size={6}>
                    <Grid container sx={{ alignItems: 'center' }}>
                      <Grid>
                        <Typography sx={{ fontSize: '2.125rem', fontWeight: 500, mr: 1, mt: 1.75, mb: 0.75 }}>
                          {totalOrders.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid>
                        <Avatar
                          sx={{
                            ...theme.typography.smallAvatar,
                            cursor: 'pointer',
                            bgcolor: 'primary.200',
                            color: 'primary.dark'
                          }}
                        >
                          <ArrowDownwardIcon fontSize="inherit" sx={{ transform: 'rotate3d(1, 1, 1, 45deg)' }} />
                        </Avatar>
                      </Grid>
                      <Grid size={12}>
                        <Typography
                          sx={{
                            fontSize: '1rem',
                            fontWeight: 500,
                            color: 'primary.200'
                          }}
                        >
                          Total Order
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid
                    size={6}
                    sx={{
                      '.apexcharts-tooltip.apexcharts-theme-light': {
                        color: theme.palette.text.primary,
                        background: theme.palette.background.default
                      }
                    }}
                  >
                    {timeValue ? <Chart {...ChartDataMonth} /> : <Chart {...ChartDataYear} />}
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </MainCard>
      )}
    </>
  );
}

TotalOrderLineChartCard.propTypes = {
  isLoading: PropTypes.bool
};
