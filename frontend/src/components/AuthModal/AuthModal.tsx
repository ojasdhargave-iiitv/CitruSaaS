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

    useEffect(() => {
        if (isOpen) {
            setMode(initialMode);
            resetForm();
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
            if (res.data.user?.id) {
                localStorage.setItem('userId', res.data.user.id);
            }
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
            const token = res.data.token;
            if (token) {
                console.log('[Signup Success] JWT:', token);
                localStorage.setItem('token', token);
                if (res.data.user?.id) {
                    localStorage.setItem('userId', res.data.user.id);
                }
            }
            resetForm();
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

                        <div className="auth-form-group">
                            <label className="auth-label">Email</label>
                            <input
                                className="auth-input"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {mode === 'signup' && (
                            <div className="auth-form-group">
                                <label className="auth-label">Username</label>
                                <input
                                    className="auth-input"
                                    type="text"
                                    placeholder="johndoe"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        )}

                        <div className="auth-form-group">
                            <label className="auth-label">Password</label>
                            <input
                                className="auth-input"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            {mode === 'signup' && (
                                <p className="auth-hint">Must be at least 6 characters long.</p>
                            )}
                        </div>

                        {mode === 'signup' && (
                            <div className="auth-form-group">
                                <label className="auth-label">Confirm Password</label>
                                <input
                                    className="auth-input"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <div className="auth-footer">
                        <button type="submit" className="auth-submit-btn" disabled={loading}>
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
