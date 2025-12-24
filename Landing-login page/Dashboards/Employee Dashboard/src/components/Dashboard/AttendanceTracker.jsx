import React, { useState, useEffect } from 'react';
import { Clock, Coffee, Play, Square, CheckCircle2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useUser } from '../../context/UserContext';

const AttendanceTracker = () => {
    const { addToast } = useToast();
    const { setUserStatus, setUserTask, setLastActive } = useUser();
    const [status, setStatus] = useState('checked-out'); // 'checked-out', 'checked-in', 'break'
    const [checkInTime, setCheckInTime] = useState(null);
    const [checkOutTime, setCheckOutTime] = useState(null);
    const [currentTask, setCurrentTask] = useState('');
    const [elapsedTime, setElapsedTime] = useState(0);

    // Timer logic
    useEffect(() => {
        let interval;
        if (status === 'checked-in') {
            interval = setInterval(() => {
                setElapsedTime(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [status]);

    const formatTime = (date) => {
        if (!date) return '--:--';
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const formatDuration = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleMainAction = () => {
        const now = new Date();
        if (status === 'checked-out') {
            setStatus('checked-in');
            setCheckInTime(now);
            setCheckOutTime(null);
            setElapsedTime(0);

            // Update Context
            setUserStatus('Online');
            setLastActive('Now');

            addToast('Checked in successfully', 'success');
        } else if (status === 'checked-in' || status === 'break') {
            setStatus('checked-out');
            setCheckOutTime(now);

            // Update Context
            setUserStatus('Offline');
            setLastActive(formatTime(now));

            addToast('Checked out successfully', 'success');
        }
    };

    const toggleBreak = () => {
        if (status === 'checked-in') {
            setStatus('break');
            setUserStatus('Away');
            addToast('Break started', 'info');
        } else if (status === 'break') {
            setStatus('checked-in');
            setUserStatus('Online');
            addToast('Break ended', 'success');
        }
    };

    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            borderRadius: '24px',
            padding: '24px',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Decoration */}
            <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ position: 'absolute', bottom: '-30px', left: '100px', width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.05)' }}></div>

            {/* Left Section: Info & Times */}
            <div style={{ flex: 1, zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#4ade80' }}></div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, opacity: 0.9 }}>Live Status</span>
                </div>

                <h2 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '4px' }}>Today's Attendance</h2>
                <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '32px' }}>{dateString}</p>

                <div style={{ display: 'flex', gap: '24px' }}>
                    {/* Check In Card */}
                    <div style={{
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        padding: '16px 24px',
                        borderRadius: '16px',
                        minWidth: '140px'
                    }}>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '4px' }}>Check In</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatTime(checkInTime)}</p>
                    </div>

                    {/* Check Out Card */}
                    <div style={{
                        backgroundColor: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(8px)',
                        padding: '16px 24px',
                        borderRadius: '16px',
                        minWidth: '140px'
                    }}>
                        <p style={{ fontSize: '0.9rem', opacity: 0.8, marginBottom: '4px' }}>Check Out</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{formatTime(checkOutTime)}</p>
                    </div>
                </div>

                {/* Current Task Input */}
                {(status === 'checked-in' || status === 'break') && (
                    <div style={{ marginTop: '24px', maxWidth: '400px' }}>
                        <input
                            type="text"
                            placeholder="What are you working on?"
                            value={currentTask}
                            onChange={(e) => {
                                setCurrentTask(e.target.value);
                                setUserTask(e.target.value);
                            }}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '12px',
                                border: 'none',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none',
                                placeholderColor: 'rgba(255,255,255,0.6)'
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Right Section: Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', zIndex: 1 }}>

                {/* Main Action Button */}
                <button
                    onClick={handleMainAction}
                    style={{
                        width: '160px',
                        height: '160px',
                        borderRadius: '50%',
                        backgroundColor: 'white',
                        border: 'none',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s',
                        color: status === 'checked-out' ? '#6366f1' : '#ef4444'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    {status === 'checked-out' ? (
                        <>
                            <Clock size={40} strokeWidth={1.5} />
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '8px' }}>Check In</span>
                        </>
                    ) : (
                        <>
                            <Square size={40} strokeWidth={1.5} fill="currentColor" />
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '8px' }}>Check Out</span>
                        </>
                    )}
                </button>

                {/* Timer Display */}
                {status !== 'checked-out' && (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '1.5rem', fontWeight: 'bold', fontFamily: 'monospace' }}>{formatDuration(elapsedTime)}</p>
                        <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>Working Time</p>
                    </div>
                )}

                {/* Break Button */}
                {status !== 'checked-out' && (
                    <button
                        onClick={toggleBreak}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '8px 16px',
                            borderRadius: '20px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 600,
                            transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
                    >
                        {status === 'break' ? <Play size={16} fill="currentColor" /> : <Coffee size={16} />}
                        {status === 'break' ? 'Resume Work' : 'Take a Break'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default AttendanceTracker;
