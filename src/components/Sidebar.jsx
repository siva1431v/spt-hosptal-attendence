import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, Calculator, Building2, LogOut } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

export default function Sidebar() {
    const { user, logout } = useAppContext();
    const navigate = useNavigate();

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/staff', icon: Users, label: 'Staff Directory' },
        { to: '/attendance', icon: CalendarCheck, label: 'Attendance' },
        { to: '/salary', icon: Calculator, label: 'Salary Calculator' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <aside className="app-sidebar" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div className="sidebar-header" style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                    <Building2 size={24} />
                </div>
                <div>
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>SPT Hospital</h2>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Operations Portal</p>
                </div>
            </div>

            <nav className="sidebar-nav" style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            color: isActive ? 'var(--primary)' : 'var(--text-main)',
                            backgroundColor: isActive ? 'var(--primary-light)' : 'transparent',
                            fontWeight: isActive ? 600 : 500,
                            transition: 'all 0.2s',
                        })}
                    >
                        <item.icon size={20} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>

            {/* User Info + Logout */}
            <div style={{ borderTop: '1px solid var(--border-color)', padding: '1rem' }}>
                {user && (
                    <div style={{ padding: '0.75rem 1rem', marginBottom: '0.5rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-color)' }}>
                        <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-main)', textTransform: 'capitalize' }}>{user.name}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        width: '100%', padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-sm)', border: 'none',
                        color: 'hsl(0, 80%, 50%)', backgroundColor: 'transparent',
                        fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                        fontSize: '0.9375rem', fontFamily: 'inherit'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'hsl(0, 80%, 97%)'; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
}
