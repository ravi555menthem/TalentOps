import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Award, Briefcase, ChevronDown, ChevronUp, Users, User } from 'lucide-react';

const HierarchyDemo = () => {
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [expandedTeams, setExpandedTeams] = useState({});

    const toggleTeam = (teamName) => {
        setExpandedTeams(prev => ({
            ...prev,
            [teamName]: !prev[teamName]
        }));
    };

    const hierarchyData = {
        name: "Sarah Jenkins",
        role: "CEO",
        email: "sarah.jenkins@company.com",
        phone: "+1 (555) 123-4567",
        location: "New York, NY",
        skills: ["Leadership", "Strategy", "Public Speaking"],
        bio: "Visionary leader with 15+ years of experience in scaling tech startups.",
        type: "ceo",
        children: [
            {
                name: "Engineering Team",
                role: "Technology",
                type: "team",
                lead: {
                    name: "Mike Ross",
                    role: "CTO",
                    email: "mike.ross@company.com",
                    phone: "+1 (555) 234-5678",
                    location: "San Francisco, CA",
                    skills: ["Cloud Architecture", "AI/ML", "Team Building"],
                    bio: "Tech enthusiast passionate about building scalable systems."
                },
                members: [
                    { name: "Alice Johnson", role: "VP of Engineering" },
                    { name: "David Lee", role: "Senior Backend Dev" },
                    { name: "Emily Chen", role: "Frontend Lead" }
                ]
            },
            {
                name: "Product Team",
                role: "Product",
                type: "team",
                lead: {
                    name: "Jessica Pearson",
                    role: "CPO",
                    email: "jessica.p@company.com",
                    phone: "+1 (555) 456-7890",
                    location: "New York, NY",
                    skills: ["Product Strategy", "UX Research", "Agile"],
                    bio: "Dedicated to creating user-centric products."
                },
                members: [
                    { name: "Frank Miller", role: "Product Manager" },
                    { name: "Grace Ho", role: "UX Designer" }
                ]
            },
            {
                name: "Sales Team",
                role: "Revenue",
                type: "team",
                lead: {
                    name: "Harvey Specter",
                    role: "CRO",
                    email: "harvey.s@company.com",
                    phone: "+1 (555) 567-8901",
                    location: "New York, NY",
                    skills: ["Sales Strategy", "Closing", "Client Relations"],
                    bio: "Results-driven executive with a track record of breaking revenue records."
                },
                members: [
                    { name: "Hank Green", role: "Sales Director" },
                    { name: "Ivy Wilson", role: "Account Manager" }
                ]
            }
        ]
    };

    const Node = ({ data }) => {
        const isTeam = data.type === 'team';
        const isExpanded = expandedTeams[data.name];

        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 12px' }}>
                <div
                    onClick={() => {
                        if (isTeam) {
                            toggleTeam(data.name);
                        } else {
                            setSelectedEmployee(data);
                        }
                    }}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: 'var(--surface)',
                        border: selectedEmployee?.name === data.name ? '2px solid var(--primary)' : '1px solid var(--border)',
                        borderRadius: '12px',
                        textAlign: 'center',
                        boxShadow: 'var(--shadow-sm)',
                        marginBottom: '24px',
                        position: 'relative',
                        zIndex: 2,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        minWidth: '160px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: isTeam ? 'var(--primary-light)' : '#e2e8f0', margin: '0 auto 8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isTeam ? 'var(--primary)' : 'inherit' }}>
                        {isTeam ? <Users size={20} /> : <img src={`https://ui-avatars.com/api/?name=${data.name}&background=random`} alt={data.name} style={{ width: '100%', height: '100%' }} />}
                    </div>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{data.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{data.role}</p>
                    {isTeam && (
                        <div style={{ marginTop: '4px' }}>
                            {isExpanded ? <ChevronUp size={14} color="var(--text-secondary)" /> : <ChevronDown size={14} color="var(--text-secondary)" />}
                        </div>
                    )}
                </div>

                {/* Children / Expansion Logic */}
                {(data.children || (isTeam && isExpanded)) && (
                    <div style={{ display: 'flex', position: 'relative', paddingTop: '20px' }}>
                        {/* Connector Lines */}
                        <div style={{ position: 'absolute', top: '-24px', left: '50%', width: '2px', height: '44px', backgroundColor: '#cbd5e1', zIndex: 0 }}></div>

                        {/* Horizontal Line for multiple children */}
                        {((data.children && data.children.length > 1) || (isTeam && isExpanded)) && (
                            <div style={{ position: 'absolute', top: '0', left: '20px', right: '20px', height: '2px', backgroundColor: '#cbd5e1', zIndex: 0 }}></div>
                        )}

                        {/* Render Children */}
                        {data.children && data.children.map((child, index) => (
                            <Node key={index} data={child} />
                        ))}

                        {/* Render Team Members if Expanded */}
                        {isTeam && isExpanded && (
                            <>
                                {/* Team Lead */}
                                <Node data={{ ...data.lead, type: 'lead' }} />
                                {/* Employees */}
                                {data.members.map((member, index) => (
                                    <Node key={index} data={{ ...member, type: 'employee' }} />
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div style={{ height: '100%', overflow: 'auto', padding: 'var(--spacing-xl)', display: 'flex', justifyContent: 'center' }}>
            <Node data={hierarchyData} />

            {/* Employee Details Modal */}
            {selectedEmployee && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }} onClick={() => setSelectedEmployee(null)}>
                    <div style={{ backgroundColor: 'var(--surface)', borderRadius: '16px', width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: 'var(--shadow-lg)' }} onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setSelectedEmployee(null)}
                            style={{ position: 'absolute', top: '16px', right: '16px', padding: '8px', borderRadius: '50%', backgroundColor: 'var(--background)', border: 'none', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ padding: '32px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
                            <div style={{ width: '96px', height: '96px', borderRadius: '50%', backgroundColor: '#e2e8f0', margin: '0 auto 16px', overflow: 'hidden', border: '4px solid var(--background)' }}>
                                <img src={`https://ui-avatars.com/api/?name=${selectedEmployee.name}&background=random&size=128`} alt={selectedEmployee.name} style={{ width: '100%', height: '100%' }} />
                            </div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '4px' }}>{selectedEmployee.name}</h2>
                            <p style={{ color: 'var(--primary)', fontWeight: 600 }}>{selectedEmployee.role}</p>
                            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '12px' }}>
                                <span style={{ padding: '4px 12px', borderRadius: '100px', backgroundColor: 'var(--background)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Active</span>
                                <span style={{ padding: '4px 12px', borderRadius: '100px', backgroundColor: 'var(--background)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full-time</span>
                            </div>
                        </div>

                        <div style={{ padding: '32px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                                <div>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Contact</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Mail size={16} color="var(--text-secondary)" />
                                            <span style={{ fontSize: '0.9rem' }}>{selectedEmployee.email || 'email@company.com'}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Phone size={16} color="var(--text-secondary)" />
                                            <span style={{ fontSize: '0.9rem' }}>{selectedEmployee.phone || '+1 (555) 000-0000'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>Location</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <MapPin size={16} color="var(--text-secondary)" />
                                        <span style={{ fontSize: '0.9rem' }}>{selectedEmployee.location || 'Remote'}</span>
                                    </div>
                                </div>
                            </div>

                            {selectedEmployee.bio && (
                                <div style={{ marginBottom: '32px' }}>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'block' }}>About</label>
                                    <p style={{ lineHeight: 1.6, color: 'var(--text-primary)' }}>{selectedEmployee.bio}</p>
                                </div>
                            )}

                            {selectedEmployee.skills && (
                                <div>
                                    <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'block' }}>Skills & Expertise</label>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {selectedEmployee.skills.map((skill, index) => (
                                            <span key={index} style={{ padding: '6px 16px', borderRadius: '8px', backgroundColor: 'var(--background)', fontSize: '0.875rem', fontWeight: 500 }}>
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HierarchyDemo;
