import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Check system preference
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Load user preferences from localStorage or use system defaults
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme !== null) return savedTheme === 'dark';
    return systemPrefersDark;
  });

  const [textSize, setTextSize] = useState(() => {
    const savedTextSize = localStorage.getItem('textSize');
    return savedTextSize || 'medium';
  });

  const [fontWeight, setFontWeight] = useState(() => {
    const savedFontWeight = localStorage.getItem('fontWeight');
    return savedFontWeight || 'small'; 
  });

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('textSize', textSize);
  }, [textSize]);

  useEffect(() => {
    localStorage.setItem('fontWeight', fontWeight);
  }, [fontWeight]);

  // Theme toggle
  const toggleTheme = () => setDarkMode(prev => !prev);

  // Text size controls (unused)
  const increaseTextSize = () => {
    setTextSize(prev => {
      if (prev === 'small') return 'medium';
      if (prev === 'medium') return 'large';
      return 'large';
    });
  };

  const decreaseTextSize = () => {
    setTextSize(prev => {
      if (prev === 'large') return 'medium';
      if (prev === 'medium') return 'small';
      return 'small';
    });
  };

  // Font weight controls
  const increaseFontWeight = () => {
    setFontWeight(prev => {
      if (prev === 'small') return 'medium';
      if (prev === 'medium') return 'large';
      return 'large';
    });
  };

  const decreaseFontWeight = () => {
    setFontWeight(prev => {
      if (prev === 'large') return 'medium';
      if (prev === 'medium') return 'small';
      return 'small';
    });
  };

  // Theme object
  const theme = {
    darkMode,
    textSize,
    fontWeight,
    toggleTheme,
    increaseTextSize,
    decreaseTextSize,
    increaseFontWeight,
    decreaseFontWeight,
    palette: {
      mode: darkMode ? 'dark' : 'light',
      background: {
        default: darkMode ? '#121212' : '#f5f7fa',
        paper: darkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: darkMode ? '#ffffff' : '#000000',
      },
    },
    textWeights: {
      small: 400,
      medium: 600,
      large: 800,
    },
    textSizeStyles: {
      small: { fontSize: '0.875rem' },
      medium: { fontSize: '1rem' },
      large: { fontSize: '1.25rem' },
    }
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);