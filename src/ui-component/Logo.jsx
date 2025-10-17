import { useTheme } from '@mui/material/styles';
import logoLight from 'assets/images/image_logo_dark_background.png';
import logoDark from 'assets/images/image_logo_light_background.png';

export default function Logo() {
  const theme = useTheme();

  return <img src={theme.palette.mode === 'dark' ? logoDark : logoLight} alt="Siupo" width="150" />;
}
