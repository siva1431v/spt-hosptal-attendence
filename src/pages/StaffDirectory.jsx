import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Plus, Edit2, Search } from 'lucide-react';

export default function StaffDirectory() {
    const { staff, addStaff, updateStaff } = useAppContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({ name: '', role: '', baseSalary: '', status: 'Active' });

    const filteredStaff = staff.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (staffMember = null) => {
        if (staffMember) {
            setFormData({ name: staffMember.name, role: staffMember.role, baseSalary: staffMember.baseSalary || 0, status: staffMember.status });
            setEditingId(staffMember.id);
        } else {
            setFormData({ name: '', role: '', baseSalary: '', status: 'Active' });
            setEditingId(null);
        }
        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (editingId) {
            updateStaff(editingId, { ...formData, baseSalary: Number(formData.baseSalary) });
        } else {
            addStaff({ ...formData, baseSalary: Number(formData.baseSalary) });
        }
        setIsModalOpen(false);
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1>Staff Directory</h1>
                <button className="btn btn-primary" onClick={() => handleOpenModal()}>
                    <Plus size={18} /> Add Staff
                </button>
            </div>

            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 1rem' }}>
                    <Search size={18} color="var(--text-muted)" style={{ marginRight: '0.5rem' }} />
                    <input
                        type="text"
                        placeholder="Search staff by name or role..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.875rem' }}
                    />
                </div>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Name</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Role</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Base Salary</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem' }}>Status</th>
                            <th style={{ padding: '1rem', fontWeight: 600, fontSize: '0.875rem', textAlign: 'right' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.map((person) => (
                            <tr key={person.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                                        {person.name.charAt(0)}
                                    </div>
                                    <span style={{ fontWeight: 500 }}>{person.name}</span>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{person.role}</td>
                                <td style={{ padding: '1rem' }}>₹{Number(person.baseSalary || 0).toLocaleString()}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span className={`badge ${person.status === 'Active' ? 'badge-success' : 'badge-neutral'}`}>
                                        {person.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <button className="btn btn-outline" style={{ padding: '0.35rem 0.5rem' }} onClick={() => handleOpenModal(person)}>
                                        <Edit2 size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="card animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
                        <h2 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Staff' : 'Add Staff'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Full Name</label>
                                <input required className="form-input" type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Dr. Jane Fox" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Role</label>
                                <input required className="form-input" type="text" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} placeholder="e.g. Cardiologist" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Base Monthly Salary (₹)</label>
                                <input required className="form-input" type="number" min="0" value={formData.baseSalary} onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })} placeholder="e.g. 50000" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <select className="form-input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingId ? 'Save Changes' : 'Add Staff'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
