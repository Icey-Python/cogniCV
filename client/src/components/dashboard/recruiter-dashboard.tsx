'use client';

import { formatDistanceToNow } from 'date-fns';
import {
	ArrowDownUp,
	BriefcaseBusiness,
	ChevronDown,
	ChevronUp,
	Filter,
	PencilLine,
	PlayCircle,
	Plus,
	Search,
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

type SortMode = 'score-desc' | 'score-asc' | 'name';

type ScreeningState = RecruiterJobView['screeningState'];

type BadgeVariant =
	| 'default'
	| 'secondary'
	| 'outline'
	| 'accent'
	| 'destructive';

function getJobStatusVariant(status: JobListing['status']): BadgeVariant {
	switch (status) {
		case 'Open':
			return 'default';
		case 'Closing Soon':
			return 'accent';
		case 'Paused':
			return 'secondary';
		default:
			return 'outline';
	}
}

function getAvailabilityVariant(
	availability: CandidateProfile['availability']
): BadgeVariant {
	switch (availability) {
		case 'Available':
			return 'default';
		case 'Open to opportunities':
			return 'accent';
		case 'Not available':
			return 'secondary';
		default:
			return 'outline';
	}
}

function getScreeningVariant(state: ScreeningState): BadgeVariant {
	switch (state) {
		case 'running':
			return 'accent';
		case 'complete':
			return 'default';
		case 'idle':
		default:
			return 'outline';
	}
}

function sortCandidates(candidates: CandidateProfile[], sortMode: SortMode) {
	const copy = [...candidates];

	switch (sortMode) {
		case 'score-desc':
			copy.sort((a, b) => b.matchScore - a.matchScore);
			break;
		case 'score-asc':
			copy.sort((a, b) => a.matchScore - b.matchScore);
			break;
		case 'name':
			copy.sort((a, b) => a.name.localeCompare(b.name));
			break;
	}

	return copy;
}

function getScoreTone(score: number): string {
	if (score >= 90) {
		return 'text-primary';
	}

	if (score >= 80) {
		return 'text-foreground';
	}

	return 'text-muted-foreground';
}

export function RecruiterDashboard() {
	const [selectedJobId, setSelectedJobId] = useState<string>(
		mockJobs[0]?.id ?? ''
	);
	const [query, setQuery] = useState('');
	const [minScore, setMinScore] = useState(70);
	const [sortMode, setSortMode] = useState<SortMode>('score-desc');
	const [expandedCandidateId, setExpandedCandidateId] = useState<string | null>(
		null
	);
	const [screeningStateByJob, setScreeningStateByJob] = useState<
		Record<string, ScreeningState>
	>(() => {
		return mockRecruiterJobs.reduce<Record<string, ScreeningState>>(
			(accumulator, current) => {
				accumulator[current.jobId] = current.screeningState;
				return accumulator;
			},
			{}
		);
	});

	const screeningTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>(
		{}
	);

	useEffect(() => {
		return () => {
			Object.values(screeningTimers.current).forEach((timer) =>
				clearTimeout(timer)
			);
		};
	}, []);

	const selectedJob = useMemo(
		() => mockJobs.find((job) => job.id === selectedJobId),
		[selectedJobId]
	);

	const applicantsForSelectedJob = useMemo(() => {
		const entry = mockRecruiterJobs.find((item) => item.jobId === selectedJobId);
		return entry?.applicants ?? [];
	}, [selectedJobId]);

	const filteredCandidates = useMemo(() => {
		const searchTerm = query.trim().toLowerCase();

		const filtered = applicantsForSelectedJob.filter((candidate) => {
			const queryMatch =
				searchTerm.length === 0 ||
				candidate.name.toLowerCase().includes(searchTerm) ||
				candidate.headline.toLowerCase().includes(searchTerm) ||
				candidate.skills.some((skill) => skill.toLowerCase().includes(searchTerm));

			const scoreMatch = candidate.matchScore >= minScore;

			return queryMatch && scoreMatch;
		});

		return sortCandidates(filtered, sortMode);
	}, [applicantsForSelectedJob, minScore, query, sortMode]);

	const runScreening = () => {
		if (!selectedJobId) {
			return;
		}

		if (screeningTimers.current[selectedJobId]) {
			clearTimeout(screeningTimers.current[selectedJobId]);
		}

		setScreeningStateByJob((current) => ({
			...current,
			[selectedJobId]: 'running'
		}));

		screeningTimers.current[selectedJobId] = setTimeout(() => {
			setScreeningStateByJob((current) => ({
				...current,
				[selectedJobId]: 'complete'
			}));
		}, 1600);
	};

	const totalOpenJobs = mockJobs.filter((job) => job.status === 'Open').length;
	const totalApplicants = mockJobs.reduce((sum, job) => sum + job.applicants, 0);
	const highScoreCandidates = applicantsForSelectedJob.filter(
		(candidate) => candidate.matchScore >= 85
	).length;

	return (
		<div className="relative min-h-screen overflow-hidden bg-background pb-20">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -right-20 top-6 h-72 w-72 rounded-full bg-primary/15 blur-3xl" />
				<div className="absolute left-0 top-64 h-64 w-64 rounded-full bg-accent/70 blur-3xl" />
			</div>

			<main className="relative mx-auto max-w-7xl px-4 pt-8 md:px-8">
				<section className="animate-rise-in overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm md:p-8">
					<div className="grid gap-6 lg:grid-cols-[1.6fr_1fr] lg:items-end">
						<div>
							<p className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
								<Sparkles className="size-4 text-primary" />
								Recruiter command center
							</p>
							<h1 className="font-serif text-3xl text-foreground md:text-4xl">
								Screen, compare, and shortlist with confidence
							</h1>
							<p className="mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
								Run AI screening, inspect score breakdowns, and review candidate
								reasoning without leaving one dashboard.
							</p>
						</div>

						<div className="flex flex-wrap justify-start gap-2 lg:justify-end">
							<Button type="button" className="gap-2">
								<Plus className="size-4" />
								Create job
							</Button>
							<Button type="button" variant="outline" className="gap-2">
								<PencilLine className="size-4" />
								Edit job
							</Button>
							<Button type="button" variant="secondary" className="gap-2">
								<Users className="size-4" />
								View applicants
							</Button>
						</div>
					</div>
				</section>

				<section className="mt-6 grid gap-3 md:grid-cols-3">
					<div className="rounded-2xl border border-border/70 bg-card/85 p-4">
						<p className="text-xs uppercase tracking-wide text-muted-foreground">
							Open jobs
						</p>
						<p className="mt-2 text-2xl font-semibold text-foreground">
							{totalOpenJobs}
						</p>
					</div>
					<div className="rounded-2xl border border-border/70 bg-card/85 p-4">
						<p className="text-xs uppercase tracking-wide text-muted-foreground">
							Applicants in pipeline
						</p>
						<p className="mt-2 text-2xl font-semibold text-foreground">
							{totalApplicants}
						</p>
					</div>
					<div className="rounded-2xl border border-border/70 bg-card/85 p-4">
						<p className="text-xs uppercase tracking-wide text-muted-foreground">
							High-match candidates
						</p>
						<p className="mt-2 text-2xl font-semibold text-foreground">
							{highScoreCandidates}
						</p>
					</div>
				</section>

				<section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.5fr]">
					<aside className="rounded-3xl border border-border/70 bg-card/85 p-4 shadow-sm md:p-5">
						<p className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
							<BriefcaseBusiness className="size-3.5" />
							Job listings
						</p>
						<div className="space-y-2">
							{mockJobs.map((job) => {
								const screeningState = screeningStateByJob[job.id] ?? 'idle';

								return (
									<button
										type="button"
										key={job.id}
										onClick={() => {
											setSelectedJobId(job.id);
											setExpandedCandidateId(null);
										}}
										className={cn(
											'w-full rounded-2xl border p-3 text-left transition-colors',
											selectedJobId === job.id
												? 'border-primary/45 bg-primary/5'
												: 'border-border/70 bg-background/70 hover:border-primary/25'
										)}
									>
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="font-medium text-foreground">{job.title}</p>
												<p className="mt-1 text-xs text-muted-foreground">
													{job.applicants} applicants
												</p>
											</div>
											<div className="flex flex-col items-end gap-1">
												<Badge variant={getJobStatusVariant(job.status)}>
													{job.status}
												</Badge>
												<Badge variant={getScreeningVariant(screeningState)}>
													{screeningState}
												</Badge>
											</div>
										</div>
									</button>
								);
							})}
						</div>
					</aside>

					<div className="rounded-3xl border border-border/70 bg-card/85 p-4 shadow-sm md:p-5">
						{selectedJob && (
							<>
								<div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/70 bg-background/70 p-4">
									<div>
										<p className="text-xs uppercase tracking-wide text-muted-foreground">
											Selected role
										</p>
										<h2 className="mt-1 text-xl font-semibold text-foreground">
											{selectedJob.title}
										</h2>
										<p className="mt-1 text-sm text-muted-foreground">
											Posted{' '}
											{formatDistanceToNow(new Date(selectedJob.postedAt), {
												addSuffix: true
											})}
										</p>
									</div>

									<Button
										type="button"
										onClick={runScreening}
										disabled={screeningStateByJob[selectedJob.id] === 'running'}
									>
										<PlayCircle className="size-4" />
										{screeningStateByJob[selectedJob.id] === 'running'
											? 'Screening in progress...'
											: 'Run AI screening'}
									</Button>
								</div>

								<div className="mb-5 grid gap-3 rounded-2xl border border-border/70 bg-background/70 p-4 md:grid-cols-[1.5fr_0.9fr_0.9fr]">
									<div className="relative">
										<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
										<Input
											value={query}
											onChange={(event) => setQuery(event.target.value)}
											placeholder="Search by name, headline, or skill"
											className="pl-9"
										/>
									</div>

									<div className="rounded-md border border-input bg-input px-3">
										<select
											value={sortMode}
											onChange={(event) =>
												setSortMode(event.target.value as SortMode)
											}
											className="h-10 w-full bg-transparent text-sm text-foreground focus:outline-hidden"
										>
											<option value="score-desc">Highest score</option>
											<option value="score-asc">Lowest score</option>
											<option value="name">Name (A-Z)</option>
										</select>
									</div>

									<div className="flex items-center gap-2 rounded-md border border-input bg-input px-3 text-sm text-muted-foreground">
										<ArrowDownUp className="size-4" />
										<p>{filteredCandidates.length} results</p>
									</div>
								</div>

								<div className="mb-5 rounded-2xl border border-border/70 bg-background/70 p-4">
									<p className="inline-flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
										<Filter className="size-3.5" />
										Minimum score filter: {minScore}
									</p>
									<input
										type="range"
										min={50}
										max={95}
										step={1}
										value={minScore}
										onChange={(event) => setMinScore(Number(event.target.value))}
										className="mt-3 w-full accent-primary"
									/>
								</div>

								<div className="space-y-3">
									{filteredCandidates.map((candidate, index) => {
										const expanded = expandedCandidateId === candidate.id;

										return (
											<article
												key={candidate.id}
												className="animate-rise-in rounded-2xl border border-border/70 bg-background/75 p-4"
												style={{ animationDelay: `${index * 50}ms` }}
											>
												<div className="flex flex-wrap items-start justify-between gap-3">
													<div>
														<p className="text-xs uppercase tracking-wide text-muted-foreground">
															Rank #{index + 1}
														</p>
														<h3 className="mt-1 text-lg font-semibold text-foreground">
															{candidate.name}
														</h3>
														<p className="mt-1 text-sm text-muted-foreground">
															{candidate.headline}
														</p>
													</div>

													<div className="text-right">
														<p
															className={cn(
																'text-2xl font-semibold',
																getScoreTone(candidate.matchScore)
															)}
														>
															{candidate.matchScore}
														</p>
														<p className="text-xs text-muted-foreground">match score</p>
													</div>
												</div>

												<div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
													<Badge variant={getAvailabilityVariant(candidate.availability)}>
														{candidate.availability}
													</Badge>
													<span>{candidate.location}</span>
													<span>·</span>
													<span>{candidate.yearsExperience} years experience</span>
												</div>

												<div className="mt-4 grid gap-2 md:grid-cols-2">
													{Object.entries(candidate.subScores).map(([key, value]) => (
														<div key={key}>
															<div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
																<span className="capitalize">{key}</span>
																<span>{value}</span>
															</div>
															<div className="h-1.5 overflow-hidden rounded-full bg-muted">
																<div
																	className="h-full rounded-full bg-primary"
																	style={{ width: `${value}%` }}
																/>
															</div>
														</div>
													))}
												</div>

												<div className="mt-4 flex items-center justify-between gap-2">
													<p className="text-xs text-muted-foreground">
														Applied{' '}
														{formatDistanceToNow(new Date(candidate.appliedAt), {
															addSuffix: true
														})}
													</p>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														onClick={() =>
															setExpandedCandidateId((current) =>
																current === candidate.id ? null : candidate.id
															)
														}
													>
														{expanded ? (
															<>
																Hide reasoning <ChevronUp className="size-4" />
															</>
														) : (
															<>
																View reasoning <ChevronDown className="size-4" />
															</>
														)}
													</Button>
												</div>

												{expanded && (
													<div className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
														<p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-foreground">
															<Sparkles className="size-4 text-primary" />
															AI reasoning card
														</p>
														<p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
															Strengths
														</p>
														<div className="mb-3 flex flex-wrap gap-1.5">
															{candidate.strengths.map((strength) => (
																<span
																	key={strength}
																	className="rounded-full border border-primary/30 bg-background px-2 py-1 text-xs text-foreground"
																>
																	{strength}
																</span>
															))}
														</div>
														<p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
															Gaps
														</p>
														<div className="mb-3 flex flex-wrap gap-1.5">
															{candidate.gaps.map((gap) => (
																<span
																	key={gap}
																	className="rounded-full border border-border bg-background px-2 py-1 text-xs text-muted-foreground"
																>
																	{gap}
																</span>
															))}
														</div>
														<p className="rounded-lg border border-border bg-background p-3 text-sm text-foreground">
															{candidate.recommendation}
														</p>
													</div>
												)}
											</article>
										);
									})}
								</div>

								{filteredCandidates.length === 0 && (
									<div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
										No candidates match this filter set.
									</div>
								)}
							</>
						)}
					</div>
				</section>
			</main>
		</div>
	);
}
