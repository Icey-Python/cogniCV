'use client';

import { formatDistanceToNow } from 'date-fns';
import {
	IconActivity,
	IconBriefcase,
	IconChevronRight,
	IconFilter,
	IconLayoutDashboard,
	IconPencil,
	IconPlayerPlay,
	IconPlus,
	IconSearch,
	IconSettings,
	IconSparkles,
	IconUpload,
	IconUsers,
	IconX,
	IconCheck,
	IconFileSpreadsheet,
	IconFileTypePdf,
	IconRobot
} from '@tabler/icons-react';
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
type TabType = 'overview' | 'jobs' | 'upload' | 'results' | 'settings';
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

function JobGridCard({ job, onSelect, screeningState }: { job: JobListing, onSelect: () => void, screeningState: ScreeningState }) {
	return (
		<button
			onClick={onSelect}
			className="animate-rise-in flex flex-col text-left rounded-2xl border border-border/60 bg-card/40 p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-sm"
		>
			<div className="flex w-full items-start justify-between gap-3 mb-4">
				<div>
					<h3 className="font-semibold text-foreground text-lg">{job.title}</h3>
					<p className="text-sm text-muted-foreground mt-1">{job.location} &bull; {job.type}</p>
				</div>
				<Badge variant={getJobStatusVariant(job.status)}>{job.status}</Badge>
			</div>
			
			<p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
				{job.summary}
			</p>

			<div className="w-full flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
				<div className="flex items-center gap-3">
					<p className="text-xs font-medium text-foreground">{job.applicants} applicants</p>
					{screeningState !== 'idle' && (
						<Badge variant={getScreeningVariant(screeningState)} className="text-[10px]">{screeningState}</Badge>
					)}
				</div>
				<IconChevronRight className="size-4 text-muted-foreground" />
			</div>
		</button>
	);
}

