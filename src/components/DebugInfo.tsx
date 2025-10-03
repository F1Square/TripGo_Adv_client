import React from 'react';

const DebugInfo = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'black', 
      color: 'white', 
      padding: '10px', 
      fontSize: '12px',
      zIndex: 9999,
      borderRadius: '4px'
    }}>
      <div>VITE_GOOGLE_CLIENT_ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID || 'NOT SET'}</div>
      <div>ENV MODE: {import.meta.env.MODE}</div>
    </div>
  );
};

export default DebugInfo;