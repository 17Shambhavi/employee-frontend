import React, { useState, useEffect, useRef } from 'react';
const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

function AdminDashboard({ token, onLogout }) {
    const [employees, setEmployees] = useState([]);
    const [statPresent, setStatPresent] = useState(0);
    const [statLeaves, setStatLeaves] = useState(0);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [newEmp, setNewEmp] = useState({ name:'', department:'', designation:'', email:'', mobileNumber:'', salary:'', joiningDate:'' });
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [addMsg, setAddMsg] = useState('');
    const [pendingLeaves, setPendingLeaves] = useState([]);
    const [insights, setInsights] = useState(null);
    const [holidays, setHolidays] = useState([]);
    const [newHoliday, setNewHoliday] = useState({ name: '', date: '', description: '' });
    const [holidayMsg, setHolidayMsg] = useState('');
    const [projects, setProjects] = useState([]);
    const [newProject, setNewProject] = useState({ projectName: '', description: '', startDate: '', deadline: '', status: 'ONGOING', employeeId: '', assignedBy: 'Admin' });
    const [projectMsg, setProjectMsg] = useState('');
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([{ role: 'assistant', content: 'Hi! I am your AI assistant. Ask me anything about employees!' }]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        loadEmployees(); loadPendingLeaves(); loadTodayAttendance(); loadInsights(); loadHolidays(); loadProjects();
    }, []);

    useEffect(() => {
        // Auto generate notifications
        const notifs = [];
        if (statLeaves > 0) notifs.push({ id: 1, type: 'warning', msg: `${statLeaves} leave request(s) pending approval`, time: 'Just now' });
        if (employees.length > 0) notifs.push({ id: 2, type: 'info', msg: `${employees.length} total employees in system`, time: '5 min ago' });
        if (holidays.length > 0) notifs.push({ id: 3, type: 'success', msg: `${holidays.length} holidays scheduled`, time: '1 hour ago' });
        if (projects.length > 0) notifs.push({ id: 4, type: 'info', msg: `${projects.length} active projects assigned`, time: '2 hours ago' });
        setNotifications(notifs);
    }, [statLeaves, employees, holidays, projects]);

    useEffect(() => {
        if (chatOpen) chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages, chatOpen]);

    const loadEmployees = async () => {
        const res = await fetch('http://https://employee-management-production-2291.up.railway.app/api/admin/employees', { headers: { 'Authorization': 'Bearer ' + token } });
        const data = await res.json(); setEmployees(data);
    };
    const loadPendingLeaves = async () => {
        const res = await fetch('http://https://employee-management-production-2291.up.railway.app/api/admin/leaves/pending', { headers: { 'Authorization': 'Bearer ' + token } });
        if (res.ok) { const data = await res.json(); setPendingLeaves(data); setStatLeaves(data.length); }
    };
    const loadTodayAttendance = async () => {
        const res = await fetch('http://https://employee-management-production-2291.up.railway.app/api/admin/attendance/today', { headers: { 'Authorization': 'Bearer ' + token } });
        if (res.ok) { const data = await res.json(); setStatPresent(data.presentCount || 0); }
    };
    const loadInsights = async () => {
        const res = await fetch('http://https://employee-management-production-2291.up.railway.app/api/admin/attendance/insights', { headers: { 'Authorization': 'Bearer ' + token } });
        if (res.ok) { const data = await res.json(); setInsights(data); }
    };
    const loadHolidays = async () => {
        const res = await fetch('http://https://employee-management-production-2291.up.railway.app/api/holidays', { headers: { 'Authorization': 'Bearer ' + token } });
        if (res.ok) { const data = await res.json(); setHolidays(data); }
    };
    const loadProjects = async () => {
        const res = await fetch('http://https://employee-management-production-2291.up.railway.app/api/projects', { headers: { 'Authorization': 'Bearer ' + token } });
        if (res.ok) { const data = await res.json(); setProjects(data); }
    };
    const addHoliday = async () => {
        if (!newHoliday.name || !newHoliday.date) { setHolidayMsg('error:Name and date required!'); return; }
        const res = await fetch('http://https://employee-management-production-2291.up.railway.app/api/holidays', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify(newHoliday) });
        if (res.ok) { setHolidayMsg('success:Holiday added!'); setNewHoliday({ name: '', date: '', description: '' }); loadHolidays(); }
        else { setHolidayMsg('error:Error adding holiday!'); }
    };
    const deleteHoliday = async (id) => {
        if (!window.confirm('Delete this holiday?')) return;
        await fetch('http://https://employee-management-production-2291.up.railway.app/api/holidays/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
        loadHolidays();
    };
    const addProject = async () => {
        if (!newProject.projectName || !newProject.employeeId) { setProjectMsg('error:Project name and employee required!'); return; }
        const res = await fetch('http://https://employee-management-production-2291.up.railway.app/api/projects', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ ...newProject, employeeId: parseInt(newProject.employeeId) }) });
        if (res.ok) { setProjectMsg('success:Project assigned!'); setNewProject({ projectName: '', description: '', startDate: '', deadline: '', status: 'ONGOING', employeeId: '', assignedBy: 'Admin' }); loadProjects(); }
        else { setProjectMsg('error:Error assigning project!'); }
    };
    const deleteProject = async (id) => {
        if (!window.confirm('Delete this project?')) return;
        await fetch('http://https://employee-management-production-2291.up.railway.app/api/projects/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
        loadProjects();
    };
    const sendChatMessage = async () => {
        if (!chatInput.trim()) return;
        const userMsg = { role: 'user', content: chatInput };
        const updatedMessages = [...chatMessages, userMsg];
        setChatMessages(updatedMessages); setChatInput(''); setChatLoading(true);
        const ctx = `Total employees: ${employees.length}, Departments: ${[...new Set(employees.map(e => e.department))].join(', ')}, Pending leaves: ${statLeaves}, Present today: ${statPresent}, Employees: ${employees.map(e => `${e.name} (${e.department})`).join(', ')}`;
        try {
            const res = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + GROQ_API_KEY }, body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: `You are a helpful HR admin assistant. Always respond in English. ${ctx}` }, ...updatedMessages], max_tokens: 300 }) });
            const data = await res.json();
            setChatMessages(prev => [...prev, { role: 'assistant', content: data.choices[0].message.content }]);
        } catch { setChatMessages(prev => [...prev, { role: 'assistant', content: 'Error! Please try again.' }]); }
        setChatLoading(false);
    };
    const addEmployee = async () => {
        const res = await fetch('http://https://employee-management-production-2291.up.railway.app/api/admin/employees', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token }, body: JSON.stringify({ ...newEmp, salary: parseFloat(newEmp.salary) }) });
        if (res.ok) {
            const saved = await res.json();
            if (newUsername && newPassword) await fetch('http://https://employee-management-production-2291.up.railway.app/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: newUsername, password: newPassword, employeeId: String(saved.id) }) });
            setAddMsg('success:Employee added successfully!');
            setNewEmp({ name:'', department:'', designation:'', email:'', mobileNumber:'', salary:'', joiningDate:'' });
            setNewUsername(''); setNewPassword(''); loadEmployees();
        } else { setAddMsg('error:Error adding employee!'); }
    };
    const deleteEmployee = async (id) => {
        if (!window.confirm('Delete this employee?')) return;
        await fetch('http://https://employee-management-production-2291.up.railway.app/api/admin/employees/' + id, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + token } });
        loadEmployees();
    };
    const approveLeave = async (id) => { await fetch('http://https://employee-management-production-2291.up.railway.app/api/admin/leave/' + id + '/approve', { method: 'PUT', headers: { 'Authorization': 'Bearer ' + token } }); loadPendingLeaves(); };
    const rejectLeave = async (id) => { await fetch('http://https://employee-management-production-2291.up.railway.app/api/admin/leave/' + id + '/reject', { method: 'PUT', headers: { 'Authorization': 'Bearer ' + token } }); loadPendingLeaves(); };

    const tabList = [
        { key: 'dashboard', label: '📊 Dashboard' },
        { key: 'employees', label: '👥 Employees' },
        { key: 'addEmployee', label: '➕ Add Employee' },
        { key: 'leaves', label: '📋 Leave Approval' },
        { key: 'holidays', label: '🗓️ Holidays' },
        { key: 'projects', label: '🚀 Projects' },
    ];

    const notifColor = (type) => type === 'warning' ? '#f59e0b' : type === 'success' ? '#10b981' : '#6366f1';

    return (
        <div style={styles.container}>
            <style>{`
                .tab-btn:hover { background: rgba(99,102,241,0.1) !important; color: #4f46e5 !important; }
                .nav-btn:hover { background: rgba(255,255,255,0.2) !important; }
                .stat-card:hover { transform: translateY(-4px) !important; box-shadow: 0 12px 30px rgba(0,0,0,0.12) !important; }
                .modern-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important; outline: none; }
                .action-btn:hover { opacity: 0.85; transform: translateY(-1px); }
                table tr:hover td { background: #f8f9ff !important; }
                .notif-item:hover { background: #f3f4f6 !important; }
            `}</style>

            {/* Navbar */}
            <div style={styles.navbar}>
                <div style={styles.navLeft}>
                    <div style={styles.navLogo}>🏢</div>
                    <div>
                        <div style={styles.navTitle}>Employee Management System</div>
                        <div style={styles.navSub}>Admin Portal</div>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {/* Notification Bell */}
                    <div style={{ position: 'relative' }}>
                        <button className="nav-btn" style={styles.bellBtn} onClick={() => setShowNotif(!showNotif)}>
                            🔔
                            {notifications.length > 0 && <span style={styles.notifBadge}>{notifications.length}</span>}
                        </button>
                        {showNotif && (
                            <div style={styles.notifDropdown}>
                                <div style={styles.notifHeader}>
                                    <span style={{ fontWeight: '600', fontSize: '14px' }}>Notifications</span>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{notifications.length} alerts</span>
                                </div>
                                {notifications.map(n => (
                                    <div key={n.id} className="notif-item" style={styles.notifItem}>
                                        <span style={{ fontSize: '18px' }}>{n.type === 'warning' ? '⚠️' : n.type === 'success' ? '✅' : 'ℹ️'}</span>
                                        <div>
                                            <div style={{ fontSize: '13px', color: '#111827' }}>{n.msg}</div>
                                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>{n.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div style={styles.adminBadge}>
                        <span style={styles.adminAvatar}>A</span>
                        <span style={{ fontSize: '13px' }}>Admin</span>
                    </div>
                    <button className="nav-btn" style={styles.logoutBtn} onClick={onLogout}>← Logout</button>
                </div>
            </div>

            {/* Tab Bar */}
            <div style={styles.tabBar}>
                {tabList.map(tab => (
                    <button key={tab.key} className="tab-btn"
                            style={{ ...styles.tabBtn, background: activeTab === tab.key ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent', color: activeTab === tab.key ? 'white' : '#4b5563', boxShadow: activeTab === tab.key ? '0 4px 12px rgba(99,102,241,0.3)' : 'none' }}
                            onClick={() => setActiveTab(tab.key)}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <div style={styles.content}>

                {activeTab === 'dashboard' && (
                    <div>
                        <h2 style={styles.pageTitle}>Dashboard Overview</h2>
                        <div style={styles.statCards}>
                            {[
                                { label: 'Total Employees', value: employees.length, color: '#3b82f6', bg: '#eff6ff', icon: '👥' },
                                { label: 'Present Today', value: statPresent, color: '#10b981', bg: '#f0fdf4', icon: '✅' },
                                { label: 'Pending Leaves', value: statLeaves, color: '#f59e0b', bg: '#fffbeb', icon: '📋' },
                                { label: 'Departments', value: new Set(employees.map(e => e.department)).size, color: '#8b5cf6', bg: '#f5f3ff', icon: '🏗️' },
                                { label: 'Active Projects', value: projects.length, color: '#ec4899', bg: '#fdf2f8', icon: '🚀' },
                                { label: 'Holidays', value: holidays.length, color: '#06b6d4', bg: '#ecfeff', icon: '🗓️' },
                            ].map((s, i) => (
                                <div key={i} className="stat-card" style={{ ...styles.statCard, background: s.bg, borderLeft: `4px solid ${s.color}` }}>
                                    <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
                                    <div style={{ ...styles.statNum, color: s.color }}>{s.value}</div>
                                    <div style={styles.statLabel}>{s.label}</div>
                                </div>
                            ))}
                        </div>
                        {insights && (
                            <div style={styles.insightCard}>
                                <div style={styles.insightHeader}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={styles.insightTag}>🧠 Smart Insight</span>
                                        <span style={styles.insightRate}>{insights.attendanceRate}% attendance this week</span>
                                    </div>
                                </div>
                                <p style={styles.insightText}>{insights.summary}</p>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div style={styles.quickActions}>
                            <h3 style={{ margin: '0 0 16px', color: '#374151', fontSize: '16px' }}>⚡ Quick Actions</h3>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {[
                                    { label: '➕ Add Employee', tab: 'addEmployee', color: '#10b981' },
                                    { label: '📋 Approve Leaves', tab: 'leaves', color: '#f59e0b' },
                                    { label: '🚀 Assign Project', tab: 'projects', color: '#6366f1' },
                                    { label: '🗓️ Add Holiday', tab: 'holidays', color: '#ec4899' },
                                ].map((a, i) => (
                                    <button key={i} className="action-btn" onClick={() => setActiveTab(a.tab)}
                                            style={{ background: a.color, color: 'white', border: 'none', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}>
                                        {a.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'addEmployee' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>➕ Add New Employee</h2>
                        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>Fill in the details to add a new employee</p>
                        <div style={styles.formGrid}>
                            {[
                                { field: 'name', placeholder: '👤 Full Name', icon: '👤' },
                                { field: 'department', placeholder: '🏗️ Department', icon: '🏗️' },
                                { field: 'designation', placeholder: '💼 Designation', icon: '💼' },
                                { field: 'email', placeholder: '📧 Email Address', icon: '📧' },
                                { field: 'mobileNumber', placeholder: '📱 Mobile Number', icon: '📱' },
                                { field: 'salary', placeholder: '💰 Salary (₹)', icon: '💰' },
                            ].map(({ field, placeholder }) => (
                                <input key={field} className="modern-input" style={styles.input}
                                       placeholder={placeholder} value={newEmp[field]}
                                       onChange={e => setNewEmp({...newEmp, [field]: e.target.value})} />
                            ))}
                            <input className="modern-input" style={styles.input} type="date" value={newEmp.joiningDate} onChange={e => setNewEmp({...newEmp, joiningDate: e.target.value})} />
                        </div>
                        <div style={styles.divider}></div>
                        <p style={styles.sectionLabel}>🔐 Login Credentials</p>
                        <div style={styles.formGrid}>
                            <input className="modern-input" style={styles.input} placeholder="👤 Username" value={newUsername} onChange={e => setNewUsername(e.target.value)} />
                            <input className="modern-input" style={styles.input} type="password" placeholder="🔒 Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                        </div>
                        <button className="action-btn" style={styles.btnPrimary} onClick={addEmployee}>➕ Add Employee</button>
                        {addMsg && <div style={{ ...styles.msgBox, background: addMsg.startsWith('success') ? '#f0fdf4' : '#fef2f2', color: addMsg.startsWith('success') ? '#059669' : '#dc2626', borderColor: addMsg.startsWith('success') ? '#bbf7d0' : '#fecaca' }}>{addMsg.startsWith('success') ? '✅' : '❌'} {addMsg.split(':')[1]}</div>}
                    </div>
                )}

                {activeTab === 'leaves' && (
                    <div style={styles.card}>
                        <div style={styles.cardHeader}>
                            <div>
                                <h2 style={styles.cardTitle}>📋 Leave Approval</h2>
                                <p style={{ color: '#6b7280', fontSize: '13px', margin: '4px 0 0' }}>{pendingLeaves.length} pending requests</p>
                            </div>
                            <button className="action-btn" style={styles.btnOutline} onClick={loadPendingLeaves}>🔄 Refresh</button>
                        </div>
                        <div style={{overflowX: 'auto'}}>
                            <table style={styles.table}>
                                <thead><tr>{['Emp ID','From','To','Reason','Action'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                                <tbody>
                                {pendingLeaves.length === 0
                                    ? <tr><td colSpan="5" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>✅ No pending leaves</td></tr>
                                    : pendingLeaves.map(l => (
                                        <tr key={l.id}>
                                            <td style={styles.td}><span style={styles.idBadge}>#{l.employeeId}</span></td>
                                            <td style={styles.td}>{l.fromDate}</td>
                                            <td style={styles.td}>{l.toDate}</td>
                                            <td style={styles.td}>{l.reason}</td>
                                            <td style={styles.td}>
                                                <button className="action-btn" style={styles.btnGreen} onClick={() => approveLeave(l.id)}>✅ Approve</button>
                                                <button className="action-btn" style={styles.btnRed} onClick={() => rejectLeave(l.id)}>❌ Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'holidays' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>🗓️ Manage Holidays</h2>
                        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>Add and manage company holidays</p>
                        <div style={styles.formGrid}>
                            <input className="modern-input" style={styles.input} placeholder="🎉 Holiday Name" value={newHoliday.name} onChange={e => setNewHoliday({...newHoliday, name: e.target.value})} />
                            <input className="modern-input" style={styles.input} type="date" value={newHoliday.date} onChange={e => setNewHoliday({...newHoliday, date: e.target.value})} />
                            <input className="modern-input" style={styles.input} placeholder="📝 Description" value={newHoliday.description} onChange={e => setNewHoliday({...newHoliday, description: e.target.value})} />
                        </div>
                        <button className="action-btn" style={styles.btnPrimary} onClick={addHoliday}>➕ Add Holiday</button>
                        {holidayMsg && <div style={{ ...styles.msgBox, background: holidayMsg.startsWith('success') ? '#f0fdf4' : '#fef2f2', color: holidayMsg.startsWith('success') ? '#059669' : '#dc2626', borderColor: holidayMsg.startsWith('success') ? '#bbf7d0' : '#fecaca' }}>{holidayMsg.startsWith('success') ? '✅' : '❌'} {holidayMsg.split(':')[1]}</div>}
                        <div style={styles.divider}></div>
                        <div style={{overflowX: 'auto'}}>
                            <table style={styles.table}>
                                <thead><tr>{['#','Holiday','Date','Description','Action'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                                <tbody>
                                {holidays.length === 0 ? <tr><td colSpan="5" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>No holidays added yet</td></tr>
                                    : holidays.map(h => (
                                        <tr key={h.id}>
                                            <td style={styles.td}><span style={styles.idBadge}>#{h.id}</span></td>
                                            <td style={{...styles.td, fontWeight: '600'}}>{h.name}</td>
                                            <td style={styles.td}><span style={styles.dateBadge}>{h.date}</span></td>
                                            <td style={styles.td}>{h.description}</td>
                                            <td style={styles.td}><button className="action-btn" style={styles.btnRed} onClick={() => deleteHoliday(h.id)}>🗑️ Delete</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                {activeTab === 'projects' && (
                    <div style={styles.card}>
                        <h2 style={styles.cardTitle}>🚀 Assign Projects</h2>
                        <p style={{ color: '#6b7280', fontSize: '13px', marginBottom: '20px' }}>Assign projects to employees</p>
                        <div style={styles.formGrid}>
                            <input className="modern-input" style={styles.input} placeholder="📁 Project Name" value={newProject.projectName} onChange={e => setNewProject({...newProject, projectName: e.target.value})} />
                            <input className="modern-input" style={styles.input} placeholder="📝 Description" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} />
                            <input className="modern-input" style={styles.input} type="date" placeholder="Start Date" value={newProject.startDate} onChange={e => setNewProject({...newProject, startDate: e.target.value})} />
                            <input className="modern-input" style={styles.input} type="date" placeholder="Deadline" value={newProject.deadline} onChange={e => setNewProject({...newProject, deadline: e.target.value})} />
                            <select className="modern-input" style={styles.input} value={newProject.status} onChange={e => setNewProject({...newProject, status: e.target.value})}>
                                <option value="ONGOING">🔄 Ongoing</option>
                                <option value="COMPLETED">✅ Completed</option>
                                <option value="ON_HOLD">⏸️ On Hold</option>
                            </select>
                            <select className="modern-input" style={styles.input} value={newProject.employeeId} onChange={e => setNewProject({...newProject, employeeId: e.target.value})}>
                                <option value="">👤 Select Employee</option>
                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name} — {emp.department}</option>)}
                            </select>
                        </div>
                        <button className="action-btn" style={styles.btnPrimary} onClick={addProject}>🚀 Assign Project</button>
                        {projectMsg && <div style={{ ...styles.msgBox, background: projectMsg.startsWith('success') ? '#f0fdf4' : '#fef2f2', color: projectMsg.startsWith('success') ? '#059669' : '#dc2626', borderColor: projectMsg.startsWith('success') ? '#bbf7d0' : '#fecaca' }}>{projectMsg.startsWith('success') ? '✅' : '❌'} {projectMsg.split(':')[1]}</div>}
                        <div style={styles.divider}></div>
                        <h3 style={{ color: '#374151', fontSize: '15px', marginBottom: '8px' }}>All Projects</h3>
                        <div style={{overflowX: 'auto'}}>
                            <table style={styles.table}>
                                <thead><tr>{['#','Project','Employee','Status','Deadline','Action'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr></thead>
                                <tbody>
                                {projects.length === 0 ? <tr><td colSpan="6" style={{textAlign:'center', padding:'40px', color:'#9ca3af'}}>No projects assigned yet</td></tr>
                                    : projects.map(p => (
                                        <tr key={p.id}>
                                            <td style={styles.td}><span style={styles.idBadge}>#{p.id}</span></td>
                                            <td style={{...styles.td, fontWeight: '600'}}>{p.projectName}</td>
                                            <td style={styles.td}>{employees.find(e => e.id === p.employeeId)?.name || `ID: ${p.employeeId}`}</td>
                                            <td style={styles.td}><span style={{ ...styles.statusBadge, background: p.status === 'COMPLETED' ? '#f0fdf4' : p.status === 'ON_HOLD' ? '#fffbeb' : '#eef2ff', color: p.status === 'COMPLETED' ? '#10b981' : p.status === 'ON_HOLD' ? '#f59e0b' : '#6366f1' }}>{p.status}</span></td>
                                            <td style={styles.td}>{p.deadline || '-'}</td>
                                            <td style={styles.td}><button className="action-btn" style={styles.btnRed} onClick={() => deleteProject(p.id)}>🗑️ Delete</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* AI Chatbot */}
            <div style={styles.chatWidget}>
                {chatOpen && (
                    <div style={styles.chatBox}>
                        <div style={styles.chatHeader}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={styles.chatAvatar}>🤖</div>
                                <div>
                                    <div style={{ fontWeight: '600', fontSize: '14px' }}>AI Assistant</div>
                                    <div style={{ fontSize: '11px', opacity: 0.8 }}>● Online</div>
                                </div>
                            </div>
                            <button onClick={() => setChatOpen(false)} style={styles.chatClose}>✕</button>
                        </div>
                        <div style={styles.chatMessages}>
                            {chatMessages.map((msg, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '8px' }}>
                                    <div style={{ ...styles.chatMsg, background: msg.role === 'user' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f3f4f6', color: msg.role === 'user' ? 'white' : '#111827', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px' }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {chatLoading && <div style={{ display: 'flex', justifyContent: 'flex-start' }}><div style={{ ...styles.chatMsg, background: '#f3f4f6', color: '#6b7280' }}>⠋ Typing...</div></div>}
                            <div ref={chatEndRef} />
                        </div>
                        <div style={styles.chatInputRow}>
                            <input style={styles.chatInput} placeholder="Ask anything about employees..." value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendChatMessage()} />
                            <button style={styles.chatSend} onClick={sendChatMessage}>➤</button>
                        </div>
                    </div>
                )}
                <button style={styles.chatFab} onClick={() => setChatOpen(!chatOpen)}>
                    {chatOpen ? '✕' : '🤖'}
                    {!chatOpen && notifications.length > 0 && <span style={{ ...styles.notifBadge, top: '-4px', right: '-4px' }}>{notifications.length}</span>}
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: { minHeight: '100vh', background: '#f0f2f5', fontFamily: "'Segoe UI', sans-serif" },
    navbar: { background: 'linear-gradient(135deg, #1e1b4b, #4f46e5)', color: 'white', padding: '14px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 20px rgba(0,0,0,0.15)' },
    navLeft: { display: 'flex', alignItems: 'center', gap: '14px' },
    navLogo: { width: '40px', height: '40px', background: 'rgba(255,255,255,0.15)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' },
    navTitle: { fontSize: '16px', fontWeight: '700', letterSpacing: '0.3px' },
    navSub: { fontSize: '11px', opacity: 0.7, marginTop: '2px' },
    adminBadge: { display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.15)', padding: '6px 14px 6px 6px', borderRadius: '20px', fontSize: '13px', fontWeight: '500' },
    adminAvatar: { width: '26px', height: '26px', background: 'linear-gradient(135deg, #f59e0b, #ec4899)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', color: 'white' },
    logoutBtn: { background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s' },
    bellBtn: { background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '38px', height: '38px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' },
    notifBadge: { position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700' },
    notifDropdown: { position: 'absolute', top: '48px', right: 0, width: '300px', background: 'white', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', zIndex: 1000, overflow: 'hidden' },
    notifHeader: { padding: '14px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    notifItem: { padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'flex-start', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '1px solid #f9fafb' },
    tabBar: { background: 'white', padding: '10px 24px', display: 'flex', gap: '6px', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', flexWrap: 'wrap' },
    tabBtn: { border: 'none', padding: '10px 18px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', transition: 'all 0.2s' },
    content: { maxWidth: '1200px', margin: '24px auto', padding: '0 24px' },
    pageTitle: { fontSize: '22px', fontWeight: '700', color: '#111827', marginBottom: '20px' },
    card: { background: 'white', borderRadius: '16px', padding: '28px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
    cardTitle: { color: '#111827', fontSize: '18px', margin: 0, fontWeight: '700' },
    statCards: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '20px' },
    statCard: { borderRadius: '14px', padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.3s', cursor: 'pointer' },
    statNum: { fontSize: '30px', fontWeight: '800', lineHeight: 1 },
    statLabel: { color: '#6b7280', marginTop: '6px', fontSize: '12px', fontWeight: '500' },
    insightCard: { background: 'linear-gradient(135deg, #eef2ff, #f5f3ff)', border: '1px solid #e0e7ff', borderRadius: '14px', padding: '20px 24px', marginBottom: '20px' },
    insightHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    insightTag: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: '11px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px' },
    insightRate: { color: '#4f46e5', fontWeight: '700', fontSize: '14px', marginLeft: '10px' },
    insightText: { color: '#374151', fontSize: '14px', lineHeight: '1.6', margin: 0 },
    quickActions: { background: 'white', borderRadius: '14px', padding: '20px 24px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
    formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '8px' },
    input: { width: '100%', padding: '11px 14px', border: '1.5px solid #e5e7eb', borderRadius: '10px', fontSize: '14px', boxSizing: 'border-box', outline: 'none', transition: 'all 0.2s', background: '#fafafa' },
    divider: { borderTop: '1px solid #f3f4f6', margin: '20px 0' },
    sectionLabel: { fontWeight: '700', color: '#374151', marginBottom: '12px', fontSize: '14px' },
    msgBox: { marginTop: '12px', padding: '10px 16px', borderRadius: '8px', fontSize: '13px', border: '1px solid', display: 'flex', alignItems: 'center', gap: '8px' },
    table: { width: '100%', borderCollapse: 'collapse', marginTop: '8px' },
    th: { background: '#f8f9ff', color: '#6b7280', padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.8px', borderBottom: '2px solid #e5e7eb' },
    td: { padding: '12px 16px', borderBottom: '1px solid #f3f4f6', fontSize: '14px', color: '#374151' },
    idBadge: { background: '#f3f4f6', color: '#6b7280', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
    deptBadge: { background: '#eef2ff', color: '#6366f1', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
    dateBadge: { background: '#f0fdf4', color: '#10b981', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600' },
    statusBadge: { padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
    empName: { display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' },
    empAvatar: { width: '28px', height: '28px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '700', flexShrink: 0 },
    btnPrimary: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', padding: '11px 24px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', marginTop: '8px' },
    btnGreen: { background: '#10b981', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', margin: '3px', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' },
    btnRed: { background: '#ef4444', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', margin: '3px', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s' },
    btnOutline: { background: 'white', color: '#6366f1', border: '1.5px solid #c7d2fe', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' },
    chatWidget: { position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 },
    chatFab: { width: '58px', height: '58px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', fontSize: '24px', cursor: 'pointer', boxShadow: '0 6px 20px rgba(99,102,241,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', transition: 'all 0.3s' },
    chatBox: { width: '340px', height: '460px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', marginBottom: '16px', overflow: 'hidden' },
    chatHeader: { background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', padding: '16px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    chatAvatar: { width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' },
    chatClose: { background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    chatMessages: { flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column' },
    chatMsg: { padding: '10px 14px', maxWidth: '80%', fontSize: '13px', lineHeight: '1.5' },
    chatInputRow: { display: 'flex', borderTop: '1px solid #f3f4f6', padding: '12px' },
    chatInput: { flex: 1, border: '1.5px solid #e5e7eb', borderRadius: '10px', padding: '9px 14px', fontSize: '13px', marginRight: '8px', outline: 'none' },
    chatSend: { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', padding: '9px 16px', cursor: 'pointer', fontSize: '14px' },
};

export default AdminDashboard