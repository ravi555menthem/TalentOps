import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { Calendar, Clock, ArrowUpRight, ChevronLeft, ChevronRight } from 'lucide-react';

const StatusDemo = () => {
    const { userName, userStatus, userTask, lastActive } = useUser();

    // Mock Status Data (Filtered for current user)
    const statusData = [
        { name: userName, dept: 'Engineering', availability: userStatus, task: userTask || 'No active task', lastActive: lastActive }
    ];

    // Mock Monthly Log Data
    // Helper to get the Sunday of the current week
    const getSunday = (d) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day;
        return new Date(date.setDate(diff));
    };

    const [currentWeekStart, setCurrentWeekStart] = useState(getSunday(new Date()));

    const handlePrevWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(currentWeekStart.getDate() - 7);
        setCurrentWeekStart(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentWeekStart);
        newDate.setDate(currentWeekStart.getDate() + 7);
        setCurrentWeekStart(newDate);
    };

    // Generate 7 days for the current week
    const getWeekDays = (startDate) => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            days.push(d);
        }
        return days;
    };

    const weekDays = getWeekDays(currentWeekStart);

    // Mock Data Generator
    const getMockLog = (date) => {
        const day = date.getDay();
        const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

        // Weekend logic
        if (day === 0 || day === 6) {
            return {
                id: date.getTime(),
                date: dateStr,
                in: '- -',
                out: '- -',
                hours: '0 hrs',
                status: 'ABSENT',
                color: '#ef4444'
            };
        }

        // Randomize slightly for realism
        const isLate = Math.random() > 0.8;
        const status = isLate ? 'LATE' : 'PRESENT';
        const color = isLate ? '#eab308' : '#22c55e';
        const inTime = isLate ? '09:35 AM' : '09:00 AM';

        return {
            id: date.getTime(),
            date: dateStr,
            in: inTime,
            out: '06:00 PM',
            hours: '9 hrs',
            status: status,
            color: color
        };
    };

    const monthlyLog = weekDays.map(date => getMockLog(date));

    // Date Range String
    const endDate = new Date(currentWeekStart);
    endDate.setDate(currentWeekStart.getDate() + 6);
    const dateRange = `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    Your Status
                </h2>
            </div>

            {/* Your Status List */}
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Your Status List</h3>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                            <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Team Member</th>
                            <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Department</th>
                            <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Availability</th>
                            <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Current Task</th>
                            <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Last Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {statusData.map((row, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                <td style={{ padding: '16px', fontWeight: 500 }}>{row.name}</td>
                                <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{row.dept}</td>
                                <td style={{ padding: '16px' }}>
                                    <span style={{
                                        display: 'flex', alignItems: 'center', gap: '6px',
                                        color: row.availability === 'Online' ? 'var(--success)' : row.availability === 'Away' ? 'var(--warning)' : 'var(--text-secondary)',
                                        fontWeight: 600
                                    }}>
                                        <span style={{
                                            width: '8px', height: '8px', borderRadius: '50%',
                                            backgroundColor: row.availability === 'Online' ? 'var(--success)' : row.availability === 'Away' ? 'var(--warning)' : 'var(--text-secondary)'
                                        }}></span>
                                        {row.availability}
                                    </span>
                                </td>
                                <td style={{ padding: '16px' }}>{row.task}</td>
                                <td style={{ padding: '16px' }}>{row.lastActive}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Monthly Log */}
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-lg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Monthly Log</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{dateRange}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={handlePrevWeek} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', cursor: 'pointer' }}>
                            <ChevronLeft size={16} />
                        </button>
                        <button onClick={handleNextWeek} style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', backgroundColor: 'var(--background)', cursor: 'pointer' }}>
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {monthlyLog.map((log, i) => (
                        <div key={log.id} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '16px', borderRadius: '12px', border: '1px solid var(--border)',
                            backgroundColor: 'var(--background)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div style={{
                                    width: '40px', height: '40px', borderRadius: '50%',
                                    backgroundColor: log.status === 'ABSENT' ? '#fee2e2' : log.status === 'LATE' ? '#fef9c3' : '#dcfce7',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontWeight: 'bold', color: log.status === 'ABSENT' ? '#991b1b' : log.status === 'LATE' ? '#854d0e' : '#166534'
                                }}>
                                    {i + 1}
                                </div>
                                <div>
                                    <h4 style={{ fontWeight: 'bold', fontSize: '1rem' }}>{log.date}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                        In: {log.in} • Out: {log.out}
                                    </p>
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '1rem' }}>{log.hours}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end', marginTop: '4px' }}>
                                    <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: log.color }}>{log.status}</span>
                                    <ArrowUpRight size={14} color="var(--text-secondary)" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default StatusDemo;
