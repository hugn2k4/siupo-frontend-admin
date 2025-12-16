import PropTypes from 'prop-types';
import { useState, useMemo, useRef, useEffect } from 'react';
import { format, startOfDay, startOfMonth, endOfMonth, startOfWeek, addDays, isSameMonth, isToday, parseISO } from 'date-fns';

// material-ui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';

// icons
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import { useBookingsByDateRange } from 'hooks/useBookings';
import BookingDetailDrawer from './BookingDetailDrawer';
import SkeletonMiniCalendar from './SkeletonMiniCalendar';

// Status colors
const STATUS_COLORS = {
  pending: '#FFB74D',
  confirmed: '#26A69A',
  completed: '#9E9E9E',
  denied: '#F44336'
};

const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  denied: 'Denied'
};

// Fixed cell height for equal sizing
const CELL_HEIGHT = 150;

export default function MiniBookingCalendar({ isLoading: propIsLoading }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerDate, setDrawerDate] = useState(null);

  // Calculate month start and end dates using date-fns (no timezone shift)
  const monthRange = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return { start, end };
  }, [currentMonth]);

  const { bookingsByDate, loading } = useBookingsByDateRange(monthRange.start, monthRange.end);

  // Helper to build 4-week calendar weeks for any given month
  const getCalendarWeeksFor = (monthDate) => {
    const monthStart = startOfMonth(monthDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
    const days = [];
    for (let i = 0; i < 28; i++) {
      days.push(addDays(calendarStart, i));
    }
    const weeks = [];
    for (let i = 0; i < 4; i++) {
      weeks.push(days.slice(i * 7, (i + 1) * 7));
    }
    return weeks;
  };

  // For slide animation between months
  const [transition, setTransition] = useState(null); // { from: Date, to: Date, direction: 'left'|'right' }
  const trackRef = useRef(null);
  const animatingRef = useRef(false);

  // Get bookings for a specific date
  const getBookingsForDate = (date) => {
    const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
    const dayData = bookingsByDate[dateStr] || {
      total: 0,
      bookings: []
    };

    return {
      total: dayData.total || 0,
      bookings: dayData.bookings || []
    };
  };

  const handleDateClick = (date) => {
    if (!date) return;
    const normalizedDate = startOfDay(date);
    setDrawerDate(normalizedDate);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setDrawerDate(null);
  };

  const handlePrevMonth = () => {
    if (animatingRef.current) return;
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() - 1);
    setTransition({ from: currentMonth, to: newDate, direction: 'right' });
  };

  const handleNextMonth = () => {
    if (animatingRef.current) return;
    const newDate = new Date(currentMonth);
    newDate.setMonth(currentMonth.getMonth() + 1);
    setTransition({ from: currentMonth, to: newDate, direction: 'left' });
  };

  const handleToday = () => {
    const today = new Date();
    if (today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear()) return;

    const direction = today > currentMonth ? 'left' : 'right';
    setTransition({ from: currentMonth, to: today, direction });
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Format time from ISO string
  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = parseISO(dateString);
      return format(date, 'HH:mm');
    } catch {
      return '';
    }
  };

  // Render functions for a single month grid (extracted to reuse in animation)
  const renderMonth = (month) => {
    const weeks = getCalendarWeeksFor(month);
    return (
      <>
        {/* Weekday headers - Using Grid with equal spacing */}
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {weekDays.map((day) => (
            <Grid size={{ xs: 12 / 7 }} key={day}>
              <Box
                sx={{
                  py: 1,
                  px: 1,
                  textAlign: 'left',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'text.secondary',
                  bgcolor: 'grey.50',
                  borderRadius: 1
                }}
              >
                {day}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Calendar days - 4 rows of 7 days each */}
        {weeks.map((week, weekIdx) => (
          <Grid container spacing={1} key={weekIdx} sx={{ mb: weekIdx < 3 ? 1 : 0 }}>
            {week.map((date, dayIdx) => {
              const isCurrentMonth = isSameMonth(date, month);
              const isTodayDate = isToday(date);
              const dayBookings = getBookingsForDate(date);
              const allBookings = dayBookings.bookings || [];

              // Sort bookings by time (earliest first)
              const sortedBookings = [...allBookings].sort((a, b) => {
                try {
                  const timeA = parseISO(a.startedAt).getTime();
                  const timeB = parseISO(b.startedAt).getTime();
                  return timeA - timeB;
                } catch {
                  return 0;
                }
              });

              // Show max 2 bookings per cell
              const maxVisible = 2;
              const visibleBookings = sortedBookings.slice(0, maxVisible);
              const remainingCount = Math.max(0, dayBookings.total - maxVisible);

              return (
                <Grid size={{ xs: 12 / 7 }} key={`${weekIdx}-${dayIdx}`}>
                  <Box
                    onClick={() => handleDateClick(date)}
                    sx={{
                      height: CELL_HEIGHT,
                      border: 2,
                      borderColor: isTodayDate ? 'primary.main' : 'divider',
                      borderRadius: 2,
                      p: 1,
                      bgcolor: isTodayDate ? 'primary.light' : isCurrentMonth ? 'background.paper' : 'grey.50',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      '&:hover': {
                        bgcolor: isTodayDate ? 'primary.200' : 'action.hover',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)',
                        borderColor: isTodayDate ? 'primary.dark' : 'primary.light'
                      },
                      opacity: isCurrentMonth ? 1 : 0.6
                    }}
                  >
                    {/* Date number */}
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isTodayDate ? 700 : isCurrentMonth ? 600 : 400,
                        color: isTodayDate ? 'primary.dark' : isCurrentMonth ? 'text.primary' : 'text.secondary',
                        mb: 0.5,
                        fontSize: '0.875rem',
                        lineHeight: 1.2,
                        flexShrink: 0
                      }}
                    >
                      {format(date, 'd')}
                    </Typography>

                    {/* Booking items */}
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                        flex: 1,
                        overflow: 'hidden',
                        minHeight: 0
                      }}
                    >
                      {visibleBookings.map((booking, bookingIdx) => {
                        const status = (booking.status || '').toLowerCase();
                        const statusColor = STATUS_COLORS[status] || STATUS_COLORS.pending;
                        const bookingName = booking.name || 'Booking';
                        const startTime = formatTime(booking.startedAt);

                        return (
                          <Box
                            key={booking.id || bookingIdx}
                            sx={{
                              bgcolor: statusColor,
                              color: 'white',
                              borderRadius: 1,
                              p: 0.5,
                              fontSize: '0.7rem',
                              lineHeight: 1.3,
                              cursor: 'pointer',
                              flexShrink: 0,
                              '&:hover': {
                                opacity: 0.9,
                                transform: 'scale(1.02)'
                              },
                              transition: 'all 0.15s ease'
                            }}
                            title={`${bookingName} - ${startTime} - ${STATUS_LABELS[status]}`}
                          >
                            {/* Booking name */}
                            <Typography
                              sx={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                mb: 0.25
                              }}
                            >
                              {bookingName}
                            </Typography>

                            {/* Time and status */}
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 0.5 }}>
                              {startTime && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25 }}>
                                  <AccessTimeIcon sx={{ fontSize: '0.65rem' }} />
                                  <Typography
                                    sx={{
                                      fontSize: '0.65rem',
                                      fontWeight: 500,
                                      opacity: 0.95
                                    }}
                                  >
                                    {startTime}
                                  </Typography>
                                </Box>
                              )}
                              <Chip
                                label={STATUS_LABELS[status]}
                                size="small"
                                sx={{
                                  height: 16,
                                  fontSize: '0.6rem',
                                  bgcolor: 'rgba(255,255,255,0.2)',
                                  color: 'white',
                                  fontWeight: 600,
                                  '& .MuiChip-label': {
                                    px: 0.5
                                  }
                                }}
                              />
                            </Box>
                          </Box>
                        );
                      })}

                      {/* "+ more" indicator */}
                      {remainingCount > 0 && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 600,
                            fontSize: '0.7rem',
                            mt: 'auto',
                            cursor: 'pointer',
                            textAlign: 'center',
                            py: 0.25,
                            borderRadius: 0.5,
                            bgcolor: 'action.hover',
                            flexShrink: 0,
                            '&:hover': {
                              color: 'primary.main',
                              bgcolor: 'primary.light'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          +{remainingCount} more
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        ))}
      </>
    );
  };

  // handle transition effects
  useEffect(() => {
    if (!transition) return;
    animatingRef.current = true;
    const track = trackRef.current;
    if (!track) return;

    const duration = 360; // ms
    const easing = 'cubic-bezier(0.4, 0, 0.2, 1)';

    // GPU hinting
    track.style.willChange = 'transform';
    track.style.backfaceVisibility = 'hidden';

    // Ensure initial position without transition, force reflow, then animate
    track.style.transition = 'none';
    track.style.transform = transition.direction === 'left' ? 'translate3d(0,0,0)' : 'translate3d(-50%,0,0)';
    // force reflow

    track.offsetHeight;

    requestAnimationFrame(() => {
      track.style.transition = `transform ${duration}ms ${easing}`;
      track.style.transform = transition.direction === 'left' ? 'translate3d(-50%,0,0)' : 'translate3d(0,0,0)';
    });

    const onEnd = () => {
      setCurrentMonth(transition.to);
      setTransition(null);
      animatingRef.current = false;
      // cleanup inline styles
      track.style.transition = '';
      track.style.willChange = '';
      track.style.backfaceVisibility = '';
      track.removeEventListener('transitionend', onEnd);
    };

    track.addEventListener('transitionend', onEnd);

    return () => {
      track.removeEventListener('transitionend', onEnd);
    };
  }, [transition]);

  if (propIsLoading || loading) {
    return <SkeletonMiniCalendar />;
  }

  return (
    <>
      <MainCard
        title="Booking Calendar"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Header with navigation */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton size="small" onClick={handlePrevMonth}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 600, minWidth: 200, textAlign: 'center' }}>
              {format(currentMonth, 'MMMM yyyy')}
            </Typography>
            <IconButton size="small" onClick={handleNextMonth}>
              <ChevronRightIcon />
            </IconButton>
            <Chip label="Today" size="small" onClick={handleToday} sx={{ cursor: 'pointer', ml: 1 }} />
          </Box>

          {/* Legend */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', mr: 0.5 }}>
              Status:
            </Typography>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <Chip
                key={status}
                label={STATUS_LABELS[status]}
                size="small"
                sx={{
                  height: 20,
                  bgcolor: color,
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 500
                }}
              />
            ))}
          </Box>
        </Box>

        {/* Calendar Grid */}
        <Box sx={{ p: 2, flex: 1, overflow: 'auto' }}>
          {/* When transitioning, show two months side-by-side and animate via CSS transform */}
          <Box className="month-slide-wrapper">
            {transition ? (
              <Box
                className="month-slide-track"
                ref={trackRef}
                style={{
                  transform: transition.direction === 'left' ? 'translateX(0%)' : 'translateX(-50%)'
                }}
              >
                <Box className="month-slide-item">{renderMonth(transition.from)}</Box>
                <Box className="month-slide-item">{renderMonth(transition.to)}</Box>
              </Box>
            ) : (
              <Box className="month-slide-track">
                <Box className="month-slide-item">{renderMonth(currentMonth)}</Box>
              </Box>
            )}
          </Box>
        </Box>
      </MainCard>

      {/* Detail Drawer */}
      <BookingDetailDrawer open={drawerOpen} date={drawerDate} onClose={handleCloseDrawer} />
    </>
  );
}

MiniBookingCalendar.propTypes = {
  isLoading: PropTypes.bool
};
