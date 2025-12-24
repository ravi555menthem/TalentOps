import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { BarChart2, TrendingUp, Users, DollarSign, ChevronLeft, Award, Briefcase, Star, CheckCircle2 } from 'lucide-react';

const AnalyticsDemo = () => {
    const { userName } = useUser();

    // Mock Data for Current User
    const myStats = {
        performance: 94,
        tasksCompleted: 145,
        projects: 4,
        attendance: '98%'
    };

    const performanceHistory = [
        { month: 'Jan', score: 88, tasks: 12 },
        { month: 'Feb', score: 90, tasks: 15 },
        { month: 'Mar', score: 85, tasks: 10 },
        { month: 'Apr', score: 92, tasks: 18 },
        { month: 'May', score: 94, tasks: 20 },
        { month: 'Jun', score: 91, tasks: 16 },
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    My Analytics
                </h2>
            </div>

            {/* Top Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-lg)' }}>
                {[
                    { label: 'My Performance', value: `${myStats.performance}%`, change: '+2%', icon: Award, color: '#f59e0b' },
                    { label: 'Tasks Completed', value: myStats.tasksCompleted, change: '+12', icon: Briefcase, color: '#3b82f6' },
                    { label: 'Active Projects', value: myStats.projects, change: '0', icon: Star, color: '#8b5cf6' },
                    { label: 'Attendance', value: myStats.attendance, change: '+1%', icon: TrendingUp, color: '#10b981' },
                ].map((stat, i) => (
                    <div key={i} style={{ backgroundColor: 'var(--surface)', padding: 'var(--spacing-lg)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--spacing-md)' }}>
                            <div style={{ padding: '10px', borderRadius: '12px', backgroundColor: stat.color + '20', color: stat.color }}>
                                <stat.icon size={20} />
                            </div>
                            <span style={{ fontSize: '0.875rem', color: 'var(--success)', fontWeight: 600 }}>
                                {stat.change}
                            </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{stat.label}</p>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginTop: '4px' }}>{stat.value}</h3>
                    </div>
                ))}
            </div>

            {/* Performance History Chart (Mock Visual) */}
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', padding: 'var(--spacing-lg)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '24px' }}>Performance History (Last 6 Months)</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingBottom: '20px', borderBottom: '1px solid var(--border)' }}>
                    {performanceHistory.map((item, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <div style={{
                                width: '40px',
                                height: `${item.score * 1.5}px`,
                                backgroundColor: '#3b82f6',
                                borderRadius: '8px 8px 0 0',
                                opacity: 0.8,
                                transition: 'height 0.3s'
                            }}></div>
                            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.month}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Achievements / Feedback */}
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Recent Achievements</h3>
                </div>
                <div style={{ padding: 'var(--spacing-lg)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '12px', alignItems: 'center' }}>
                        <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '50%' }}>
                            <Award size={24} color="#d97706" />
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 'bold', color: '#92400e' }}>Employee of the Month</h4>
                            <p style={{ fontSize: '0.9rem', color: '#b45309' }}>Recognized for outstanding performance in the Q3 project delivery.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '16px', padding: '16px', backgroundColor: '#dcfce7', borderRadius: '12px', alignItems: 'center' }}>
                        <div style={{ padding: '10px', backgroundColor: '#fff', borderRadius: '50%' }}>
                            <CheckCircle2 size={24} color="#15803d" />
                        </div>
                        <div>
                            <h4 style={{ fontWeight: 'bold', color: '#166534' }}>Project Alpha Completed</h4>
                            <p style={{ fontSize: '0.9rem', color: '#15803d' }}>Successfully delivered the frontend architecture for Project Alpha ahead of schedule.</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default AnalyticsDemo;
