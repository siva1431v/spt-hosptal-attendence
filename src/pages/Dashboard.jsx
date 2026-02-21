import React from 'react';
import { useAppContext } from '../context/AppContext';
import { Users, CalendarCheck, DollarSign, Activity } from 'lucide-react';

export default function Dashboard() {
    const { staff, attendance } = useAppContext();
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance[today] || {};

    const presentCount = Object.values(todayAttendance).filter(status => status === 'Present').length;
    const halfDayCount = Object.values(todayAttendance).filter(status => status === 'Half-day').length;
    const absentCount = staff.length - presentCount - halfDayCount;

    const stats = [
        { title: 'Total Staff', value: staff.length, icon: Users, color: 'var(--primary)', bgColor: 'var(--primary-light)' },
        { title: 'Present Today', value: presentCount, icon: CalendarCheck, color: 'var(--success)', bgColor: 'var(--success-bg)' },
        { title: 'Half-day', value: halfDayCount, icon: Activity, color: 'var(--warning)', bgColor: 'var(--warning-bg)' },
        { title: 'Absent', value: absentCount, icon: Activity, color: 'var(--danger)', bgColor: 'var(--danger-bg)' },
    ];

    return (
        <div>
            <h1 style={{ marginBottom: '1.5rem' }}>Dashboard Overview</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                {stats.map((stat, idx) => (
                    <div key={idx} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ padding: '1rem', borderRadius: '50%', backgroundColor: stat.bgColor, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>{stat.title}</p>
                            <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card">
                <h3 style={{ marginBottom: '1rem' }}>Today's Quick Summary</h3>
                <p style={{ color: 'var(--text-muted)' }}>
                    Welcome to the SPT Hospital Operations Portal. To manage the operations efficiently, ensure daily attendance is tracked accurately. The salary calculator will automatically process payouts based on the logged days and the staff's base daily rate.
                </p>
            </div>
        </div>
    );
}
