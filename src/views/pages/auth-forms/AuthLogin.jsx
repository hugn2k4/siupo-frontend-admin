import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
// import { useNavigate } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import { useTheme } from '@mui/material/styles';

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import authService from 'services/authService';

import { useSnackbar } from 'contexts/SnackbarProvider';
import { useGlobal } from 'hooks/useGlobal';
import { useNavigate } from 'react-router-dom';

// Auth login form using react-hook-form + MUI FormControl + Controller
export default function AuthLogin() {
  const theme = useTheme();
  const navigate = useNavigate();

  const { control, handleSubmit } = useForm({ defaultValues: { email: '', password: '', role: 'admin' } });

  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((s) => !s);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const { setGlobal } = useGlobal();
  const { showSnackbar } = useSnackbar();

  const onSubmit = async (data) => {
    try {
      const res = await authService.login(data);
      if (res.success) {
        setGlobal({ isLogin: true, user: res.data?.user || null, accessToken: res.data?.accessToken || null });
        showSnackbar({ message: 'Signed in successfully', severity: 'success' });
        navigate('/');
      } else {
        showSnackbar({ message: res.message || 'Login failed', severity: 'error' });
      }
    } catch (error) {
      showSnackbar({ message: error?.message || 'Login failed', severity: 'error' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        rules={{
          required: 'Email is required',
          pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Enter a valid email address' }
        }}
        render={({ field, fieldState: { error } }) => (
          <FormControl fullWidth error={!!error} sx={{ ...theme.typography.customInput, '& .MuiOutlinedInput-root': { minHeight: 56 } }}>
            <InputLabel htmlFor="outlined-adornment-email-login">Email Address</InputLabel>
            <OutlinedInput id="outlined-adornment-email-login" type="email" {...field} error={!!error} />
            {error && <FormHelperText error>{error.message}</FormHelperText>}
          </FormControl>
        )}
      />

      <Controller
        name="password"
        control={control}
        rules={{ required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } }}
        render={({ field, fieldState: { error } }) => (
          <FormControl
            fullWidth
            error={!!error}
            sx={{
              ...theme.typography.customInput,
              '& .MuiOutlinedInput-root': { minHeight: 56 },
              mt: 2
            }}
          >
            <InputLabel htmlFor="outlined-adornment-password-login">Password</InputLabel>
            <OutlinedInput
              id="outlined-adornment-password-login"
              type={showPassword ? 'text' : 'password'}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    edge="end"
                    size="medium"
                  >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              }
              label="Password"
              {...field}
              error={!!error}
            />
            {error && <FormHelperText error>{error.message}</FormHelperText>}
          </FormControl>
        )}
      />

      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <FormControl
            fullWidth
            sx={{
              ...theme.typography.customInput,
              '& .MuiOutlinedInput-root': { minHeight: 63, display: 'flex', alignItems: 'end' },
              mt: 2
            }}
          >
            <InputLabel id="role-select-label">Role</InputLabel>
            {/* pass label so the outline reserves space and the label floats correctly */}
            <Select labelId="role-select-label" id="role-select" label="Role" size="medium" {...field}>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        )}
      />

      <Box sx={{ mt: 3 }}>
        <AnimateButton>
          <Button color="secondary" fullWidth size="large" type="submit" variant="contained">
            Sign In
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
