import React, { useState } from 'react';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import EmployeeDashboard from './components/EmployeeDashboard';
import HRDashboard from './components/HRDashboard';

function App() {
    const [user, setUser] = useState(null);

    const handleLogin = (data) => {
        setUser(data);
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('employeeId', data.employeeId || '');
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.clear();
    };

    return (
        <div>
            {!user ? (
                <Login onLogin={handleLogin} />
            ) : user.role === 'ADMIN' ? (
                <AdminDashboard
                    token={user.token}
                    onLogout={handleLogout}
                />
            ) : user.role === 'HR' ? (
                <HRDashboard
                    token={user.token}
                    onLogout={handleLogout}
                />
            ) : (
                <EmployeeDashboard
                    token={user.token}
                    employeeId={user.employeeId}
                    onLogout={handleLogout}
                />
            )}
        </div>
    );
}

export default App;