import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { BarChart2, TrendingUp, Users, DollarSign, ChevronLeft, Award, Briefcase, Star } from 'lucide-react';

const AnalyticsDemo = () => {
    const [selectedTeam, setSelectedTeam] = useState(null);
    const location = useLocation();

    // Mock Data
    const teams = [
        { id: 'eng', name: 'Engineering', lead: 'Mike Ross', count: 42, performance: 92, projects: 12, color: '#3b82f6' },
        { id: 'sales', name: 'Sales', lead: 'Harvey Specter', count: 28, performance: 88, projects: 8, color: '#10b981' },
        { id: 'product', name: 'Product', lead: 'Jessica Pearson', count: 15, performance: 95, projects: 5, color: '#8b5cf6' },
        { id: 'marketing', name: 'Marketing', lead: 'Donna Paulsen', count: 18, performance: 85, projects: 9, color: '#f59e0b' },
    ];

    const employees = {
        eng: [
            { name: 'Alice Johnson', role: 'Senior Dev', performance: 96, tasks: 45, status: 'Top Performer' },
            { name: 'Bob Smith', role: 'Frontend Dev', performance: 88, tasks: 32, status: 'Consistent' },
            { name: 'Charlie Brown', role: 'DevOps', performance: 92, tasks: 28, status: 'Consistent' },
            { name: 'David Lee', role: 'Junior Dev', performance: 78, tasks: 15, status: 'Needs Improvement' },
        ],
        sales: [
            { name: 'Evan Wright', role: 'Sales Exec', performance: 98, tasks: 60, status: 'Top Performer' },
            { name: 'Frank Castle', role: 'Account Mgr', performance: 85, tasks: 40, status: 'Consistent' },
        ],
        product: [
            { name: 'Grace Hopper', role: 'Product Owner', performance: 94, tasks: 22, status: 'Top Performer' },
        ],
        marketing: [
            { name: 'Harry Potter', role: 'Content Lead', performance: 89, tasks: 35, status: 'Consistent' },
        ]
    };

    useEffect(() => {
        if (location.state?.teamId) {
            const team = teams.find(t => t.id === location.state.teamId);
            if (team) setSelectedTeam(team);
        }
    }, [location.state]);

    const currentEmployees = selectedTeam ? (employees[selectedTeam.id] || []) : [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>

            {/* Header / Navigation */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                {selectedTeam && (
                    <button
                        onClick={() => setSelectedTeam(null)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            color: 'var(--text-secondary)', fontWeight: 600,
                            padding: '8px 12px', borderRadius: '8px',
                            backgroundColor: 'var(--surface)', border: '1px solid var(--border)'
                        }}
                    >
                        <ChevronLeft size={16} /> Back to Overview
                    </button>
                )}
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {selectedTeam ? `${selectedTeam.name} Analytics` : 'Organization Overview'}
                </h2>
            </div>

            {/* Top Stats Row (Context Aware) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-lg)' }}>
                {[
                    { label: 'Avg Performance', value: selectedTeam ? `${selectedTeam.performance}%` : '89%', change: '+2%', icon: Award, color: '#f59e0b' },
                    { label: 'Total Headcount', value: selectedTeam ? selectedTeam.count : '103', change: '+5', icon: Users, color: '#3b82f6' },
                    { label: 'Active Projects', value: selectedTeam ? selectedTeam.projects : '34', change: '+3', icon: Briefcase, color: '#8b5cf6' },
                    { label: 'Retention Rate', value: '96%', change: '+1%', icon: TrendingUp, color: '#10b981' },
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

            {/* Main Content Area */}
            {!selectedTeam ? (
                // Teams Grid View
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-lg)' }}>
                    {teams.map((team) => (
                        <div
                            key={team.id}
                            onClick={() => setSelectedTeam(team)}
                            style={{
                                backgroundColor: 'var(--surface)', padding: 'var(--spacing-xl)', borderRadius: '16px',
                                boxShadow: 'var(--shadow-sm)', cursor: 'pointer', border: '1px solid transparent',
                                transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: team.color + '20', color: team.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Users size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{team.name}</h3>
                                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Lead: {team.lead}</p>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: team.color }}>{team.performance}%</p>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Avg Score</p>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
                                <div style={{ backgroundColor: 'var(--background)', padding: '12px', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Employees</p>
                                    <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{team.count}</p>
                                </div>
                                <div style={{ backgroundColor: 'var(--background)', padding: '12px', borderRadius: '8px' }}>
                                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Projects</p>
                                    <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{team.projects}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                // Employee List View
                <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
                    <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border)' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Team Members</h3>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Employee</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Role</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Performance</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Tasks Completed</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentEmployees.map((emp, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px', fontWeight: 500 }}>{emp.name}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{emp.role}</td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, height: '6px', width: '80px', backgroundColor: 'var(--background)', borderRadius: '3px' }}>
                                                <div style={{ width: `${emp.performance}%`, height: '100%', backgroundColor: emp.performance > 90 ? 'var(--success)' : emp.performance > 80 ? 'var(--warning)' : 'var(--danger)', borderRadius: '3px' }}></div>
                                            </div>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{emp.performance}%</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px' }}>{emp.tasks}</td>
                                    <td style={{ padding: '16px' }}>
                                        <span style={{
                                            padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                            backgroundColor: emp.status === 'Top Performer' ? '#dcfce7' : emp.status === 'Needs Improvement' ? '#fee2e2' : '#e0f2fe',
                                            color: emp.status === 'Top Performer' ? '#166534' : emp.status === 'Needs Improvement' ? '#991b1b' : '#075985'
                                        }}>
                                            {emp.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

        </div>
    );
};

export default AnalyticsDemo;
