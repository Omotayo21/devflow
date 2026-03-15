import React from 'react';
import { Toaster as HotToaster } from 'react-hot-toast';

export const Toaster: React.FC = () => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#111111',
          color: '#f4f4f5',
          border: '1px solid #1a1a1a',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
        },
        success: {
          iconTheme: {
            primary: '#8b5cf6',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }}
    />
  );
};
