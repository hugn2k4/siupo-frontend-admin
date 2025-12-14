// src/components/dashboard/TotalGrowthBarChart.jsx

import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { Box } from '@mui/material';

// material-ui
import Grid from '@mui/material/Grid';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// mui-x date pickers
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

// third party
import Chart from 'react-apexcharts';

// project imports
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';

// API
import orderApi from '../../../api/orderApi';

const status = [
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'specificDate', label: 'Specific Date' },
  { value: 'specificMonth', label: 'Specific Month' },
  { value: 'specificYear', label: 'Specific Year' }
];

// === HÀM CHUYỂN NGÀY THÀNH YYYY-MM-DD (LOCAL TIME) ===
const formatLocalDate = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function TotalGrowthBarChart({ isLoading: propIsLoading }) {
  const [value, setValue] = useState('month');
  const [specificDate, setSpecificDate] = useState(null);
  const [specificMonth, setSpecificMonth] = useState(null);
  const [specificYear, setSpecificYear] = useState(null);
  const [allOrders, setAllOrders] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [chartCategories, setChartCategories] = useState([]);
  const [chartColors, setChartColors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // === GỌI API ===
  useEffect(() => {
    const fetchAllOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await orderApi.getOrders({
          page: 0,
          size: 1000,
          status: 'COMPLETED'
        });

        if (response.success && response.data?.content) {
          const orders = response.data.content;
          setAllOrders(orders);
          calculateRevenue(orders, 'month');
        } else {
          setAllOrders([]);
        }
      } catch (err) {
        setError(err.message || 'Failed to load orders');
        setAllOrders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllOrders();
  }, []);

  // === TÍNH DOANH THU ===
  const calculateRevenue = (orders, filterType, specificDate = null, specificMonth = null, specificYear = null) => {
    let filtered = [...orders];
    let revenueData = [];
    let categories = [];
    let colors = [];
    let total = 0;

    const now = new Date();
    const today = formatLocalDate(now);
    const getDateOnly = (iso) => iso?.split('T')[0]; // 2025-11-16T13:10:54.469365 → 2025-11-16

    if (filterType === 'week') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      const weekDays = [];

      for (let i = 0; i < 7; i++) {
        const day = new Date(startOfWeek);
        day.setDate(startOfWeek.getDate() + i);
        const dateStr = formatLocalDate(day);
        const label = day.toLocaleDateString('en-US', { weekday: 'short' });
        weekDays.push({ date: dateStr, label });
      }

      revenueData = Array(7).fill(0);
      categories = weekDays.map((d) => d.label);
      colors = weekDays.map((d) => (d.date === today ? '#00A76F' : '#00A76F'));

      filtered.forEach((o) => {
        const date = getDateOnly(o.createdAt);
        const index = weekDays.findIndex((d) => d.date === date);
        if (index !== -1) revenueData[index] += o.totalPrice || 0;
      });

      total = revenueData.reduce((a, b) => a + b, 0);
    } else {
      if (filterType === 'month') {
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const groupSize = Math.ceil(daysInMonth / 8);
        const groups = [];

        for (let i = 0; i < daysInMonth; i += groupSize) {
          const start = i + 1;
          const end = Math.min(i + groupSize, daysInMonth);
          groups.push({ start, end, label: `${start}-${end}` });
        }

        revenueData = groups.map(() => 0);
        categories = groups.map((g) => g.label);

        filtered.forEach((o) => {
          const dateStr = getDateOnly(o.createdAt);
          if (dateStr?.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)) {
            const day = parseInt(dateStr.split('-')[2]);
            const groupIndex = Math.floor((day - 1) / groupSize);
            if (groupIndex < revenueData.length) revenueData[groupIndex] += o.totalPrice || 0;
          }
        });
      } else if (filterType === 'year') {
        const monthly = Array(12).fill(0);
        categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        filtered.forEach((o) => {
          const dateStr = getDateOnly(o.createdAt);
          if (dateStr?.startsWith(now.getFullYear())) {
            const month = parseInt(dateStr.substring(5, 7)) - 1;
            if (month >= 0 && month < 12) monthly[month] += o.totalPrice || 0;
          }
        });
        revenueData = monthly;
      } else if (filterType === 'specificDate' && specificDate) {
        // === ĐÃ SỬA: DÙNG LOCAL DATE ===
        const selectedDateStr = formatLocalDate(specificDate); // 2025-11-17
        filtered = orders.filter((o) => getDateOnly(o.createdAt) === selectedDateStr);
        total = filtered.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        revenueData = [total];
        categories = [selectedDateStr];
      } else if (filterType === 'specificMonth' && specificMonth) {
        const year = specificMonth.getFullYear();
        const month = String(specificMonth.getMonth() + 1).padStart(2, '0');
        const monthStr = `${year}-${month}`;
        filtered = orders.filter((o) => getDateOnly(o.createdAt)?.startsWith(monthStr));
        total = filtered.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        revenueData = [total];
        categories = [specificMonth.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })];
      } else if (filterType === 'specificYear' && specificYear) {
        filtered = orders.filter((o) => getDateOnly(o.createdAt)?.startsWith(specificYear));
        const monthly = Array(12).fill(0);
        filtered.forEach((o) => {
          const dateStr = getDateOnly(o.createdAt);
          if (dateStr) {
            const month = parseInt(dateStr.substring(5, 7)) - 1;
            if (month >= 0 && month < 12) monthly[month] += o.totalPrice || 0;
          }
        });
        revenueData = monthly;
        categories = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      }

      total = revenueData.reduce((a, b) => a + b, 0);
      colors = Array(revenueData.length).fill('#00A76F');
    }

    setChartData(revenueData);
    setChartCategories(categories);
    setChartColors(colors);
    setTotalRevenue(total);
  };

  const handleApply = () => {
    calculateRevenue(allOrders, value, specificDate, specificMonth, specificYear);
  };

  const showSpecificPicker = ['specificDate', 'specificMonth', 'specificYear'].includes(value);

  return (
    <>
      {isLoading || propIsLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : error ? (
        <MainCard>
          <Box sx={{ p: 3, textAlign: 'center', color: 'error.main' }}>
            <Typography variant="h6">Failed to load data</Typography>
            <Typography variant="body2">{error}</Typography>
            <Button variant="outlined" size="small" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
              Retry
            </Button>
          </Box>
        </MainCard>
      ) : (
        <MainCard content={false}>
          {/* === HEADER === */}
          <Grid container sx={{ px: 3, py: 2, alignItems: 'center' }}>
            <Grid item>
              <Grid container alignItems="center" spacing={1} wrap="nowrap">
                <Grid item>
                  <TextField
                    select
                    size="small"
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value);
                      setSpecificDate(null);
                      setSpecificMonth(null);
                      setSpecificYear(null);
                    }}
                    sx={{ minWidth: 140 }}
                  >
                    {status.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {showSpecificPicker && (
                  <Grid item>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      {value === 'specificDate' && (
                        <DatePicker
                          label="Select Date"
                          value={specificDate}
                          onChange={setSpecificDate}
                          slotProps={{ textField: { size: 'small' } }}
                        />
                      )}
                      {value === 'specificMonth' && (
                        <DatePicker
                          label="Select Month"
                          views={['month', 'year']}
                          value={specificMonth}
                          onChange={setSpecificMonth}
                          slotProps={{ textField: { size: 'small' } }}
                        />
                      )}
                      {value === 'specificYear' && (
                        <DatePicker
                          label="Select Year"
                          views={['year']}
                          value={specificYear ? new Date(specificYear, 0, 1) : null}
                          onChange={(date) => setSpecificYear(date ? date.getFullYear() : null)}
                          slotProps={{ textField: { size: 'small' } }}
                        />
                      )}
                    </LocalizationProvider>
                  </Grid>
                )}

                <Grid item>
                  <Button variant="contained" size="small" onClick={handleApply}>
                    Apply
                  </Button>
                </Grid>
              </Grid>
            </Grid>

            <Grid item sx={{ ml: 'auto' }}>
              <Grid container direction="column" alignItems="flex-end">
                <Grid item>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Total Revenue
                  </Typography>
                </Grid>
                <Grid item>
                  <Typography variant="h3" sx={{ fontWeight: 600 }}>
                    ${totalRevenue.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* === BIỂU ĐỒ === */}
          <Box sx={{ p: 3 }}>
            <Chart
              options={{
                chart: { type: 'bar', height: 480, toolbar: { show: true } },
                plotOptions: { bar: { borderRadius: 4, horizontal: false, columnWidth: '45%' } },
                dataLabels: { enabled: false },
                stroke: { show: true, width: 2, colors: ['transparent'] },
                xaxis: { categories: chartCategories, labels: { style: { fontSize: '12px' } } },
                yaxis: {
                  title: { text: '' },
                  labels: { show: false },
                  axisBorder: { show: false },
                  axisTicks: { show: false }
                },
                fill: { opacity: 1 },
                tooltip: { y: { formatter: (val) => `$${val.toLocaleString()}` } },
                legend: { show: false },
                colors: chartColors
              }}
              series={[{ name: 'Revenue', data: chartData }]}
              type="bar"
              height={480}
            />
          </Box>
        </MainCard>
      )}
    </>
  );
}

TotalGrowthBarChart.propTypes = {
  isLoading: PropTypes.bool
};
