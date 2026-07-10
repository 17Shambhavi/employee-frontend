import React, { useState, useRef } from 'react';

function ProfilePhoto({ employeeId, currentPhoto, token, onUpdated, size = 90 }) {
    const [photo, setPhoto] = useState(currentPhoto || null);
    const [showMenu, setShowMenu] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    const savePhoto = async (base64) => {
        setUploading(true);
        try {
            await fetch(`https://employee-management-production-2291.up.railway.app/api/employee/profile/${employeeId}/photo`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                body: JSON.stringify({ photo: base64 })
            });
            setPhoto(base64);
            if (onUpdated) onUpdated(base64);
        } catch (err) { console.error(err); }
        setUploading(false);
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => savePhoto(reader.result);
        reader.readAsDataURL(file);
        setShowMenu(false);
    };

    const openCamera = async () => {
        setShowMenu(false);
        setShowCamera(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            alert('Camera access denied or not available.');
            setShowCamera(false);
        }
    };

    const closeCamera = () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        setShowCamera(false);
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        savePhoto(base64);
        closeCamera();
    };

    return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
            <div onClick={() => setShowMenu(!showMenu)} style={{
                width: size, height: size, borderRadius: '50%', cursor: 'pointer',
                background: photo ? `url(${photo}) center/cover` : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: size * 0.35, fontWeight: '700',
                border: '3px solid white', boxShadow: '0 2px 10px rgba(0,0,0,0.15)', position: 'relative'
            }}>
                {!photo && '👤'}
                <div style={{
                    position: 'absolute', bottom: 0, right: 0, width: size * 0.32, height: size * 0.32,
                    background: '#6366f1', borderRadius: '50%', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: size * 0.16, border: '2px solid white'
                }}>📷</div>
                {uploading && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'white' }}>...</div>}
            </div>

            {showMenu && (
                <div style={{
                    position: 'absolute', top: size + 8, left: 0, background: 'white', borderRadius: '10px',
                    boxShadow: '0 6px 24px rgba(0,0,0,0.15)', overflow: 'hidden', zIndex: 100, minWidth: '170px'
                }}>
                    <div onClick={() => fileInputRef.current.click()} style={menuItemStyle}>📁 Upload Photo</div>
                    <div onClick={openCamera} style={menuItemStyle}>📷 Take Photo</div>
                </div>
            )}
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />

            {showCamera && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
                    <div style={{ background: 'white', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
                        <video ref={videoRef} autoPlay playsInline style={{ width: '320px', borderRadius: '10px', background: '#000' }} />
                        <div style={{ marginTop: '14px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
                            <button onClick={capturePhoto} style={{ background: '#6366f1', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>📸 Capture</button>
                            <button onClick={closeCamera} style={{ background: '#e5e7eb', color: '#374151', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const menuItemStyle = { padding: '12px 16px', cursor: 'pointer', fontSize: '13px', fontWeight: '500', color: '#374151', borderBottom: '1px solid #f3f4f6' };

export default ProfilePhoto;