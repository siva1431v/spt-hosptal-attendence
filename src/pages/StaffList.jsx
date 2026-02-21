import React, { useState } from 'react';
import { useHospitalContext } from '../context/HospitalContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const StaffList = () => {
    const { staff, addStaff, updateStaff, removeStaff } = useHospitalContext();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({ name: '', role: 'Nurse', baseSalary: '' });

    const handleOpenModal = (employee = null) => {
        if (employee) {
            setFormData({ name: employee.name, role: employee.role, baseSalary: employee.baseSalary || '' });
            setEditingId(employee.id);
        } else {
            setFormData({ name: '', role: 'Nurse', baseSalary: '' });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            updateStaff(editingId, { ...formData, baseSalary: Number(formData.baseSalary) });
        } else {
            addStaff({ ...formData, baseSalary: Number(formData.baseSalary) });
        }
        handleCloseModal();
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Staff Directory</h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Add Staff
                </button>
            </div>

            <div className="card">
                {staff.length === 0 ? (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                        No staff members found. Add some to get started.
                    </p>
                ) : (
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Role</th>
                                    <th>Base Salary (Monthly)</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staff.map(emp => (
                                    <tr key={emp.id}>
                                        <td style={{ fontWeight: '500' }}>{emp.name}</td>
                                        <td><span className="badge badge-blue">{emp.role}</span></td>
                                        <td>₹{Number(emp.baseSalary).toLocaleString()}</td>
                                        <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                            <button className="btn btn-secondary" style={{ padding: '6px' }} onClick={() => handleOpenModal(emp)}>
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="btn btn-danger" style={{ padding: '6px' }} onClick={() => {
                                                if (window.confirm('Are you sure you want to remove this staff member?')) {
                                                    removeStaff(emp.id);
                                                }
                                            }}>
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{editingId ? 'Edit Staff Details' : 'Add New Staff'}</h2>
                            <button className="close-btn" onClick={handleCloseModal}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Dr. Sarah Jenkins"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <select
                                    className="form-select"
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                >
                                    <option value="Doctor">Doctor</option>
                                    <option value="Nurse">Nurse</option>
                                    <option value="Receptionist">Receptionist</option>
                                    <option value="Ward Boy">Ward Boy</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Cleaner">Cleaner</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Monthly Base Salary (₹)</label>
                                <input
                                    type="number"
                                    className="form-input"
                                    required
                                    min="0"
                                    value={formData.baseSalary}
                                    onChange={e => setFormData({ ...formData, baseSalary: e.target.value })}
                                    placeholder="e.g. 50000"
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Staff'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffList;
