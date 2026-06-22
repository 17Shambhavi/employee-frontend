import React, { useState } from 'react';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.token) {
                onLogin(data);
            } else {
                setError('Wrong credentials, please try again');
            }
        } catch (e) {
            setError('Unable to reach server');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') handleLogin();
    };

    return (
        <>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .login-input:focus {
                    border-color: #6366f1 !important;
                    box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
                }
                .login-button:hover {
                    background: #4f46e5 !important;
                    transform: translateY(-1px);
                }
                .login-button:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                }
            `}</style>
            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.iconCircle}>🏢</div>
                    <h2 style={styles.title}>Employee Management System</h2>
                    <p style={styles.subtitle}>Sign in to continue</p>

                    <input
                        className="login-input"
                        style={styles.input}
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />
                    <input
                        className="login-input"
                        style={styles.input}
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        onKeyPress={handleKeyPress}
                    />

                    <button
                        className="login-button"
                        style={styles.button}
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Login'}
                    </button>

                    {error && (
                        <div style={styles.errorBox}>
                            <span>⚠️</span> {error}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

const styles = {
    container: {
        display: 'flex', justifyContent: 'center',
        alignItems: 'center', height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "'Segoe UI', sans-serif"
    },
    card: {
        background: 'white', padding: '45px 40px',
        borderRadius: '16px', width: '380px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        animation: 'fadeIn 0.5s ease-out',
        textAlign: 'center'
    },
    iconCircle: {
        width: '60px', height: '60px',
        background: 'linear-gradient(135deg, #667eea, #764ba2)',
        borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '28px', margin: '0 auto 16px'
    },
    title: { color: '#1f2937', marginBottom: '4px', fontSize: '20px' },
    subtitle: { color: '#9ca3af', marginBottom: '24px', fontSize: '14px' },
    input: {
        width: '100%', padding: '12px 14px', margin: '8px 0',
        border: '1.5px solid #e5e7eb', borderRadius: '8px',
        fontSize: '14px', boxSizing: 'border-box',
        outline: 'none', transition: 'all 0.2s ease'
    },
    button: {
        width: '100%', padding: '13px', background: '#6366f1',
        color: 'white', border: 'none', borderRadius: '8px',
        fontSize: '15px', fontWeight: '600', cursor: 'pointer',
        marginTop: '14px', transition: 'all 0.2s ease'
    },
    errorBox: {
        marginTop: '14px', padding: '10px',
        background: '#fef2f2', color: '#dc2626',
        borderRadius: '8px', fontSize: '13px',
        display: 'flex', alignItems: 'center', gap: '6px',
        justifyContent: 'center'
    }
};

export default Login;