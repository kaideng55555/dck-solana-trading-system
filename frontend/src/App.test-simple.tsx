import React from 'react';

export default function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#0D1117', 
      color: '#00F5FF',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>
        ⚡ DCK$ TOOLS
      </h1>
      <p style={{ fontSize: '20px', opacity: 0.7 }}>
        Dashboard Loading Successfully!
      </p>
      <p style={{ fontSize: '14px', marginTop: '20px', color: '#FF41D6' }}>
        If you see this, React is working ✅
      </p>
    </div>
  );
}
