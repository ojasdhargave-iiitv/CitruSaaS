import React, { useState, useEffect } from 'react';
import './AuthModal.css';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'signup';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'login' }) => {
    const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Sync mode whenever the modal is opened with a different initialMode
    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setError('');
            setSuccess('');
        }
    }, [isOpen, initialMode]);

    if (!isOpen) return null;

    const resetForm = () => {
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
    };

    const switchMode = (newMode: 'login' | 'signup') => {
        resetForm();
        setMode(newMode);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const res = await api.post('/users/login', { email, password });
            const token = res.data.token;
            console.log('[Login Success] JWT:', token);
            localStorage.setItem('token', token);
            onClose();
            navigate('/');
        } catch (err: any) {
            console.error('[Login Error]', err);
            setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        setLoading(true);
        try {
            const res = await api.post('/users/signup', { username, email, password });

            // Store the JWT returned from signup
            const token = res.data.token;
            if (token) {
                console.log('[Signup Success] JWT:', token);
                localStorage.setItem('token', token);
            }

            resetForm();
            // Show success message then slide to login
            setSuccess(`Account created! Please sign in, ${username}.`);
            setTimeout(() => {
                setSuccess('');
                setMode('login');
            }, 1800);
        } catch (err: any) {
            console.error('[Signup Error]', err);
            setError(err.response?.data?.error || 'Could not create account. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-backdrop" onClick={onClose}>
            <div className="auth-container" onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="auth-header">
                    <div>
                        <h2 className="auth-title">
                            {mode === 'login' ? 'Welcome back' : 'Create account'}
                        </h2>
                        <p className="auth-subtitle">
                            {mode === 'login'
                                ? 'Sign in to your CitruSaaS account'
                                : 'Join CitruSaaS and start building'}
                        </p>
                    </div>

                </div>

                {/* Body */}
                <form onSubmit={mode === 'login' ? handleLogin : handleSignup}>
                    <div className="auth-body">
                        {error && <div className="auth-error">{error}</div>}
                        {success && (
                            <div className="auth-success">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                {success}
                            </div>
                        )}

                        {/* Email — shown in both modes */}
                        <div className="auth-form-group">
                            <label className="auth-label" htmlFor="auth-email">Email</label>
                            <input
                                id="auth-email"
                                className="auth-input"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        {/* Username — only shown on signup */}
                        {mode === 'signup' && (
                            <div className="auth-form-group">
                                <label className="auth-label" htmlFor="auth-username">Username</label>
                                <input
                                    id="auth-username"
                                    className="auth-input"
                                    type="text"
                                    placeholder="johndoe"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    autoComplete="username"
                                />
                            </div>
                        )}

                        <div className="auth-form-group">
                            <label className="auth-label" htmlFor="auth-password">Password</label>
                            <input
                                id="auth-password"
                                className="auth-input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                            />
                            {mode === 'signup' && (
                                <p className="auth-hint">Must be at least 6 characters long.</p>
                            )}
                        </div>

                        {mode === 'signup' && (
                            <div className="auth-form-group">
                                <label className="auth-label" htmlFor="auth-confirm">Confirm Password</label>
                                <input
                                    id="auth-confirm"
                                    className="auth-input"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    autoComplete="new-password"
                                />
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="auth-footer">
                        <button type="submit" className="auth-submit-btn" disabled={loading}>
                            {loading ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                </svg>
                            ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            )}
                            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>

                        <p className="auth-switch">
                            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                            <button
                                type="button"
                                className="auth-switch-link"
                                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                            >
                                {mode === 'login' ? 'Sign Up' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthModal;
