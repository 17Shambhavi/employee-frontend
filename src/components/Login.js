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
            const res = await fetch('http://localhost:8080/api/auth/login', {
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
            const res = await fetch('http://localhost:8080/api/password/forgot-password', {
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
            const res = await fetch('http://localhost:8080/api/password/verify-otp', {
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
            const res = await fetch('http://localhost:8080/api/password/reset-password', {
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
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.7; }
                }
                .login-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 4px rgba(99,102,241,0.1) !important; outline: none; }
                .login-btn:hover { background: linear-gradient(135deg, #4f46e5, #6366f1) !important; transform: translateY(-2px); box-shadow: 0 8px 25px rgba(99,102,241,0.4) !important; }
                .login-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none !important; }
                .forgot-link:hover { color: #4f46e5 !important; text-decoration: underline; }
                .back-btn:hover { background: #f3f4f6 !important; }
                .show-pass:hover { color: #6366f1 !important; }
                .bubble { position: absolute; border-radius: 50%; background: rgba(255,255,255,0.1); animation: float 3s ease-in-out infinite; }
            `}</style>

            <div style={styles.container}>
                {/* Background bubbles */}
                <div className="bubble" style={{ width: '80px', height: '80px', top: '10%', left: '10%', animationDelay: '0s' }}></div>
                <div className="bubble" style={{ width: '120px', height: '120px', top: '60%', right: '8%', animationDelay: '1s' }}></div>
                <div className="bubble" style={{ width: '60px', height: '60px', bottom: '15%', left: '15%', animationDelay: '2s' }}></div>
                <div className="bubble" style={{ width: '100px', height: '100px', top: '25%', right: '20%', animationDelay: '0.5s' }}></div>

                <div style={styles.card}>
                    {/* Left Panel */}
                    <div style={styles.leftPanel}>
                        <div style={styles.logoWrap}>
                            <span style={{ fontSize: '40px' }}>🏢</span>
                        </div>
                        <h1 style={styles.brandTitle}>EMS</h1>
                        <p style={styles.brandSubtitle}>Employee Management System</p>
                        <div style={styles.features}>
                            {['👥 Manage Employees', '📊 Track Attendance', '📅 Leave Management', '🤖 AI Assistant'].map((f, i) => (
                                <div key={i} style={styles.featureItem}>{f}</div>
                            ))}
                        </div>
                    </div>

                    {/* Right Panel */}
                    <div style={styles.rightPanel}>
                        {!showForgot ? (
                            <>
                                <h2 style={styles.welcomeTitle}>Welcome Back!</h2>
                                <p style={styles.welcomeSubtitle}>Sign in to your account</p>

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

                                <div style={{ textAlign: 'right', marginBottom: '20px' }}>
                                    <span className="forgot-link" style={styles.forgotLink}
                                          onClick={() => { setShowForgot(true); setError(''); }}>
                                        Forgot Password?
                                    </span>
                                </div>

                                <button className="login-btn" style={styles.button} onClick={handleLogin} disabled={loading}>
                                    {loading ? <span style={{ animation: 'pulse 1s infinite' }}>Signing in...</span> : '→ Sign In'}
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
                                    {!showOtp ? '🔐 Forgot Password' : !showReset ? '📧 Verify OTP' : '🔑 New Password'}
                                </h2>
                                <p style={styles.welcomeSubtitle}>
                                    {!showOtp ? 'Enter your registered email' : !showReset ? 'Check your email for OTP' : 'Create a strong new password'}
                                </p>

                                {/* Step indicator */}
                                <div style={styles.stepIndicator}>
                                    {['Email', 'OTP', 'Reset'].map((step, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <div style={{ ...styles.stepDot, background: i === 0 ? '#6366f1' : (showOtp && i === 1) || (showReset && i <= 2) ? '#6366f1' : '#e5e7eb', color: i === 0 || (showOtp && i === 1) || (showReset && i <= 2) ? 'white' : '#9ca3af' }}>{i + 1}</div>
                                            <span style={{ fontSize: '12px', color: '#6b7280' }}>{step}</span>
                                            {i < 2 && <div style={{ width: '20px', height: '2px', background: (showOtp && i === 0) || (showReset && i <= 1) ? '#6366f1' : '#e5e7eb', marginLeft: '4px' }}></div>}
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
                                    {forgotLoading ? 'Please wait...' : !showOtp ? '→ Send OTP' : !showReset ? '→ Verify OTP' : '→ Reset Password'}
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
            </div>
        </>
    );
}

const styles = {
    container: {
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
        fontFamily: "'Segoe UI', sans-serif", position: 'relative', overflow: 'hidden'
    },
    card: {
        display: 'flex', width: '820px', minHeight: '520px',
        borderRadius: '24px', overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
        animation: 'fadeInUp 0.6s ease-out'
    },
    leftPanel: {
        width: '45%', background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        padding: '50px 35px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', color: 'white'
    },
    logoWrap: {
        width: '80px', height: '80px', background: 'rgba(255,255,255,0.2)',
        borderRadius: '20px', display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginBottom: '20px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.2)'
    },
    brandTitle: { fontSize: '36px', fontWeight: '800', margin: '0 0 8px', letterSpacing: '3px' },
    brandSubtitle: { fontSize: '13px', opacity: 0.8, textAlign: 'center', marginBottom: '30px', lineHeight: '1.5' },
    features: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' },
    featureItem: { background: 'rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '10px', fontSize: '13px', backdropFilter: 'blur(10px)' },
    rightPanel: { width: '55%', background: 'white', padding: '50px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
    welcomeTitle: { fontSize: '24px', fontWeight: '700', color: '#111827', margin: '0 0 8px' },
    welcomeSubtitle: { fontSize: '14px', color: '#6b7280', marginBottom: '28px' },
    inputGroup: { marginBottom: '16px' },
    label: { fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px', display: 'block' },
    inputWrap: { position: 'relative', display: 'flex', alignItems: 'center' },
    inputIcon: { position: 'absolute', left: '12px', fontSize: '16px', zIndex: 1 },
    input: {
        width: '100%', padding: '12px 14px 12px 38px',
        border: '1.5px solid #e5e7eb', borderRadius: '10px',
        fontSize: '14px', boxSizing: 'border-box', outline: 'none',
        transition: 'all 0.2s', background: '#fafafa'
    },
    showPass: { position: 'absolute', right: '12px', cursor: 'pointer', fontSize: '16px', color: '#9ca3af', transition: 'all 0.2s' },
    forgotLink: { color: '#6366f1', fontSize: '13px', cursor: 'pointer', fontWeight: '500' },
    button: {
        width: '100%', padding: '14px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px',
        fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s',
        boxShadow: '0 4px 15px rgba(99,102,241,0.3)', marginBottom: '8px'
    },
    stepIndicator: { display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '20px' },
    stepDot: { width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700' },
    backBtn: { background: 'none', border: '1px solid #e5e7eb', color: '#6b7280', cursor: 'pointer', marginTop: '12px', fontSize: '13px', fontWeight: '500', padding: '8px 16px', borderRadius: '8px', width: '100%', transition: 'all 0.2s' },
    errorBox: { marginTop: '12px', padding: '10px 14px', background: '#fef2f2', color: '#dc2626', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }
};

export default Login;