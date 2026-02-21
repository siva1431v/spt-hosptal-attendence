import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const { login, signInWithGoogle } = useAppContext();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!email || !password) {
            setError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, hsl(210, 90%, 10%) 0%, hsl(210, 80%, 20%) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            fontFamily: "'Inter', -apple-system, sans-serif"
        }}>
            <div style={{
                width: '100%',
                maxWidth: '420px',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem'
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '0.5rem'
                    }}>
                        <div style={{
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            padding: '0.75rem',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)'
                        }}>
                            <Building2 size={28} color="white" />
                        </div>
                        <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>SPT Hospital</h1>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Operations Portal — Staff Management</p>
                </div>

                {/* Card */}
                <div style={{
                    backgroundColor: 'white',
                    borderRadius: '20px',
                    padding: '2.5rem',
                    boxShadow: '0 24px 48px rgba(0,0,0,0.3)'
                }}>
                    <h2 style={{ marginBottom: '0.5rem', fontSize: '1.375rem' }}>Welcome Back</h2>
                    <p style={{ color: 'hsl(210, 15%, 45%)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>Sign in to your account to continue</p>

                    {error && (
                        <div style={{
                            backgroundColor: 'hsl(0, 80%, 95%)', color: 'hsl(0, 80%, 40%)',
                            border: '1px solid hsl(0, 80%, 85%)', borderRadius: '8px',
                            padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Google Sign-In */}
                    <button
                        type="button"
                        disabled={googleLoading || loading}
                        onClick={async () => {
                            setGoogleLoading(true);
                            try { await signInWithGoogle(); }
                            catch (err) { setError(err.message); setGoogleLoading(false); }
                        }}
                        style={{
                            width: '100%', padding: '0.75rem 1rem',
                            background: 'white', color: '#3c4043',
                            border: '1px solid #dadce0', borderRadius: '8px',
                            fontSize: '0.9375rem', fontWeight: 500, cursor: googleLoading ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                            fontFamily: 'inherit', marginBottom: '0.5rem',
                            opacity: googleLoading ? 0.7 : 1,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 48 48">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                        </svg>
                        {googleLoading ? 'Redirecting...' : 'Continue with Google'}
                    </button>

                    {/* Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', margin: '0.25rem 0' }}>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'hsl(210, 30%, 88%)' }} />
                        <span style={{ color: 'hsl(210, 15%, 55%)', fontSize: '0.8rem' }}>or sign in with email</span>
                        <div style={{ flex: 1, height: '1px', backgroundColor: 'hsl(210, 30%, 88%)' }} />
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(210, 15%, 45%)' }} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="admin@spt.com"
                                    style={{
                                        width: '100%', padding: '0.75rem 0.875rem 0.75rem 2.5rem',
                                        border: '1px solid hsl(210, 30%, 88%)', borderRadius: '8px',
                                        fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
                                        fontFamily: 'inherit', color: 'hsl(210, 30%, 15%)'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'hsl(210, 90%, 55%)'}
                                    onBlur={e => e.target.style.borderColor = 'hsl(210, 30%, 88%)'}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(210, 15%, 45%)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    style={{
                                        width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem',
                                        border: '1px solid hsl(210, 30%, 88%)', borderRadius: '8px',
                                        fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
                                        fontFamily: 'inherit', color: 'hsl(210, 30%, 15%)'
                                    }}
                                    onFocus={e => e.target.style.borderColor = 'hsl(210, 90%, 55%)'}
                                    onBlur={e => e.target.style.borderColor = 'hsl(210, 30%, 88%)'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(p => !p)}
                                    style={{
                                        position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)',
                                        background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(210, 15%, 45%)', padding: 0
                                    }}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%', padding: '0.875rem',
                                background: 'linear-gradient(135deg, hsl(210, 90%, 55%), hsl(210, 90%, 45%))',
                                color: 'white', border: 'none', borderRadius: '8px',
                                fontSize: '0.9375rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                transition: 'opacity 0.2s', fontFamily: 'inherit', marginTop: '0.25rem',
                                opacity: loading ? 0.7 : 1
                            }}
                        >
                            <LogIn size={18} />
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'hsl(210, 15%, 45%)' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{ color: 'hsl(210, 90%, 55%)', fontWeight: 600 }}>Sign Up</Link>
                    </p>
                </div>

                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                    © 2026 SPT Hospital. All rights reserved.
                </p>
            </div>
        </div>
    );
}
