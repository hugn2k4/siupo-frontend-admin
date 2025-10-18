// material-ui
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// ==============================|| FOOTER - AUTHENTICATION 2 & 3 ||============================== //

export default function AuthFooter() {
  return (
    <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
      <Typography variant="subtitle2" component={Link} href="https://siupo-restaurant.com" target="_blank" underline="hover">
        siupo-restaurant.com
      </Typography>
      <Typography variant="subtitle2" component={Link} href="https://siupo-restaurant.com" target="_blank" underline="hover">
        &copy; {new Date().getFullYear()} Siupo Restaurant
      </Typography>
    </Stack>
  );
}
