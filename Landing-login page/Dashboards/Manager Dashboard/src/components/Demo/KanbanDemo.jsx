import React, { useState } from 'react';
import { MoreHorizontal, Plus, X, User, Users, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const KanbanDemo = () => {
    const { addToast } = useToast();
    const [showModal, setShowModal] = useState(false);

    // Helper to get the Sunday of the current week
    const getSunday = (d) => {
        const date = new Date(d);
        const day = date.getDay();
        const diff = date.getDate() - day;
        return new Date(date.setDate(diff));
    };

    // State for the start date of the currently viewed week (Always Sunday)
    const [weekStart, setWeekStart] = useState(getSunday(new Date()));

    // Default selected date to today
    const today = new Date().toISOString().split('T')[0];
    const [selectedDate, setSelectedDate] = useState(today);

    // Mock Data
    const teams = ['Engineering', 'Design', 'Product', 'Marketing'];
    const employees = {
        'Engineering': ['Alice Johnson', 'Bob Smith', 'David Lee'],
        'Design': ['Charlie Brown', 'Eve Davis'],
        'Product': ['Frank Miller', 'Grace Ho'],
        'Marketing': ['Hank Green', 'Ivy Wilson']
    };

    // Filter State
    const [selectedTeam, setSelectedTeam] = useState('All');
    const [selectedEmployee, setSelectedEmployee] = useState('All');

    const [newTask, setNewTask] = useState({ title: '', team: 'Engineering', assignee: 'team', date: today });

    const [columns, setColumns] = useState([
        {
            id: 'todo', title: 'To Do', color: '#64748b',
            items: [
                { id: 1, title: 'Update Documentation', assignee: 'Alice Johnson', team: 'Engineering', type: 'user', date: today },
                { id: 2, title: 'Review PR #123', assignee: 'Entire Team', team: 'Engineering', type: 'team', date: today }
            ]
        },
        {
            id: 'progress', title: 'In Progress', color: '#3b82f6',
            items: [
                { id: 3, title: 'Fix Login Bug', assignee: 'Bob Smith', team: 'Engineering', type: 'user', date: today }
            ]
        },
        {
            id: 'review', title: 'Review', color: '#f59e0b',
            items: [
                { id: 4, title: 'Design System Audit', assignee: 'Entire Team', team: 'Design', type: 'team', date: '2025-12-03' }
            ]
        },
        {
            id: 'done', title: 'Done', color: '#10b981',
            items: [
                { id: 5, title: 'Q3 Planning', assignee: 'Entire Team', team: 'Product', type: 'team', date: '2025-12-01' }
            ]
        },
    ]);

    // Generate 7 days starting from weekStart
    const getDays = (startDate) => {
        const days = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(startDate);
            d.setDate(startDate.getDate() + i);
            days.push({
                date: d.toISOString().split('T')[0],
                day: d.toLocaleDateString('en-US', { weekday: 'short' }),
                num: d.getDate()
            });
        }
        return days;
    };

    const days = getDays(weekStart);

    const handlePrevWeek = () => {
        const newDate = new Date(weekStart);
        newDate.setDate(weekStart.getDate() - 7);
        setWeekStart(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(weekStart);
        newDate.setDate(weekStart.getDate() + 7);
        setWeekStart(newDate);
    };

    const handleAddTask = () => {
        if (!newTask.title) return;

        const updatedColumns = [...columns];
        updatedColumns[0].items.push({
            id: Date.now(),
            title: newTask.title,
            assignee: newTask.assignee === 'team' ? 'Entire Team' : newTask.assignee,
            team: newTask.team,
            type: newTask.assignee === 'team' ? 'team' : 'user',
            date: newTask.date
        });

        setColumns(updatedColumns);
        setShowModal(false);
        setNewTask({ title: '', team: 'Engineering', assignee: 'team', date: selectedDate });
        addToast('Task added successfully', 'success');
    };

    const filteredColumns = columns.map(col => ({
        ...col,
        items: col.items.filter(item => {
            const dateMatch = item.date === selectedDate;
            const teamMatch = selectedTeam === 'All' || item.team === selectedTeam;
            const employeeMatch = selectedEmployee === 'All' || item.assignee === selectedEmployee || (selectedEmployee !== 'All' && item.assignee === 'Entire Team' && item.team === selectedTeam);

            return dateMatch && teamMatch && employeeMatch;
        })
    }));

    // Format header date range
    const endDate = new Date(weekStart);
    endDate.setDate(weekStart.getDate() + 6);

    const formatDate = (date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const headerDate = `${formatDate(weekStart)} - ${formatDate(endDate)}, ${weekStart.getFullYear()}`;

    return (
        <>
            {/* Filters and Header */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', marginBottom: 'var(--spacing-lg)' }}>
                {/* Top Row: Date Nav and Today */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{headerDate}</h3>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={handlePrevWeek} style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', cursor: 'pointer' }}>
                                <ChevronLeft size={16} />
                            </button>
                            <button onClick={handleNextWeek} style={{ padding: '4px', borderRadius: '4px', border: '1px solid var(--border)', backgroundColor: 'var(--surface)', cursor: 'pointer' }}>
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const now = new Date();
                            setWeekStart(getSunday(now));
                            setSelectedDate(now.toISOString().split('T')[0]);
                        }}
                        style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                        Today
                    </button>
                </div>

                {/* Bottom Row: Team and Employee Filters */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--surface)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                        <Filter size={16} color="var(--text-secondary)" />
                        <select
                            value={selectedTeam}
                            onChange={(e) => {
                                setSelectedTeam(e.target.value);
                                setSelectedEmployee('All'); // Reset employee when team changes
                            }}
                            style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}
                        >
                            <option value="All">All Teams</option>
                            {teams.map(team => <option key={team} value={team}>{team}</option>)}
                        </select>
                    </div>

                    {selectedTeam !== 'All' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--surface)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                            <User size={16} color="var(--text-secondary)" />
                            <select
                                value={selectedEmployee}
                                onChange={(e) => setSelectedEmployee(e.target.value)}
                                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}
                            >
                                <option value="All">All Employees</option>
                                {employees[selectedTeam].map(emp => <option key={emp} value={emp}>{emp}</option>)}
                            </select>
                        </div>
                    )}
                </div>
            </div>

            {/* Calendar Strip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: 'var(--spacing-lg)', overflowX: 'auto', paddingBottom: '8px' }}>
                {days.map((day, i) => {
                    const isSelected = day.date === selectedDate;
                    const isToday = day.date === today;
                    return (
                        <button
                            key={i}
                            onClick={() => setSelectedDate(day.date)}
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                minWidth: '60px',
                                height: '70px',
                                borderRadius: '12px',
                                backgroundColor: isSelected ? 'var(--primary)' : 'var(--surface)',
                                color: isSelected ? 'white' : 'var(--text-secondary)',
                                border: isSelected ? 'none' : isToday ? '2px solid var(--accent)' : '1px solid var(--border)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isSelected ? 'var(--shadow-md)' : 'none',
                                flexShrink: 0
                            }}
                        >
                            <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{day.day}</span>
                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{day.num}</span>
                        </button>
                    );
                })}
            </div>

            <div style={{ display: 'flex', gap: 'var(--spacing-lg)', overflowX: 'auto', paddingBottom: 'var(--spacing-lg)' }}>
                {filteredColumns.map((col, i) => (
                    <div key={i} style={{ minWidth: '300px', backgroundColor: 'var(--surface)', borderRadius: '16px', padding: 'var(--spacing-md)', boxShadow: 'var(--shadow-sm)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: col.color }}></div>
                                <h4 style={{ fontWeight: 600 }}>{col.title}</h4>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', backgroundColor: 'var(--background)', padding: '2px 6px', borderRadius: '4px' }}>{col.items.length}</span>
                            </div>
                            <button style={{ color: 'var(--text-secondary)' }}><MoreHorizontal size={16} /></button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)', minHeight: '100px' }}>
                            {col.items.length === 0 ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                    No tasks found
                                </div>
                            ) : (
                                col.items.map((item, j) => (
                                    <div key={j} style={{ backgroundColor: 'var(--background)', padding: 'var(--spacing-md)', borderRadius: '8px', border: '1px solid var(--border)', cursor: 'grab' }}>
                                        <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '8px' }}>{item.title}</p>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {item.type === 'team' ? <Users size={14} /> : <User size={14} />}
                                                <span>{item.assignee}</span>
                                            </div>
                                            <span style={{ fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--surface)', color: 'var(--text-secondary)' }}>{item.team}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                            <button
                                onClick={() => {
                                    setNewTask(prev => ({ ...prev, date: selectedDate }));
                                    setShowModal(true);
                                }}
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px', borderRadius: '8px', border: '1px dashed var(--border)', color: 'var(--text-secondary)', fontSize: '0.875rem', cursor: 'pointer', marginTop: 'auto' }}
                            >
                                <Plus size={16} /> Add Task
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Task Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ backgroundColor: 'var(--surface)', padding: 'var(--spacing-xl)', borderRadius: '16px', width: '400px', boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Add New Task</h3>
                            <button onClick={() => setShowModal(false)} style={{ color: 'var(--text-secondary)' }}><X size={20} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Task Title</label>
                                <input
                                    type="text"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    placeholder="Enter task title"
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Team</label>
                                <select
                                    value={newTask.team}
                                    onChange={(e) => setNewTask({ ...newTask, team: e.target.value, assignee: 'team' })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                                >
                                    {teams.map(team => <option key={team} value={team}>{team}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Assignee</label>
                                <select
                                    value={newTask.assignee}
                                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                                >
                                    <option value="team">Entire Team</option>
                                    {employees[newTask.team].map(emp => <option key={emp} value={emp}>{emp}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>Date</label>
                                <input
                                    type="date"
                                    value={newTask.date}
                                    onChange={(e) => setNewTask({ ...newTask, date: e.target.value })}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none' }}
                                />
                            </div>
                            <button
                                onClick={handleAddTask}
                                style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '12px', borderRadius: '8px', fontWeight: 600, marginTop: '8px' }}
                            >
                                Add Task
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default KanbanDemo;
