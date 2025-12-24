import React, { useState } from 'react';
import { Bell, Lock, User, Globe, Moon, Save } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useUser } from '../../context/UserContext';

const SettingsDemo = () => {
    const { addToast } = useToast();
    const { userName, setUserName } = useUser();
    const [notifications, setNotifications] = useState({ email: true, push: false, weekly: true });
    const [theme, setTheme] = useState('dark');
    const [fullName, setFullName] = useState(userName);

    const handleSave = () => {
        setUserName(fullName);
        addToast('Settings saved successfully!', 'success');
    };

    const Toggle = ({ checked, onChange }) => (
        <div
            onClick={onChange}
            style={{
                width: '48px', height: '24px', borderRadius: '12px',
                backgroundColor: checked ? 'var(--primary)' : 'var(--border)',
                position: 'relative', cursor: 'pointer', transition: 'all 0.2s'
            }}
        >
            <div style={{
                width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
                position: 'absolute', top: '2px', left: checked ? '26px' : '2px', transition: 'all 0.2s'
            }} />
        </div>
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)', maxWidth: '800px' }}>

            {/* Profile Section */}
            <section style={{ backgroundColor: 'var(--surface)', padding: 'var(--spacing-lg)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={20} /> Profile Settings
                </h3>
                <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center' }}>
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold' }}>
                        MG
                    </div>
                    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Email</label>
                            <input type="email" defaultValue="admin@company.com" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', color: 'var(--text-primary)' }} />
                        </div>
                    </div>
                </div>
            </section>

            {/* Notifications Section */}
            <section style={{ backgroundColor: 'var(--surface)', padding: 'var(--spacing-lg)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: 'var(--spacing-lg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Bell size={20} /> Notifications
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontWeight: 500 }}>Email Notifications</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Receive daily summaries and alerts</p>
                        </div>
                        <Toggle checked={notifications.email} onChange={() => setNotifications({ ...notifications, email: !notifications.email })} />
                    </div>
                    <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border)' }}></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <p style={{ fontWeight: 500 }}>Push Notifications</p>
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Real-time alerts on your device</p>
                        </div>
                        <Toggle checked={notifications.push} onChange={() => setNotifications({ ...notifications, push: !notifications.push })} />
                    </div>
                </div>
            </section>

            {/* Save Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={handleSave}
                    style={{
                        backgroundColor: 'var(--primary)', color: 'white', padding: '12px 24px', borderRadius: '8px',
                        fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: 'var(--shadow-md)'
                    }}
                >
                    <Save size={20} /> Save Changes
                </button>
            </div>

        </div>
    );
};

export default SettingsDemo;
