import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Clock, Calendar, ChevronRight, MoreHorizontal,
    CheckCircle2, AlertCircle, Timer, Plus, Star, X
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useUser } from '../context/UserContext';
import AttendanceTracker from '../components/Dashboard/AttendanceTracker';

const DashboardHome = () => {
    const { addToast } = useToast();
    const { userName, currentTeam } = useUser();
    const navigate = useNavigate();

    // Helper to format date as YYYY-MM-DD for comparison (Local Time)
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // State
    const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(today);

    // Mock Data
    const employeeStats = {
        active: 14,
        away: 5,
        offline: 2,
        total: 45
    };

    const teamAnalytics = [
        { id: 'eng', name: 'Engineering', count: 14, status: 'On Track', color: '#15803d' },
        { id: 'design', name: 'Design', count: 5, status: 'At Risk', color: '#b45309' },
        { id: 'product', name: 'Product', count: 1, status: 'Delayed', color: '#b91c1c' },
        { id: 'sales', name: 'Sales', count: 8, status: 'On Track', color: '#15803d' },
        { id: 'marketing', name: 'Marketing', count: 6, status: 'At Risk', color: '#b45309' },
    ];

    const teamMembers = [
        { id: 1, name: 'Alice Johnson', team: 'Engineering', task: 'API Integration', status: 'In Progress' },
        { id: 2, name: 'Bob Smith', team: 'Engineering', task: 'Bug Fixes', status: 'Completed' },
        { id: 3, name: 'David Lee', team: 'Engineering', task: 'Database Schema', status: 'Pending' },
        { id: 4, name: 'Charlie Brown', team: 'Design', task: 'UI Mockups', status: 'In Progress' },
        { id: 5, name: 'Eve Davis', team: 'Design', task: 'User Research', status: 'Completed' },
        { id: 6, name: 'Frank Miller', team: 'Product', task: 'Roadmap Planning', status: 'In Progress' },
        { id: 7, name: 'Grace Ho', team: 'Product', task: 'Competitor Analysis', status: 'Pending' },
        { id: 8, name: 'Hank Green', team: 'Marketing', task: 'Campaign Launch', status: 'In Progress' },
        { id: 9, name: 'Ivy Wilson', team: 'Marketing', task: 'Content Strategy', status: 'Completed' },
        { id: 9, name: 'Ivy Wilson', team: 'Marketing', task: 'Content Strategy', status: 'Completed' },
        { id: 10, name: 'Jack White', team: 'Sales', task: 'Lead Generation', status: 'In Progress' },
        { id: 11, name: 'Alex Morgan', team: 'Engineering', task: 'Frontend Architecture', status: 'In Progress' },
        { id: 12, name: 'Alex Morgan', team: 'Engineering', task: 'Code Review', status: 'Pending' },
    ];

    const filteredTeamMembers = currentTeam === 'All'
        ? teamMembers
        : teamMembers.filter(m => m.team === currentTeam);

    const filteredTeamAnalytics = currentTeam === 'All'
        ? teamAnalytics
        : teamAnalytics.filter(t => t.name === currentTeam);

    const activeTeamStats = filteredTeamAnalytics.length === 1 ? filteredTeamAnalytics[0] : null;

    const displayStats = activeTeamStats ? {
        total: activeTeamStats.count,
        active: Math.floor(activeTeamStats.count * 0.7),
        away: Math.floor(activeTeamStats.count * 0.2),
        offline: Math.ceil(activeTeamStats.count * 0.1)
    } : employeeStats;

    const myTasks = teamMembers.filter(m => m.name === userName);
    const myTaskStats = {
        inProgress: myTasks.filter(m => m.status === 'In Progress').length,
        inReview: myTasks.filter(m => m.status === 'Pending').length,
        completed: myTasks.filter(m => m.status === 'Completed').length
    };

    const [timeline, setTimeline] = useState([
        { id: 1, date: formatDate(today), time: '09:00', title: 'Strategy Meeting', location: 'Conference Room A', color: '#fce7f3' },
        { id: 2, date: formatDate(today), time: '11:00', title: 'Product Review', location: 'Design Lab', color: '#e0f2fe' },
        { id: 3, date: formatDate(today), time: '14:00', title: 'Team Sync', location: 'Virtual', color: '#fef9c3' },
        { id: 4, date: formatDate(today), time: '16:00', title: 'Client Call', location: 'Meeting Room 2', color: '#fce7f3' },
        { id: 5, date: formatDate(tomorrow), time: '10:00', title: 'Project Kickoff', location: 'Room 303', color: '#dcfce7' },
        { id: 6, date: formatDate(tomorrow), time: '15:30', title: 'Design Review', location: 'Creative Studio', color: '#ffedd5' },
    ]);

    // Handlers
    const handleMonthChange = (direction) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(currentMonth.getMonth() + direction);
        setCurrentMonth(newDate);
    };

    const handleDateClick = (day) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(newDate);
    };



    const handleAddEmployee = (e) => {
        e.preventDefault();
        setShowAddEmployeeModal(false);
        addToast('Team Member added successfully', 'success');
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
    const startDayOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const filteredTimeline = timeline.filter(event => event.date === formatDate(selectedDate));

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '32px' }}>

            {/* Header */}
            <div>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
                    Good morning, {userName}
                </h1>
                <p style={{ color: '#64748b', fontSize: '1rem' }}>
                    Intelly wishes you a good and productive day. {displayStats.total} team members active today. You have {filteredTimeline.length} events on {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.
                </p>
            </div>


            <div style={{ display: 'grid', gridTemplateColumns: '2.5fr 1fr', gap: '32px' }}>

                {/* Left Column: Cards Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Attendance Tracker - Moved Here */}
                    <AttendanceTracker />

                    {/* Top Row Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                        {/* Attendance Report Card (Yellow) */}
                        <div style={{ backgroundColor: '#fef08a', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '240px', position: 'relative', overflow: 'hidden' }}>
                            <div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#854d0e' }}>Attendance Report:</h3>
                            </div>

                            <div style={{ display: 'flex', gap: '24px', marginTop: '16px' }}>
                                <div>
                                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>20</span>
                                    <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#fff' }}>Present</p>
                                    <p style={{ fontSize: '0.8rem', color: '#854d0e' }}>Days</p>
                                </div>
                                <div style={{ paddingTop: '12px' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#854d0e' }}>2</span>
                                    <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#854d0e' }}>Absent</p>
                                    <p style={{ fontSize: '0.75rem', color: '#a16207' }}>Days</p>
                                </div>
                                <div style={{ paddingTop: '12px' }}>
                                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#854d0e' }}>8</span>
                                    <p style={{ fontSize: '0.9rem', fontWeight: '600', color: '#854d0e' }}>Leave Balance</p>
                                    <p style={{ fontSize: '0.75rem', color: '#a16207' }}>Days</p>
                                </div>
                            </div>

                            {/* Decorative Bottom Shapes */}
                            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginTop: 'auto', height: '40px' }}>
                                <div style={{ width: '30px', height: '20px', backgroundColor: '#422006', borderRadius: '15px 15px 0 0', opacity: 0.8 }}></div>
                                <div style={{ width: '30px', height: '35px', backgroundColor: '#a16207', borderRadius: '15px 15px 0 0', opacity: 0.6 }}></div>
                                <div style={{ width: '30px', height: '15px', backgroundColor: '#422006', borderRadius: '15px 15px 0 0', opacity: 0.8 }}></div>
                                <div style={{ width: '30px', height: '40px', backgroundColor: '#a16207', borderRadius: '15px 15px 0 0', opacity: 0.6 }}></div>
                                <div style={{ width: '30px', height: '25px', backgroundColor: '#422006', borderRadius: '15px 15px 0 0', opacity: 0.8 }}></div>
                                <div style={{ width: '30px', height: '40px', backgroundColor: '#a16207', borderRadius: '15px 15px 0 0', opacity: 0.6 }}></div>
                                <div style={{ width: '30px', height: '20px', backgroundColor: '#422006', borderRadius: '15px 15px 0 0', opacity: 0.8 }}></div>
                            </div>
                        </div>

                        {/* My Tasks Status Card (Blue) - Moved Here */}
                        <div
                            onClick={() => navigate('/tasks')}
                            style={{
                                backgroundColor: '#bfdbfe', borderRadius: '24px', padding: '24px',
                                display: 'flex', flexDirection: 'column', minHeight: '240px',
                                position: 'relative', overflow: 'hidden', cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '24px' }}>My Tasks Status:</h3>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{myTaskStats.inProgress}</span>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#1e3a8a', marginTop: '4px' }}>IN PROGRESS</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{myTaskStats.inReview}</span>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#1e3a8a', marginTop: '4px' }}>IN REVIEW</p>
                                </div>
                                <div>
                                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: '#fff' }}>{myTaskStats.completed}</span>
                                    <p style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#1e3a8a', marginTop: '4px' }}>COMPLETED</p>
                                </div>
                            </div>

                            {/* Decorative Triangle */}
                            <div style={{ position: 'absolute', bottom: 0, right: 0, width: '0', height: '0', borderStyle: 'solid', borderWidth: '0 0 100px 100px', borderColor: 'transparent transparent rgba(255,255,255,0.3) transparent' }}></div>
                        </div>
                    </div>

                    {/* Team Analytics Card (Green) - Moved to Bottom, Full Width */}
                    <div style={{ backgroundColor: '#bbf7d0', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '200px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#14532d', marginBottom: '16px' }}>Your Tasks:</h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {teamMembers.filter(member => member.name === userName).map((member) => (
                                <div
                                    key={member.id}
                                    onClick={() => navigate('/tasks', { state: { employeeName: member.name, team: member.team } })}
                                    style={{
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '12px 16px',
                                        backgroundColor: 'rgba(255,255,255,0.4)',
                                        borderRadius: '12px',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#14532d', fontSize: '0.8rem' }}>
                                            {member.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 'bold', color: '#14532d', fontSize: '0.9rem' }}>{member.task}</p>
                                            <p style={{ fontSize: '0.75rem', color: '#166534' }}>{member.name}</p>
                                        </div>
                                    </div>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        fontWeight: 'bold',
                                        color: member.status === 'Completed' ? '#15803d' : member.status === 'In Progress' ? '#b45309' : '#b91c1c',
                                        backgroundColor: '#fff',
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                    }}>
                                        {member.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Column: Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

                    {/* Calendar Widget */}
                    <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <span style={{ fontWeight: 'bold', color: '#1e293b' }}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</span>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => handleMonthChange(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b' }}>&lt;</button>
                                <button onClick={() => handleMonthChange(1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem', color: '#64748b' }}>&gt;</button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
                            <span>MO</span><span>TU</span><span>WE</span><span>TH</span><span>FR</span><span>SA</span><span>SU</span>

                            {/* Empty cells for offset */}
                            {Array.from({ length: startDayOffset }).map((_, i) => (
                                <span key={`empty-${i}`}></span>
                            ))}

                            {/* Calendar Days */}
                            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => {
                                const isSelected = selectedDate.getDate() === d && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
                                const isToday = today.getDate() === d && today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();

                                return (
                                    <span
                                        key={d}
                                        onClick={() => handleDateClick(d)}
                                        style={{
                                            padding: '6px',
                                            borderRadius: '50%',
                                            backgroundColor: isSelected ? '#000' : isToday ? '#e2e8f0' : 'transparent',
                                            color: isSelected ? '#fff' : 'inherit',
                                            cursor: 'pointer',
                                            fontWeight: isSelected || isToday ? 'bold' : 'normal'
                                        }}
                                    >
                                        {d}
                                    </span>
                                );
                            })}
                        </div>
                    </div>



                    {/* Timeline */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b' }}>
                                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </h3>
                            <div style={{ display: 'flex', gap: '16px', fontSize: '0.9rem' }}>
                                <span style={{ fontWeight: 'bold', borderBottom: '2px solid #000', paddingBottom: '2px' }}>Time</span>
                                <span style={{ color: '#94a3b8' }}>Timeline</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative', minHeight: '200px' }}>
                            {/* Vertical Line */}
                            <div style={{ position: 'absolute', left: '60px', top: '10px', bottom: '10px', width: '1px', backgroundColor: '#e2e8f0', borderLeft: '1px dashed #cbd5e1' }}></div>

                            {filteredTimeline.length > 0 ? (
                                filteredTimeline.map((event) => (
                                    <div key={event.id} style={{ display: 'flex', gap: '24px' }}>
                                        <span style={{ minWidth: '48px', fontSize: '0.85rem', color: '#94a3b8', paddingTop: '16px' }}>{event.time}</span>
                                        <div style={{ flex: 1, backgroundColor: event.color, padding: '16px', borderRadius: '16px' }}>
                                            <p style={{ fontWeight: 'bold', color: '#1e293b' }}>{event.title}</p>
                                            <p style={{ fontSize: '0.85rem', color: '#64748b' }}>{event.location}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontStyle: 'italic' }}>
                                    No events for this day
                                </div>
                            )}
                        </div>
                    </div>



                </div>
            </div>

            {/* Modals */}
            {showAddEmployeeModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: '#fff', padding: '32px', borderRadius: '24px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Add Team Member</h3>
                            <button onClick={() => setShowAddEmployeeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <form onSubmit={handleAddEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <input type="text" placeholder="Full Name" required style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                            <input type="text" placeholder="Role" required style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }} />
                            <select style={{ padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '1rem' }}>
                                <option>Engineering</option>
                                <option>Design</option>
                                <option>Product</option>
                            </select>
                            <button type="submit" style={{ backgroundColor: '#000', color: '#fff', padding: '12px', borderRadius: '12px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '8px' }}>Add Team Member</button>
                        </form>
                    </div>
                </div>
            )}





        </div>
    );
};

export default DashboardHome;
