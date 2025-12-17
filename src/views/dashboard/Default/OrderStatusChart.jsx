import { useEffect, useState, useMemo } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chart from 'react-apexcharts';
import orderApi from '../../../api/orderApi';

// Component biểu đồ phân bố trạng thái đơn hàng
export default function OrderStatusChart() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getOrders({ page: 0, size: 5000 });
        const fetchedOrders = (res && res.content) || (res && res.data && res.data.content) || [];
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Error fetching orders for status chart:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const statusData = useMemo(() => {
    const statusCount = {};
    const statusLabels = {
      PENDING: 'Pending',
      PROCESSING: 'Processing',
      CONFIRMED: 'Confirmed',
      COMPLETED: 'Completed',
      CANCELLED: 'Cancelled',
      CANCELED: 'Cancelled'
    };

    orders.forEach((order) => {
      const status = String(order.status || 'UNKNOWN').toUpperCase();
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    // Merge CANCELLED and CANCELED
    if (statusCount.CANCELED && statusCount.CANCELLED) {
      statusCount.CANCELLED += statusCount.CANCELED;
      delete statusCount.CANCELED;
    } else if (statusCount.CANCELED) {
      statusCount.CANCELLED = statusCount.CANCELED;
      delete statusCount.CANCELED;
    }

    const labels = Object.keys(statusCount).map((key) => statusLabels[key] || key);
    const series = Object.values(statusCount);

    return { labels, series };
  }, [orders]);

  const chartOptions = {
    chart: {
      type: 'donut',
      height: 350
    },
    labels: statusData.labels,
    colors: ['#fb8c00', '#1e88e5', '#43a047', '#66bb6a', '#e53935'],
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '14px',
      markers: {
        radius: 12
      },
      itemMargin: {
        horizontal: 10,
        vertical: 5
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              color: '#373d3f'
            },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 700,
              color: '#1e88e5',
              formatter: (val) => val
            },
            total: {
              show: true,
              label: 'Total Orders',
              fontSize: '14px',
              color: '#999',
              formatter: () => orders.length
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Math.round(val * 10) / 10}%`,
      style: {
        fontSize: '12px',
        fontWeight: 600
      },
      dropShadow: {
        enabled: false
      }
    },
    tooltip: {
      y: {
        formatter: (val) => `${val} orders`
      }
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            height: 300
          },
          legend: {
            position: 'bottom',
            fontSize: '12px'
          }
        }
      }
    ]
  };

  if (loading) {
    return (
      <MainCard>
        <Typography>Loading...</Typography>
      </MainCard>
    );
  }

  if (orders.length === 0) {
    return (
      <MainCard>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Order Status Distribution
        </Typography>
        <Typography color="text.secondary">No order data available</Typography>
      </MainCard>
    );
  }

  return (
    <MainCard>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Order Status Distribution
      </Typography>
      <Box sx={{ width: '100%', height: 350 }}>
        <Chart options={chartOptions} series={statusData.series} type="donut" height={350} />
      </Box>
    </MainCard>
  );
}
