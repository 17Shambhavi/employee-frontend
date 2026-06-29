import React, { useState, useEffect } from 'react';

function AdminDashboard({ token, onLogout }) {
    const [employees, setEmployees] = useState([]);
    const [statPresent, setStatPresent] = useState(0);
    const [statLeaves, setStatLeaves] = useState(0);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [newEmp, setNewEmp] = useState({
        name:'', department:'', designation:'',
        email:'', mobileNumber:'', salary:'', joiningDate:''
    });
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [addMsg, setAddMsg] = useState('');
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [insights, setInsights] = useState(null);

    useEffect(() => {
        loadEmployees();
        loadPendingLeaves();
        loadTodayAttendance();
        loadInsights();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadEmployees = async () => {
        const res = await fetch('http://localhost:8080/api/admin/employees', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        setEmployees(data);
    };

    const loadPendingLeaves = async () => {
        const res = await fetch('http://localhost:8080/api/admin/leaves/pending', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
            const data = await res.json();
            setPendingLeaves(data);
            setStatLeaves(data.length);
        }
    };

    const loadTodayAttendance = async () => {
        const res = await fetch('http://localhost:8080/api/admin/attendance/today', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
            const data = await res.json();
            setStatPresent(data.presentCount || 0);
        }
    };

    const loadInsights = async () => {
        const res = await fetch('http://localhost:8080/api/admin/attendance/insights', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        if (res.ok) {
            const data = await res.json();
            setInsights(data);
        }
    };

    const addEmployee = async () => {
        const res = await fetch('http://localhost:8080/api/admin/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ ...newEmp, salary: parseFloat(newEmp.salary) })
        });
        if (res.ok) {
            const saved = await res.json();
            if (newUsername && newPassword) {
                await fetch('http://localhost:8080/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: newUsername, password: newPassword, employeeId: String(saved.id) })
                });
            }
            setAddMsg('success:Employee added successfully!');
            setNewEmp({ name:'', department:'', designation:'', email:'', mobileNumber:'', salary:'', joiningDate:'' });
            setNewUsername(''); setNewPassword('');
            loadEmployees();
        } else {
            setAddMsg('error:Error adding employee!');
        }
    };

    const deleteEmployee = async (id) => {
        if (!window.confirm('Delete this employee?')) return;
        await fetch('http://localhost:8080/api/admin/employees/' + id, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        loadEmployees();
    };

    const approveLeave = async (id) => {
        await fetch('http://localhost:8080/api/admin/leave/' + id + '/approve', {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        loadPendingLeaves();
    };

    const rejectLeave = async (id) => {
        await fetch('http://localhost:8080/api/admin/leave/' + id + '/reject', {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + token }
        });
        loadPendingLeaves();
    };

    const tabLabels = {
        dashboard: 'Dashboard',
        employees: 'Employees',
        addEmployee: 'Add Employee',
        leaves: 'Leave Approval'
    };

    return (
        <div style={styles.container}>
            <style>{`
                .tab-btn:hover { background: #eef2ff !important; color: #4f46e5 !important; }
                .nav-btn:hover { background: rgba(255,255,255,0.15) !important; }
                .stat-card:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(0,0,0,0.1); }
                .modern-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
                .action-btn:hover { opacity: 0.85; transform: translateY(-1px); }
                table tr:hover td { background: #f9fafb; }
            `}</style>

            <div style={styles.navbar}>
                <span>Employee Management System</span>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={styles.adminBadge}>Admin</span>
                    <button className="nav-btn" style={styles.logoutBtn} onClick={onLogout}>Logout</button>
                </div>
            </div>

            <div style={styles.tabBar}>
                {Object.keys(tabLabels).map(tab => (
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
                        {tabLabels[tab]}
                    </button>
                ))}
            </div>

            <div style={styles.content}>

                {activeTab === 'dashboard' && (
                    <div>
                        <div style={styles.statCards}>
                            <div className="stat-card" style={{...styles.statCard, borderTop: '4px solid #3b82f6'}}>
                                <div style={{...styles.statNum, color: '#3b82f6'}}>{employees.length}</div>
                                <div style={styles.statLabel}>Total Employees</div>
                            </div>
                            <div className="stat-card" style={{...styles.statCard, borderTop: '4px solid #10b981'}}>
                                <div style={{...styles.statNum, color: '#10b981'}}>{statPresent}</div>
                                <div style={styles.statLabel}>Present Today</div>
                            </div>
                            <div className="stat-card" style={{...styles.statCard, borderTop: '4px solid #f59e0b'}}>
                                <div style={{...styles.statNum, color: '#f59e0b'}}>{statLeaves}</div>
                                <div style={styles.statLabel}>Pending Leaves</div>
                            </div>
                            <div className="stat-card" style={{...styles.statCard, borderTop: '4px solid #8b5cf6'}}>
                                <div style={{...styles.statNum, color: '#8b5cf6'}}>
                                    {new Set(employees.map(e => e.department)).size}
                                </div>
                                <div style={styles.statLabel}>Departments</div>
                            </div>
                        </div>

                        {insights && (
                            <div style={styles.insightCard}>
                                <div style={styles.insightHeader}>
                                    <span style={styles.insightTag}>Smart Insight</span>
                                    <span style={styles.insightRate}>{insights.attendanceRate}% attendance this week</span>
                                </div>
                                <p style={styles.insightText}>{insights.summary}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'employees' && (
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>All Employees</h2>
                            <button className="action-btn" style={styles.btnOutline} onClick={loadEmployees}>Refresh</button>
                        </div>
                        <div style={{overflowX: 'auto'}}>
                            <table style={styles.table}>
                                <thead>
                                <tr>
                                    {['ID','Name','Department','Designation','Email','Mobile','Salary','Action'].map(h => (
                                        <th key={h} style={styles.th}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {employees.map(emp => (
                                    <tr key={emp.id}>
                                        <td style={styles.td}>{emp.id}</td>
                                        <td style={{...styles.td, fontWeight: '600'}}>{emp.name}</td>
                                        <td style={styles.td}>{emp.department}</td>
                                        <td style={styles.td}>{emp.designation}</td>
                                        <td style={styles.td}>{emp.email}</td>
                                        <td style={styles.td}>{emp.mobileNumber}</td>
                                        <td style={styles.td}>₹{emp.salary}</td>
                                        <td style={styles.td}>
                                            <button className="action-btn" style={styles.btnRed} onClick={() => deleteEmployee(emp.id)}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'addEmployee' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Add Employee</h2>
                        <div style={styles.formGrid}>
                            {['name','department','designation','email','mobileNumber','salary'].map(field => (
                                <input key={field} className="modern-input" style={styles.input}
                                       placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                                       value={newEmp[field]}
                                       onChange={e => setNewEmp({...newEmp, [field]: e.target.value})}
                                />
                            ))}
                            <input className="modern-input" style={styles.input} type="date"
                                   value={newEmp.joiningDate}
                                   onChange={e => setNewEmp({...newEmp, joiningDate: e.target.value})}
                            />
                        </div>
                        <div style={styles.divider}></div>
                        <p style={styles.sectionLabel}>Login Credentials</p>
                        <div style={styles.formGrid}>
                            <input className="modern-input" style={styles.input} placeholder="Username"
                                   value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                            <input className="modern-input" style={styles.input} type="password" placeholder="Password"
                                   value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                        </div>
                        <button className="action-btn" style={styles.btnGreen} onClick={addEmployee}>Add Employee</button>
                        {addMsg && (
                            <p style={{
                                color: addMsg.startsWith('success') ? '#059669' : '#dc2626',
                                marginTop:'12px', fontWeight: '500'
                            }}>
                                {addMsg.split(':')[1]}
                            </p>
                        )}
                    </div>
                )}

                {activeTab === 'leaves' && (
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <h2 style={styles.cardTitle}>Leave Approval</h2>
                            <button className="action-btn" style={styles.btnOutline} onClick={loadPendingLeaves}>Refresh</button>
                        </div>
                        <div style={{overflowX: 'auto'}}>
                            <table style={styles.table}>
                                <thead>
                                <tr>
                                    {['Emp ID','From','To','Reason','Action'].map(h => (
                                        <th key={h} style={styles.th}>{h}</th>
                                    ))}
                                </tr>
                                </thead>
                                <tbody>
                                {pendingLeaves.length === 0 ? (
                                    <tr><td colSpan="5" style={{textAlign:'center', padding:'30px', color:'#9ca3af'}}>No pending leaves</td></tr>
                                ) : pendingLeaves.map(l => (
                                    <tr key={l.id}>
                                        <td style={styles.td}>{l.employeeId}</td>
                                        <td style={styles.td}>{l.fromDate}</td>
                                        <td style={styles.td}>{l.toDate}</td>
                                        <td style={styles.td}>{l.reason}</td>
                                        <td style={styles.td}>
                                            <button className="action-btn" style={styles.btnGreen} onClick={() => approveLeave(l.id)}>Approve</button>
                                            <button className="action-btn" style={styles.btnRed} onClick={() => rejectLeave(l.id)}>Reject</button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
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
    adminBadge: {
        background: 'rgba(255,255,255,0.15)', padding: '6px 14px',
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
    statCards: { display: 'flex', gap: '18px', flexWrap: 'wrap' },
    statCard: {
        flex: 1, minWidth: '190px', background: 'white', borderRadius: '14px',
        padding: '22px', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        transition: 'all 0.25s'
    },
    statNum: { fontSize: '32px', fontWeight: '700' },
    statLabel: { color: '#6b7280', marginTop: '4px', fontSize: '13px', fontWeight: '500' },
    insightCard: {
        marginTop: '20px', background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)',
        border: '1px solid #e0e7ff', borderRadius: '14px', padding: '20px 24px'
    },
    insightHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '10px', flexWrap: 'wrap', gap: '8px'
    },
    insightTag: {
        background: '#6366f1', color: 'white', fontSize: '11px', fontWeight: '600',
        padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px'
    },
    insightRate: { color: '#4f46e5', fontWeight: '700', fontSize: '14px' },
    insightText: { color: '#374151', fontSize: '14px', lineHeight: '1.6', margin: 0 },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4px 12px' },
    input: {
        width: '100%', padding: '11px 14px', margin: '6px 0',
        border: '1.5px solid #e5e7eb', borderRadius: '8px',
        fontSize: '14px', boxSizing: 'border-box', outline: 'none',
        transition: 'all 0.2s'
    },
    divider: { borderTop: '1px solid #e5e7eb', margin: '20px 0' },
    sectionLabel: { fontWeight: '600', color: '#374151', marginBottom: '8px', fontSize: '14px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
    th: {
        background: '#f9fafb', color: '#6b7280', padding: '12px',
        textAlign: 'left', fontSize: '12px', fontWeight: '600',
        textTransform: 'uppercase', letterSpacing: '0.5px',
        borderBottom: '2px solid #e5e7eb'
    },
    td: { padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', color: '#374151' },
    btnGreen: {
        background: '#10b981', color: 'white', border: 'none', padding: '8px 16px',
        borderRadius: '7px', cursor: 'pointer', margin: '3px', fontSize: '13px',
        fontWeight: '500', transition: 'all 0.2s'
    },
    btnRed: {
        background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px',
        borderRadius: '7px', cursor: 'pointer', margin: '3px', fontSize: '13px',
        fontWeight: '500', transition: 'all 0.2s'
    },
    btnOutline: {
        background: 'white', color: '#4f46e5', border: '1.5px solid #c7d2fe',
        padding: '8px 16px', borderRadius: '7px', cursor: 'pointer',
        fontSize: '13px', fontWeight: '500', transition: 'all 0.2s'
    },
};
export default AdminDashboard;