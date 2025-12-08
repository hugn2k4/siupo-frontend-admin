import PropTypes from 'prop-types';

// material-ui
import Skeleton from '@mui/material/Skeleton';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'ui-component/cards/MainCard';

export default function SkeletonMiniCalendar({ height = 400 }) {
  return (
    <MainCard
      title="Booking Calendar"
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Legend skeleton */}
      <Box
        sx={{
          px: 3,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          gap: 2,
          alignItems: 'center'
        }}
      >
        <Skeleton variant="text" width={60} height={20} />
        <Skeleton variant="rectangular" width={70} height={20} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={75} height={20} sx={{ borderRadius: 1 }} />
      </Box>

      {/* Calendar skeleton */}
      <Box sx={{ p: 2 }}>
        {/* Month header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Skeleton variant="text" width={120} height={32} />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </Box>
        </Box>

        {/* Weekday headers */}
        <Box sx={{ display: 'flex', justifyContent: 'space-around', mb: 1 }}>
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} variant="text" width={36} height={24} />
          ))}
        </Box>

        {/* Calendar grid */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {[...Array(6)].map((_, weekIndex) => (
            <Box key={weekIndex} sx={{ display: 'flex', justifyContent: 'space-around', gap: 0.5 }}>
              {[...Array(7)].map((_, dayIndex) => (
                <Skeleton key={dayIndex} variant="rectangular" width={36} height={36} sx={{ borderRadius: 1 }} />
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </MainCard>
  );
}

SkeletonMiniCalendar.propTypes = {
  height: PropTypes.number
};
