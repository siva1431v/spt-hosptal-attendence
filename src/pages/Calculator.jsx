import React, { useState, useEffect } from 'react';
import { useHospitalContext } from '../context/HospitalContext';
import { format, parseISO, getDaysInMonth } from 'date-fns';
import { Save, FileText } from 'lucide-react';

const Calculator = () => {
    const { staff, attendance, saveAttendance, getAttendanceForMonth } = useHospitalContext();

    // Default to current month
    const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
    const [localAttendance, setLocalAttendance] = useState({});
    const [selectedPayslip, setSelectedPayslip] = useState(null);

    // When month changes or context updates, load the attendance
    useEffect(() => {
        const monthData = getAttendanceForMonth(selectedMonth);

        // Initialize or merge with existing data
        const mergedData = {};
        staff.forEach(emp => {
            mergedData[emp.id] = monthData[emp.id] || {
                present: 0,
                absent: 0,
                halfDay: 0,
                paidLeave: 0,
                sickLeave: 0
            };
        });
        setLocalAttendance(mergedData);
    }, [selectedMonth, staff, attendance]);

    const handleInputChange = (empId, field, value) => {
        setLocalAttendance(prev => ({
            ...prev,
            [empId]: {
                ...prev[empId],
                [field]: Number(value) || 0
            }
        }));
    };

    const calculateSalary = (empId) => {
        const emp = staff.find(s => s.id === empId);
        if (!emp) return 0;

        const record = localAttendance[empId];
        if (!record) return 0;

        const [year, month] = selectedMonth.split('-');
        const daysInMonth = getDaysInMonth(new Date(Number(year), Number(month) - 1));
        const dailyRate = emp.baseSalary / daysInMonth;

        // Formula: Payable Days = Present + PaidLeave + SickLeave + (HalfDay * 0.5)
        const payableDays = record.present + record.paidLeave + record.sickLeave + (record.halfDay * 0.5);

        return Math.round(payableDays * dailyRate);
    };

    const handleSave = () => {
        saveAttendance(selectedMonth, localAttendance);
        alert('Attendance and salary data saved successfully!');
    };

    const getDaysInSelectedMonth = () => {
        const [year, month] = selectedMonth.split('-');
        return getDaysInMonth(new Date(Number(year), Number(month) - 1));
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Monthly Attendance & Payroll</h1>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <input
                        type="month"
                        className="form-input"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        style={{ width: 'auto' }}
                    />
                    <button className="btn btn-primary" onClick={handleSave}>
                        <Save size={18} /> Save Records
                    </button>
                </div>
            </div>

            <div className="card">
                {staff.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)' }}>No staff available. Add staff in the directory first.</p>
                ) : (
                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table style={{ minWidth: '900px' }}>
                            <thead>
                                <tr>
                                    <th>Staff Member</th>
                                    <th style={{ width: '80px' }}>Base Salary</th>
                                    <th style={{ width: '70px' }}>P</th>
                                    <th style={{ width: '70px' }}>A</th>
                                    <th style={{ width: '70px' }}>HD</th>
                                    <th style={{ width: '70px' }}>PL</th>
                                    <th style={{ width: '70px' }}>SL</th>
                                    <th>Total Payable</th>
                                    <th>Fin. Salary</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map(emp => {
                                    const record = localAttendance[emp.id] || { present: 0, absent: 0, halfDay: 0, paidLeave: 0, sickLeave: 0 };
                                    const finalSlry = calculateSalary(emp.id);
                                    const payableDays = record.present + record.paidLeave + record.sickLeave + (record.halfDay * 0.5);

                                    return (
                                        <tr key={emp.id}>
                                            <td>
                                                <div style={{ fontWeight: '500' }}>{emp.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.role}</div>
                                            </td>
                                            <td>₹{emp.baseSalary}</td>
                                            <td>
                                                <input type="number" min="0" className="form-input" style={{ padding: '4px', width: '60px' }}
                                                    value={record.present === 0 ? '' : record.present}
                                                    onChange={(e) => handleInputChange(emp.id, 'present', e.target.value)}
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td>
                                                <input type="number" min="0" className="form-input" style={{ padding: '4px', width: '60px' }}
                                                    value={record.absent === 0 ? '' : record.absent}
                                                    onChange={(e) => handleInputChange(emp.id, 'absent', e.target.value)}
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td>
                                                <input type="number" min="0" className="form-input" style={{ padding: '4px', width: '60px' }}
                                                    value={record.halfDay === 0 ? '' : record.halfDay}
                                                    onChange={(e) => handleInputChange(emp.id, 'halfDay', e.target.value)}
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td>
                                                <input type="number" min="0" className="form-input" style={{ padding: '4px', width: '60px' }}
                                                    value={record.paidLeave === 0 ? '' : record.paidLeave}
                                                    onChange={(e) => handleInputChange(emp.id, 'paidLeave', e.target.value)}
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td>
                                                <input type="number" min="0" className="form-input" style={{ padding: '4px', width: '60px' }}
                                                    value={record.sickLeave === 0 ? '' : record.sickLeave}
                                                    onChange={(e) => handleInputChange(emp.id, 'sickLeave', e.target.value)}
                                                    placeholder="0"
                                                />
                                            </td>
                                            <td><span className="badge badge-blue">{payableDays} Days</span></td>
                                            <td style={{ fontWeight: '700', color: 'var(--primary-color)' }}>₹{finalSlry.toLocaleString()}</td>
                                            <td>
                                                <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => setSelectedPayslip({ emp, record, finalSlry })}>
                                                    <FileText size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Payslip Modal */}
            {selectedPayslip && (
                <div className="modal-overlay" onClick={() => setSelectedPayslip(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header no-print">
                            <h2 className="modal-title">Employee Payslip</h2>
                            <button className="close-btn" onClick={() => setSelectedPayslip(null)}>&times;</button>
                        </div>

                        <div id="payslip-print-area" style={{ padding: '10px' }}>
                            <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid var(--primary-color)', paddingBottom: '10px' }}>
                                <h1 style={{ color: 'var(--primary-color)', margin: 0 }}>Attendance Management</h1>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Attendance & Salary Slip for {format(parseISO(selectedMonth + '-01'), 'MMMM yyyy')}</p>
                            </div>

                            <div className="grid grid-cols-2" style={{ marginBottom: '20px', gap: '10px' }}>
                                <div>
                                    <p className="form-label" style={{ margin: 0 }}>Employee Name:</p>
                                    <p style={{ fontWeight: '600' }}>{selectedPayslip.emp.name}</p>
                                </div>
                                <div>
                                    <p className="form-label" style={{ margin: 0 }}>Designation:</p>
                                    <p style={{ fontWeight: '600' }}>{selectedPayslip.emp.role}</p>
                                </div>
                                <div>
                                    <p className="form-label" style={{ margin: 0 }}>Base Salary:</p>
                                    <p style={{ fontWeight: '600' }}>₹{selectedPayslip.emp.baseSalary.toLocaleString()}</p>
                                </div>
                                <div>
                                    <p className="form-label" style={{ margin: 0 }}>Total Month Days:</p>
                                    <p style={{ fontWeight: '600' }}>{getDaysInSelectedMonth()}</p>
                                </div>
                            </div>

                            <div className="payslip-summary">
                                <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>Attendance Breakup</h3>
                                <div className="payslip-row">
                                    <span>Present Days</span>
                                    <span>{selectedPayslip.record.present}</span>
                                </div>
                                <div className="payslip-row">
                                    <span>Paid Leaves (PL)</span>
                                    <span>{selectedPayslip.record.paidLeave}</span>
                                </div>
                                <div className="payslip-row">
                                    <span>Sick Leaves (SL)</span>
                                    <span>{selectedPayslip.record.sickLeave}</span>
                                </div>
                                <div className="payslip-row">
                                    <span>Half Days</span>
                                    <span>{selectedPayslip.record.halfDay} (0.5x each)</span>
                                </div>
                                <div className="payslip-row">
                                    <span style={{ color: 'var(--danger)' }}>Absent Days</span>
                                    <span style={{ color: 'var(--danger)' }}>{selectedPayslip.record.absent}</span>
                                </div>
                            </div>

                            <div className="payslip-summary" style={{ backgroundColor: 'var(--white)', border: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontWeight: '600' }}>Net Payable Amount</span>
                                    <span className="payslip-total">₹{selectedPayslip.finalSlry.toLocaleString()}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ borderTop: '1px solid var(--text-muted)', paddingTop: '5px', width: '120px', textAlign: 'center', fontSize: '0.8rem' }}>
                                    Employer Auth.
                                </div>
                                <div style={{ borderTop: '1px solid var(--text-muted)', paddingTop: '5px', width: '120px', textAlign: 'center', fontSize: '0.8rem' }}>
                                    Employee Sign.
                                </div>
                            </div>
                        </div>

                        <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '30px' }}>
                            <button className="btn btn-secondary" onClick={() => setSelectedPayslip(null)}>Close</button>
                            <button className="btn btn-primary" onClick={() => window.print()}>
                                <FileText size={18} /> Print Payslip
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Calculator;
