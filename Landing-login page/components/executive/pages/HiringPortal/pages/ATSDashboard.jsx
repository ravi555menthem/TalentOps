import {
    Briefcase,
    Users,
    Calendar,
    FileText,
    TrendingUp,
    TrendingDown,
    ArrowRight,
    Clock,
} from 'lucide-react';
import { useATSData } from '../../../context/ATSDataContext';
import { useUser } from '../../../context/UserContext';
import { formatDate, getRelativeTime, getInitials } from '../../../utils/atsHelpers';

const ATSDashboard = ({ onNavigate }) => {
    const { userName: user } = useUser();
    const { jobs, candidates, interviews, offers, getAnalytics, getUpcomingInterviews } = useATSData();
    const analytics = getAnalytics();
    const upcomingInterviews = getUpcomingInterviews().slice(0, 5);

    const stats = [
        {
            label: 'Active Jobs',
            value: analytics.activeJobs,
            total: analytics.totalJobs,
            icon: Briefcase,
            color: '#8b5cf6',
            trend: '+2 this week',
            positive: true
        },
        {
            label: 'Total Candidates',
            value: analytics.totalCandidates,
            icon: Users,
            color: '#3b82f6',
            trend: `+${analytics.recentCandidates} last 30 days`,
            positive: true
        },
        {
            label: 'Scheduled Interviews',
            value: analytics.upcomingInterviews,
            icon: Calendar,
            color: '#f59e0b',
            trend: `${analytics.completedInterviews} completed`,
            positive: true
        },
        {
            label: 'Pending Offers',
            value: analytics.pendingOffers,
            icon: FileText,
            color: '#10b981',
            trend: `${analytics.acceptedOffers} accepted`,
            positive: true
        }
    ];

    const pipelineData = [
        { stage: 'Applied', count: analytics.candidatesByStage.applied, color: '#3b82f6' },
        { stage: 'Shortlisted', count: analytics.candidatesByStage.shortlisted, color: '#8b5cf6' },
        { stage: 'Interview', count: analytics.candidatesByStage.interview, color: '#f59e0b' },
        { stage: 'Offer', count: analytics.candidatesByStage.offer, color: '#10b981' },
        { stage: 'Hired', count: analytics.candidatesByStage.hired, color: '#059669' }
    ];

    const recentCandidates = candidates
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .slice(0, 5);

    return (
        <div className="dashboard animate-fade-in">
            <div className="page-header mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Welcome back, {user?.split(' ')[0] || 'User'}!</h1>
                    <p className="text-[var(--text-secondary)]">Here's what's happening with your recruitment today.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="dashboard-card p-6" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-3 rounded-xl" style={{ background: `${stat.color}20` }}>
                                    <Icon size={24} style={{ color: stat.color }} />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${stat.positive ? 'text-[var(--success)] bg-[var(--success-bg)]' : 'text-[var(--error)] bg-[var(--error-bg)]'}`}>
                                    {stat.positive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                    {stat.trend}
                                </div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                                    {stat.value}
                                    {stat.total && <span className="text-base font-normal text-[var(--text-secondary)]">/{stat.total}</span>}
                                </div>
                                <div className="text-sm text-[var(--text-secondary)]">{stat.label}</div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Pipeline Overview */}
                <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-[var(--text-primary)]">Pipeline Overview</h3>
                        <button onClick={() => onNavigate('candidates')} className="btn-ghost text-sm flex items-center gap-1 hover:text-[var(--accent)]">
                            View All <ArrowRight size={16} />
                        </button>
                    </div>
                    <div className="space-y-4">
                        {pipelineData.map((item, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--text-secondary)]">{item.stage}</span>
                                    <span className="font-semibold text-[var(--text-primary)]">{item.count}</span>
                                </div>
                                <div className="h-2 bg-[var(--bg-tertiary)] rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${Math.max((item.count / Math.max(...pipelineData.map(d => d.count), 1)) * 100, 5)}%`,
                                            background: item.color
                                        }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Interviews */}
                <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-[var(--text-primary)]">Upcoming Interviews</h3>
                        <button onClick={() => onNavigate('interviews')} className="btn-ghost text-sm flex items-center gap-1 hover:text-[var(--accent)]">
                            View All <ArrowRight size={16} />
                        </button>
                    </div>
                    {upcomingInterviews.length > 0 ? (
                        <div className="space-y-4">
                            {upcomingInterviews.map(interview => (
                                <div key={interview.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-sm">
                                        {getInitials(interview.candidateName)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-[var(--text-primary)] truncate">{interview.candidateName}</h4>
                                        <p className="text-xs text-[var(--text-secondary)] truncate">{interview.jobTitle}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)] mb-1">
                                            <Clock size={12} />
                                            {formatDate(interview.scheduledAt)}
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${interview.mode === 'online' ? 'bg-blue-500/10 text-blue-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                            {interview.mode}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
                            <Calendar size={48} className="mb-2 opacity-50" />
                            <p>No upcoming interviews</p>
                        </div>
                    )}
                </div>

                {/* Recent Candidates */}
                <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-[var(--text-primary)]">Recent Candidates</h3>
                        <button onClick={() => onNavigate('candidates')} className="btn-ghost text-sm flex items-center gap-1 hover:text-[var(--accent)]">
                            View All <ArrowRight size={16} />
                        </button>
                    </div>
                    {recentCandidates.length > 0 ? (
                        <div className="space-y-4">
                            {recentCandidates.map(candidate => (
                                <div key={candidate.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-primary)] flex items-center justify-center font-bold text-sm">
                                        {getInitials(candidate.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-[var(--text-primary)] truncate">{candidate.name}</h4>
                                        <p className="text-xs text-[var(--text-secondary)] truncate">{candidate.jobTitle}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-[var(--bg-tertiary)]`}>
                                            {candidate.stage}
                                        </span>
                                        <div className="text-[10px] text-[var(--text-muted)] mt-1">{getRelativeTime(candidate.appliedAt)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
                            <Users size={48} className="mb-2 opacity-50" />
                            <p>No candidates yet</p>
                        </div>
                    )}
                </div>

                {/* Active Jobs */}
                <div className="dashboard-card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-semibold text-[var(--text-primary)]">Active Job Postings</h3>
                        <button onClick={() => onNavigate('jobs')} className="btn-ghost text-sm flex items-center gap-1 hover:text-[var(--accent)]">
                            View All <ArrowRight size={16} />
                        </button>
                    </div>
                    {jobs.filter(j => j.status === 'published').slice(0, 4).length > 0 ? (
                        <div className="space-y-4">
                            {jobs.filter(j => j.status === 'published').slice(0, 4).map(job => (
                                <div key={job.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-[var(--accent-glow)] text-[var(--accent)] flex items-center justify-center">
                                        <Briefcase size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium text-[var(--text-primary)] truncate">{job.title}</h4>
                                        <p className="text-xs text-[var(--text-secondary)] truncate">{job.department} • {job.location}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                                        <Users size={14} />
                                        {job.applicants || 0}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-[var(--text-muted)]">
                            <Briefcase size={48} className="mb-2 opacity-50" />
                            <p>No active jobs</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .dashboard-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          box-shadow: var(--shadow-sm);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .dashboard-card:hover {
            box-shadow: var(--shadow-md);
        }
        
        .btn-ghost {
            background: transparent;
            border: none;
            cursor: pointer;
            transition: color 0.2s;
        }
      `}</style>
        </div>
    );
};

export default ATSDashboard;
