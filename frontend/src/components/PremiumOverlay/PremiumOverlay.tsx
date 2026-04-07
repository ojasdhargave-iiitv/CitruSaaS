import React from 'react';
import '../CreateProjectModal/CreateProjectModal.css';

interface PremiumOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSubscribe: () => void;
}

const PremiumOverlay: React.FC<PremiumOverlayProps> = ({ isOpen, onClose, onSubscribe }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <h2 className="modal-title">Premium Access Required</h2>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="modal-content" style={{ textAlign: 'center', padding: '32px 16px' }}>
                    <div style={{ marginBottom: '24px' }}>
                        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto' }}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                    </div>
                    <h3 style={{ color: '#fff', fontSize: '20px', marginBottom: '12px' }}>Unlock Premium Frameworks</h3>
                    <p style={{ color: '#a0a0a0', fontSize: '14px', lineHeight: '1.5', marginBottom: '24px' }}>
                        To access this framework and other advanced features, please buy the subscription.
                    </p>
                    <button 
                        onClick={() => {
                            onClose();
                            onSubscribe();
                        }}
                        style={{
                            backgroundColor: '#22c55e',
                            color: '#000',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '12px 24px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            gap: '8px',
                            transition: 'background-color 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Get Subscription
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PremiumOverlay;
