import React, { useState, useEffect, useRef } from 'react';
import { Bell, Search, MessageSquare, User, FileText, ClipboardList, Receipt } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const { addToast } = useToast();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);

    // Mock Search Data
    const searchData = [
        // Employees
        { id: 1, type: 'Team Member', title: 'Alice Johnson', subtitle: 'Engineering', path: '/employees', icon: User },
        { id: 2, type: 'Team Member', title: 'Bob Smith', subtitle: 'Engineering', path: '/employees', icon: User },
        { id: 3, type: 'Team Member', title: 'Charlie Brown', subtitle: 'Design', path: '/employees', icon: User },
        // Tasks
        { id: 4, type: 'Task', title: 'Fix Login Bug', subtitle: 'In Progress', path: '/tasks', icon: FileText },
        { id: 5, type: 'Task', title: 'Update Documentation', subtitle: 'To Do', path: '/tasks', icon: FileText },
        { id: 6, type: 'Task', title: 'Design System Audit', subtitle: 'Review', path: '/tasks', icon: FileText },
        // Audit Logs
        { id: 7, type: 'Audit', title: 'User Login', subtitle: 'Alice Johnson - 2 mins ago', path: '/audit', icon: ClipboardList },
        { id: 8, type: 'Audit', title: 'Permission Change', subtitle: 'Admin - 1 hour ago', path: '/audit', icon: ClipboardList },
        // Payslips
        { id: 9, type: 'Payslip', title: 'November 2025', subtitle: 'Generated', path: '/payslips', icon: Receipt },
        { id: 10, type: 'Payslip', title: 'October 2025', subtitle: 'Paid', path: '/payslips', icon: Receipt },
    ];

    const handleSearch = (e) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (query.trim() === '') {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const filtered = searchData.filter(item =>
            item.title.toLowerCase().includes(query.toLowerCase()) ||
            item.type.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filtered);
        setShowResults(true);
    };

    const handleResultClick = (path) => {
        navigate(path);
        setSearchQuery('');
        setShowResults(false);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header style={{
            height: '80px',
            backgroundColor: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 var(--spacing-xl)',
            position: 'sticky',
            top: 0,
            zIndex: 900
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Workforce Analytics</h2>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
                <div style={{ position: 'relative' }} ref={searchRef}>
                    <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search team members, tasks, logs..."
                        value={searchQuery}
                        onChange={handleSearch}
                        onFocus={() => searchQuery && setShowResults(true)}
                        style={{
                            padding: '0.5rem 1rem 0.5rem 2.5rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--background)',
                            width: '350px',
                            fontFamily: 'inherit'
                        }}
                    />

                    {/* Search Results Dropdown */}
                    {showResults && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            marginTop: '8px',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                            border: '1px solid var(--border)',
                            maxHeight: '400px',
                            overflowY: 'auto',
                            zIndex: 1000
                        }}>
                            {searchResults.length > 0 ? (
                                searchResults.map((result) => (
                                    <div
                                        key={result.id}
                                        onClick={() => handleResultClick(result.path)}
                                        style={{
                                            padding: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            borderBottom: '1px solid var(--border)',
                                            transition: 'background-color 0.2s'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--background)'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            backgroundColor: 'var(--primary-light)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--primary)'
                                        }}>
                                            <result.icon size={16} />
                                        </div>
                                        <div>
                                            <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{result.title}</p>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{result.type} • {result.subtitle}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                    No results found for "{searchQuery}"
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
                    <button
                        onClick={() => addToast('No new messages', 'info')}
                        style={{ position: 'relative', padding: '8px', borderRadius: '8px', backgroundColor: 'var(--background)' }}
                    >
                        <MessageSquare size={20} color="var(--text-secondary)" />
                    </button>
                    <button
                        onClick={() => addToast('No new notifications', 'info')}
                        style={{ position: 'relative', padding: '8px', borderRadius: '8px', backgroundColor: 'var(--background)' }}
                    >
                        <Bell size={20} color="var(--text-secondary)" />
                        <span style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', backgroundColor: 'var(--danger)', borderRadius: '50%' }}></span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
