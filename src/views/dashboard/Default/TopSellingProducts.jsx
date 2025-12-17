import { useEffect, useState, useMemo } from 'react';
import MainCard from 'ui-component/cards/MainCard';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import orderApi from '../../../api/orderApi';

// Component hiển thị top món bán chạy
export default function TopSellingProducts() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getOrders({ page: 0, size: 5000 });
        const fetchedOrders = (res && res.content) || (res && res.data && res.data.content) || [];
        setOrders(fetchedOrders);
      } catch (err) {
        console.error('Error fetching orders for top selling products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const topProducts = useMemo(() => {
    // Aggregate product data from all completed orders
    const productMap = {};

    orders.forEach((order) => {
      // Only count completed orders
      if (String(order.status).toUpperCase() !== 'COMPLETED') return;

      // Check if order has items
      if (!order.items || !Array.isArray(order.items)) return;

      order.items.forEach((item) => {
        const productId = item.productId || item.id;
        const productName = item.productName || item.name || 'Unknown Product';
        const imageUrl = item.productImageUrl || item.imageUrl || '';
        const price = item.price || 0;
        const quantity = item.quantity || 0;

        if (!productId) return;

        if (!productMap[productId]) {
          productMap[productId] = {
            id: productId,
            name: productName,
            imageUrl: imageUrl,
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: 0
          };
        }

        productMap[productId].totalQuantity += quantity;
        productMap[productId].totalRevenue += price * quantity;
        productMap[productId].orderCount += 1;
      });
    });

    // Convert to array and sort by quantity (or revenue)
    const productsArray = Object.values(productMap);
    productsArray.sort((a, b) => b.totalQuantity - a.totalQuantity);

    // Return top 10
    return productsArray.slice(0, 10);
  }, [orders]);

  if (loading) {
    return (
      <MainCard>
        <Typography>Loading...</Typography>
      </MainCard>
    );
  }

  if (topProducts.length === 0) {
    return (
      <MainCard>
        <Typography variant="h4" sx={{ mb: 2 }}>
          Top Selling Products
        </Typography>
        <Typography color="text.secondary">No product data available</Typography>
      </MainCard>
    );
  }

  return (
    <MainCard>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <TrendingUpIcon color="primary" />
        <Typography variant="h4">Top Selling Products</Typography>
      </Box>

      <Stack spacing={2}>
        {topProducts.map((product, index) => (
          <Stack
            key={product.id}
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              p: 2,
              bgcolor: index < 3 ? 'primary.lighter' : 'background.paper',
              borderRadius: 2,
              border: '1px solid',
              borderColor: index < 3 ? 'primary.light' : 'divider',
              transition: 'all 0.2s',
              '&:hover': {
                boxShadow: 2,
                transform: 'translateY(-2px)'
              }
            }}
          >
            {/* Rank */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: index < 3 ? 'primary.main' : 'grey.300',
                color: index < 3 ? 'white' : 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '14px'
              }}
            >
              {index + 1}
            </Box>

            {/* Product Image */}
            <Avatar
              src={product.imageUrl}
              variant="rounded"
              sx={{
                width: 60,
                height: 60,
                border: '2px solid',
                borderColor: 'divider'
              }}
            />

            {/* Product Info */}
            <Box flex={1} minWidth={0}>
              <Typography variant="subtitle1" fontWeight={600} noWrap>
                {product.name}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {product.orderCount} orders
                </Typography>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'divider' }} />
                <Typography variant="caption" color="primary.main" fontWeight={600}>
                  ${(product.totalRevenue / 25000).toFixed(2)}
                </Typography>
              </Stack>
            </Box>

            {/* Quantity Sold */}
            <Box sx={{ textAlign: 'right' }}>
              <Chip
                label={`${product.totalQuantity} sold`}
                color={index < 3 ? 'primary' : 'default'}
                size="small"
                sx={{ fontWeight: 600 }}
              />
            </Box>
          </Stack>
        ))}
      </Stack>
    </MainCard>
  );
}
