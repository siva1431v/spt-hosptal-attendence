import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { Calculator, Download, ChevronLeft, ChevronRight, CalendarDays, Edit3, Printer, X, Save, Check } from 'lucide-react';

export default function SalaryCalculator() {
    const { staff } = useAppContext();

    // By default, start with the current month and year
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
    const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

    // Local state to store manual inputs per staff per month { "YYYY-MM": { staffId: { present: 0, leave: 0, offDuty: 0, collection: 0 } } }
    const [manualInputs, setManualInputs] = useState(() => {
        try {
            const saved = localStorage.getItem('hospital_salary_inputs');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Failed to parse saved inputs', e);
            return {};
        }
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSaveInputs = () => {
        try {
            localStorage.setItem('hospital_salary_inputs', JSON.stringify(manualInputs));
            setIsSaving(true);
            setTimeout(() => setIsSaving(false), 2000);
        } catch (e) {
            console.error('Failed to save inputs:', e);
            alert('Failed to save data. Storage might be full.');
        }
    };

    const handleExportPayroll = () => {
        const monthLabel = `${monthNames[selectedMonth]} ${selectedYear}`;

        // CSV Headers
        const headers = [
            'Staff Name',
            'Role',
            'Base Salary (₹)',
            'Present Days',
            'Half Days',
            'Paid Leaves',
            'Off Duty',
            'Payable Days',
            'Absent Days',
            'Daily Rate (₹)',
            'Absence Deduction (₹)',
            'Collection Adjustment (₹)',
            'Total Salary (₹)'
        ];

        const rows = salaryData.map(data => [
            data.name,
            data.role,
            data.baseSalary.toFixed(2),
            data.inputs.present || 0,
            data.inputs.halfDays || 0,
            data.paidLeaves,
            data.inputs.offDuty || 0,
            data.payableDays.toFixed(1),
            data.absentDays.toFixed(1),
            data.dailyRate.toFixed(2),
            data.absenceDeduction.toFixed(2),
            (data.inputs.collection || 0).toFixed(2),
            data.totalSalary.toFixed(2)
        ]);

        // Add totals row
        const totalRow = [
            'TOTAL', '', '',
            salaryData.reduce((s, d) => s + (d.inputs.present || 0), 0),
            salaryData.reduce((s, d) => s + (d.inputs.halfDays || 0), 0),
            '', '', '', '',
            '',
            salaryData.reduce((s, d) => s + d.absenceDeduction, 0).toFixed(2),
            salaryData.reduce((s, d) => s + (Number(d.inputs.collection) || 0), 0).toFixed(2),
            salaryData.reduce((s, d) => s + d.totalSalary, 0).toFixed(2)
        ];

        const csvContent = [
            [`SPT Hospital - Payroll Report - ${monthLabel}`],
            [],
            headers,
            ...rows,
            [],
            totalRow
        ].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `SPT_Payroll_${monthNames[selectedMonth]}_${selectedYear}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // State for viewing/printing a specific staff member's payslip
    const [selectedSlip, setSelectedSlip] = useState(null);

    const activeStaff = staff.filter(s => s.status === 'Active');

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    const handleMonthChange = (direction) => {
        let newMonth = selectedMonth + direction;
        let newYear = selectedYear;

        if (newMonth > 11) {
            newMonth = 0;
            newYear += 1;
        } else if (newMonth < 0) {
            newMonth = 11;
            newYear -= 1;
        }

        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    const getDaysInMonth = (month, year) => new Date(year, month + 1, 0).getDate();
    const daysInCurrentMonth = getDaysInMonth(selectedMonth, selectedYear);
    const monthKey = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;

    const handleInput = (staffId, field, value) => {
        let valToStore = value;

        // Allow typing negative signs for collection or empty strings
        if (value === '' || value === '-' || value.endsWith('.')) {
            valToStore = value;
        } else {
            // Revert back to parsing integers only to prevent decimal days
            const parsedValue = parseInt(value, 10);
            if (!isNaN(parsedValue)) {
                valToStore = field === 'collection' ? parseFloat(value) : Math.max(0, parsedValue);
            }
        }

        setManualInputs(prev => {
            const monthData = prev[monthKey] || {};
            const staffData = monthData[staffId] || { present: 0, leave: 0, offDuty: 0, collection: 0 };
            return {
                ...prev,
                [monthKey]: {
                    ...monthData,
                    [staffId]: {
                        ...staffData,
                        [field]: valToStore
                    }
                }
            };
        });
    };

    // Calculate Salary Data using manual inputs
    const salaryData = useMemo(() => {
        const monthData = manualInputs[monthKey] || {};

        return activeStaff.map(person => {
            const inputs = monthData[person.id] || { present: 0, leave: 0, offDuty: 0, collection: 0 };

            // Calculate lifetime collections for this person
            let lifetimeCollection = 0;
            Object.values(manualInputs).forEach(monthRecord => {
                if (monthRecord[person.id] && monthRecord[person.id].collection) {
                    lifetimeCollection += Number(monthRecord[person.id].collection) || 0;
                }
            });

            const presentDays = Math.min(inputs.present || 0, daysInCurrentMonth);
            const halfDays = inputs.halfDays || 0;
            const offDuty = inputs.offDuty || 0;

            // Maximum of 3 paid leaves are allowed
            const paidLeaves = Math.min(inputs.leave || 0, 3);

            const payableDays = presentDays + (halfDays * 0.5) + offDuty + paidLeaves;
            const absentDays = Math.max(0, daysInCurrentMonth - payableDays);

            // Calculate daily rate based on month length
            const baseSalary = person.baseSalary || 0;
            const dailyRate = baseSalary / daysInCurrentMonth;

            // Deduct for absences
            const absenceDeduction = absentDays * dailyRate;

            const collectionAmount = inputs.collection || 0;
            const totalSalary = Math.max(0, baseSalary - absenceDeduction + collectionAmount);

            return {
                ...person,
                inputs,
                payableDays,
                absentDays,
                paidLeaves,
                dailyRate,
                absenceDeduction,
                totalSalary,
                lifetimeCollection
            };
        });
    }, [selectedMonth, selectedYear, manualInputs, activeStaff, daysInCurrentMonth, monthKey]);

    const totalPayout = salaryData.reduce((sum, item) => sum + item.totalSalary, 0);

    return (
        <div>
            <div className="no-print">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <div>
                        <h1>Salary Management</h1>
                        <p style={{ color: 'var(--text-muted)' }}>Manually input attendance data to process payouts</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface-color)', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                            <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} onClick={() => handleMonthChange(-1)}>
                                <ChevronLeft size={20} />
                            </button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0 1rem', fontWeight: 600, minWidth: '160px', justifyContent: 'center' }}>
                                <CalendarDays size={18} color="var(--primary)" />
                                {monthNames[selectedMonth]} {selectedYear}
                            </div>
                            <button className="btn btn-outline" style={{ padding: '0.25rem', border: 'none' }} onClick={() => handleMonthChange(1)}>
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                className="btn btn-outline"
                                onClick={handleSaveInputs}
                                style={{
                                    transition: 'all 0.3s ease',
                                    backgroundColor: isSaving ? 'var(--success)' : 'transparent',
                                    color: isSaving ? 'white' : 'var(--primary)',
                                    borderColor: isSaving ? 'var(--success)' : 'var(--border-color)',
                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                    padding: '0.5rem 1rem'
                                }}
                            >
                                {isSaving ? <Check size={18} /> : <Save size={18} />}
                                {isSaving ? 'Saved!' : 'Save Data'}
                            </button>
                            <button className="btn btn-primary" onClick={handleExportPayroll} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem' }}>
                                <Download size={18} /> Export Payroll
                            </button>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--primary-light)', border: '1px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ color: 'var(--primary-hover)', marginBottom: '0.25rem' }}>Total Monthly Payout</h3>
                            <p style={{ color: 'var(--text-main)', fontSize: '0.875rem' }}>For {activeStaff.length} active staff members</p>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white' }}>
                                <Calculator size={28} />
                            </div>
                            <h2 style={{ fontSize: '2.5rem', color: 'var(--primary-hover)', margin: 0 }}>₹{totalPayout.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', width: '25%' }}>Staff Member</th>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Base Salary</th>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Present Days</th>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Half Days</th>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Leave (Max 3 Paid)</th>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Off Duty (Paid)</th>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Collection (₹)</th>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Payable Days</th>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Total Salary</th>
                                <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {salaryData.length === 0 ? (
                                <tr><td colSpan="9" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No staff data available for calculation.</td></tr>
                            ) : salaryData.map((data) => (
                                <tr key={data.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 500 }}>{data.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{data.role}</div>
                                    </td>
                                    <td style={{ padding: '1rem', fontWeight: 500 }}>₹{Number(data.baseSalary || 0).toLocaleString()}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', width: '100px' }}>
                                            <Edit3 size={14} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                max={daysInCurrentMonth}
                                                value={data.inputs.present || ''}
                                                onChange={(e) => handleInput(data.id, 'present', e.target.value)}
                                                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                                                placeholder="0"
                                            />
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', width: '100px' }}>
                                            <Edit3 size={14} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={data.inputs.halfDays || ''}
                                                onChange={(e) => handleInput(data.id, 'halfDays', e.target.value)}
                                                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                                                placeholder="0"
                                            />
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', width: '100px' }}>
                                            <Edit3 size={14} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={data.inputs.leave || ''}
                                                onChange={(e) => handleInput(data.id, 'leave', e.target.value)}
                                                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                                                placeholder="0"
                                            />
                                        </div>
                                        {data.inputs.leave > 3 && <span style={{ fontSize: '0.7rem', color: 'var(--warning)', display: 'block', marginTop: '0.25rem' }}>Only 3 paid</span>}
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', width: '100px' }}>
                                            <Edit3 size={14} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                                            <input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={data.inputs.offDuty || ''}
                                                onChange={(e) => handleInput(data.id, 'offDuty', e.target.value)}
                                                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                                                placeholder="0"
                                            />
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', width: '100px' }}>
                                            <span style={{ color: 'var(--text-muted)', marginRight: '0.25rem' }}>₹</span>
                                            <input
                                                type="number"
                                                value={data.inputs.collection || ''}
                                                onChange={(e) => handleInput(data.id, 'collection', e.target.value)}
                                                style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                                                placeholder="0"
                                            />
                                        </div>
                                        {data.inputs.collection > 0 && <span style={{ fontSize: '0.7rem', color: 'var(--danger)', display: 'block', marginTop: '0.25rem' }}>-₹{data.inputs.collection} (Deduct)</span>}
                                        {data.inputs.collection < 0 && <span style={{ fontSize: '0.7rem', color: 'var(--success)', display: 'block', marginTop: '0.25rem' }}>+₹{Math.abs(data.inputs.collection)} (Refund)</span>}
                                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                                            Lifetime: ₹{data.lifetimeCollection.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 500 }}>
                                        <span className="badge badge-success">{data.payableDays}</span>
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600, color: 'var(--primary-hover)', fontSize: '1.125rem' }}>
                                        ₹{data.totalSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <button className="btn btn-outline" style={{ padding: '0.35rem 0.5rem' }} onClick={() => setSelectedSlip(data)}>
                                            <Printer size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payslip Modal Component (Only visible when a slip is selected) */}
            {selectedSlip && (
                <div
                    className="payslip-modal-container"
                    onClick={() => setSelectedSlip(null)}
                    style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
                >
                    <div className="card animate-fade-in payslip-modal" onClick={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: '600px', margin: '2rem' }}>
                        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                            <button onClick={() => setSelectedSlip(null)} style={{ color: 'var(--text-muted)' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Printable Area */}
                        <div className="print-only" style={{ display: 'block' }}>
                            <div style={{ textAlign: 'center', marginBottom: '2rem', borderBottom: '2px solid var(--border-color)', paddingBottom: '1rem' }}>
                                <h1 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>SPT Hospital</h1>
                                <p style={{ color: 'var(--text-muted)' }}>Official Salary Slip: {monthNames[selectedMonth]} {selectedYear}</p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                                <div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Employee Name</p>
                                    <h3 style={{ margin: 0 }}>{selectedSlip.name}</h3>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Role Designatnion</p>
                                    <h3 style={{ margin: 0 }}>{selectedSlip.role}</h3>
                                </div>
                            </div>

                            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
                                <thead>
                                    <tr style={{ backgroundColor: 'var(--bg-color)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
                                        <th style={{ padding: '1rem', textAlign: 'left' }}>Description</th>
                                        <th style={{ padding: '1rem', textAlign: 'right' }}>Amount / Days</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr style={{ borderBottom: '1px solid var(--bg-color)' }}>
                                        <td style={{ padding: '1rem' }}>Base Monthly Salary</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>₹{Number(selectedSlip.baseSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--bg-color)' }}>
                                        <td style={{ padding: '1rem' }}>Present Days</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>{Math.min(selectedSlip.inputs.present || 0, daysInCurrentMonth)}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--bg-color)' }}>
                                        <td style={{ padding: '1rem' }}>Half Days</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>{selectedSlip.inputs.halfDays || 0}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--bg-color)' }}>
                                        <td style={{ padding: '1rem' }}>Paid Leaves</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>{selectedSlip.paidLeaves}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--bg-color)' }}>
                                        <td style={{ padding: '1rem' }}>Paid Off Duty</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>{selectedSlip.inputs.offDuty || 0}</td>
                                    </tr>
                                    <tr style={{ borderTop: '2px solid var(--border-color)', backgroundColor: 'var(--primary-light)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>Total Payable Days</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 600 }}>{Number(selectedSlip.payableDays).toLocaleString('en-IN', { maximumFractionDigits: 1 })}</td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--bg-color)' }}>
                                        <td style={{ padding: '1rem', color: selectedSlip.absenceDeduction > 0 ? 'var(--danger)' : 'inherit' }}>Less: Absences ({Number(selectedSlip.absentDays).toLocaleString('en-IN', { maximumFractionDigits: 1 })} days)</td>
                                        <td style={{ padding: '1rem', textAlign: 'right', color: selectedSlip.absenceDeduction > 0 ? 'var(--danger)' : 'inherit' }}>
                                            -₹{selectedSlip.absenceDeduction.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                    <tr style={{ borderBottom: '1px solid var(--bg-color)' }}>
                                        <td style={{ padding: '1rem' }}>Gross Salary Amount</td>
                                        <td style={{ padding: '1rem', textAlign: 'right' }}>₹{(selectedSlip.baseSalary - selectedSlip.absenceDeduction).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                    {(selectedSlip.inputs.collection || 0) > 0 && (
                                        <tr style={{ borderBottom: '1px solid var(--bg-color)' }}>
                                            <td style={{ padding: '1rem', color: 'var(--danger)' }}>Less: Collections</td>
                                            <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--danger)' }}>-₹{selectedSlip.inputs.collection.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    )}
                                    {(selectedSlip.inputs.collection || 0) < 0 && (
                                        <tr style={{ borderBottom: '1px solid var(--bg-color)' }}>
                                            <td style={{ padding: '1rem', color: 'var(--success)' }}>Add: Collection Disbursement</td>
                                            <td style={{ padding: '1rem', textAlign: 'right', color: 'var(--success)' }}>+₹{Math.abs(selectedSlip.inputs.collection).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--primary)', color: 'white', padding: '1.5rem', borderRadius: 'var(--radius-sm)' }}>
                                <h2 style={{ margin: 0, color: 'white' }}>Net Salary Payout</h2>
                                <h1 style={{ margin: 0, color: 'white' }}>₹{selectedSlip.totalSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h1>
                            </div>

                            <div style={{ marginTop: '4rem', display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ borderTop: '1px solid var(--text-main)', width: '200px', paddingTop: '0.5rem', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.875rem' }}>Employer Signature</p>
                                </div>
                                <div style={{ borderTop: '1px solid var(--text-main)', width: '200px', paddingTop: '0.5rem', textAlign: 'center' }}>
                                    <p style={{ margin: 0, fontSize: '0.875rem' }}>Employee Signature</p>
                                </div>
                            </div>
                        </div>

                        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
                            <button className="btn btn-primary" onClick={() => window.print()}>
                                <Printer size={18} /> Print Salary Slip
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
