import React from 'react';

export default function Alert({ type = 'info', message, onClose }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button 
          onClick={onClose} 
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'inherit' }}
        >
          &times;
        </button>
      )}
    </div>
  );
}
