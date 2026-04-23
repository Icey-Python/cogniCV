'use client';

import { formatDistanceToNow } from 'date-fns';
import {
	Activity,
	BriefcaseBusiness,
	ChevronDown,
	ChevronUp,
	Filter,
	LayoutDashboard,
	PencilLine,
	PlayCircle,
	Plus,
	Search,
	Settings,
	Sparkles,
	Users
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockJobs, mockRecruiterJobs } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { CandidateProfile, JobListing, RecruiterJobView } from '@/types/jobs';

// ─── Types ────────────────────────────────────────────────────────────────────

type SortMode = 'score-desc' | 'score-asc' | 'name';
type ScreeningState = RecruiterJobView['screeningState'];
type TabType = 'overview' | 'jobs' | 'candidates' | 'settings';
type BadgeVariant = 'default' | 'secondary' | 'outline' | 'accent' | 'destructive';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getJobStatusVariant(status: JobListing['status']): BadgeVariant {
	switch (status) {
		case 'Open': return 'default';
		case 'Closing Soon': return 'accent';
		case 'Paused': return 'secondary';
		default: return 'outline';
	}
}

function getAvailabilityVariant(availability: CandidateProfile['availability']): BadgeVariant {
	switch (availability) {
		case 'Available': return 'default';
		case 'Open to opportunities': return 'accent';
		case 'Not available': return 'secondary';
		default: return 'outline';
	}
}

function getScreeningVariant(state: ScreeningState): BadgeVariant {
	switch (state) {
		case 'running': return 'accent';
		case 'complete': return 'default';
		default: return 'outline';
	}
}

function getScoreTone(score: number): string {
	if (score >= 90) return 'text-primary';
	if (score >= 80) return 'text-foreground';
	return 'text-muted-foreground';
}

