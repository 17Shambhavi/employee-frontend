import React, { useState } from 'react';

function Login({ onLogin }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPass, setShowPass] = useState(false);
    const [showForgot, setShowForgot] = useState(false);
    const [showOtp, setShowOtp] = useState(false);
    const [showReset, setShowReset] = useState(false);
    const [forgotEmail, setForgotEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [forgotMsg, setForgotMsg] = useState('');
    const [forgotLoading, setForgotLoading] = useState(false);

    const handleLogin = async () => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch('https://employee-management-production-2291.up.railway.app/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();
            if (data.token) { onLogin(data); }
            else { setError('Invalid username or password. Please try again.'); }
        } catch (e) { setError('Unable to reach server. Please check your connection.'); }
        finally { setLoading(false); }
    };

    const sendOtp = async () => {
        if (!forgotEmail) { setForgotMsg('error:Please enter your email!'); return; }
        setForgotLoading(true);
        try {
            const res = await fetch('https://employee-management-production-2291.up.railway.app/api/password/forgot-password', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail })
            });
            const text = await res.text();
            if (res.ok) { setForgotMsg('success:OTP sent to your email!'); setShowOtp(true); }
            else { setForgotMsg('error:' + text); }
        } catch (e) { setForgotMsg('error:Unable to reach server'); }
        setForgotLoading(false);
    };

    const verifyOtp = async () => {
        if (!otp) { setForgotMsg('error:Please enter OTP!'); return; }
        setForgotLoading(true);
        try {
            const res = await fetch('https://employee-management-production-2291.up.railway.app/api/password/verify-otp', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail, otp })
            });
            if (res.ok) { setForgotMsg('success:OTP verified successfully!'); setShowReset(true); }
            else { setForgotMsg('error:Invalid or expired OTP!'); }
        } catch (e) { setForgotMsg('error:Unable to reach server'); }
        setForgotLoading(false);
    };

    const resetPassword = async () => {
        if (!newPassword || !confirmPassword) { setForgotMsg('error:Please fill all fields!'); return; }
        if (newPassword !== confirmPassword) { setForgotMsg('error:Passwords do not match!'); return; }
        setForgotLoading(true);
        try {
            const res = await fetch('https://employee-management-production-2291.up.railway.app/api/password/reset-password', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: forgotEmail, otp, newPassword })
            });
            if (res.ok) {
                setForgotMsg('success:Password reset successfully!');
                setTimeout(() => { setShowForgot(false); setShowOtp(false); setShowReset(false); setForgotEmail(''); setOtp(''); setNewPassword(''); setConfirmPassword(''); setForgotMsg(''); }, 2000);
            } else { setForgotMsg('error:Failed to reset password!'); }
        } catch (e) { setForgotMsg('error:Unable to reach server'); }
        setForgotLoading(false);
    };

    const handleKeyPress = (e) => { if (e.key === 'Enter') handleLogin(); };

    return (
        <>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .login-input:focus { border-color: #4338ca !important; box-shadow: 0 0 0 4px rgba(67,56,202,0.12) !important; outline: none; background: white !important; }
                .login-btn:hover { background: linear-gradient(135deg, #312e81, #4338ca) !important; transform: translateY(-1px); box-shadow: 0 10px 28px rgba(67,56,202,0.35) !important; }
                .login-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none !important; }
                .forgot-link:hover { color: #4338ca !important; text-decoration: underline; }
                .back-btn:hover { background: #f8fafc !important; border-color: #cbd5e1 !important; }
                .show-pass:hover { color: #4338ca !important; }
            `}</style>

            <div style={styles.container}>
                <div style={styles.gridOverlay}></div>
                <div style={styles.glow1}></div>
                <div style={styles.glow2}></div>

                <div style={styles.card}>
                    <div style={styles.leftPanel}>
                        <div style={styles.leftPanelInner}>
                            <div style={styles.logoWrap}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 2L2 20H22L12 2Z" fill="white" />
                                </svg>
                            </div>
                            <h1 style={styles.brandTitle}>VERTEX</h1>
                            <p style={styles.brandSubtitle}>Workforce Management Platform</p>
                            <div style={styles.features}>
                                {[
                                    ['👥', 'Manage Employees'],
                                    ['📊', 'Track Attendance'],
                                    ['📅', 'Leave Management'],
                                    ['🤖', 'AI Assistant']
                                ].map(([icon, label], i) => (
                                    <div key={i} style={styles.featureItem}>
                                        <span style={styles.featureIcon}>{icon}</span>
                                        <span>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div style={styles.rightPanel}>
                        {!showForgot ? (
                            <>
                                <h2 style={styles.welcomeTitle}>Welcome back</h2>
                                <p style={styles.welcomeSubtitle}>Sign in to continue to Vertex</p>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Username</label>
                                    <div style={styles.inputWrap}>
                                        <span style={styles.inputIcon}>👤</span>
                                        <input className="login-input" style={styles.input} type="text"
                                               placeholder="Enter your username" value={username}
                                               onChange={e => setUsername(e.target.value)} onKeyPress={handleKeyPress} />
                                    </div>
                                </div>

                                <div style={styles.inputGroup}>
                                    <label style={styles.label}>Password</label>
                                    <div style={styles.inputWrap}>
                                        <span style={styles.inputIcon}>🔒</span>
                                        <input className="login-input" style={styles.input}
                                               type={showPass ? 'text' : 'password'}
                                               placeholder="Enter your password" value={password}
                                               onChange={e => setPassword(e.target.value)} onKeyPress={handleKeyPress} />
                                        <span className="show-pass" style={styles.showPass} onClick={() => setShowPass(!showPass)}>
                                            {showPass ? '🙈' : '👁️'}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ textAlign: 'right', marginBottom: '22px' }}>
                                    <span className="forgot-link" style={styles.forgotLink}
                                          onClick={() => { setShowForgot(true); setError(''); }}>
                                        Forgot Password?
                                    </span>
                                </div>

                                <button className="login-btn" style={styles.button} onClick={handleLogin} disabled={loading}>
                                    {loading ? <span style={{ animation: 'pulse 1s infinite' }}>Signing in...</span> : 'Sign In'}
                                </button>

                                {error && (
                                    <div style={styles.errorBox}>
                                        <span>⚠️</span> {error}
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <h2 style={styles.welcomeTitle}>
                                    {!showOtp ? 'Reset password' : !showReset ? 'Verify OTP' : 'New password'}
                                </h2>
                                <p style={styles.welcomeSubtitle}>
                                    {!showOtp ? 'Enter your registered email' : !showReset ? 'Check your email for the code' : 'Create a strong new password'}
                                </p>

                                <div style={styles.stepIndicator}>
                                    {['Email', 'OTP', 'Reset'].map((step, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <div style={{ ...styles.stepDot, background: i === 0 ? '#4338ca' : (showOtp && i === 1) || (showReset && i <= 2) ? '#4338ca' : '#e2e8f0', color: i === 0 || (showOtp && i === 1) || (showReset && i <= 2) ? 'white' : '#94a3b8' }}>{i + 1}</div>
                                            <span style={{ fontSize: '12px', color: '#64748b' }}>{step}</span>
                                            {i < 2 && <div style={{ width: '20px', height: '2px', background: (showOtp && i === 0) || (showReset && i <= 1) ? '#4338ca' : '#e2e8f0', marginLeft: '4px' }}></div>}
                                        </div>
                                    ))}
                                </div>

                                {!showOtp && (
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Email Address</label>
                                        <div style={styles.inputWrap}>
                                            <span style={styles.inputIcon}>📧</span>
                                            <input className="login-input" style={styles.input} type="email"
                                                   placeholder="Enter your email" value={forgotEmail}
                                                   onChange={e => setForgotEmail(e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                {showOtp && !showReset && (
                                    <div style={styles.inputGroup}>
                                        <label style={styles.label}>Enter OTP</label>
                                        <div style={styles.inputWrap}>
                                            <span style={styles.inputIcon}>🔢</span>
                                            <input className="login-input" style={{ ...styles.input, letterSpacing: '8px', textAlign: 'center', fontSize: '20px' }}
                                                   type="text" maxLength="6" placeholder="• • • • • •" value={otp}
                                                   onChange={e => setOtp(e.target.value)} />
                                        </div>
                                    </div>
                                )}

                                {showReset && (
                                    <>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>New Password</label>
                                            <div style={styles.inputWrap}>
                                                <span style={styles.inputIcon}>🔒</span>
                                                <input className="login-input" style={styles.input} type="password"
                                                       placeholder="Enter new password" value={newPassword}
                                                       onChange={e => setNewPassword(e.target.value)} />
                                            </div>
                                        </div>
                                        <div style={styles.inputGroup}>
                                            <label style={styles.label}>Confirm Password</label>
                                            <div style={styles.inputWrap}>
                                                <span style={styles.inputIcon}>🔒</span>
                                                <input className="login-input" style={styles.input} type="password"
                                                       placeholder="Confirm new password" value={confirmPassword}
                                                       onChange={e => setConfirmPassword(e.target.value)} />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <button className="login-btn" style={styles.button}
                                        onClick={!showOtp ? sendOtp : !showReset ? verifyOtp : resetPassword}
                                        disabled={forgotLoading}>
                                    {forgotLoading ? 'Please wait...' : !showOtp ? 'Send OTP' : !showReset ? 'Verify OTP' : 'Reset Password'}
                                </button>

                                {forgotMsg && (
                                    <div style={{ ...styles.errorBox, background: forgotMsg.startsWith('success') ? '#f0fdf4' : '#fef2f2', color: forgotMsg.startsWith('success') ? '#059669' : '#dc2626' }}>
                                        {forgotMsg.startsWith('success') ? '✅' : '⚠️'} {forgotMsg.split(':')[1]}
                                    </div>
                                )}

                                <button className="back-btn" style={styles.backBtn}
                                        onClick={() => { setShowForgot(false); setShowOtp(false); setShowReset(false); setForgotMsg(''); }}>
                                    ← Back to Login
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <p style={styles.footer}>© 2026 Vertex. All rights reserved.</p>
            </div>
        </>
    );
}

const styles = {
    container: {
        display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', background: '#0f0e2e',
        backgroundImage: 'radial-gradient(circle at 20% 20%, #1e1b4b 0%, #0f0e2e 55%)',
        fontFamily: "'Segoe UI', sans-serif", position: 'relative', overflow: 'hidden', padding: '20px'
    },
    gridOverlay: {
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)',
        backgroundSize: '42px 42px', pointerEvents: 'none'
    },
    glow1: { position: 'absolute', width: '420px', height: '420px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.35), transparent 70%)', top: '-120px', left: '-100px', filter: 'blur(10px)' },
    glow2: { position: 'absolute', width: '380px', height: '380px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.28), transparent 70%)', bottom: '-140px', right: '-100px', filter: 'blur(10px)' },
    card: {
        display: 'flex', width: '860px', maxWidth: '95vw', minHeight: '520px',
        borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 40px 90px rgba(0,0,0,0.45)',
        animation: 'fadeInUp 0.5s ease-out', position: 'relative', zIndex: 1
    },
    leftPanel: {
        width: '42%', background: 'linear-gradient(160deg, #1e1b4b 0%, #312e81 55%, #4338ca 100%)',
        padding: '48px 34px', display: 'flex', alignItems: 'center', color: 'white'
    },
    leftPanelInner: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', width: '100%' },
    logoWrap: {
        width: '50px', height: '50px', background: 'rgba(255,255,255,0.14)',
        borderRadius: '14px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: '22px', border: '1px solid rgba(255,255,255,0.18)'
    },
    brandTitle: { fontSize: '30px', fontWeight: '800', margin: '0 0 6px', letterSpacing: '4px' },
    brandSubtitle: { fontSize: '13px', opacity: 0.75, marginBottom: '34px', lineHeight: '1.5' },
    features: { display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' },
    featureItem: { display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', padding: '11px 14px', borderRadius: '10px', fontSize: '13px' },
    featureIcon: { fontSize: '15px' },
    rightPanel: { width: '58%', background: 'white', padding: '52px 46px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    welcomeTitle: { fontSize: '25px', fontWeight: '700', color: '#0f172a', margin: '0 0 6px', letterSpacing: '-0.3px' },
    welcomeSubtitle: { fontSize: '14px', color: '#64748b', marginBottom: '30px' },
    inputGroup: { marginBottom: '16px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px', display: 'block' },
    inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: '13px', fontSize: '15px', zIndex: 1, opacity: 0.7 },
    input: {
        width: '100%', padding: '12px 14px 12px 40px',
        border: '1.5px solid #e2e8f0', borderRadius: '10px',
        fontSize: '14px', boxSizing: 'border-box', outline: 'none',
        transition: 'all 0.2s', background: '#f8fafc', color: '#0f172a'
    },
    showPass: { position: 'absolute', right: '13px', cursor: 'pointer', fontSize: '15px', color: '#94a3b8', transition: 'all 0.2s' },
    forgotLink: { color: '#4338ca', fontSize: '13px', cursor: 'pointer', fontWeight: '600' },
    button: {
        width: '100%', padding: '13px', background: 'linear-gradient(135deg, #4338ca, #6366f1)',
        color: 'white', border: 'none', borderRadius: '10px', fontSize: '14.5px',
        fontWeight: '600', cursor: 'pointer', transition: 'all 0.25s',
        boxShadow: '0 6px 18px rgba(67,56,202,0.28)', marginBottom: '8px', letterSpacing: '0.2px'
    },
    stepIndicator: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '22px' },
    stepDot: { width: '23px', height: '23px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' },
    backBtn: { background: 'none', border: '1.5px solid #e2e8f0', color: '#64748b', cursor: 'pointer', marginTop: '12px', fontSize: '13px', fontWeight: '600', padding: '9px 16px', borderRadius: '9px', width: '100%', transition: 'all 0.2s' },
    errorBox: { marginTop: '12px', padding: '10px 14px', background: '#fef2f2', color: '#dc2626', borderRadius: '9px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' },
    footer: { position: 'relative', zIndex: 1, marginTop: '22px', color: 'rgba(255,255,255,0.4)', fontSize: '12px', letterSpacing: '0.3px' }
};

export default Login;