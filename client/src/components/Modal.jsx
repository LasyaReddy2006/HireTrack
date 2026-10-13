import React, { useEffect } from 'react';

/**
 * Reusable Accessible Modal Dialog
 */
export default function Modal({ isOpen, onClose, title, children, footer }) {
  // Close modal when Escape key is pressed
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button 
            type="button" 
            className="btn-icon" 
            onClick={onClose}
            aria-label="Close dialog"
            style={{ fontSize: '1.2rem', lineHeight: 1 }}
          >
            &times;
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
        {footer && (
          <div className="modal-footer">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
