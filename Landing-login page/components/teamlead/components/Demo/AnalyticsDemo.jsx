import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { BarChart2, TrendingUp, Users, DollarSign, Award, Briefcase, Star } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';

const AnalyticsDemo = () => {
    const { teamId } = useUser();
    const [teamData, setTeamData] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        avgPerformance: 0,
        headcount: 0,
        activeTasks: 0,
        retentionRate: 0
    });

    useEffect(() => {
        const fetchTeamAnalytics = async () => {
            if (!teamId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                // Fetch Team Info
                const { data: team, error: teamError } = await supabase
                    .from('teams')
                    .select('id, team_name')
                    .eq('id', teamId)
                    .single();

                if (teamError) throw teamError;
                setTeamData(team);

                // Fetch Team Members
                const { data: teamMembers, error: membersError } = await supabase
                    .from('profiles')
                    .select('id, full_name, role, team_id')
                    .eq('team_id', teamId);

                if (membersError) throw membersError;

                // Fetch Tasks for team members
                const memberIds = teamMembers.map(m => m.id);
                const { data: tasksData, error: tasksError } = await supabase
                    .from('tasks')
                    .select('id, status, assigned_to')
                    .in('assigned_to', memberIds);

                if (tasksError) throw tasksError;

                // Calculate stats
                let totalActiveTasks = 0;
                const employeeList = teamMembers.map(emp => {
                    const empTasks = tasksData.filter(t => t.assigned_to === emp.id);
                    const completedTasks = empTasks.filter(t => ['completed', 'done'].includes(t.status?.toLowerCase())).length;
                    const activeEmpTasks = empTasks.filter(t => !['completed', 'done'].includes(t.status?.toLowerCase())).length;

                    totalActiveTasks += activeEmpTasks;

                    const totalTasks = empTasks.length;
                    const performance = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                    return {
                        name: emp.full_name || 'Unknown',
                        role: emp.role || 'N/A',
                        performance: performance,
                        tasks: completedTasks,
                        status: performance > 80 ? 'Top Performer' : performance < 50 ? 'Needs Improvement' : 'Steady'
                    };
                });

                setEmployees(employeeList);

                // Calculate average performance
                const avgPerf = employeeList.length > 0
                    ? Math.round(employeeList.reduce((acc, emp) => acc + emp.performance, 0) / employeeList.length)
                    : 0;

                setStats({
                    avgPerformance: avgPerf,
                    headcount: teamMembers.length,
                    activeTasks: totalActiveTasks,
                    retentionRate: 95 // Placeholder - you can calculate this based on your data
                });

            } catch (error) {
                console.error('Error fetching team analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTeamAnalytics();
    }, [teamId]);

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                Loading team analytics...
            </div>
        );
    }

    if (!teamId || !teamData) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No team data available. Please ensure you are assigned to a team.
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-xl)' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {teamData.team_name} Analytics
                </h2>
            </div>

            {/* Top Stats Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-lg)' }}>
                {[
                    { label: 'Avg Performance', value: `${stats.avgPerformance}%`, change: '+5%', icon: Award, color: '#f59e0b' },
                    { label: 'Total Headcount', value: stats.headcount, change: '+2', icon: Users, color: '#3b82f6' },
                    { label: 'Active Tasks', value: stats.activeTasks, change: '+3', icon: Briefcase, color: '#8b5cf6' },
                    { label: 'Retention Rate', value: `${stats.retentionRate}%`, change: '+2%', icon: TrendingUp, color: '#10b981' },
                ].map((stat, i) => (
                    <div key={i} style={{ backgroundColor: 'var(--surface)', padding: 'var(--spacing-lg)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border)' }}>
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

            {/* Team Members List */}
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <div style={{ padding: 'var(--spacing-lg)', borderBottom: '1px solid var(--border)' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Team Members Performance</h3>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '600px' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', backgroundColor: 'var(--background)' }}>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>TEAM MEMBER</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>ROLE</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>PERFORMANCE</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>TASKS COMPLETED</th>
                                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600 }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.length > 0 ? employees.map((emp, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                                    <td style={{ padding: '16px', fontWeight: 500 }}>{emp.name}</td>
                                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{emp.role}</td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, height: '6px', width: '80px', backgroundColor: 'var(--background)', borderRadius: '3px' }}>
                                                <div style={{ width: `${emp.performance}%`, height: '100%', backgroundColor: emp.performance > 80 ? 'var(--success)' : emp.performance > 50 ? 'var(--warning)' : 'var(--danger)', borderRadius: '3px' }}></div>
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
                            )) : (
                                <tr>
                                    <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No team members found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default AnalyticsDemo;
