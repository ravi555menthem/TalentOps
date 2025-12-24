import React from 'react';
import {
    LayoutDashboard,
    BarChart2,
    Users,
    ListTodo,
    CalendarOff,
    Receipt,
    FileText,
    Briefcase,
    Network,
    ClipboardList,
    Settings,
    ChevronLeft,
    ChevronRight,
    LogOut,
    UserCheck
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isCollapsed, toggleSidebar }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
        { icon: BarChart2, label: 'Analytics', path: '/analytics' },
        { icon: Users, label: 'Employees', path: '/employees' },
        { icon: ListTodo, label: 'Task Executive', path: '/tasks' },
        { icon: CalendarOff, label: 'Leave Requests', path: '/leaves' },
        { icon: UserCheck, label: 'Employee Status', path: '/employee-status' },
        { icon: Receipt, label: 'Payslips', path: '/payslips' },
        { icon: FileText, label: 'Policies', path: '/policies' },
        { icon: Briefcase, label: 'Hiring Portal', path: '/hiring' },
        { icon: Network, label: 'Team Hierarchy', path: '/hierarchy' },
        { icon: ClipboardList, label: 'Audit Logs', path: '/audit' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <aside style={{
            width: isCollapsed ? '80px' : '260px',
            backgroundColor: 'var(--primary)',
            color: 'white',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            display: 'flex',
            flexDirection: 'column',
            padding: 'var(--spacing-lg)',
            zIndex: 1000,
            transition: 'width 0.3s ease'
        }}>
            <div style={{
                marginBottom: 'var(--spacing-xl)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                gap: 'var(--spacing-sm)',
                height: '40px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
                    {!isCollapsed && (
                        <>
                            <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px', flexShrink: 0 }}></div>
                            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.025em', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                Talent Ops
                            </h1>
                        </>
                    )}
                </div>

                <button
                    onClick={toggleSidebar}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        borderRadius: '4px',
                        transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            <nav style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--spacing-xs)',
                overflowY: 'auto',
                overflowX: 'hidden',
                paddingRight: '4px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
            }}>
                <style>
                    {`
                        nav::-webkit-scrollbar { 
                            width: 0px;
                            background: transparent;
                        }
                    `}
                </style>
                {menuItems.map((item, index) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={index}
                            onClick={() => navigate(item.path)}
                            title={isCollapsed ? item.label : ''}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                gap: 'var(--spacing-md)',
                                padding: 'var(--spacing-md)',
                                borderRadius: '8px',
                                backgroundColor: isActive ? 'var(--accent)' : 'transparent',
                                color: isActive ? 'white' : 'var(--text-secondary)',
                                transition: 'all 0.2s ease',
                                textAlign: 'left',
                                width: '100%'
                            }}
                            onMouseEnter={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'var(--primary-light)';
                                    e.currentTarget.style.color = 'white';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = isActive ? 'white' : 'var(--text-secondary)';
                                }
                            }}
                        >
                            <item.icon size={20} style={{ flexShrink: 0 }} />
                            {!isCollapsed && <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>{item.label}</span>}
                        </button>
                    );
                })}
            </nav>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 'var(--spacing-md)', marginTop: 'var(--spacing-md)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                <button
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        gap: 'var(--spacing-md)',
                        padding: 'var(--spacing-md)',
                        borderRadius: '8px',
                        color: 'var(--danger)',
                        width: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--danger)'; e.currentTarget.style.color = 'white'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = 'var(--danger)'; }}
                >
                    <LogOut size={20} style={{ flexShrink: 0 }} />
                    {!isCollapsed && <span style={{ fontWeight: 600 }}>Logout</span>}
                </button>


            </div>
        </aside>
    );
};

export default Sidebar;
