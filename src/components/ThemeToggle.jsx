import { IconButton } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';

export default function ThemeToggle({ darkMode, toggleTheme }) {
  //Get the current theme 
  const theme = useTheme();
  return (
    //IconButton
    //change button based on the current theme
    <IconButton onClick={toggleTheme} color="inherit">
      {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
}