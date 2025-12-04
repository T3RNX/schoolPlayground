'use client';

import { useEffect } from 'react';

export function SuppressDarkReaderWarnings() {
  useEffect(() => {
    // This will run only on the client-side
    // Suppress hydration warnings from attributes added by Dark Reader extension
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Filter out specific hydration warnings related to Dark Reader
      const suppressedWarnings = [
        'Warning: Extra attributes from the server: data-darkreader-inline-stroke',
        'Warning: Extra attributes from the server: style',
        'Warning: Received "true" for a non-boolean attribute',
        'Warning: React does not recognize the',
        'A tree hydrated but some attributes of the server rendered HTML didn\'t match',
        'Hydration failed because the initial UI does not match what was rendered on the server',
        '--darkreader-inline-stroke'
      ];
      
      if (!args[0] || typeof args[0] !== 'string' || 
          !suppressedWarnings.some(warning => args[0].includes(warning))) {
        originalConsoleError(...args);
      }
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  return null;
}