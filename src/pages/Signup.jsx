import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { signup } = useAppContext();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!name || !email || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        const success = signup(name, email, password);
        if (success) {
            navigate('/');
        } else {
            setError('Could not create account. Please try again.');
        }
    };

    const inputStyle = {
        width: '100%', padding: '0.75rem 0.875rem 0.75rem 2.5rem',
        border: '1px solid hsl(210, 30%, 88%)', borderRadius: '8px',
        fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s',
        fontFamily: 'inherit', color: 'hsl(210, 30%, 15%)'
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
            <div style={{ width: '100%', maxWidth: '440px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Logo */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ backgroundColor: 'rgba(255,255,255,0.15)', padding: '0.75rem', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
                            <Building2 size={28} color="white" />
                        </div>
                        <h1 style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>SPT Hospital</h1>
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Operations Portal — Staff Management</p>
                </div>

                {/* Card */}
                <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 24px 48px rgba(0,0,0,0.3)' }}>
                    <h2 style={{ marginBottom: '0.5rem', fontSize: '1.375rem' }}>Create Account</h2>
                    <p style={{ color: 'hsl(210, 15%, 45%)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>Join SPT Hospital's operations portal</p>

                    {error && (
                        <div style={{
                            backgroundColor: 'hsl(0, 80%, 95%)', color: 'hsl(0, 80%, 40%)',
                            border: '1px solid hsl(0, 80%, 85%)', borderRadius: '8px',
                            padding: '0.75rem 1rem', marginBottom: '1.25rem', fontSize: '0.875rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(210, 15%, 45%)' }} />
                                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Dr. Jane Smith" style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = 'hsl(210, 90%, 55%)'}
                                    onBlur={e => e.target.style.borderColor = 'hsl(210, 30%, 88%)'}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(210, 15%, 45%)' }} />
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jane@spt.com" style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = 'hsl(210, 90%, 55%)'}
                                    onBlur={e => e.target.style.borderColor = 'hsl(210, 30%, 88%)'}
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(210, 15%, 45%)' }} />
                                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min. 6 characters"
                                    style={{ ...inputStyle, paddingRight: '2.5rem' }}
                                    onFocus={e => e.target.style.borderColor = 'hsl(210, 90%, 55%)'}
                                    onBlur={e => e.target.style.borderColor = 'hsl(210, 30%, 88%)'}
                                />
                                <button type="button" onClick={() => setShowPassword(p => !p)}
                                    style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(210, 15%, 45%)', padding: 0 }}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>Confirm Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(210, 15%, 45%)' }} />
                                <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••"
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = 'hsl(210, 90%, 55%)'}
                                    onBlur={e => e.target.style.borderColor = 'hsl(210, 30%, 88%)'}
                                />
                            </div>
                        </div>

                        <button type="submit"
                            style={{
                                width: '100%', padding: '0.875rem',
                                background: 'linear-gradient(135deg, hsl(210, 90%, 55%), hsl(210, 90%, 45%))',
                                color: 'white', border: 'none', borderRadius: '8px',
                                fontSize: '0.9375rem', fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                transition: 'opacity 0.2s', fontFamily: 'inherit', marginTop: '0.25rem'
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                            <UserPlus size={18} />
                            Create Account
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.875rem', color: 'hsl(210, 15%, 45%)' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: 'hsl(210, 90%, 55%)', fontWeight: 600 }}>Sign In</Link>
                    </p>
                </div>

                <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                    © 2026 SPT Hospital. All rights reserved.
                </p>
            </div>
        </div>
    );
}
