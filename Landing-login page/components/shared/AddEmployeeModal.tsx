import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface Team {
    id: string;
    name: string;
}

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        password: '',
        role: 'employee',
        team_id: '',
        newTeamName: '',
        monthly_leave_quota: 3,
        basic_salary: '',
        hra: '',
        allowances: '',
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchTeams();
        }
    }, [isOpen]);

    const fetchTeams = async () => {
        console.log('Fetching teams...');
        const { data, error } = await supabase
            .from('teams')
            .select('id, team_name');

        if (error) {
            console.error('Error fetching teams:', error);
        } else {
            console.log('Teams fetched:', data);
            // Map team_name to name for consistency
            const mappedTeams = data?.map(team => ({
                id: team.id,
                name: team.team_name
            })) || [];
            setTeams(mappedTeams);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            let teamId = formData.team_id;

            // If creating a new team, create it first
            if (formData.team_id === 'new' && formData.newTeamName) {
                const { data: newTeam, error: teamError } = await supabase
                    .from('teams')
                    .insert([{ team_name: formData.newTeamName }])
                    .select()
                    .single();

                if (teamError) {
                    throw new Error(`Failed to create team: ${teamError.message}`);
                }

                teamId = newTeam.id;
            } else if (formData.team_id === 'new') {
                throw new Error('Please enter a team name');
            }

            // Get the current session token
            const { data: { session } } = await supabase.auth.getSession();

            if (!session) {
                throw new Error('You must be logged in to add employees');
            }

            // Call the Supabase Edge Function to add employee
            console.log('Sending data to Edge Function:', {
                full_name: formData.full_name,
                email: formData.email,
                role: formData.role,
                team_id: teamId || null,
                monthly_leave_quota: formData.monthly_leave_quota,
            });

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/add-employee`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({
                        full_name: formData.full_name,
                        email: formData.email,
                        password: formData.password,
                        role: formData.role,
                        team_id: teamId || null,
                        monthly_leave_quota: formData.monthly_leave_quota,
                        basic_salary: parseFloat(formData.basic_salary),
                        hra: parseFloat(formData.hra),
                        allowances: parseFloat(formData.allowances) || 0,
                    }),
                }
            );

            let result;
            try {
                result = await response.json();
            } catch (jsonError) {
                throw new Error(`Server error: ${response.status} ${response.statusText}`);
            }

            console.log('Edge Function response:', result);

            if (!response.ok) {
                console.error('Edge Function error:', result);
                throw new Error(result.error || result.message || `Server error: ${response.status}`);
            }

            // Reset form
            setFormData({
                full_name: '',
                email: '',
                password: '',
                role: 'employee',
                team_id: '',
                newTeamName: '',
                monthly_leave_quota: 3,
                basic_salary: '',
                hra: '',
                allowances: '',
            });

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'An error occurred while adding the employee');
            console.error('Error adding employee:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
            }}
            onClick={onClose}
        >
            <div
                style={{
                    backgroundColor: 'var(--surface)',
                    borderRadius: '16px',
                    width: '600px',
                    maxWidth: '90%',
                    maxHeight: '90vh',
                    overflowY: 'auto',
                    boxShadow: 'var(--shadow-lg)',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div style={{
                    padding: 'var(--spacing-lg)',
                    borderBottom: '1px solid var(--border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Add New Employee</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} style={{ padding: 'var(--spacing-lg)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                        {/* Full Name */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                Full Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                Email *
                            </label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                Password *
                            </label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                                Minimum 6 characters
                            </p>
                        </div>

                        {/* Role */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                Role *
                            </label>
                            <select
                                required
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                <option value="employee">Employee</option>
                                <option value="team_lead">Team Lead</option>
                                <option value="manager">Manager</option>
                                <option value="executive">Executive</option>
                            </select>
                        </div>

                        {/* Team */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                Team
                            </label>
                            <select
                                value={formData.team_id}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, team_id: value });
                                    if (value !== 'new') {
                                        setFormData(prev => ({ ...prev, newTeamName: '' }));
                                    }
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text-primary)',
                                }}
                            >
                                <option value="">No Team</option>
                                {teams.map((team) => (
                                    <option key={team.id} value={team.id}>
                                        {team.name}
                                    </option>
                                ))}
                                <option value="new">+ Create New Team</option>
                            </select>
                        </div>

                        {/* New Team Name (shown only when "Create New Team" is selected) */}
                        {formData.team_id === 'new' && (
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                    New Team Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.newTeamName || ''}
                                    onChange={(e) => setFormData({ ...formData, newTeamName: e.target.value })}
                                    placeholder="Enter team name..."
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--background)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                            </div>
                        )}

                        {/* Monthly Leave Quota */}
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                Monthly Leave Quota
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={formData.monthly_leave_quota}
                                onChange={(e) => setFormData({ ...formData, monthly_leave_quota: parseInt(e.target.value) })}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>

                        {/* Compensation Details Section */}
                        <div style={{
                            marginTop: 'var(--spacing-lg)',
                            paddingTop: 'var(--spacing-lg)',
                            borderTop: '2px solid var(--border)',
                        }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 'var(--spacing-md)' }}>
                                Compensation Details
                            </h3>

                            {/* Basic Salary */}
                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                    Basic Salary *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    step="0.01"
                                    value={formData.basic_salary}
                                    onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                                    placeholder="Enter basic salary"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--background)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                            </div>

                            {/* HRA */}
                            <div style={{ marginBottom: 'var(--spacing-md)' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                    HRA (House Rent Allowance) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min={0}
                                    step="0.01"
                                    value={formData.hra}
                                    onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
                                    placeholder="Enter HRA amount"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--background)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                            </div>

                            {/* Allowances */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                    Other Allowances
                                </label>
                                <input
                                    type="number"
                                    min={0}
                                    step="0.01"
                                    value={formData.allowances}
                                    onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                                    placeholder="Enter other allowances (optional)"
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: '1px solid var(--border)',
                                        backgroundColor: 'var(--background)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={{
                                padding: '12px',
                                borderRadius: '8px',
                                backgroundColor: '#fee2e2',
                                color: '#991b1b',
                                fontSize: '0.875rem',
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                backgroundColor: loading ? 'var(--border)' : 'var(--primary)',
                                color: 'white',
                                padding: '12px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                marginTop: '8px',
                            }}
                        >
                            {loading ? 'Adding Employee...' : 'Add Employee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