function CandidateInsightsDrawer({ candidate, onClose }: { candidate: CandidateProfile | null, onClose: () => void }) {
	return (
		<>
			<div 
				className={cn('fixed inset-0 z-40 bg-secondary/40 backdrop-blur-[2px] transition-opacity', candidate ? 'opacity-100' : 'pointer-events-none opacity-0')}
				onClick={onClose}
			/>
			<aside className={cn('fixed right-0 top-0 z-50 h-dvh w-full max-w-md overflow-y-auto border-l border-border bg-popover shadow-2xl transition-transform duration-300', candidate ? 'translate-x-0' : 'translate-x-full')}>
				{candidate && (
					<div className="flex flex-col h-full">
						<div className="flex items-center justify-between p-6 border-b border-border/50">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
									{candidate.name.charAt(0)}
								</div>
								<div>
									<h2 className="font-semibold text-lg">{candidate.name}</h2>
									<p className="text-xs text-muted-foreground">Match Score: {candidate.matchScore}</p>
								</div>
							</div>
							<Button variant="ghost" size="icon" onClick={onClose}><IconX className="size-4" /></Button>
						</div>

						<div className="flex-1 p-6 space-y-6">
							<div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
								<div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
									<IconSparkles className="size-4" /> CogniCV AI Analysis
								</div>
								
								<div className="space-y-6">
									<div>
										<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Strengths</p>
										<ul className="space-y-2">
											{candidate.strengths.map((s) => (
												<li key={s} className="flex items-start gap-2 text-sm text-foreground">
													<span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-emerald-500" />{s}
												</li>
											))}
										</ul>
									</div>
									<div>
										<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Potential Gaps</p>
										<ul className="space-y-2">
											{candidate.gaps.map((g) => (
												<li key={g} className="flex items-start gap-2 text-sm text-foreground">
													<span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-amber-500" />{g}
												</li>
											))}
										</ul>
									</div>
									<div className="rounded-lg bg-background/50 p-4 border border-border/50">
										<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recommendation</p>
										<p className="text-sm font-medium leading-relaxed text-foreground">{candidate.recommendation}</p>
									</div>
								</div>
							</div>

							<div>
								<h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Score Breakdown</h3>
								<div className="grid gap-4">
									{Object.entries(candidate.subScores).map(([key, value]) => (
										<div key={key}>
											<div className="mb-1.5 flex items-center justify-between text-xs font-medium text-foreground">
												<span className="capitalize">{key}</span>
												<span>{value}/100</span>
											</div>
											<div className="h-1.5 overflow-hidden rounded-full bg-muted">
												<div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				)}
			</aside>
		</>
	);
}

function UploadProfilesView() {
	const [isDragging, setIsDragging] = useState(false);
	const [files, setFiles] = useState<{name: string, type: 'csv' | 'pdf', status: 'pending' | 'parsing' | 'success'}[]>([]);

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		
		const droppedFiles = Array.from(e.dataTransfer.files).map(f => ({
			name: f.name,
			type: f.name.endsWith('.csv') ? 'csv' : 'pdf' as 'csv'|'pdf',
			status: 'pending' as const
		}));
		
		setFiles(prev => [...prev, ...droppedFiles]);
	};

	const startParsing = () => {
		setFiles(prev => prev.map(f => ({ ...f, status: 'parsing' })));
		setTimeout(() => {
			setFiles(prev => prev.map(f => ({ ...f, status: 'success' })));
		}, 3000);
	};

	return (
		<div className="animate-rise-in space-y-6">
			<div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-xs">
				<h2 className="text-lg font-semibold mb-2">Batch Upload Profiles</h2>
				<p className="text-sm text-muted-foreground mb-6">
					Upload external candidate data via CSV or bulk PDF resumes. Our AI will automatically parse and normalise them to the Umurava TalentProfile schema.
				</p>

				<div 
					onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
					onDragLeave={() => setIsDragging(false)}
					onDrop={handleDrop}
					className={cn(
						"flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 transition-colors",
						isDragging ? "border-primary bg-primary/5" : "border-border/60 bg-background/50 hover:bg-muted/50"
					)}
				>
					<IconUpload className={cn("size-10 mb-4", isDragging ? "text-primary" : "text-muted-foreground")} />
					<p className="text-sm font-medium">Drag and drop files here</p>
					<p className="text-xs text-muted-foreground mt-1">Supports .csv, .xlsx, .pdf (Max 50MB batch)</p>
					<Button variant="secondary" className="mt-6" size="sm">Browse Files</Button>
				</div>

				{files.length > 0 && (
					<div className="mt-8 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-semibold">Upload Queue ({files.length})</h3>
							<Button size="sm" onClick={startParsing} disabled={files.every(f => f.status === 'success' || f.status === 'parsing')} className="gap-2">
								<IconRobot className="size-4" /> Run Parsing Engine
							</Button>
						</div>
						
						<div className="grid gap-3">
							{files.map((file, i) => (
								<div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50">
									<div className="flex items-center gap-3">
										{file.type === 'csv' ? <IconFileSpreadsheet className="size-5 text-emerald-500" /> : <IconFileTypePdf className="size-5 text-rose-500" />}
										<span className="text-sm font-medium">{file.name}</span>
									</div>
									<div>
										{file.status === 'pending' && <Badge variant="secondary">Ready</Badge>}
										{file.status === 'parsing' && <Badge variant="accent" className="animate-pulse">Parsing via AI...</Badge>}
										{file.status === 'success' && <Badge variant="default" className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"><IconCheck className="size-3 mr-1" /> Mapped to Schema</Badge>}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
	{ id: 'overview', label: 'Overview', icon: IconLayoutDashboard },
	{ id: 'jobs', label: 'Jobs', icon: IconBriefcase },
	{ id: 'upload', label: 'Upload Profiles', icon: IconUpload },
	{ id: 'results', label: 'Screening Results', icon: IconSparkles },
	{ id: 'settings', label: 'Settings', icon: IconSettings }
] as const;

export default function DashboardPage() {
	const [activeTab, setActiveTab] = useState<TabType>('overview');
	const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [sortMode, setSortMode] = useState<SortMode>('score-desc');
	const [drawerCandidate, setDrawerCandidate] = useState<CandidateProfile | null>(null);
	
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
		}, 2000);
	};

	const totalOpenJobs = mockJobs.filter((j) => j.status === 'Open').length;
	const totalApplicants = mockJobs.reduce((sum, j) => sum + j.applicants, 0);

	return (
		<div className="flex h-screen w-full overflow-hidden bg-background/50">
			{/* ── Sidebar ── */}
			<aside className="w-64 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur-xl">
				<div className="flex h-full flex-col px-4 py-6">
					<div className="mb-8 px-2">
						<div className="gap-2 flex items-center text-xl font-serif font-medium text-primary">
							<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
								<IconSparkles className="size-4" />
							</div>
							CogniCV
						</div>
					</div>

					<nav className="flex flex-1 flex-col gap-1">
						<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">Workspace</p>
						{NAV_ITEMS.map((item) => (
							<button
								key={item.id}
								onClick={() => {
									setActiveTab(item.id);
									if (item.id !== 'jobs') setSelectedJobId(null);
								}}
								className={cn(
									'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
									activeTab === item.id && !selectedJobId
										? 'bg-accent/80 text-accent-foreground shadow-xs'
										: 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
								)}
							>
								<item.icon className={cn('size-4', activeTab === item.id && !selectedJobId && 'text-primary')} />
								{item.label}
							</button>
						))}
					</nav>
				</div>
			</aside>

			{/* ── Main ── */}
			<main className="flex-1 overflow-y-auto">
				<div className="mx-auto max-w-6xl p-6 md:p-8 lg:p-10">
					{/* Header */}
					<header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
						<div>
							<h1 className="font-serif text-3xl font-semibold text-foreground md:text-4xl">
								{selectedJob ? selectedJob.title : NAV_ITEMS.find((i) => i.id === activeTab)?.label}
							</h1>
							<p className="mt-2 text-sm text-muted-foreground">
								{selectedJob ? 'View applicants, rank candidates, and run AI screening.' : 
									activeTab === 'overview' ? 'A high-level view of your recruitment pipeline.' :
									activeTab === 'jobs' ? 'Manage your open roles.' :
									activeTab === 'upload' ? 'Upload and parse external candidate profiles.' :
									activeTab === 'results' ? 'View saved AI screening results across roles.' :
									'Manage your workspace preferences.'}
							</p>
						</div>
						{activeTab === 'jobs' && !selectedJob && (
							<Button className="gap-2 shadow-sm">
								<IconPlus className="size-4" /> Create Job
							</Button>
						)}
						{selectedJob && (
							<div className="flex gap-2">
								<Button variant="outline" className="gap-2"><IconPencil className="size-4"/> Edit</Button>
								<Button onClick={runScreening} disabled={screeningStateByJob[selectedJob.id] === 'running'} className="gap-2">
									<IconPlayerPlay className="size-4" />
									{screeningStateByJob[selectedJob.id] === 'running' ? 'Screening...' : 'Run AI Screening'}
								</Button>
							</div>
						)}
					</header>

					{/* ── Overview Tab ── */}
					{activeTab === 'overview' && !selectedJob && (
						<div className="animate-rise-in space-y-6">
							<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
								{[
									{ label: 'Open Roles', value: totalOpenJobs, icon: IconBriefcase },
									{ label: 'Total Applicants', value: totalApplicants, icon: IconUsers },
									{ label: 'Top Matches', value: '42', icon: IconSparkles },
									{ label: 'Time to Hire', value: '18d', icon: IconActivity }
								].map((kpi) => (
									<div key={kpi.label} className="rounded-2xl border border-border/60 bg-card/50 p-5 shadow-xs">
										<div className="flex items-center justify-between text-muted-foreground">
											<p className="text-xs font-semibold uppercase tracking-wider">{kpi.label}</p>
											<kpi.icon className="size-4" />
										</div>
										<p className="mt-3 text-3xl font-bold text-foreground">{kpi.value}</p>
									</div>
								))}
							</div>
						</div>
					)}

					{/* ── Jobs Tab (Grid View) ── */}
					{activeTab === 'jobs' && !selectedJob && (
						<div className="animate-rise-in grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{mockJobs.map(job => (
								<JobGridCard 
									key={job.id} 
									job={job} 
									onSelect={() => setSelectedJobId(job.id)} 
									screeningState={screeningStateByJob[job.id] ?? 'idle'}
								/>
							))}
						</div>
					)}

					{/* ── Job Detail Tabular View ── */}
					{selectedJob && (
						<div className="animate-rise-in space-y-6">
							<div className="flex items-center gap-4 border-b border-border/50 pb-4">
								<Button variant="ghost" onClick={() => setSelectedJobId(null)} className="text-muted-foreground">
									&larr; Back to Jobs
								</Button>
							</div>

							{/* Table Toolbar */}
							<div className="flex flex-wrap gap-4 items-center justify-between bg-card/40 border border-border/60 p-4 rounded-xl">
								<div className="relative w-full max-w-sm">
									<IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
									<Input 
										value={query} 
										onChange={e => setQuery(e.target.value)} 
										placeholder="Search candidates..." 
										className="pl-9 bg-background/50"
									/>
								</div>
								<div className="flex items-center gap-3">
									<select
										value={sortMode}
										onChange={(e) => setSortMode(e.target.value as SortMode)}
										className="h-10 rounded-md border border-input bg-background/50 px-3 text-sm focus:outline-hidden"
									>
										<option value="score-desc">Sort: Highest Match</option>
										<option value="score-asc">Sort: Lowest Match</option>
										<option value="name">Sort: Name</option>
									</select>
									<Button variant="outline" size="icon"><IconFilter className="size-4" /></Button>
								</div>
							</div>

							{/* Ranking Table */}
							<div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
								<table className="w-full text-sm text-left">
									<thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
										<tr>
											<th className="px-6 py-4 font-semibold">Rank</th>
											<th className="px-6 py-4 font-semibold">Candidate</th>
											<th className="px-6 py-4 font-semibold hidden md:table-cell">Experience</th>
											<th className="px-6 py-4 font-semibold hidden lg:table-cell">Status</th>
											<th className="px-6 py-4 font-semibold text-right">Match Score</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-border/50">
										{filteredCandidates.map((candidate, i) => (
											<tr 
												key={candidate.id} 
												onClick={() => setDrawerCandidate(candidate)}
												className="hover:bg-muted/30 cursor-pointer transition-colors group"
											>
												<td className="px-6 py-4 font-medium text-muted-foreground">#{i + 1}</td>
												<td className="px-6 py-4">
													<div className="font-semibold text-foreground group-hover:text-primary transition-colors">{candidate.name}</div>
													<div className="text-muted-foreground text-xs">{candidate.headline}</div>
												</td>
												<td className="px-6 py-4 hidden md:table-cell">{candidate.yearsExperience} yrs</td>
												<td className="px-6 py-4 hidden lg:table-cell">
													<Badge variant={getAvailabilityVariant(candidate.availability)} className="font-normal text-[10px]">
														{candidate.availability}
													</Badge>
												</td>
												<td className="px-6 py-4 text-right">
													<span className={cn('text-lg font-bold', getScoreTone(candidate.matchScore))}>
														{candidate.matchScore}
													</span>
												</td>
											</tr>
										))}
									</tbody>
								</table>
								{filteredCandidates.length === 0 && (
									<div className="p-12 text-center text-muted-foreground">No candidates match the current filters.</div>
								)}
							</div>
						</div>
					)}

					{/* ── Upload Profiles Tab ── */}
					{activeTab === 'upload' && !selectedJob && <UploadProfilesView />}

					{/* ── Placeholder Tabs ── */}
					{activeTab === 'results' && !selectedJob && (
						<div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 p-12 text-center text-muted-foreground">
							<IconSparkles className="size-10 mb-4 opacity-50" />
							<p>Historical screening results will appear here.</p>
						</div>
					)}
					{activeTab === 'settings' && !selectedJob && (
						<div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 p-12 text-center text-muted-foreground">
							<IconSettings className="size-10 mb-4 opacity-50" />
							<p>Workspace settings.</p>
						</div>
					)}
				</div>
			</main>
			
			<CandidateInsightsDrawer candidate={drawerCandidate} onClose={() => setDrawerCandidate(null)} />
		</div>
	);
}
