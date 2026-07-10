import React, { useState, useEffect } from 'react';
import ProfilePhoto from './ProfilePhoto';

function HRDashboard({ token, onLogout }) {
    const [employees, setEmployees] = useState([]);
    const [activeTab, setActiveTab] = useState('employees');
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '', department: '', designation: '',
        email: '', mobileNumber: '', salary: ''
    });
    const [msg, setMsg] = useState('');

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        const res = await fetch('https://employee-management-production-2291.up.railway.app/api/hr/employees', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
            const data = await res.json();
            setEmployees(data);
        }
    };

    const selectEmployee = (emp) => {
        setSelectedEmp(emp);
        setEditForm({
            name: emp.name,
            department: emp.department,
            designation: emp.designation,
            email: emp.email,
            mobileNumber: emp.mobileNumber,
            salary: emp.salary
        });
        setMsg('');
    };

    const updateEmployee = async () => {
        const res = await fetch('https://employee-management-production-2291.up.railway.app/api/hr/employees/' + selectedEmp.id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ ...editForm, salary: parseFloat(editForm.salary) })
        });
        if (res.ok) {
            setMsg('success:Employee updated successfully!');
            loadEmployees();
        } else {
            setMsg('error:Failed to update employee.');
        }
    };

    return (
        <div style={styles.container}>
            <style>{`
                .tab-btn:hover { background: #eef2ff !important; color: #4f46e5 !important; }
                .nav-btn:hover { background: rgba(255,255,255,0.15) !important; }
                .modern-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
                .action-btn:hover { opacity: 0.85; transform: translateY(-1px); }
                table tr:hover td { background: #f9fafb; }
                .row-clickable:hover { background: #eef2ff !important; cursor: pointer; }
            `}</style>

            <div style={styles.navbar}>
                <span>Vertex</span>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={styles.hrBadge}>
                        <ProfilePhoto employeeId="hr" currentPhoto={null} token={token} size={26} />
                        <span>HR</span>
                    </div>
                    <button className="nav-btn" style={styles.logoutBtn} onClick={onLogout}>Logout</button>
                </div>
            </div>

            <div style={styles.tabBar}>
                {['employees', 'edit'].map(tab => (
                    <button
                        key={tab}
                        className="tab-btn"
                        style={{
                            ...styles.tabBtn,
                            background: activeTab === tab ? '#6366f1' : 'transparent',
                            color: activeTab === tab ? 'white' : '#4b5563'
                        }}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'employees' ? 'All Employees' : 'Edit Employee'}
                    </button>
                ))}
            </div>

            <div style={styles.content}>

                {activeTab === 'employees' && (
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>All Employees</h2>
                            <button className="action-btn" style={styles.btnOutline} onClick={loadEmployees}>Refresh</button>
                        </div>
                        <p style={{ color: '#6b7280', fontSize: '13px', marginTop: 0 }}>
                            Click on an employee row to edit their details
                        </p>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={styles.table}>
                                <thead>
                                <tr>
                                    {['Photo', 'ID', 'Name', 'Department', 'Designation', 'Email', 'Mobile', 'Salary'].map(h => (
                                        <th key={h} style={styles.th}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {employees.map(emp => (
                                    <tr
                                        key={emp.id}
                                        className="row-clickable"
                                        onClick={() => { selectEmployee(emp); setActiveTab('edit'); }}
                                    >
                                        <td style={styles.td}><ProfilePhoto employeeId={emp.id} currentPhoto={emp.profilePhoto} token={token} size={32} /></td>
                                        <td style={styles.td}>{emp.id}</td>
                                        <td style={{ ...styles.td, fontWeight: '600' }}>{emp.name}</td>
                                        <td style={styles.td}>{emp.department}</td>
                                        <td style={styles.td}>{emp.designation}</td>
                                        <td style={styles.td}>{emp.email}</td>
                                        <td style={styles.td}>{emp.mobileNumber}</td>
                                        <td style={styles.td}>₹{emp.salary}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'edit' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Edit Employee</h2>
                        {!selectedEmp ? (
                            <p style={{ color: '#9ca3af' }}>
                                Select an employee from the "All Employees" tab first.
                            </p>
                        ) : (
                            <>
                                <div style={{ marginBottom: '20px' }}>
                                    <ProfilePhoto employeeId={selectedEmp.id} currentPhoto={selectedEmp.profilePhoto} token={token} size={80} />
                                </div>
                                <div style={styles.formGrid}>
                                    <input className="modern-input" style={styles.input}
                                           placeholder="Name" value={editForm.name}
                                           onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                                    <input className="modern-input" style={styles.input}
                                           placeholder="Department" value={editForm.department}
                                           onChange={e => setEditForm({ ...editForm, department: e.target.value })} />
                                    <input className="modern-input" style={styles.input}
                                           placeholder="Designation" value={editForm.designation}
                                           onChange={e => setEditForm({ ...editForm, designation: e.target.value })} />
                                    <input className="modern-input" style={styles.input}
                                           placeholder="Email" value={editForm.email}
                                           onChange={e => setEditForm({ ...editForm, email: e.target.value })} />
                                    <input className="modern-input" style={styles.input}
                                           placeholder="Mobile Number" value={editForm.mobileNumber}
                                           onChange={e => setEditForm({ ...editForm, mobileNumber: e.target.value })} />
                                    <input className="modern-input" style={styles.input}
                                           placeholder="Salary" value={editForm.salary}
                                           onChange={e => setEditForm({ ...editForm, salary: e.target.value })} />
                                </div>
                                <button className="action-btn" style={styles.btnGreen} onClick={updateEmployee}>
                                    Save Changes
                                </button>
                                {msg && (
                                    <p style={{
                                        color: msg.startsWith('success') ? '#059669' : '#dc2626',
                                        marginTop: '12px', fontWeight: '500'
                                    }}>
                                        {msg.split(':')[1]}
                                    </p>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: '#f3f4f6', fontFamily: "'Segoe UI', sans-serif" },
    navbar: {
        background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white',
        padding: '16px 30px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', fontSize: '18px', fontWeight: '600',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    hrBadge: {
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(255,255,255,0.15)', padding: '6px 14px 6px 6px',
        borderRadius: '20px', fontSize: '13px', fontWeight: '500'
    },
    logoutBtn: {
        background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none',
        padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
        fontSize: '14px', transition: 'all 0.2s'
    },
    tabBar: {
        background: 'white', padding: '12px 30px', display: 'flex', gap: '8px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
    },
    tabBtn: {
        border: 'none', padding: '10px 18px', borderRadius: '20px',
        cursor: 'pointer', fontSize: '14px', fontWeight: '500',
        transition: 'all 0.2s'
    },
    content: { maxWidth: '1150px', margin: '24px auto', padding: '0 20px' },
    card: { background: 'white', borderRadius: '14px', padding: '28px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
    cardTitle: { color: '#111827', fontSize: '19px', margin: 0 },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4px 12px' },
    input: {
        width: '100%', padding: '11px 14px', margin: '6px 0',
        border: '1.5px solid #e5e7eb', borderRadius: '8px',
        fontSize: '14px', boxSizing: 'border-box', outline: 'none',
        transition: 'all 0.2s'
    },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
    th: {
        background: '#f9fafb', color: '#6b7280', padding: '12px',
        textAlign: 'left', fontSize: '12px', fontWeight: '600',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        borderBottom: '2px solid #e5e7eb'
    },
    td: { padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', color: '#374151' },
    btnGreen: {
        background: '#10b981', color: 'white', border: 'none', padding: '10px 18px',
        borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500',
        marginTop: '8px', transition: 'all 0.2s'
    },
    btnOutline: {
        background: 'white', color: '#4f46e5', border: '1.5px solid #c7d2fe',
        padding: '8px 16px', borderRadius: '7px', cursor: 'pointer',
        fontSize: '13px', fontWeight: '500', transition: 'all 0.2s'
    },
};

export default HRDashboard;