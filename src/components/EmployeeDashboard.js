import React, { useState, useEffect } from 'react';

function EmployeeDashboard({ token, employeeId, onLogout }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [leaves, setLeaves] = useState([]);
    const [punchStatus, setPunchStatus] = useState('');
    const [attendanceMsg, setAttendanceMsg] = useState('');
    const [leaveMsg, setLeaveMsg] = useState('');
    const [leaveForm, setLeaveForm] = useState({ fromDate: '', toDate: '', reason: '' });
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [passMsg, setPassMsg] = useState('');
    const [timesheets, setTimesheets] = useState([]);
    const [timesheetForm, setTimesheetForm] = useState({ date: '', hoursWorked: '', taskDescription: '' });
    const [timesheetMsg, setTimesheetMsg] = useState('');
    const [regularizations, setRegularizations] = useState([]);
    const [regForm, setRegForm] = useState({ date: '', reason: '', requestedPunchIn: '', requestedPunchOut: '' });
    const [regMsg, setRegMsg] = useState('');
    const [projects, setProjects] = useState([]);

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        const res = await fetch('https://employee-management-production-2291.up.railway.app/api/employee/profile/' + employeeId);
        const data = await res.json();
        setProfile(data);
    };

    const loadAttendance = async () => {
        const res = await fetch('https://employee-management-production-2291.up.railway.app/api/employee/attendance/' + employeeId);
        const data = await res.json();
        setAttendance(data);
    };

    const loadLeaves = async () => {
        const res = await fetch('https://employee-management-production-2291.up.railway.app/api/employee/leave/' + employeeId);
        const data = await res.json();
        setLeaves(data);
    };

    const loadTimesheets = async () => {
        const res = await fetch('https://employee-management-production-2291.up.railway.app/api/timesheet/employee/' + employeeId);
        if (res.ok) { const data = await res.json(); setTimesheets(data); }
    };

    const loadRegularizations = async () => {
        const res = await fetch('https://employee-management-production-2291.up.railway.app/api/regularization/employee/' + employeeId);
        if (res.ok) { const data = await res.json(); setRegularizations(data); }
    };

    const loadProjects = async () => {
        const res = await fetch('https://employee-management-production-2291.up.railway.app/api/projects/employee/' + employeeId);
        if (res.ok) { const data = await res.json(); setProjects(data); }
    };

    const punchIn = async () => {
        const res = await fetch('https://employee-management-production-2291.up.railway.app/api/employee/attendance/punchin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId: String(employeeId) })
        });
        if (res.ok) { setPunchStatus('Punched In at ' + new Date().toLocaleTimeString()); setAttendanceMsg('success:Punch In recorded!'); loadAttendance(); }
        else { setAttendanceMsg('error:Already punched in today!'); }
    };

    const punchOut = async () => {
        const res = await fetch('https://employee-management-production-2291.up.railway.app/api/employee/attendance/punchout', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId: String(employeeId) })
        });
        if (res.ok) { setPunchStatus('Punched Out at ' + new Date().toLocaleTimeString()); setAttendanceMsg('success:Punch Out recorded!'); loadAttendance(); }
        else { setAttendanceMsg('error:Punch in first!'); }
    };

    const applyLeave = async () => {
        const res = await fetch('https://employee-management-production-2291.up.railway.app/api/employee/leave', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId: String(employeeId), ...leaveForm })
        });
        if (res.ok) { setLeaveMsg('success:Leave applied successfully!'); setLeaveForm({ fromDate: '', toDate: '', reason: '' }); loadLeaves(); }
    };

    const submitTimesheet = async () => {
        if (!timesheetForm.date || !timesheetForm.hoursWorked || !timesheetForm.taskDescription) { setTimesheetMsg('error:All fields required!'); return; }
        const res = await fetch('https://employee-management-production-2291.up.railway.app/api/timesheet', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId, date: timesheetForm.date, hoursWorked: parseFloat(timesheetForm.hoursWorked), taskDescription: timesheetForm.taskDescription, status: 'SUBMITTED' })
        });
        if (res.ok) { setTimesheetMsg('success:Timesheet submitted!'); setTimesheetForm({ date: '', hoursWorked: '', taskDescription: '' }); loadTimesheets(); }
        else { setTimesheetMsg('error:Error submitting timesheet!'); }
    };

    const submitRegularization = async () => {
        if (!regForm.date || !regForm.reason) { setRegMsg('error:Date and reason required!'); return; }
        const res = await fetch('https://employee-management-production-2291.up.railway.app/api/regularization', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ employeeId, ...regForm })
        });
        if (res.ok) { setRegMsg('success:Regularization request submitted!'); setRegForm({ date: '', reason: '', requestedPunchIn: '', requestedPunchOut: '' }); loadRegularizations(); }
        else { setRegMsg('error:Error submitting request!'); }
    };

    const changePassword = async () => {
        if (newPass !== confirmPass) { setPassMsg('error:Passwords do not match!'); return; }
        const res = await fetch('https://employee-management-production-2291.up.railway.app/api/auth/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
            body: JSON.stringify({ username: profile?.name, oldPassword: oldPass, newPassword: newPass })
        });
        if (res.ok) { setPassMsg('success:Password changed!'); }
        else { setPassMsg('error:Wrong current password!'); }
    };

    const totalHours = timesheets.reduce((sum, t) => sum + (t.hoursWorked || 0), 0);
    const avgHours = timesheets.length > 0 ? (totalHours / timesheets.length).toFixed(1) : 0;
    const pendingCount = leaves.filter(l => l.status === 'PENDING').length;
    const statusColor = (status) => status === 'APPROVED' ? '#10b981' : status === 'REJECTED' ? '#ef4444' : '#f59e0b';
    const projectStatusColor = (status) => status === 'COMPLETED' ? '#10b981' : status === 'ON_HOLD' ? '#f59e0b' : '#6366f1';

    const tabs = [
        { key: 'profile', label: 'Profile' },
        { key: 'attendance', label: 'Attendance' },
        { key: 'leave', label: 'Leave' },
        { key: 'timesheet', label: 'Timesheet' },
        { key: 'workhours', label: 'Work Hours' },
        { key: 'regularization', label: 'Regularization' },
        { key: 'projects', label: 'My Projects' },
        { key: 'changepass', label: 'Change Password' }
    ];

    const initials = profile?.name ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';

    return (
        <div style={styles.container}>
            <style>{`
                .tab-btn:hover { background: #eef2ff !important; color: #4f46e5 !important; }
                .nav-btn:hover { background: rgba(255,255,255,0.15) !important; }
                .modern-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; }
                .action-btn:hover { opacity: 0.88; transform: translateY(-1px); }
                table tr:hover td { background: #f9fafb; }
            `}</style>

            <div style={styles.navbar}>
                <span style={styles.brand}>Employee Management System</span>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <div style={styles.userBadge}>
                        <span style={styles.avatar}>{initials}</span>
                        <span>{profile?.name}</span>
                    </div>
                    <button className="nav-btn" style={styles.logoutBtn} onClick={onLogout}>Logout</button>
                </div>
            </div>

            <div style={styles.tabBar}>
                {tabs.map(tab => (
                    <button key={tab.key} className="tab-btn"
                            style={{ ...styles.tabBtn, background: activeTab === tab.key ? '#6366f1' : 'transparent', color: activeTab === tab.key ? 'white' : '#4b5563' }}
                            onClick={() => {
                                setActiveTab(tab.key);
                                if (tab.key === 'attendance') loadAttendance();
                                if (tab.key === 'leave') loadLeaves();
                                if (tab.key === 'timesheet') loadTimesheets();
                                if (tab.key === 'workhours') loadTimesheets();
                                if (tab.key === 'regularization') loadRegularizations();
                                if (tab.key === 'projects') loadProjects();
                            }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={styles.content}>

                {activeTab === 'profile' && profile && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>My Profile</h2>
                        {[['Employee ID', profile.id], ['Name', profile.name], ['Department', profile.department], ['Designation', profile.designation], ['Email', profile.email], ['Mobile', profile.mobileNumber], ['Joining Date', profile.joiningDate]].map(([label, value]) => (
                            <div key={label} style={styles.profileRow}>
                                <span style={styles.profileLabel}>{label}</span>
                                <span style={styles.profileValue}>{value}</span>
                            </div>
                        ))}
                        <div style={styles.divider}></div>
                        <h3 style={styles.subTitle}>Education Details</h3>
                        {[['10th School', profile.school10 || 'Not Added'], ['10th Percentage', profile.percent10 || '-'], ['12th School', profile.school12 || 'Not Added'], ['12th Percentage', profile.percent12 || '-'], ['Degree', profile.degree || 'Not Added'], ['College', profile.college || 'Not Added'], ['CGPA', profile.cgpa || '-']].map(([label, value]) => (
                            <div key={label} style={styles.profileRow}>
                                <span style={styles.profileLabel}>{label}</span>
                                <span style={styles.profileValue}>{value}</span>
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'attendance' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Attendance</h2>
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                            <button className="action-btn" style={styles.btnGreen} onClick={punchIn}>Punch In</button>
                            <button className="action-btn" style={styles.btnRed} onClick={punchOut}>Punch Out</button>
                            <span style={{ color: '#6b7280', fontSize: '14px' }}>{punchStatus}</span>
                        </div>
                        {attendanceMsg && <p style={{ color: attendanceMsg.startsWith('success') ? '#059669' : '#dc2626', fontWeight: '500', fontSize: '14px' }}>{attendanceMsg.split(':')[1]}</p>}
                        <h3 style={{ ...styles.subTitle, marginTop: '20px' }}>Attendance Records</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={styles.table}>
                                <thead><tr>{['Date', 'Punch In', 'Punch Out', 'Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                                <tbody>
                                {attendance.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>No records found</td></tr>
                                    : attendance.map(a => <tr key={a.id}><td style={styles.td}>{a.date}</td><td style={styles.td}>{a.punchIn || '-'}</td><td style={styles.td}>{a.punchOut || '-'}</td><td style={styles.td}>{a.status}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'leave' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Apply Leave</h2>
                        <div style={styles.formGrid}>
                            <input className="modern-input" style={styles.input} type="date" value={leaveForm.fromDate} onChange={e => setLeaveForm({ ...leaveForm, fromDate: e.target.value })} />
                            <input className="modern-input" style={styles.input} type="date" value={leaveForm.toDate} onChange={e => setLeaveForm({ ...leaveForm, toDate: e.target.value })} />
                            <input className="modern-input" style={styles.input} placeholder="Reason" value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} />
                        </div>
                        <button className="action-btn" style={styles.btnBlue} onClick={applyLeave}>Apply Leave</button>
                        {leaveMsg && <p style={{ color: '#059669', fontWeight: '500', fontSize: '14px', marginTop: '8px' }}>{leaveMsg.split(':')[1]}</p>}
                        {pendingCount > 0 && <p style={{ color: '#f59e0b', fontWeight: '600', fontSize: '14px' }}>Pending Leaves: {pendingCount}</p>}
                        <h3 style={{ ...styles.subTitle, marginTop: '20px' }}>My Leaves</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={styles.table}>
                                <thead><tr>{['From', 'To', 'Reason', 'Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                                <tbody>
                                {leaves.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>No leaves applied yet</td></tr>
                                    : leaves.map(l => <tr key={l.id}><td style={styles.td}>{l.fromDate}</td><td style={styles.td}>{l.toDate}</td><td style={styles.td}>{l.reason}</td><td style={{ ...styles.td, color: statusColor(l.status), fontWeight: '600' }}>{l.status}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'timesheet' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Timesheet</h2>
                        <div style={styles.formGrid}>
                            <input className="modern-input" style={styles.input} type="date" value={timesheetForm.date} onChange={e => setTimesheetForm({ ...timesheetForm, date: e.target.value })} />
                            <input className="modern-input" style={styles.input} type="number" placeholder="Hours Worked (e.g. 8)" value={timesheetForm.hoursWorked} onChange={e => setTimesheetForm({ ...timesheetForm, hoursWorked: e.target.value })} />
                            <input className="modern-input" style={styles.input} placeholder="Task Description" value={timesheetForm.taskDescription} onChange={e => setTimesheetForm({ ...timesheetForm, taskDescription: e.target.value })} />
                        </div>
                        <button className="action-btn" style={styles.btnBlue} onClick={submitTimesheet}>Submit Timesheet</button>
                        {timesheetMsg && <p style={{ color: timesheetMsg.startsWith('success') ? '#059669' : '#dc2626', marginTop: '8px', fontWeight: '500', fontSize: '14px' }}>{timesheetMsg.split(':')[1]}</p>}
                        <h3 style={{ ...styles.subTitle, marginTop: '20px' }}>My Timesheets</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={styles.table}>
                                <thead><tr>{['Date', 'Hours Worked', 'Task', 'Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                                <tbody>
                                {timesheets.length === 0 ? <tr><td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>No timesheets submitted</td></tr>
                                    : timesheets.map(t => <tr key={t.id}><td style={styles.td}>{t.date}</td><td style={styles.td}>{t.hoursWorked} hrs</td><td style={styles.td}>{t.taskDescription}</td><td style={{ ...styles.td, color: '#6366f1', fontWeight: '600' }}>{t.status}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'workhours' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Work Hours Summary</h2>
                        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: '24px' }}>
                            <div style={{ ...styles.statCard, borderTop: '4px solid #6366f1' }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#6366f1' }}>{totalHours.toFixed(1)}</div>
                                <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>Total Hours Logged</div>
                            </div>
                            <div style={{ ...styles.statCard, borderTop: '4px solid #10b981' }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{timesheets.length}</div>
                                <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>Days Logged</div>
                            </div>
                            <div style={{ ...styles.statCard, borderTop: '4px solid #f59e0b' }}>
                                <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{avgHours}</div>
                                <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>Avg Hours/Day</div>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={styles.table}>
                                <thead><tr>{['Date', 'Hours', 'Task'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                                <tbody>
                                {timesheets.length === 0 ? <tr><td colSpan="3" style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>No data available</td></tr>
                                    : timesheets.map(t => <tr key={t.id}><td style={styles.td}>{t.date}</td><td style={{ ...styles.td, fontWeight: '600', color: '#6366f1' }}>{t.hoursWorked} hrs</td><td style={styles.td}>{t.taskDescription}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'regularization' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Attendance Regularization</h2>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '16px' }}>Missed punch in/out? Submit a correction request here.</p>
                        <div style={styles.formGrid}>
                            <input className="modern-input" style={styles.input} type="date" value={regForm.date} onChange={e => setRegForm({ ...regForm, date: e.target.value })} />
                            <input className="modern-input" style={styles.input} type="time" placeholder="Requested Punch In" value={regForm.requestedPunchIn} onChange={e => setRegForm({ ...regForm, requestedPunchIn: e.target.value })} />
                            <input className="modern-input" style={styles.input} type="time" placeholder="Requested Punch Out" value={regForm.requestedPunchOut} onChange={e => setRegForm({ ...regForm, requestedPunchOut: e.target.value })} />
                            <input className="modern-input" style={styles.input} placeholder="Reason for regularization" value={regForm.reason} onChange={e => setRegForm({ ...regForm, reason: e.target.value })} />
                        </div>
                        <button className="action-btn" style={styles.btnBlue} onClick={submitRegularization}>Submit Request</button>
                        {regMsg && <p style={{ color: regMsg.startsWith('success') ? '#059669' : '#dc2626', marginTop: '8px', fontWeight: '500', fontSize: '14px' }}>{regMsg.split(':')[1]}</p>}
                        <h3 style={{ ...styles.subTitle, marginTop: '20px' }}>My Requests</h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={styles.table}>
                                <thead><tr>{['Date', 'Punch In', 'Punch Out', 'Reason', 'Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                                <tbody>
                                {regularizations.length === 0 ? <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#9ca3af' }}>No requests submitted</td></tr>
                                    : regularizations.map(r => <tr key={r.id}><td style={styles.td}>{r.date}</td><td style={styles.td}>{r.requestedPunchIn || '-'}</td><td style={styles.td}>{r.requestedPunchOut || '-'}</td><td style={styles.td}>{r.reason}</td><td style={{ ...styles.td, color: statusColor(r.status), fontWeight: '600' }}>{r.status}</td></tr>)}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>My Projects</h2>
                        {projects.length === 0 ? (
                            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '30px' }}>No projects assigned yet</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {projects.map(p => (
                                    <div key={p.id} style={styles.projectCard}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                            <h3 style={{ margin: 0, color: '#111827', fontSize: '16px' }}>{p.projectName}</h3>
                                            <span style={{ ...styles.statusBadge, background: projectStatusColor(p.status) + '20', color: projectStatusColor(p.status) }}>{p.status}</span>
                                        </div>
                                        <p style={{ color: '#6b7280', fontSize: '14px', margin: '8px 0' }}>{p.description}</p>
                                        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                            <span style={styles.projectMeta}>📅 Start: {p.startDate || '-'}</span>
                                            <span style={styles.projectMeta}>⏰ Deadline: {p.deadline || '-'}</span>
                                            <span style={styles.projectMeta}>👤 Assigned by: {p.assignedBy || 'Admin'}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'changepass' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>Change Password</h2>
                        <input className="modern-input" style={styles.input} type="password" placeholder="Current Password" value={oldPass} onChange={e => setOldPass(e.target.value)} />
                        <input className="modern-input" style={styles.input} type="password" placeholder="New Password" value={newPass} onChange={e => setNewPass(e.target.value)} />
                        <input className="modern-input" style={styles.input} type="password" placeholder="Confirm New Password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                        <button className="action-btn" style={styles.btnBlue} onClick={changePassword}>Update Password</button>
                        {passMsg && <p style={{ color: passMsg.startsWith('success') ? '#059669' : '#dc2626', marginTop: '10px', fontWeight: '500', fontSize: '14px' }}>{passMsg.split(':')[1]}</p>}
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: '#f3f4f6', fontFamily: "'Segoe UI', sans-serif" },
    navbar: { background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', padding: '16px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' },
    brand: { fontSize: '18px', fontWeight: '600', letterSpacing: '0.3px' },
    userBadge: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px 6px 6px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
    avatar: { width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' },
    logoutBtn: { background: 'rgba(255,255,255,0.15)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', transition: 'all 0.2s' },
    tabBar: { background: 'white', padding: '12px 30px', display: 'flex', gap: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.05)', flexWrap: 'wrap' },
    tabBtn: { border: 'none', padding: '10px 18px', borderRadius: '20px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' },
    content: { maxWidth: '1100px', margin: '24px auto', padding: '0 20px' },
    card: { background: 'white', borderRadius: '14px', padding: '28px', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
    cardTitle: { color: '#111827', fontSize: '19px', marginTop: 0, marginBottom: '16px' },
    subTitle: { color: '#374151', fontSize: '16px' },
    profileRow: { padding: '10px 0', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' },
    profileLabel: { fontWeight: '600', color: '#6b7280', fontSize: '14px' },
    profileValue: { color: '#111827', fontSize: '14px', fontWeight: '500' },
    divider: { borderTop: '1px solid #e5e7eb', margin: '20px 0' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4px 12px' },
    input: { width: '100%', padding: '11px 14px', margin: '6px 0', border: '1.5px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s' },
    statCard: { flex: 1, minWidth: '150px', background: 'white', borderRadius: '12px', padding: '18px', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,0.06)' },
    projectCard: { background: '#f9fafb', borderRadius: '12px', padding: '18px', border: '1px solid #e5e7eb' },
    statusBadge: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    projectMeta: { fontSize: '13px', color: '#6b7280' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '16px' },
    th: { background: '#f9fafb', color: '#6b7280', padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '2px solid #e5e7eb' },
    td: { padding: '12px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', color: '#374151' },
    btnGreen: { background: '#10b981', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' },
    btnRed: { background: '#ef4444', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', transition: 'all 0.2s' },
    btnBlue: { background: '#6366f1', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '500', marginTop: '8px', transition: 'all 0.2s' },
};

export default EmployeeDashboard;