import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import { API_BASE_URL } from '../services/api';
import './Home.css';
import './Profile.css';

const Profile: React.FC = () => {
    const [userId, setUserId] = useState<string>('');
    const [isPremium, setIsPremium] = useState<boolean>(false);

    useEffect(() => {
        const storedUserId = localStorage.getItem('userId') || 'Guest';
        const storedPremium = localStorage.getItem('isPremium') === 'true';

        setUserId(storedUserId);
        setIsPremium(storedPremium);
    }, []);

    const handleCancelSubscription = async () => {
        const currentUserId = localStorage.getItem('userId');
        if (!currentUserId) return;
        
        try {
            const response = await fetch(`${API_BASE_URL}/users/premium/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUserId })
            });
            if (response.ok) {
                localStorage.setItem('isPremium', 'false');
                setIsPremium(false);
            }
        } catch (error) {
            console.error("Failed to cancel subscription", error);
        }
    };

    return (
        <div className="home-container">
            <Sidebar />

            <main className="main-content">
                <div className="profile-wrapper">
                    <h1 className="hero-title">Profile <span className="highlight-green">Overview</span></h1>
                    
                    <div className="profile-card">
                        <div className="profile-header">
                            <div className="profile-avatar">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            </div>
                            <div className="profile-info">
                                <h2>{userId !== 'Guest' ? `User: ${userId}` : 'Guest User'}</h2>
                                <p className="status-badge">
                                    {isPremium ? (
                                        <span className="premium-status">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none" style={{marginRight: 4}}>
                                                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                                            </svg>
                                            Premium Member
                                        </span>
                                    ) : (
                                        <span className="free-status">Free Tier</span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="profile-details">
                            <h3>Subscription Status</h3>
                            {isPremium ? (
                                <div>
                                    <p className="detail-text" style={{marginBottom: '16px'}}>You have full access to all premium frameworks and features.</p>
                                    <button 
                                        className="btn btn-ghost" 
                                        onClick={handleCancelSubscription} 
                                        style={{backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', fontWeight: 'bold', display: 'inline-flex', border: 'none'}}
                                    >
                                        Cancel Subscription
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <p className="detail-text" style={{marginBottom: '16px'}}>You are currently on the free tier. Upgrade to access premium frameworks.</p>
                                    <button className="btn-create" onClick={() => window.location.href='/'} style={{display: 'inline-flex'}}>
                                        Browse Premium Options on Home
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
