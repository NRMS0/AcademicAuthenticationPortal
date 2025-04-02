import React, { useEffect, useRef, useState } from 'react';
import { Box, keyframes, Slider, Typography, IconButton, Popover } from '@mui/material';
import { useTheme } from '../contexts/ThemeContext';
import PaletteIcon from '@mui/icons-material/Palette'; 

const EmojiBackground = () => {
  const containerRef = useRef(null);
  // Define emojis to be displayed and grid size can be changed as per website requirements
  const emojis = ['️💭', '🎒', '👨‍🎓', '🏫', '📖','🧠','✍️','✏️','📐'];
  const gridSize = 20;
  const theme = useTheme();
  
  // Load saved opacity from localStorage or default to 1 (max visibility)
  const [emojiOpacity, setEmojiOpacity] = useState(() => {
    const savedOpacity = localStorage.getItem('emojiOpacity');
    // Default to max visibility
    return savedOpacity ? parseFloat(savedOpacity) : 1.0; 
  });
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // Define animations
  const scrollAnimation = keyframes`
    0% { transform: translate(0, 0); }
    100% { transform: translate(-50%, -50%); }
  `;

  const pulseKeyframes = `
    @keyframes pulse {
      0%, 100% { 
        transform: rotate(30deg) scale(0.9); 
      }
      50% { 
        transform: rotate(30deg) scale(1.2); 
      }
    }
  `;

  // Define color schemes for light and dark modes
  const colorSchemes = {
    light: [
      'linear-gradient(45deg, #FF7E5F, #FEB47B)',
      'linear-gradient(45deg, #4FACFE, #00F2FE)',
      'linear-gradient(45deg, #FF61D2, #FE9090)',
      'linear-gradient(45deg, #BFF098, #6FD6FF)',
      'linear-gradient(45deg, #FEE140, #FA709A)'
    ],
    dark: [
      'linear-gradient(45deg, #9D50BB, #6E48AA)',
      'linear-gradient(45deg, #4776E6, #8E54E9)',
      'linear-gradient(45deg, #A71D31, #3F0D12)',
      'linear-gradient(45deg, #1A2980, #26D0CE)',
      'linear-gradient(45deg, #614385, #516395)'
    ]
  };

  useEffect(() => {
    // Save opacity to localStorage whenever it changes
    localStorage.setItem('emojiOpacity', emojiOpacity.toString());

    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = '';

    // Inject the pulse animation
    const style = document.createElement('style');
    style.innerHTML = pulseKeyframes;
    document.head.appendChild(style);

    const colors = colorSchemes[theme.palette.mode];

    for (let i = 0; i < gridSize * gridSize; i++) {
      const emoji = document.createElement('div');
      
      Object.assign(emoji.style, {
        background: colors[Math.floor(Math.random() * colors.length)],
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: emojiOpacity, 
        transform: 'rotate(30deg)',
        fontSize: `${50 + Math.random() * 70}px`,
        animation: `pulse 6s ease-in-out infinite ${Math.random() * 10}s`,
        willChange: 'transform',
        filter: 'saturate(1.5) brightness(1.1)'
      });
      
      emoji.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      container.appendChild(emoji);
    }

    return () => {
      document.head.removeChild(style);
    };
  }, [theme.palette.mode, emojiOpacity]);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOpacityChange = (event, newValue) => {
    setEmojiOpacity(newValue);
  };

  return (
    <>
      {/* Emoji Background */}
      <Box sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '200%',
        height: '200%',
        zIndex: 0,
        animation: `${scrollAnimation} 120s linear infinite`,
        willChange: 'transform',
        overflow: 'hidden'
      }}>
        <Box ref={containerRef} sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
          gap: '30px',
          width: '100%',
          height: '100%',
          padding: '40px'
        }} />
      </Box>

      {/* Palette Button*/}
      <IconButton
        onClick={handleClick}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.7)' : 'rgba(255, 255, 255, 0.2)',
          color: theme.palette.mode === 'dark' ? '#6a11cb' : '#2575fc',
          '&:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(30,30,30,0.9)' : 'rgba(255,255,255,0.9)'
          },
          border: `1px solid ${theme.palette.mode === 'dark' ? '#6a11cb' : '#2575fc'}`,
          borderRadius: '50%',
          padding: '12px'
        }}
      >
        <PaletteIcon fontSize="medium" />
      </IconButton>

      {/* Popover Controls */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        disableScrollLock={true} 
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.mode === 'dark' ? '#6a11cb' : '#2575fc'}`,
            borderRadius: '12px',
            overflow: 'visible',
            padding: '16px',
            marginRight: '8px',
            maxWidth: 'calc(100vw - 32px)',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
        slotProps={{
          root: {
            sx: {
              '&::before': {
                content: '""',
                display: 'block',
                width: '16px',
                height: '100%',
                position: 'fixed',
                right: 0,
                top: 0,
                backgroundColor: 'transparent'
              }
            }
          }
        }}
      >
        <Box sx={{ p: 2, width: 300 }}>
          <Typography variant="body1" gutterBottom sx={{ color: theme.palette.text.primary }}>
            Background Intensity
          </Typography>
          <Slider
            value={emojiOpacity}
            onChange={handleOpacityChange}
            min={0.1}
            max={1}
            step={0.05}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${Math.round(value * 100)}%`}
            sx={{
              color: theme.palette.mode === 'dark' ? '#6a11cb' : '#2575fc',
              '& .MuiSlider-thumb': {
                width: 15,
                height: 15,
              }
            }}
          />
        </Box>
      </Popover>
    </>
  );
};

export default EmojiBackground;