import React, { useState, useEffect, createContext } from 'react';

export const KeyboardNavContext = createContext();

export const KeyboardNavigationProvider = ({ children }) => {
  const [navEnabled, setNavEnabled] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [customNavHandler, setCustomNavHandler] = useState(null);

  const registerCustomHandler = (handler) => {
    setCustomNavHandler(() => handler);
  };

  useEffect(() => {
    if (!navEnabled) return;

    // get all relevant focusable elements on the page
    const getFocusableElements = () => {
      return Array.from(document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"]), [role="button"], [data-course-id]'
      )).filter(el => {
        return !el.disabled && 
               el.offsetParent !== null && 
               (el.tabIndex >= 0 || el.hasAttribute('onclick') || el.hasAttribute('data-course-id'));
      });
    };

    // Main keydown event handler
    const handleKeyDown = (e) => {
      if (customNavHandler && customNavHandler(e)) {
        return;
      }

      // handle specific navigation keys
      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      if (['ArrowRight', 'ArrowLeft', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();

        switch (e.key) {
          case 'ArrowRight':
            setCurrentIndex(prev => (prev + 1) % focusableElements.length);
            break;
          case 'ArrowLeft':
            setCurrentIndex(prev => (prev - 1 + focusableElements.length) % focusableElements.length);
            break;
          case 'Enter':
            focusableElements[currentIndex]?.click();
            break;
          case 'Escape':
            break;
          default:
            break;
        }
      }
    };
    
    // Automatically focus the current element when it updates
    const handleFocus = () => {
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0 && currentIndex < focusableElements.length) {
        focusableElements[currentIndex]?.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('focus', handleFocus, true);

    // Initial focus
    handleFocus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('focus', handleFocus, true);
    };
  }, [navEnabled, currentIndex, customNavHandler]);

  return (
    <KeyboardNavContext.Provider value={{ 
      navEnabled, 
      setNavEnabled,
      currentIndex,
      setCurrentIndex,
      registerCustomHandler
    }}>
      {children}
    </KeyboardNavContext.Provider>
  );
};