// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        pt: 3,
        mt: 'auto'
      }}
    >
      <Typography variant="caption" color="text.secondary">
        © {year} Siupo Restaurant Admin
      </Typography>
    </Stack>
  );
}
