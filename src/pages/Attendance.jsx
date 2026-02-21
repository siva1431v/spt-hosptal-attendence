import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function Attendance() {
    const { staff, attendance, markAttendance } = useAppContext();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const activeStaff = staff.filter(s => s.status === 'Active');
    const dayData = attendance[selectedDate] || {};

    const handleDateChange = (days) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + days);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Present': return <CheckCircle2 size={18} color="var(--success)" />;
            case 'Absent': return <XCircle size={18} color="var(--danger)" />;
            case 'Half-day': return <Clock size={18} color="var(--warning)" />;
            default: return <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px dashed var(--border-color)' }} />;
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>Daily Attendance</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface-color)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                    <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} onClick={() => handleDateChange(-1)}>
                        <ChevronLeft size={20} />
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 0.5rem', fontWeight: 600 }}>
                        <Calendar size={18} color="var(--primary)" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '1rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}
                        />
                    </div>
                    <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} onClick={() => handleDateChange(1)}>
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Staff Member</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Role</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Current Status</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Mark Attendance</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeStaff.length === 0 ? (
                            <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No active staff found.</td></tr>
                        ) : activeStaff.map((person) => (
                            <tr key={person.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                        {person.name.charAt(0)}
                                    </div>
                                    <span style={{ fontWeight: 500 }}>{person.name}</span>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{person.role}</td>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {getStatusIcon(dayData[person.id])}
                                        <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{dayData[person.id] || 'Unmarked'}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <div style={{ display: 'inline-flex', gap: '0.25rem', backgroundColor: 'var(--bg-color)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
                                        <button
                                            onClick={() => markAttendance(selectedDate, person.id, 'Present')}
                                            style={{
                                                padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                                backgroundColor: dayData[person.id] === 'Present' ? 'var(--success-bg)' : 'transparent',
                                                color: dayData[person.id] === 'Present' ? 'var(--success)' : 'var(--text-muted)'
                                            }}
                                        >
                                            Present
                                        </button>
                                        <button
                                            onClick={() => markAttendance(selectedDate, person.id, 'Half-day')}
                                            style={{
                                                padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                                backgroundColor: dayData[person.id] === 'Half-day' ? 'var(--warning-bg)' : 'transparent',
                                                color: dayData[person.id] === 'Half-day' ? 'var(--warning)' : 'var(--text-muted)'
                                            }}
                                        >
                                            Half-day
                                        </button>
                                        <button
                                            onClick={() => markAttendance(selectedDate, person.id, 'Absent')}
                                            style={{
                                                padding: '0.35rem 0.75rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                                                backgroundColor: dayData[person.id] === 'Absent' ? 'var(--danger-bg)' : 'transparent',
                                                color: dayData[person.id] === 'Absent' ? 'var(--danger)' : 'var(--text-muted)'
                                            }}
                                        >
                                            Absent
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
