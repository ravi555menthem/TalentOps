import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface EditEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    employee: any;
}

interface Team {
    id: string;
    name: string;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ isOpen, onClose, onSuccess, employee }) => {
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState<Team[]>([]);
    const [currentUserRole, setCurrentUserRole] = useState<string>('');
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        role: 'employee',
        team_id: '',
        newTeamName: '',
        monthly_leave_quota: 3,
        basic_salary: '',
        hra: '',
        allowances: '',
        change_reason: 'Annual Increment',
        custom_change_reason: '',
        effective_from: new Date().toISOString().split('T')[0],
    });
    const [originalSalary, setOriginalSalary] = useState<any>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && employee) {
            fetchTeams();
            fetchCurrentUserRole();
            fetchEmployeeSalary();
            // Populate form with employee data
            setFormData({
                full_name: employee.name || '',
                email: employee.email || '',
                role: employee.role || 'employee',
                team_id: employee.team_id || '',
                newTeamName: '',
                monthly_leave_quota: employee.monthly_leave_quota || 3,
                basic_salary: '',
                hra: '',
                allowances: '',
                change_reason: 'Annual Increment',
                custom_change_reason: '',
                effective_from: new Date().toISOString().split('T')[0],
            });
        }
    }, [isOpen, employee]);

    const fetchTeams = async () => {
        console.log('Fetching teams for edit modal...');
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

    const fetchCurrentUserRole = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();
                if (profile) {
                    setCurrentUserRole(profile.role);
                }
            }
        } catch (error) {
            console.error('Error fetching current user role:', error);
        }
    };

    const fetchEmployeeSalary = async () => {
        try {
            const { data, error } = await supabase
                .from('employee_finance')
                .select('*')
                .eq('employee_id', employee.id)
                .eq('is_active', true)
                .single();

            if (error) {
                console.log('No active salary record found:', error);
                return;
            }

            if (data) {
                setOriginalSalary(data);
                setFormData(prev => ({
                    ...prev,
                    basic_salary: data.basic_salary?.toString() || '',
                    hra: data.hra?.toString() || '',
                    allowances: data.allowances?.toString() || '',
                }));
            }
        } catch (error) {
            console.error('Error fetching employee salary:', error);
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

            // Update employee profile
            console.log('Updating employee with data:', {
                full_name: formData.full_name,
                role: formData.role,
                team_id: teamId || null,
                monthly_leave_quota: formData.monthly_leave_quota,
            });

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    role: formData.role,
                    team_id: teamId || null,
                    monthly_leave_quota: formData.monthly_leave_quota,
                })
                .eq('id', employee.id);

            if (updateError) {
                console.error('Update error details:', updateError);
                throw new Error(updateError.message || 'Failed to update employee');
            }

            console.log('Employee updated successfully');

            // Handle salary updates (executives only)
            if (currentUserRole === 'executive' && formData.basic_salary && formData.hra) {
                const newBasicSalary = parseFloat(formData.basic_salary);
                const newHra = parseFloat(formData.hra);
                const newAllowances = parseFloat(formData.allowances || '0');

                // Check if salary has changed (or if there's no existing salary)
                const salaryChanged = !originalSalary ||
                    newBasicSalary !== originalSalary.basic_salary ||
                    newHra !== originalSalary.hra ||
                    newAllowances !== (originalSalary.allowances || 0);

                if (salaryChanged) {
                    console.log('Salary changed or no existing salary, updating employee_finance...');

                    const today = new Date().toISOString().split('T')[0];

                    if (originalSalary) {
                        // Existing salary record - deactivate ALL active records for this employee
                        const effectiveFromDate = new Date(formData.effective_from);
                        const effectiveTo = new Date(effectiveFromDate);
                        effectiveTo.setDate(effectiveTo.getDate() - 1);
                        const effectiveToStr = effectiveTo.toISOString().split('T')[0];

                        // First, get all active record IDs
                        const { data: activeRecords, error: fetchError } = await supabase
                            .from('employee_finance')
                            .select('id')
                            .eq('employee_id', employee.id)
                            .eq('is_active', true);

                        if (fetchError) {
                            console.error('Error fetching active records:', fetchError);
                            throw new Error(`Failed to fetch active records: ${fetchError.message}`);
                        }

                        if (activeRecords && activeRecords.length > 0) {
                            console.log(`Found ${activeRecords.length} active record(s) to deactivate`);

                            // Deactivate each record individually
                            for (const record of activeRecords) {
                                const { error: deactivateError } = await supabase
                                    .from('employee_finance')
                                    .update({
                                        is_active: false,
                                        effective_to: effectiveToStr,
                                    })
                                    .eq('id', record.id);

                                if (deactivateError) {
                                    console.error(`Error deactivating record ${record.id}:`, deactivateError);
                                    throw new Error(`Failed to deactivate record: ${deactivateError.message}`);
                                }
                            }

                            console.log('All active records deactivated successfully');

                            // Wait for database to commit
                            await new Promise(resolve => setTimeout(resolve, 500));

                            // Verify deactivation worked - check if any active records still exist
                            const { data: stillActive, error: checkError } = await supabase
                                .from('employee_finance')
                                .select('id')
                                .eq('employee_id', employee.id)
                                .eq('is_active', true);

                            if (checkError) {
                                console.error('Error checking active records:', checkError);
                            } else if (stillActive && stillActive.length > 0) {
                                console.error('ERROR: Records still active after deactivation:', stillActive);
                                throw new Error(`Failed to deactivate ${stillActive.length} record(s). Please refresh and try again.`);
                            }
                        }
                    }

                    // Insert new salary record (works for both new and updated salaries)
                    const changeReason = formData.change_reason === 'Other'
                        ? formData.custom_change_reason || 'Salary Update'
                        : formData.change_reason;

                    const { error: insertError } = await supabase
                        .from('employee_finance')
                        .insert([{
                            employee_id: employee.id,
                            basic_salary: newBasicSalary,
                            hra: newHra,
                            allowances: newAllowances,
                            effective_from: formData.effective_from,
                            is_active: true,
                            change_reason: changeReason,
                        }]);

                    if (insertError) {
                        console.error('Error inserting new salary:', insertError);
                        throw new Error(`Failed to create salary record: ${insertError.message}`);
                    }

                    console.log('New salary record created successfully');
                }
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            setError(err.message || 'An error occurred while updating the employee');
            console.error('Error updating employee:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !employee) return null;

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
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Edit Employee</h2>
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
                                Email (Read-only)
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                readOnly
                                disabled
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border)',
                                    backgroundColor: '#f3f4f6',
                                    color: '#6b7280',
                                    cursor: 'not-allowed',
                                }}
                            />
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

                        {/* New Team Name */}
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

                        {/* Compensation Details Section - Role-based visibility */}
                        {(currentUserRole === 'executive' || currentUserRole === 'manager') && (
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
                                        required={currentUserRole === 'executive'}
                                        min={0}
                                        step="0.01"
                                        value={formData.basic_salary}
                                        onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                                        disabled={currentUserRole === 'manager'}
                                        placeholder="Enter basic salary"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border)',
                                            backgroundColor: currentUserRole === 'manager' ? '#f3f4f6' : 'var(--background)',
                                            color: currentUserRole === 'manager' ? '#6b7280' : 'var(--text-primary)',
                                            cursor: currentUserRole === 'manager' ? 'not-allowed' : 'text',
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
                                        required={currentUserRole === 'executive'}
                                        min={0}
                                        step="0.01"
                                        value={formData.hra}
                                        onChange={(e) => setFormData({ ...formData, hra: e.target.value })}
                                        disabled={currentUserRole === 'manager'}
                                        placeholder="Enter HRA amount"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border)',
                                            backgroundColor: currentUserRole === 'manager' ? '#f3f4f6' : 'var(--background)',
                                            color: currentUserRole === 'manager' ? '#6b7280' : 'var(--text-primary)',
                                            cursor: currentUserRole === 'manager' ? 'not-allowed' : 'text',
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
                                        disabled={currentUserRole === 'manager'}
                                        placeholder="Enter other allowances (optional)"
                                        style={{
                                            width: '100%',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            border: '1px solid var(--border)',
                                            backgroundColor: currentUserRole === 'manager' ? '#f3f4f6' : 'var(--background)',
                                            color: currentUserRole === 'manager' ? '#6b7280' : 'var(--text-primary)',
                                            cursor: currentUserRole === 'manager' ? 'not-allowed' : 'text',
                                        }}
                                    />
                                </div>

                                {/* Change Reason - Only for executives */}
                                {currentUserRole === 'executive' && (
                                    <>
                                        <div style={{ marginTop: 'var(--spacing-md)' }}>
                                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                                Reason for Change *
                                            </label>
                                            <select
                                                value={formData.change_reason}
                                                onChange={(e) => setFormData({ ...formData, change_reason: e.target.value })}
                                                style={{
                                                    width: '100%',
                                                    padding: '10px',
                                                    borderRadius: '8px',
                                                    border: '1px solid var(--border)',
                                                    backgroundColor: 'var(--background)',
                                                    color: 'var(--text-primary)',
                                                }}
                                            >
                                                <option value="Annual Increment">Annual Increment</option>
                                                <option value="Promotion">Promotion</option>
                                                <option value="Performance Bonus">Performance Bonus</option>
                                                <option value="Market Adjustment">Market Adjustment</option>
                                                <option value="Correction">Correction</option>
                                                <option value="Other">Other (Specify below)</option>
                                            </select>
                                        </div>

                                        {/* Custom Reason Input - Show only if "Other" is selected */}
                                        {formData.change_reason === 'Other' && (
                                            <div style={{ marginTop: 'var(--spacing-md)' }}>
                                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                                    Specify Reason *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.custom_change_reason}
                                                    onChange={(e) => setFormData({ ...formData, custom_change_reason: e.target.value })}
                                                    placeholder="Enter reason for salary change"
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
                                    </>
                                )}

                                {/* Effective From Date - Only for executives */}
                                {currentUserRole === 'executive' && (
                                    <div style={{ marginTop: 'var(--spacing-md)' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', fontWeight: 500 }}>
                                            Effective From Date *
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.effective_from}
                                            onChange={(e) => setFormData({ ...formData, effective_from: e.target.value })}
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
                                            The date when this salary change becomes effective
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

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
                        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{
                                    flex: 1,
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    border: '1px solid var(--border)',
                                    backgroundColor: 'var(--background)',
                                    color: 'var(--text-primary)',
                                    cursor: 'pointer',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    flex: 1,
                                    backgroundColor: loading ? 'var(--border)' : 'var(--primary)',
                                    color: 'white',
                                    padding: '12px',
                                    borderRadius: '8px',
                                    fontWeight: 600,
                                    border: 'none',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {loading ? 'Updating...' : 'Update Employee'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};
