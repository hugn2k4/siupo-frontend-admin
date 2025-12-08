import PropTypes from 'prop-types';
import { format, parseISO } from 'date-fns';

// material-ui
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';

// icons
import CloseIcon from '@mui/icons-material/Close';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PeopleIcon from '@mui/icons-material/People';
import NoteIcon from '@mui/icons-material/Note';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CancelIcon from '@mui/icons-material/Cancel';
import DoneAllIcon from '@mui/icons-material/DoneAll';

// project imports
import { useBookings } from 'hooks/useBookings';

const drawerWidth = 400;

const statusConfig = {
  PENDING: {
    label: 'Chờ xác nhận',
    color: 'warning',
    icon: <HourglassEmptyIcon fontSize="small" />
  },
  CONFIRMED: {
    label: 'Đã xác nhận',
    color: 'primary',
    icon: <CheckCircleIcon fontSize="small" />
  },
  COMPLETED: {
    label: 'Hoàn thành',
    color: 'success',
    icon: <DoneAllIcon fontSize="small" />
  },
  DENIED: {
    label: 'Từ chối',
    color: 'error',
    icon: <CancelIcon fontSize="small" />
  }
};

const formatTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = parseISO(dateString);
    return format(date, 'HH:mm');
  } catch {
    return '-';
  }
};

const formatDate = (date) => {
  if (!date) return '-';
  try {
    return format(date, 'dd MMMM yyyy');
  } catch {
    return '-';
  }
};

export default function BookingDetailDrawer({ open, date, onClose }) {
  // Chỉ fetch khi drawer thực sự mở
  const { bookings, loading, error } = useBookings(open ? date : null);

  const getStatusConfig = (status) => {
    return statusConfig[status?.toUpperCase()] || statusConfig.PENDING;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      ModalProps={{
        keepMounted: true,
        disableAutoFocus: true,
        disableEnforceFocus: true,
        disableRestoreFocus: true
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: drawerWidth },
          boxSizing: 'border-box'
        }
      }}
    >
      <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Bookings
            </Typography>
            {date && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {formatDate(date)}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="error">
                {error}
              </Typography>
            </Box>
          ) : bookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                No bookings for this date
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              {bookings.map((booking, index) => {
                const statusCfg = getStatusConfig(booking.status);
                return (
                  <Box key={booking.id}>
                    <Box
                      sx={{
                        p: 2,
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        '&:hover': {
                          boxShadow: '0 2px 14px 0 rgb(32 40 45 / 8%)'
                        }
                      }}
                    >
                      {/* Header with status */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {booking.name}
                        </Typography>
                        <Chip icon={statusCfg.icon} label={statusCfg.label} color={statusCfg.color} size="small" variant="outlined" />
                      </Stack>

                      <Divider sx={{ my: 1.5 }} />

                      {/* Details */}
                      <Stack spacing={1.5}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: 'primary.light',
                              color: 'primary.dark'
                            }}
                          >
                            <PhoneIcon sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {booking.phoneNumber}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: 'secondary.light',
                              color: 'secondary.dark'
                            }}
                          >
                            <PeopleIcon sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {booking.member} {booking.member === 1 ? 'person' : 'people'}
                          </Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: 'success.light',
                              color: 'success.dark'
                            }}
                          >
                            <AccessTimeIcon sx={{ fontSize: 14 }} />
                          </Avatar>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            {formatTime(booking.startedAt)}
                          </Typography>
                        </Stack>

                        {booking.note && (
                          <Box sx={{ mt: 1, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                            <Stack direction="row" spacing={1} alignItems="flex-start">
                              <NoteIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.5 }} />
                              <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                                  Note:
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                  {booking.note}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        )}
                      </Stack>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}

BookingDetailDrawer.propTypes = {
  open: PropTypes.bool.isRequired,
  date: PropTypes.instanceOf(Date),
  onClose: PropTypes.func.isRequired
};
