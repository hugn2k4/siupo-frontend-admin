// src/views/account/Profile.jsx
import {
  Avatar,
  Box,
  Button,
  Grid,
  IconButton,
  Typography,
  InputAdornment,
  FormControl,
  InputLabel,
  OutlinedInput,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import MainCard from '../../../ui-component/cards/MainCard.jsx';
import { IconEye, IconEyeOff, IconLockOpen, IconCircleCheck, IconCircleX, IconLock } from '@tabler/icons-react';
import { useState, useEffect } from 'react';
import userApi from '../../../api/userApi'; // Đường dẫn đúng tới file api

export default function Profile() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Snackbar state
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setOpenSnackbar(false);
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };

  const getStrength = (pass) => {
    if (!pass) return { label: '', color: 'text.secondary' };
    if (pass.length < 6) return { label: 'Yếu', color: 'error.main' };
    if (pass.length < 10) return { label: 'Trung bình', color: 'warning.main' };
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass) && /[^A-Za-z0-9]/.test(pass)) return { label: 'Mạnh', color: 'success.main' };
    return { label: 'Tốt', color: 'info.main' };
  };

  const strength = getStrength(newPass);
  const isMatch = confirmPass && newPass === confirmPass;
  const isNotEmpty = confirmPass !== '';

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoadingUser(true);
        const response = await userApi.getCurrentUser();
        setUser(response.data); // response.data là UserResponse
      } catch (error) {
        console.error('Lỗi tải thông tin người dùng:', error);
        showNotification('Không thể tải thông tin người dùng', 'error');
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);

  const handleChangePassword = async () => {
    // Validate frontend
    if (!currentPass || !newPass || !confirmPass) {
      showNotification('Vui lòng nhập đầy đủ thông tin!', 'error');
      return;
    }
    if (newPass !== confirmPass) {
      showNotification('Mật khẩu mới không khớp!', 'error');
      return;
    }
    if (newPass.length < 8) {
      showNotification('Mật khẩu phải ít nhất 8 ký tự!', 'error');
      return;
    }

    setLoading(true);

    try {
      await userApi.changePassword({
        oldPassword: currentPass,
        newPassword: newPass,
        confirmNewPassword: confirmPass
      });

      showNotification('Đổi mật khẩu thành công!', 'success');

      // Reset form chỉ khi thành công
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
      setShowCurrent(false);
      setShowNew(false);
      setShowConfirm(false);
    } catch (error) {
      const msg = error.response?.data?.message || error.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại!';

      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Grid container spacing={3}>
        {/* HEADER CARD */}
        <Grid item xs={12} sx={{ width: '100%' }}>
          <MainCard sx={{ p: 3 }}>
            <Grid container alignItems="center" spacing={3}>
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Avatar
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnwJi4dcsTyewsu16sY2E4lyx-W3OCgGMcCQ&s"
                    alt={user?.fullName || 'User'}
                    sx={{ width: 80, height: 80 }}
                  />
                  <Box>
                    {loadingUser ? (
                      <Typography variant="h5" color="text.secondary">
                        <CircularProgress size={20} sx={{ mr: 1 }} /> Đang tải...
                      </Typography>
                    ) : user ? (
                      <>
                        <Typography variant="h5" fontWeight={600}>
                          {user.fullName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.role === 'CUSTOMER' ? 'Khách hàng' : 'Quản trị viên'} | Siupo Restaurant
                        </Typography>
                      </>
                    ) : (
                      <Typography variant="h5" color="error">
                        Không thể tải thông tin
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </MainCard>
        </Grid>

        {/* Thay mat khau */}
        <Grid item xs={12} sx={{ width: '100%' }}>
          <MainCard
            title="Change Password"
            secondary={
              <Button
                variant="contained"
                color="primary"
                size="medium"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <IconLockOpen size={18} />}
                onClick={handleChangePassword}
                disabled={loading}
              >
                {loading ? 'Đang cập nhật...' : 'Update Password'}
              </Button>
            }
          >
            <Box sx={{ width: '50%' }}>
              {/* 1. MẬT KHẨU HIỆN TẠI */}
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Nhập mật khẩu hiện tại</InputLabel>
                <OutlinedInput
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton edge="end" onClick={() => setShowCurrent(!showCurrent)}>
                        {showCurrent ? <IconEyeOff /> : <IconEye />}
                      </IconButton>
                    </InputAdornment>
                  }
                  label="Nhập mật khẩu hiện tại"
                  disabled={loading}
                />
              </FormControl>

              {/* 2. MẬT KHẨU MỚI + STRENGTH */}
              <Box sx={{ position: 'relative', mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Nhập mật khẩu mới</InputLabel>
                  <OutlinedInput
                    type={showNew ? 'text' : 'password'}
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton edge="end" onClick={() => setShowNew(!showNew)}>
                          {showNew ? <IconEyeOff /> : <IconEye />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Nhập mật khẩu mới"
                    disabled={loading}
                  />
                </FormControl>

                <Box
                  sx={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    mt: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    pr: 1
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Độ mạnh mật khẩu:
                  </Typography>
                  <Typography variant="caption" fontWeight={700} color={strength.color} sx={{ fontSize: '0.8rem' }}>
                    {strength.label || '—'}
                  </Typography>
                </Box>
              </Box>

              {/* 3. NHẬP LẠI + ICON KHỚP */}
              <Box sx={{ position: 'relative', mb: 2 }}>
                <FormControl fullWidth>
                  <InputLabel>Nhập lại mật khẩu mới</InputLabel>
                  <OutlinedInput
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPass}
                    onChange={(e) => setConfirmPass(e.target.value)}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton edge="end" onClick={() => setShowConfirm(!showConfirm)}>
                          {showConfirm ? <IconEyeOff /> : <IconEye />}
                        </IconButton>
                      </InputAdornment>
                    }
                    label="Nhập lại mật khẩu mới"
                    disabled={loading}
                  />
                </FormControl>

                {isNotEmpty && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      mt: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      pr: 1
                    }}
                  >
                    {isMatch ? (
                      <IconCircleCheck size={18} style={{ color: '#4caf50' }} />
                    ) : (
                      <IconCircleX size={18} style={{ color: '#f44336' }} />
                    )}
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color={isMatch ? 'success.main' : 'error.main'}
                      sx={{ fontSize: '0.8rem' }}
                    >
                      {isMatch ? 'Khớp' : 'Không khớp'}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, pt: 1 }}>
                <IconLock size={18} color="#888" style={{ marginTop: 2 }} />
                <Typography variant="caption" color="text.secondary">
                  Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&).
                </Typography>
              </Box>
            </Grid>
          </MainCard>
        </Grid>
      </Grid>

      {/* Snackbar thông báo */}
      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          icon={snackbarSeverity === 'success' ? <IconCircleCheck /> : <IconCircleX />}
          sx={{
            width: '100%',
            fontWeight: 600,
            boxShadow: 6,
            borderRadius: 2,
            fontSize: '1rem',
            bgcolor: snackbarSeverity === 'success' ? '#4caf50' : '#f44336',
            color: 'white'
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
