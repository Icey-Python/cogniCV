'use client';

import { Button } from '@/components/ui/button';
import { mockJobs, mockRecruiterJobs } from '@/lib/mock-data';
import type { CandidateProfile, RecruiterJobView } from '@/types/jobs';
import { IconPencil, IconPlayerPlay, IconPlus, IconSettings, IconSparkles } from '@tabler/icons-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { CandidateInsightsDrawer } from '@/components/dashboard/candidate-insights-drawer';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';
import { DashboardSidebar, NAV_ITEMS, type TabType } from '@/components/dashboard/dashboard-sidebar';
import { JobDetailView } from '@/components/dashboard/job-detail-view';
import { JobGridCard } from '@/components/dashboard/job-grid-card';
import { UploadProfilesView } from '@/components/dashboard/upload-profiles-view';

type SortMode = 'score-desc' | 'score-asc' | 'name';
type ScreeningState = RecruiterJobView['screeningState'];

function sortCandidates(candidates: CandidateProfile[], mode: SortMode) {
	const copy = [...candidates];
	if (mode === 'score-desc') copy.sort((a, b) => b.matchScore - a.matchScore);
	else if (mode === 'score-asc') copy.sort((a, b) => a.matchScore - b.matchScore);
	else copy.sort((a, b) => a.name.localeCompare(b.name));
	return copy;
}

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
		return () => {
			Object.values(screeningTimers.current).forEach(clearTimeout);
		};
	}, []);

	const selectedJob = useMemo(() => mockJobs.find((j) => j.id === selectedJobId), [selectedJobId]);

	const applicantsForJob = useMemo(() => {
		return mockRecruiterJobs.find((r) => r.jobId === selectedJobId)?.applicants ?? [];
	}, [selectedJobId]);

	const filteredCandidates = useMemo(() => {
		const term = query.trim().toLowerCase();
		const filtered = applicantsForJob.filter(
			(c) =>
				term.length === 0 ||
				c.name.toLowerCase().includes(term) ||
				c.headline.toLowerCase().includes(term) ||
				c.skills.some((s) => s.toLowerCase().includes(term))
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
			<DashboardSidebar
				activeTab={activeTab}
				setActiveTab={setActiveTab}
				setSelectedJobId={setSelectedJobId}
				selectedJobId={selectedJobId}
			/>

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
								{selectedJob
									? 'View applicants, rank candidates, and run AI screening.'
									: activeTab === 'overview'
									? 'A high-level view of your recruitment pipeline.'
									: activeTab === 'jobs'
									? 'Manage your open roles.'
									: activeTab === 'upload'
									? 'Upload and parse external candidate profiles.'
									: activeTab === 'results'
									? 'View saved AI screening results across roles.'
									: 'Manage your workspace preferences.'}
							</p>
						</div>
						{activeTab === 'jobs' && !selectedJob && (
							<Button className="gap-2 shadow-sm">
								<IconPlus className="size-4" /> Create Job
							</Button>
						)}
						{selectedJob && (
							<div className="flex gap-2">
								<Button variant="outline" className="gap-2">
									<IconPencil className="size-4" /> Edit
								</Button>
								<Button
									onClick={runScreening}
									disabled={screeningStateByJob[selectedJob.id] === 'running'}
									className="gap-2"
								>
									<IconPlayerPlay className="size-4" />
									{screeningStateByJob[selectedJob.id] === 'running'
										? 'Screening...'
										: 'Run AI Screening'}
								</Button>
							</div>
						)}
					</header>

					{/* ── Overview Tab ── */}
					{activeTab === 'overview' && !selectedJob && (
						<DashboardOverview totalOpenJobs={totalOpenJobs} totalApplicants={totalApplicants} />
					)}

					{/* ── Jobs Tab (Grid View) ── */}
					{activeTab === 'jobs' && !selectedJob && (
						<div className="animate-rise-in grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{mockJobs.map((job) => (
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
						<JobDetailView
							filteredCandidates={filteredCandidates}
							query={query}
							setQuery={setQuery}
							sortMode={sortMode}
							setSortMode={setSortMode}
							setDrawerCandidate={setDrawerCandidate}
							setSelectedJobId={setSelectedJobId}
						/>
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

			<CandidateInsightsDrawer
				candidate={drawerCandidate}
				onClose={() => setDrawerCandidate(null)}
			/>
		</div>
	);
}
