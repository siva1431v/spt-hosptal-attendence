import React from 'react';
import { Bell, UserCircle } from 'lucide-react';

export default function Topbar() {
    const [currentTime, setCurrentTime] = React.useState(new Date());

    React.useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="app-header">
            <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0, fontWeight: 500 }}>
                    {currentTime.toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn btn-outline" style={{ padding: '0.5rem', borderRadius: '50%' }}>
                    <Bell size={20} />
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)' }}>
                    <UserCircle size={28} color="var(--primary)" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Admin User</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hospital Admin</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