function sortCandidates(candidates: CandidateProfile[], mode: SortMode) {
	const copy = [...candidates];
	if (mode === 'score-desc') copy.sort((a, b) => b.matchScore - a.matchScore);
	else if (mode === 'score-asc') copy.sort((a, b) => a.matchScore - b.matchScore);
	else copy.sort((a, b) => a.name.localeCompare(b.name));
	return copy;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CandidateAIInsights({ candidate }: { candidate: CandidateProfile }) {
	return (
		<div className="mt-4 animate-pop-in rounded-xl border border-primary/20 bg-primary/5 p-5">
			<div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
				<Sparkles className="size-4" />
				CogniCV Analysis
			</div>
			<div className="grid gap-6 md:grid-cols-2">
				<div>
					<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
						Strengths
					</p>
					<ul className="space-y-2">
						{candidate.strengths.map((s) => (
							<li key={s} className="flex items-start gap-2 text-sm text-foreground">
								<span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-emerald-500" />
								{s}
							</li>
						))}
					</ul>
				</div>
				<div>
					<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
						Potential Gaps
					</p>
					<ul className="space-y-2">
						{candidate.gaps.map((g) => (
							<li key={g} className="flex items-start gap-2 text-sm text-foreground">
								<span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-amber-500" />
								{g}
							</li>
						))}
					</ul>
				</div>
			</div>
			<div className="mt-6 rounded-lg bg-background/50 p-4">
				<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					Recommendation
				</p>
				<p className="text-sm font-medium leading-relaxed text-foreground">
					{candidate.recommendation}
				</p>
			</div>
		</div>
	);
}

function CandidateCard({
	candidate,
	index,
	expanded,
	onToggleExpand
}: {
	candidate: CandidateProfile;
	index: number;
	expanded: boolean;
	onToggleExpand: () => void;
}) {
	return (
		<article
			className="animate-rise-in rounded-2xl border border-border/60 bg-card/60 p-5 shadow-xs transition-shadow hover:shadow-sm"
			style={{ animationDelay: `${index * 50}ms` }}
		>
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex items-start gap-4">
					<div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
						{candidate.name.charAt(0)}
					</div>
					<div>
						<h3 className="text-lg font-semibold text-foreground">{candidate.name}</h3>
						<p className="text-sm text-muted-foreground">{candidate.headline}</p>
						<div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
							<Badge variant={getAvailabilityVariant(candidate.availability)} className="text-[10px]">
								{candidate.availability}
							</Badge>
							<span>{candidate.location}</span>
							<span>&bull;</span>
							<span>{candidate.yearsExperience} yrs exp</span>
						</div>
					</div>
				</div>
				<div className="text-right">
					<p className={cn('text-3xl font-bold', getScoreTone(candidate.matchScore))}>
						{candidate.matchScore}
					</p>
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Match</p>
				</div>
			</div>

			<div className="mt-6 grid gap-4 md:grid-cols-2">
				{Object.entries(candidate.subScores).map(([key, value]) => (
					<div key={key}>
						<div className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted-foreground">
							<span className="capitalize">{key}</span>
							<span>{value}/100</span>
						</div>
						<div className="h-1.5 overflow-hidden rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
								style={{ width: `${value}%` }}
							/>
						</div>
					</div>
				))}
			</div>

			<div className="mt-6 flex items-center justify-between border-t border-border/50 pt-4">
				<p className="text-xs text-muted-foreground">
					Applied {formatDistanceToNow(new Date(candidate.appliedAt), { addSuffix: true })}
				</p>
				<Button
					variant="ghost"
					size="sm"
					onClick={onToggleExpand}
					className="text-primary hover:bg-primary/10 hover:text-primary"
				>
					{expanded ? 'Hide Insights' : 'View AI Insights'}
					{expanded ? <ChevronUp className="ml-2 size-4" /> : <ChevronDown className="ml-2 size-4" />}
				</Button>
			</div>

			{expanded && <CandidateAIInsights candidate={candidate} />}
		</article>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
	{ id: 'overview', label: 'Overview', icon: LayoutDashboard },
	{ id: 'jobs', label: 'Job Listings', icon: BriefcaseBusiness },
	{ id: 'candidates', label: 'Candidates', icon: Users },
	{ id: 'settings', label: 'Settings', icon: Settings }
] as const;

const RECENT_ACTIVITY = [
	{ id: 1, action: 'AI Screening completed for', target: 'Frontend Engineer', time: '10m ago' },
	{ id: 2, action: 'Amara N. applied to', target: 'Senior Full-Stack Engineer', time: '1h ago' },
	{ id: 3, action: 'Job posted:', target: 'Product Designer', time: '3h ago' },
	{ id: 4, action: 'AI rejected 12 profiles for', target: 'Data Analyst', time: '5h ago' }
];

export default function DashboardPage() {
	const [activeTab, setActiveTab] = useState<TabType>('overview');
	const [selectedJobId, setSelectedJobId] = useState<string>(mockJobs[0]?.id ?? '');
	const [query, setQuery] = useState('');
	const [sortMode, setSortMode] = useState<SortMode>('score-desc');
	const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(null);
	const [screeningStateByJob, setScreeningStateByJob] = useState<Record<string, ScreeningState>>(() =>
		mockRecruiterJobs.reduce<Record<string, ScreeningState>>((acc, cur) => {
			acc[cur.jobId] = cur.screeningState;
			return acc;
		}, {})
	);

	const screeningTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

	useEffect(() => {
		return () => { Object.values(screeningTimers.current).forEach(clearTimeout); };
	}, []);

	const selectedJob = useMemo(() => mockJobs.find((j) => j.id === selectedJobId), [selectedJobId]);

	const applicantsForJob = useMemo(() => {
		return mockRecruiterJobs.find((r) => r.jobId === selectedJobId)?.applicants ?? [];
	}, [selectedJobId]);

	const filteredCandidates = useMemo(() => {
		const term = query.trim().toLowerCase();
		const filtered = applicantsForJob.filter((c) =>
			(term.length === 0 ||
				c.name.toLowerCase().includes(term) ||
				c.headline.toLowerCase().includes(term) ||
				c.skills.some((s) => s.toLowerCase().includes(term)))
		);
		return sortCandidates(filtered, sortMode);
	}, [applicantsForJob, query, sortMode]);

	const runScreening = () => {
		if (!selectedJobId) return;
		if (screeningTimers.current[selectedJobId]) clearTimeout(screeningTimers.current[selectedJobId]);
		setScreeningStateByJob((cur) => ({ ...cur, [selectedJobId]: 'running' }));
		screeningTimers.current[selectedJobId] = setTimeout(() => {
			setScreeningStateByJob((cur) => ({ ...cur, [selectedJobId]: 'complete' }));
		}, 1600);
	};

	const totalOpenJobs = mockJobs.filter((j) => j.status === 'Open').length;
	const totalApplicants = mockJobs.reduce((sum, j) => sum + j.applicants, 0);
	const highScoreCount = applicantsForJob.filter((c) => c.matchScore >= 85).length;

	return (
		<div className="flex h-screen w-full overflow-hidden bg-background/50">
			{/* ── Sidebar ── */}
			<aside className="w-64 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur-xl">
				<div className="flex h-full flex-col px-4 py-6">
					<div className="mb-8 px-2">
						<div className="gap-2 flex items-center text-sm font-medium text-primary">
							<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
								<Sparkles className="size-4" />
							</div>
							CogniCV Recruiting
						</div>
					</div>

					<nav className="flex flex-1 flex-col gap-1">
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Workspace</p>
						{NAV_ITEMS.map((item) => (
							<button
								key={item.id}
								onClick={() => setActiveTab(item.id)}
								className={cn(
									'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
									activeTab === item.id
										? 'bg-accent/80 text-accent-foreground shadow-xs'
										: 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
								)}
							>
								<item.icon className={cn('size-4', activeTab === item.id && 'text-primary')} />
								{item.label}
							</button>
						))}
					</nav>

					<div className="mt-auto px-2">
						<div className="rounded-xl border border-border/50 bg-background/50 p-4">
							<p className="text-sm font-medium">Credits Remaining</p>
							<div className="mt-2 h-2 w-full rounded-full bg-muted">
								<div className="h-full w-3/4 rounded-full bg-primary" />
							</div>
							<p className="mt-2 text-xs text-muted-foreground">15,000 / 20,000 resumes</p>
						</div>
					</div>
				</div>
			</aside>

			{/* ── Main ── */}
			<main className="flex-1 overflow-y-auto">
				<div className="mx-auto max-w-6xl p-6 md:p-8 lg:p-10">
					{/* Header */}
					<header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
						<div>
							<h1 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">
								{NAV_ITEMS.find((i) => i.id === activeTab)?.label}
							</h1>
							<p className="mt-2 text-sm text-muted-foreground">
								{activeTab === 'overview' && 'A high-level view of your recruitment pipeline.'}
								{activeTab === 'jobs' && 'Manage your open roles and screen candidates with AI.'}
								{activeTab === 'candidates' && 'Search and filter across your entire talent pool.'}
								{activeTab === 'settings' && 'Manage your workspace preferences.'}
							</p>
						</div>
						{(activeTab === 'overview' || activeTab === 'jobs') && (
							<Button className="gap-2 shadow-sm">
								<Plus className="size-4" /> Create Job
							</Button>
						)}
					</header>

					{/* ── Overview Tab ── */}
					{activeTab === 'overview' && (
						<div className="animate-rise-in space-y-6">
							{/* KPI row */}
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								{[
									{ label: 'Open Roles', value: totalOpenJobs, sub: '+2 from last month', subColor: 'text-emerald-500', icon: BriefcaseBusiness },
									{ label: 'Total Applicants', value: totalApplicants, sub: '+12% from last week', subColor: 'text-emerald-500', icon: Users },
									{ label: 'Top Matches (>85)', value: highScoreCount, sub: 'Across all active jobs', subColor: 'text-muted-foreground', icon: Sparkles },
									{ label: 'Time to Hire', value: '18d', sub: '-3 days average', subColor: 'text-emerald-500', icon: Activity }
								].map((kpi) => (
									<div key={kpi.label} className="rounded-2xl border border-border/60 bg-card/50 p-5 shadow-xs transition-shadow hover:shadow-sm">
										<div className="flex items-center justify-between text-muted-foreground">
											<p className="text-xs font-semibold uppercase tracking-wider">{kpi.label}</p>
											<kpi.icon className="size-4" />
										</div>
										<p className="mt-3 text-3xl font-bold text-foreground">{kpi.value}</p>
										<p className={cn('mt-1 text-xs', kpi.subColor)}>{kpi.sub}</p>
									</div>
								))}
							</div>

							{/* Pipeline + Activity */}
							<div className="grid gap-6 lg:grid-cols-3">
								<div className="col-span-2 rounded-2xl border border-border/60 bg-card/50 p-6 shadow-xs">
									<h2 className="mb-6 text-lg font-semibold text-foreground">Candidate Pipeline</h2>
									<div className="grid grid-cols-4 gap-4 text-center">
										{[
											{ label: 'Sourced', count: 245, bg: 'bg-muted text-foreground' },
											{ label: 'Screened', count: 86, bg: 'bg-accent text-accent-foreground' },
											{ label: 'Interviewing', count: 32, bg: 'bg-primary/20 text-primary' },
											{ label: 'Offered', count: 5, bg: 'bg-primary text-primary-foreground' }
										].map((stage, i) => (
											<div key={stage.label} className="relative flex flex-col items-center">
												{i > 0 && <div className="absolute left-[-50%] top-6 h-[2px] w-full bg-border/60 -z-10" />}
												<div className={cn('flex size-12 items-center justify-center rounded-full text-lg font-bold', stage.bg)}>
													{stage.count}
												</div>
												<p className="mt-2 text-xs font-medium text-muted-foreground">{stage.label}</p>
											</div>
										))}
									</div>
								</div>

								<div className="rounded-2xl border border-border/60 bg-card/50 p-6 shadow-xs">
									<h2 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h2>
									<div className="space-y-4">
										{RECENT_ACTIVITY.map((item) => (
											<div key={item.id} className="flex gap-3 text-sm">
												<div className="mt-0.5 size-2 shrink-0 rounded-full bg-primary" />
												<div>
													<p className="text-foreground">
														<span className="text-muted-foreground">{item.action}</span>{' '}
														<span className="font-medium">{item.target}</span>
													</p>
													<p className="text-xs text-muted-foreground">{item.time}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>
						</div>
					)}

					{/* ── Jobs Tab ── */}
					{activeTab === 'jobs' && (
						<div className="animate-rise-in grid gap-6 lg:grid-cols-[1fr_2fr]">
							{/* Job list */}
							<aside className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 shadow-xs">
								<div className="mb-2 flex items-center justify-between">
									<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Active Jobs</p>
									<Badge variant="outline">{mockJobs.length}</Badge>
								</div>
								<div className="space-y-2 overflow-y-auto">
									{mockJobs.map((job) => {
										const state = screeningStateByJob[job.id] ?? 'idle';
										return (
											<button
												key={job.id}
												onClick={() => { setSelectedJobId(job.id); setExpandedCandidateId(null); }}
												className={cn(
													'w-full rounded-xl border p-3 text-left transition-all duration-200',
													selectedJobId === job.id
														? 'border-primary/50 bg-primary/5 shadow-xs'
														: 'border-transparent bg-background/50 hover:border-border/80'
												)}
											>
												<div className="flex items-start justify-between gap-3">
													<div>
														<p className="font-medium text-foreground">{job.title}</p>
														<p className="mt-1 text-xs text-muted-foreground">{job.applicants} applicants</p>
													</div>
													<div className="flex flex-col items-end gap-1">
														<Badge variant={getJobStatusVariant(job.status)} className="text-[10px]">{job.status}</Badge>
														{state !== 'idle' && (
															<Badge variant={getScreeningVariant(state)} className="text-[10px]">{state}</Badge>
														)}
													</div>
												</div>
											</button>
										);
									})}
								</div>
							</aside>

							{/* Job detail + candidates */}
							<div className="flex flex-col gap-6">
								{selectedJob ? (
									<>
										{/* Job header */}
										<div className="rounded-2xl border border-border/60 bg-card/60 p-5 shadow-xs backdrop-blur-md">
											<div className="flex flex-wrap items-center justify-between gap-4">
												<div>
													<h2 className="text-xl font-semibold text-foreground">{selectedJob.title}</h2>
													<p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
														<span>{selectedJob.location}</span>
														<span>&bull;</span>
														<span>Posted {formatDistanceToNow(new Date(selectedJob.postedAt), { addSuffix: true })}</span>
													</p>
												</div>
												<div className="flex gap-2">
													<Button variant="outline" size="sm" className="gap-2">
														<PencilLine className="size-4" /> Edit
													</Button>
													<Button
														onClick={runScreening}
														disabled={screeningStateByJob[selectedJob.id] === 'running'}
														size="sm"
														className="gap-2"
													>
														<PlayCircle className="size-4" />
														{screeningStateByJob[selectedJob.id] === 'running' ? 'Screening...' : 'Run AI Screening'}
													</Button>
												</div>
											</div>
										</div>

										{/* Filters */}
										<div className="grid gap-3 rounded-2xl border border-border/60 bg-card/40 p-4 shadow-xs md:grid-cols-[1.5fr_1fr]">
											<div className="relative">
												<Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
												<Input
													value={query}
													onChange={(e) => setQuery(e.target.value)}
													placeholder="Search applicants..."
													className="bg-background/50 pl-9"
												/>
											</div>
											<div className="flex items-center gap-3">
												<div className="flex-1 rounded-md border border-input bg-background/50 px-3">
													<select
														value={sortMode}
														onChange={(e) => setSortMode(e.target.value as SortMode)}
														className="h-10 w-full bg-transparent text-sm focus:outline-hidden"
													>
														<option value="score-desc">Highest Score</option>
														<option value="score-asc">Lowest Score</option>
														<option value="name">Name (A-Z)</option>
													</select>
												</div>
												<div className="flex h-10 items-center rounded-md border border-input bg-background/50 px-3 text-sm text-muted-foreground">
													<Filter className="mr-2 size-4" />
													{filteredCandidates.length}
												</div>
											</div>
										</div>

										{/* Candidate list */}
										<div className="space-y-4">
											{filteredCandidates.map((candidate, i) => (
												<CandidateCard
													key={candidate.id}
													candidate={candidate}
													index={i}
													expanded={expandedCandidateId === candidate.id}
													onToggleExpand={() =>
														setExpandedCandidateId(
															expandedCandidateId === candidate.id ? null : candidate.id
														)
													}
												/>
											))}

											{filteredCandidates.length === 0 && (
												<div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-16 text-center">
													<div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
														<Search className="size-6" />
													</div>
													<h3 className="mt-4 text-lg font-semibold text-foreground">No candidates found</h3>
													<p className="mt-1 text-sm text-muted-foreground">
														Adjust your search or score filters to see more results.
													</p>
												</div>
											)}
										</div>
									</>
								) : (
									<div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-border/60 p-12 text-center">
										<p className="text-muted-foreground">Select a job to view applicants.</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* ── Candidates Tab ── */}
					{activeTab === 'candidates' && (
						<div className="flex h-64 animate-rise-in flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 p-12 text-center">
							<Users className="mb-4 size-10 text-muted-foreground/50" />
							<h2 className="text-xl font-semibold text-foreground">Global Candidate Pool</h2>
							<p className="mt-2 max-w-md text-muted-foreground">
								Search and filter across all applicants in your workspace, regardless of job.
							</p>
						</div>
					)}

					{/* ── Settings Tab ── */}
					{activeTab === 'settings' && (
						<div className="flex h-64 animate-rise-in flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 p-12 text-center">
							<Settings className="mb-4 size-10 text-muted-foreground/50" />
							<h2 className="text-xl font-semibold text-foreground">Workspace Settings</h2>
							<p className="mt-2 max-w-md text-muted-foreground">
								Manage team members, billing, and AI screening preferences here.
							</p>
						</div>
					)}
				</div>
			</main>
		</div>
	);
}
