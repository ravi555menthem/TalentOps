import React, { useState, useEffect } from 'react';
import { Search, Calendar, X, Clock, Eye, Upload, Send, RefreshCw, AlertTriangle, FileText, CheckCircle, Trash2, Paperclip, ShieldCheck, ShieldAlert, BarChart2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { supabase } from '../../../../lib/supabaseClient';

const KanbanDemo = () => {
    // Add styles for dropdown options
    React.useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .status-dropdown option {
                background-color: #f3f4f6 !important;
                color: #374151 !important;
                padding: 8px !important;
            }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const { addToast } = useToast();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTask, setSelectedTask] = useState(null);
    const [showTaskDetailsModal, setShowTaskDetailsModal] = useState(false);

    // Work Submission State
    const [submissionText, setSubmissionText] = useState('');
    const [submissionFiles, setSubmissionFiles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [taskProgress, setTaskProgress] = useState(null);
    const [lastSubmission, setLastSubmission] = useState(null);
    const [blueprint, setBlueprint] = useState(null);

    useEffect(() => {
        fetchUserTasks();
    }, []);

    const fetchUserTasks = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setLoading(false);
                return;
            }

            const { data: tasksData, error } = await supabase
                .from('tasks')
                .select('*')
                .eq('assigned_to', user.id);

            if (error) throw error;

            if (tasksData) {
                // Fetch profiles for assigned_by
                const assignerIds = [...new Set(tasksData.map(t => t.assigned_by).filter(id => id))];
                const teamIds = [...new Set(tasksData.map(t => t.team_id).filter(id => id))];

                let namesMap = {};
                let teamsMap = {};

                if (assignerIds.length > 0) {
                    const { data: profiles } = await supabase.from('profiles').select('id, full_name, email').in('id', assignerIds);
                    if (profiles) profiles.forEach(p => namesMap[p.id] = p.full_name || p.email);
                }

                if (teamIds.length > 0) {
                    const { data: teams } = await supabase.from('teams').select('id, team_name').in('id', teamIds);
                    if (teams) teams.forEach(t => teamsMap[t.id] = t.team_name);
                }

                const formatted = tasksData.map(t => ({
                    ...t,
                    assigner_name: namesMap[t.assigned_by] || 'Unknown',
                    team_name: t.team_id ? teamsMap[t.team_id] : 'N/A'
                }));

                setTasks(formatted);
                // Log unique statuses for debugging
                const uniqueStatuses = [...new Set(tasksData.map(t => t.status))];
                console.log('Unique statuses in DB:', uniqueStatuses);
            }
        } catch (error) {
            console.error('Error fetching tasks:', JSON.stringify(error, null, 2));
            addToast('Failed to load tasks', 'error');
        } finally {
            setLoading(false);
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            const { error } = await supabase
                .from('tasks')
                .update({ status: newStatus })
                .eq('id', taskId);

            if (error) throw error;

            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
            addToast('Task status updated', 'success');
        } catch (error) {
            console.error('Error updating task:', JSON.stringify(error, null, 2));
            addToast(`Failed to update task status: ${error.message || 'Unknown error'}`, 'error');
        }
    };

    const fetchBlueprint = async (taskId) => {
        const { data } = await supabase.from('task_blueprint').select('*').eq('task_id', taskId).single();
        setBlueprint(data);
    };

    const [latestReview, setLatestReview] = useState(null);

    const fetchTaskProgress = async (taskId) => {
        try {
            // Get Progress
            const { data: progress } = await supabase
                .from('task_progress')
                .select('*')
                .eq('task_id', taskId)
                .single();
            setTaskProgress(progress);

            // Get Last Submission
            const { data: submissions } = await supabase
                .from('task_submissions')
                .select('*')
                .eq('task_id', taskId)
                .order('submission_time', { ascending: false })
                .limit(1);

            if (submissions && submissions.length > 0) {
                setLastSubmission(submissions[0]);
                setSubmissionText(submissions[0].description || '');
            } else {
                setLastSubmission(null);
                setSubmissionText('');
            }

            // Get Latest Review (for feedback)
            const { data: reviews } = await supabase
                .from('task_reviews')
                .select('*')
                .eq('task_id', taskId)
                .order('reviewed_at', { ascending: false })
                .limit(1);

            if (reviews && reviews.length > 0) {
                setLatestReview(reviews[0]);
            } else {
                setLatestReview(null);
            }

            // Get blueprint rules
            fetchBlueprint(taskId);

        } catch (error) {
            console.error('Error fetching task progress:', error);
        }
    };

    const handleOpenTaskDetails = (task) => {
        setSelectedTask(task);
        setShowTaskDetailsModal(true);
        fetchTaskProgress(task.id);
        setSubmissionFiles([]);
    };

    const handleRealFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${selectedTask.id}/${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('task-proofs')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('task-proofs')
                .getPublicUrl(filePath);

            setSubmissionFiles(prev => [...prev, {
                name: file.name,
                url: publicUrl,
                type: file.type,
                path: filePath
            }]);

            addToast('Proof uploaded successfully', 'success');
        } catch (error) {
            console.error('Upload failed:', error);
            addToast('Upload failed: ' + error.message, 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = (index) => {
        setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmitWork = async (e) => {
        e.preventDefault();
        if (!selectedTask) return;
        setSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();

            // 1. Create Submission Record
            const { data: submissionData, error: subError } = await supabase
                .from('task_submissions')
                .insert({
                    task_id: selectedTask.id,
                    employee_id: user.id,
                    description: submissionText
                })
                .select()
                .single();

            if (subError) throw subError;

            // 2. Insert Evidence (Mock Files for now, assuming file upload returns URLs)
            if (submissionFiles.length > 0) {
                const evidenceRecords = submissionFiles.map(file => ({
                    submission_id: submissionData.id,
                    file_url: file.url || 'https://via.placeholder.com/150', // Mock URL
                    file_type: file.type || 'image/png',
                    uploaded_at: new Date()
                }));

                const { error: evidenceError } = await supabase
                    .from('task_evidence')
                    .insert(evidenceRecords);

                if (evidenceError) console.error('Error inserting evidence:', evidenceError);
            }

            // 3. Update Task Status to 'In Review' if currently 'In Progress'
            if (selectedTask.status !== 'done') {
                await updateTaskStatus(selectedTask.id, 'pending'); // Set to 'pending' (In Review)
            }

            addToast('Certification Engine Processing...', 'info');

            // Wait for 1 second to allow Trigger to run
            setTimeout(() => {
                fetchTaskProgress(selectedTask.id); // Refresh progress
                addToast('Work Verified & Scored!', 'success');
                setSubmitting(false);
            }, 1000);

        } catch (error) {
            console.error('Error submitting work:', error);
            addToast('Failed to submit work: ' + error.message, 'error');
            setSubmitting(false);
        }
    };

    // Filter Logic
    const filteredTasks = tasks.filter(task => {
        const matchesStatus = filterStatus === 'All' ||
            (filterStatus === 'Pending' && (task.status === 'pending' || task.status === 'to_do')) ||
            (filterStatus === 'In Progress' && task.status === 'in_progress') ||
            (filterStatus === 'Completed' && (task.status === 'done' || task.status === 'completed'));
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesStatus && matchesSearch;
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Your Tasks</h2>
                    <p style={{ color: 'var(--text-secondary)' }}>Manage and track your assigned tasks</p>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap',
                backgroundColor: 'var(--surface)', padding: '16px', borderRadius: '16px',
                border: '1px solid var(--border)'
            }}>
                <div style={{ position: 'relative', minWidth: '200px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                    <input
                        type="text"
                        placeholder="Search your tasks..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%', padding: '8px 12px 8px 36px', borderRadius: '8px',
                            border: '1px solid var(--border)', outline: 'none', fontSize: '0.9rem'
                        }}
                    />
                </div>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', outline: 'none', cursor: 'pointer', backgroundColor: 'var(--background)' }}
                >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            {/* Tasks Table */}
            <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TASK</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>DUE DATE</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>PRIORITY</th>
                                <th style={{ padding: '16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>STATUS</th>
                                <th style={{ padding: '16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading tasks...</td>
                                </tr>
                            ) : filteredTasks.length === 0 ? (
                                <tr>
                                    <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>No tasks found.</td>
                                </tr>
                            ) : (
                                filteredTasks.map((task) => (
                                    <tr
                                        key={task.id}
                                        style={{ borderBottom: '1px solid var(--border)', transition: 'background-color 0.1s' }}
                                    >
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{task.title}</div>
                                            {task.description && (
                                                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '400px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {task.description}
                                                </div>
                                            )}
                                        </td>
                                        <td style={{ padding: '16px', fontSize: '0.9rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Calendar size={14} color="var(--text-secondary)" />
                                                {new Date(task.due_date).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <span style={{
                                                padding: '4px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600,
                                                backgroundColor: task.priority === 'high' ? '#fee2e2' : task.priority === 'medium' ? '#fef3c7' : '#dcfce7',
                                                color: task.priority === 'high' ? '#991b1b' : task.priority === 'medium' ? '#92400e' : '#166534'
                                            }}>
                                                {task.priority?.toUpperCase()}
                                            </span>
                                        </td>
                                        <td style={{ padding: '16px' }}>
                                            <select
                                                className="status-dropdown"
                                                value={task.status}
                                                onChange={(e) => { e.stopPropagation(); updateTaskStatus(task.id, e.target.value); }}
                                                disabled={task.status === 'done' || task.status === 'completed'}
                                                style={{
                                                    padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 500,
                                                    backgroundColor: (task.status === 'done' || task.status === 'completed') ? '#dcfce7' : task.status === 'in_progress' ? '#dbeafe' : '#fef3c7',
                                                    color: (task.status === 'done' || task.status === 'completed') ? '#15803d' : task.status === 'in_progress' ? '#1d4ed8' : '#a16207',
                                                    border: 'none',
                                                    cursor: (task.status === 'done' || task.status === 'completed') ? 'not-allowed' : 'pointer',
                                                    outline: 'none',
                                                    opacity: (task.status === 'done' || task.status === 'completed') ? 0.7 : 1
                                                }}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="done">Completed</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center' }}>
                                            <button
                                                onClick={() => handleOpenTaskDetails(task)}
                                                style={{
                                                    padding: '8px 16px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border)',
                                                    backgroundColor: 'var(--background)',
                                                    color: 'var(--text-primary)',
                                                    cursor: 'pointer',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 500,
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.backgroundColor = '#7c3aed';
                                                    e.currentTarget.style.color = 'white';
                                                    e.currentTarget.style.borderColor = '#7c3aed';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.backgroundColor = 'var(--background)';
                                                    e.currentTarget.style.color = 'var(--text-primary)';
                                                    e.currentTarget.style.borderColor = 'var(--border)';
                                                }}
                                            >
                                                <Eye size={16} />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Task Details Modal - Enterprise Layout */}
            {showTaskDetailsModal && selectedTask && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
                    backdropFilter: 'blur(4px)'
                }}>
                    <div style={{
                        backgroundColor: 'var(--surface)', borderRadius: '16px', width: '950px', maxWidth: '95%', maxHeight: '90vh',
                        overflowY: 'auto', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column'
                    }}>
                        {/* Modal Header */}
                        <div style={{
                            padding: '24px 32px', borderBottom: '1px solid var(--border)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            background: 'var(--background)'
                        }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    {selectedTask.title}
                                    <span style={{
                                        fontSize: '0.75rem', padding: '4px 10px', borderRadius: '12px',
                                        background: selectedTask.status === 'completed' ? '#dcfce7' : '#e0f2fe',
                                        color: selectedTask.status === 'completed' ? '#166534' : '#0369a1',
                                        textTransform: 'uppercase', fontWeight: '700'
                                    }}>
                                        {selectedTask.status.replace('_', ' ')}
                                    </span>
                                </h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                    Review ID: #{selectedTask.id.slice(0, 8)} • Assigned by {selectedTask.assigner_name}
                                </p>
                            </div>
                            <button onClick={() => setShowTaskDetailsModal(false)} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%', display: 'flex' }}>
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body - 2 Column Layout */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', height: '100%' }}>

                            {/* LEFT COLUMN: Works Submission */}
                            <div style={{ padding: '32px', borderRight: '1px solid var(--border)' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FileText size={18} /> Work Submission
                                </h4>

                                {blueprint && (
                                    <div style={{ padding: '16px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
                                        <p style={{ fontWeight: '600', color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <ShieldCheck size={14} /> Certification Requirements
                                        </p>
                                        <ul style={{ paddingLeft: '24px', margin: 0, color: '#64748b' }}>
                                            {blueprint.min_files > 0 && <li>Upload at least {blueprint.min_files} proof file(s).</li>}
                                            {blueprint.expected_deliverables && <li>Target: {blueprint.expected_deliverables}</li>}
                                            <li>Provide detailed delivery notes (&gt;20 chars).</li>
                                        </ul>
                                    </div>
                                )}

                                {/* Feedback Alert */}
                                {latestReview && !latestReview.approved && selectedTask.status !== 'completed' && (
                                    <div style={{ padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', marginBottom: '20px' }}>
                                        <h5 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#991b1b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <AlertTriangle size={16} /> Revision Requested
                                        </h5>
                                        <p style={{ fontSize: '0.9rem', color: '#7f1d1d' }}>
                                            {latestReview.comment}
                                        </p>
                                        <p style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '8px', fontStyle: 'italic' }}>
                                            Returned by Manager on {new Date(latestReview.reviewed_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                )}

                                <form onSubmit={handleSubmitWork} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                            Delivery Notes
                                        </label>
                                        <textarea
                                            value={submissionText}
                                            onChange={(e) => setSubmissionText(e.target.value)}
                                            placeholder="Detailed description of work completed..."
                                            rows="4"
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '0.9rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                            Proof of Work
                                        </label>

                                        {/* Real File Upload */}
                                        <div style={{ position: 'relative' }}>
                                            <input
                                                type="file"
                                                onChange={handleRealFileUpload}
                                                disabled={uploading}
                                                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10 }}
                                            />
                                            <div style={{
                                                border: '2px dashed var(--border)', borderRadius: '8px', padding: '24px',
                                                textAlign: 'center', backgroundColor: uploading ? '#f8fafc' : 'white', transition: 'all 0.2s'
                                            }}>
                                                {uploading ? (
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                                        <div className="spinner" style={{ width: '20px', height: '20px', border: '2px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                                                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Uploading secure proof...</span>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div style={{ background: '#eff6ff', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                                                            <Upload size={20} color="#2563eb" />
                                                        </div>
                                                        <p style={{ fontSize: '0.9rem', fontWeight: '500', color: 'var(--text-primary)' }}>Click to Upload Proof</p>
                                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Supports screenshots, documents, PDFs</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* File List */}
                                        {submissionFiles.length > 0 && (
                                            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {submissionFiles.map((f, i) => (
                                                    <div key={i} style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '10px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0'
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                                                            <Paperclip size={16} color="#64748b" />
                                                            <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile(i)}
                                                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444', display: 'flex' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ marginTop: 'auto', paddingTop: '16px' }}>
                                        <button
                                            type="submit"
                                            disabled={submitting || (blueprint?.min_files > 0 && submissionFiles.length < blueprint.min_files)}
                                            style={{
                                                width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
                                                background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                                                color: 'white', fontWeight: '600', fontSize: '0.95rem',
                                                cursor: (submitting) ? 'not-allowed' : 'pointer',
                                                opacity: submitting ? 0.7 : 1,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                                                boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
                                            }}
                                        >
                                            {submitting ? 'Verifying & Submitting...' : <><ShieldCheck size={18} /> Submit for Certification</>}
                                        </button>
                                        {blueprint?.min_files > 0 && submissionFiles.length < blueprint.min_files && (
                                            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#ef4444', marginTop: '12px' }}>
                                                ⚠️ Requirement: Upload {blueprint.min_files - submissionFiles.length} more file(s) to submit.
                                            </p>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* RIGHT COLUMN: Intelligence Panel */}
                            <div style={{ padding: '32px', backgroundColor: '#f8fafc' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <BarChart2 size={18} /> Intelligence Engine
                                </h4>

                                <div style={{
                                    backgroundColor: 'white', borderRadius: '16px', padding: '32px 24px',
                                    border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                                    display: 'flex', flexDirection: 'column', gap: '32px', minHeight: '400px'
                                }}>
                                    {/* Score Circle */}
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <div style={{
                                            width: '120px', height: '120px', borderRadius: '50%',
                                            background: taskProgress ? `conic-gradient(#2563eb ${taskProgress.completion_percent * 3.6}deg, #e2e8f0 0deg)` : '#e2e8f0',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            marginBottom: '16px', position: 'relative'
                                        }}>
                                            <div style={{
                                                width: '100px', height: '100px', borderRadius: '50%', background: 'white',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                <span style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1e3a8a' }}>
                                                    {taskProgress ? Math.round(taskProgress.completion_percent) : 0}%
                                                </span>
                                                <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: '700' }}>Completion</span>
                                            </div>
                                        </div>

                                        {taskProgress?.risk_flag ? (
                                            <div style={{ padding: '6px 16px', background: '#fee2e2', borderRadius: '20px', color: '#991b1b', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <ShieldAlert size={14} /> HIGH RISK FLAGGED
                                            </div>
                                        ) : taskProgress ? (
                                            <div style={{ padding: '6px 16px', background: '#dcfce7', borderRadius: '20px', color: '#166534', fontSize: '0.75rem', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <CheckCircle size={14} /> ON TRACK
                                            </div>
                                        ) : (
                                            <div style={{ padding: '6px 16px', background: '#f1f5f9', borderRadius: '20px', color: '#64748b', fontSize: '0.75rem', fontWeight: '700' }}>
                                                NOT STARTED
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ height: '1px', backgroundColor: '#e2e8f0', width: '100%' }}></div>

                                    {/* Metrics Grid */}
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Confidence</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#334155' }}>
                                                {taskProgress ? Math.round(taskProgress.confidence_score) : 0}%
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Proof Strength</p>
                                            <p style={{ fontSize: '1.25rem', fontWeight: '700', color: '#334155' }}>
                                                {taskProgress ? Math.round(taskProgress.authenticity_score) : 0}/100
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Analysis</p>
                                            <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>
                                                {taskProgress ? new Date(taskProgress.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                                            </p>
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Review Status</p>
                                            <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#334155' }}>
                                                Auto-Verified
                                            </p>
                                        </div>
                                    </div>

                                    {/* Messages */}
                                    {!taskProgress && (
                                        <div style={{ padding: '16px', backgroundColor: '#f0f9ff', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                                            <p style={{ fontSize: '0.8rem', color: '#0369a1', lineHeight: '1.6', display: 'flex', gap: '8px' }}>
                                                <RefreshCw size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
                                                <span>
                                                    Submit your work to activate the <b>Certification Engine</b>. It will verify your proofs and calculate your score instantly.
                                                </span>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default KanbanDemo;
