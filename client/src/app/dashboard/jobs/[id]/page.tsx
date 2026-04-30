'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
	useJobQuery,
	useJobApplicantsQuery,
	useScreeningResultsQuery
} from '@/hooks/query/jobs/queries';
import { useTriggerScreeningMutation } from '@/hooks/query/jobs/mutations';
import { ApplicantInsightDrawer } from '@/components/jobs/applicant-insight-drawer';
import { JobInfoDrawer } from '@/components/jobs/job-info-drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RankedApplicantsTable } from '@/components/jobs/ranked-applicants-table';
import { SimpleApplicantsTable } from '@/components/jobs/simple-applicants-table';
import {
	IconSearch,
	IconUsers,
	IconMapPin,
	IconBriefcase,
	IconUpload,
	IconInfoCircle,
	IconLoader2,
	IconSparkles,
	IconPencil,
	IconFilter,
	IconDownload,
	IconX,
	IconPlus,
	IconCheck
} from '@tabler/icons-react';
import { ScreeningService } from '@/hooks/query/jobs/service';
import { FloatingChat } from '@/components/chat/floating-chat';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const MdxEditor = dynamic(() => import('@/components/ui/mdx-editor'), { ssr: false });
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'motion/react';
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 10;

const LOADING_MESSAGES = [
	'Initializing secure AI sandbox for document parsing...',
	'Scanning candidate resumes for semantic patterns...',
	'Extracting key skills and technical proficiencies...',
	'Comparing experience history against role requirements...',
	'Identifying career progression and leadership signals...',
	'Cross-referencing tech stacks with industry benchmarks...',
	'Analyzing project complexity and individual contributions...',
	'Evaluating educational background and certifications...',
	'Checking for redundant skills and potential experience gaps...',
	'Ranking candidates based on multi-dimensional AI matching...',
	'Generating tailored feedback and recruiter insights...',
	'Simulating cultural fit based on organizational parameters...',
	'Synthesizing match reasoning for top-tier candidates...',
	'Almost there! Finalizing the comprehensive analysis...',
	'Preparing the high-fidelity match report...'
];

const formatTime = (seconds: number) => {
	const mins = Math.floor(seconds / 60);
	const secs = seconds % 60;
	return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default function JobDetailPage() {
	const params = useParams<{ id: string }>();
	const { data: jobData, isLoading: jobLoading } = useJobQuery(
		params.id as string
	);
	const { data: applicantsData, isLoading: applicantsLoading } =
		useJobApplicantsQuery(params.id as string);

	const [isPolling, setIsPolling] = useState(false);
	const [filters, setFilters] = useState<{
		location?: string;
		skills?: string;
		limit?: string;
	}>({ limit: '20' });
	const [tempFilters, setTempFilters] = useState<{
		location?: string;
		skills?: string;
		limit?: string;
	}>({ limit: '20' });
	const [filtersDialogOpen, setFiltersDialogOpen] = useState(false);
	const [isDownloading, setIsDownloading] = useState(false);
	const [reEvaluateMode, setReEvaluateMode] = useState(false);
	const [reEvaluateMessage, setReEvaluateMessage] = useState('');

	const { data: screeningData, isLoading: screeningLoading } =
		useScreeningResultsQuery(params.id as string, filters, {
			refetchInterval: isPolling ? 3000 : false
		});

	const { mutate: triggerScreening, isPending: screeningPending } =
		useTriggerScreeningMutation();

	const job = jobData?.data;
	const allApplicants = useMemo(() => {
		if (!applicantsData?.data) return [];
		return [...applicantsData.data.external, ...applicantsData.data.platform];
	}, [applicantsData]);

	const screeningResult = (screeningData as any)?.data;
	const rankedCandidates = screeningResult?.rankedCandidates || [];
	const isScreened = screeningResult?.status === 'completed';
	const isScreeningInProgress =
		screeningPending || screeningResult?.status === 'pending';

	const [messageIndex, setMessageIndex] = useState(0);
	const [elapsedSeconds, setElapsedSeconds] = useState(0);
	const [subProgress, setSubProgress] = useState(0);

	useEffect(() => {
		let messageInterval: any;
		let timerInterval: any;
		let subInterval: any;

		if (isScreeningInProgress) {
			// Cycle messages every 4 seconds
			messageInterval = setInterval(() => {
				setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
				setSubProgress(0); // Reset smooth filling on message change
			}, 4000);

			timerInterval = setInterval(() => {
				setElapsedSeconds((prev) => prev + 1);
			}, 1000);

			// Smooth filling for the progress bar (increments every 100ms)
			subInterval = setInterval(() => {
				setSubProgress((prev) => Math.min(prev + 100 / 40, 100)); // 4000ms / 100ms = 40 steps
			}, 100);
		} else {
			setElapsedSeconds(0);
			setMessageIndex(0);
			setSubProgress(0);
		}

		return () => {
			clearInterval(messageInterval);
			clearInterval(timerInterval);
			clearInterval(subInterval);
		};
	}, [isScreeningInProgress]);

	// Calculate simulated progress based on messages
	const simulatedProgress = useMemo(() => {
		if (!isScreeningInProgress) return 0;
		const baseProgress = (messageIndex / LOADING_MESSAGES.length) * 100;
		const stepProgress = subProgress / LOADING_MESSAGES.length;
		return Math.min(Math.round(baseProgress + stepProgress), 99); // Cap at 99% until complete
	}, [isScreeningInProgress, messageIndex, subProgress]);

	useEffect(() => {
		setIsPolling(isScreeningInProgress);
	}, [isScreeningInProgress]);

	const [search, setSearch] = useState('');
	const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [jobInfoOpen, setJobInfoOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);

	const handleApplyFilters = () => {
		setFilters(tempFilters);
		setFiltersDialogOpen(false);
		setCurrentPage(1);
	};

	const handleDownloadCsv = async () => {
		if (!job) return;
		try {
			setIsDownloading(true);
			await ScreeningService.downloadScreeningCsv(job._id);
		} catch (error) {
			console.error('Failed to download CSV', error);
		} finally {
			setIsDownloading(false);
		}
	};

	// Reset to page 1 when search changes
	useEffect(() => {
		setCurrentPage(1);
	}, [search]);

	const filteredRanked = useMemo(
		() =>
			rankedCandidates.filter((c: any) => {
				const name =
					`${c.profileSnapshot.firstName} ${c.profileSnapshot.lastName}`.toLowerCase();
				return name.includes(search.toLowerCase());
			}),
		[rankedCandidates, search]
	);

	const filteredUnscreened = useMemo(
		() =>
			allApplicants.filter((a: any) => {
				const name = `${a.firstName} ${a.lastName}`.toLowerCase();
				return name.includes(search.toLowerCase());
			}),
		[allApplicants, search]
	);

	const activeData = isScreened ? filteredRanked : filteredUnscreened;
	const totalPages = Math.ceil(activeData.length / ITEMS_PER_PAGE);

	const paginatedData = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;
		return activeData.slice(start, start + ITEMS_PER_PAGE);
	}, [activeData, currentPage]);

	const openDrawer = (candidate: any) => {
		setSelectedCandidate(candidate);
		setDrawerOpen(true);
	};

	if (jobLoading) {
		return (
			<div className="text-muted-foreground flex justify-center py-20">
				<IconLoader2 className="mr-2 size-6 animate-spin" />
				Loading job details...
			</div>
		);
	}

	if (!job) {
		return (
			<div className="py-20 text-center">
				<p className="text-muted-foreground">Job not found.</p>
				<Button variant="outline" asChild className="mt-4">
					<Link href="/dashboard/jobs">Back to Jobs</Link>
				</Button>
			</div>
		);
	}

	const hasApplicants = allApplicants.length > 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col items-start gap-4 lg:flex-row">
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl font-semibold">{job.title} </h1>
						<button
							onClick={() => setJobInfoOpen(true)}
							type="button"
							aria-label="Job info"
							className="mt-1 cursor-pointer"
						>
							<IconInfoCircle size={18} />
						</button>
					</div>
					<div className="text-muted-foreground mt-2 flex flex-wrap gap-4 text-sm">
						<span className="flex items-center gap-1">
							<IconBriefcase className="size-4" /> {job.experienceLevel}
						</span>
						<span className="flex items-center gap-1">
							<IconMapPin className="size-4" /> {job.location?.city},{' '}
							{job.location?.country}
						</span>
						<span className="flex items-center gap-1">
							<IconUsers className="size-4" /> {allApplicants.length} applicants
						</span>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Button variant="outline" asChild>
						<Link href={`/dashboard/jobs/${job._id}/edit`}>
							<IconPencil className="size-4" />
							Edit
						</Link>
					</Button>

					<Button variant="outline" asChild className="shrink-0 gap-2">
						<Link href={`/dashboard/jobs/${job._id}/add-applicant`}>
							<IconUpload className="size-4" />
							Import Applications
						</Link>
					</Button>
				</div>
			</div>

			{/* Screening Status Alert / Progress */}
			{isScreeningInProgress && (
				<Alert className="bg-primary/5 border-primary/20">
					<IconSparkles className="text-primary size-4" />
					<AlertTitle>AI Screening in Progress</AlertTitle>
					<AlertDescription className="space-y-4">
						<div className="flex items-center justify-between">
							<p className="text-sm">
								Analyzing {allApplicants.length} candidates. We're currently
								processing chunks of applicants to find your best matches.
							</p>
							<div className="bg-primary/10 text-primary flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-medium">
								<div className="size-1.5 animate-pulse rounded-full bg-current" />
								{formatTime(elapsedSeconds)}
							</div>
						</div>

						<div className="relative h-6 overflow-hidden">
							<AnimatePresence mode="wait">
								<motion.p
									key={messageIndex}
									initial={{ y: 20, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									exit={{ y: -20, opacity: 0 }}
									transition={{ duration: 0.5, ease: 'easeInOut' }}
									className="text-primary absolute inset-0 text-sm font-medium italic"
								>
									{LOADING_MESSAGES[messageIndex]}
								</motion.p>
							</AnimatePresence>
						</div>

						<div className="space-y-1.5">
							<div className="text-muted-foreground flex justify-between text-[10px] font-bold tracking-wider uppercase">
								<span>Progress: {simulatedProgress}%</span>
								<span>Hiring Pipeline Analysis</span>
							</div>
							<Progress value={simulatedProgress} className="h-1.5 shadow-sm" />
						</div>
					</AlertDescription>
				</Alert>
			)}

			{hasApplicants && !isScreened && !isScreeningInProgress && (
				<Alert className="bg-primary/5 border-primary/20">
					<IconSparkles className="text-primary size-4" />
					<AlertTitle>Applicants Ready</AlertTitle>
					<AlertDescription className="flex items-center justify-between">
						<span>
							You have {allApplicants.length} candidates waiting for analysis.
							Run the AI screening to rank them by match score.
						</span>
						<Button
							size="sm"
							onClick={() => triggerScreening({ jobId: job._id })}
							className="ml-4"
						>
							Start Analysis
						</Button>
					</AlertDescription>
				</Alert>
			)}

			{hasApplicants && isScreened && !isScreeningInProgress && (
				<Alert className="bg-primary/5 border-primary/20">
					<IconSparkles className="text-primary size-4" />
					<AlertTitle className="flex justify-between items-center -mt-1">
						<span>Re-evaluate Candidates</span>
						{!reEvaluateMode && (
							<Button size="sm" variant="outline" onClick={() => setReEvaluateMode(true)}>
								Add Review
							</Button>
						)}
					</AlertTitle>
					<AlertDescription className="mt-2">
						{reEvaluateMode ? (
							<div className="space-y-4">
								<p className="text-sm">Provide specific instructions or focus areas for the AI to consider during re-evaluation.</p>
								<div className="bg-background rounded-md">
									<MdxEditor
										markdown={reEvaluateMessage}
										onChange={setReEvaluateMessage}
										placeholder="e.g. Focus on candidates with strong React and Node.js experience, prioritize remote workers..."
									/>
								</div>
								<div className="flex justify-end gap-2">
									<Button size="sm" variant="ghost" onClick={() => setReEvaluateMode(false)}>
										Cancel
									</Button>
									<Button
										size="sm"
										onClick={() => {
											triggerScreening({ jobId: job._id, message: reEvaluateMessage });
											setReEvaluateMode(false);
										}}
									>
										Re-evaluate
									</Button>
								</div>
							</div>
						) : (
							<span>
								Results are already analyzed. You can re-evaluate with a specific focus if needed.
							</span>
						)}
					</AlertDescription>
				</Alert>
			)}

			{/* Empty states */}
			{!hasApplicants && (
				<Card className="border-dashed">
					<CardContent className="space-y-3 py-16 text-center">
						<IconUsers className="text-muted-foreground mx-auto size-10" />
						<p className="font-medium">No candidates yet</p>
						<p className="text-muted-foreground mx-auto max-w-sm text-sm">
							Import applications from our platform or upload CSV/PDF files to
							begin the recruitment process.
						</p>
						<Button size="sm" asChild className="mt-2 gap-2">
							<Link href={`/dashboard/jobs/${job._id}/add-applicant`}>
								<IconUpload className="size-4" /> Add applicants
							</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Ranking / Applicant table */}
			{hasApplicants && (
				<div className="mt-8 space-y-4">
					<div className="flex flex-wrap items-center justify-between gap-4">
						<div>
							<h2 className="font-work-sans flex items-center gap-2 text-base font-medium">
								{isScreened ? 'Ranked Candidates' : 'Applicants'} (
								{isScreened ? filteredRanked.length : filteredUnscreened.length}
								)
							</h2>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<div className="relative">
								<IconSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
								<Input
									placeholder="Search applicants..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="bg-background h-9 w-64 pl-9"
								/>
							</div>
							{isScreened && (
								<>
									<Button
										variant="outline"
										className="h-9 gap-2"
										onClick={() => {
											setTempFilters(filters);
											setFiltersDialogOpen(true);
										}}
									>
										<IconFilter className="size-4" />
										Filters
										{Object.keys(filters).length > 1 && (
											<span className="bg-primary text-primary-foreground ml-1 flex size-5 items-center justify-center rounded-full text-xs">
												{Object.keys(filters).length -
													(filters.limit ? 1 : 0) +
													(filters.limit !== '20' ? 1 : 0)}
											</span>
										)}
									</Button>
									<Button
										variant="outline"
										className="h-9 gap-2"
										onClick={handleDownloadCsv}
										disabled={isDownloading}
									>
										{isDownloading ? (
											<IconLoader2 className="size-4 animate-spin" />
										) : (
											<IconDownload className="size-4" />
										)}
										Download CSV
									</Button>
								</>
							)}
						</div>
					</div>
					<Card>
						{isScreened ? (
							<RankedApplicantsTable
								candidates={paginatedData as any}
								onRowClick={openDrawer}
							/>
						) : (
							<SimpleApplicantsTable
								applicants={paginatedData as any}
								onRowClick={(a) =>
									openDrawer({
										profileSnapshot: a,
										matchScore: 0,
										rank: 0,
										profileSource: a.source,
										candidateId: a._id || '',
										subScores: {
											skills: 0,
											experience: 0,
											education: 0,
											availability: 0
										},
										reasoning: { strengths: [], gaps: [], recommendation: '' }
									} as any)
								}
							/>
						)}

						{totalPages > 1 && (
							<div className="flex items-center justify-between border-t p-4">
								<p className="text-muted-foreground text-sm">
									Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
									{Math.min(currentPage * ITEMS_PER_PAGE, activeData.length)} of{' '}
									{activeData.length} candidates
								</p>
								<Pagination className="mx-0 w-auto">
									<PaginationContent>
										<PaginationItem>
											<PaginationPrevious
												href="#"
												onClick={(e) => {
													e.preventDefault();
													if (currentPage > 1) setCurrentPage((p) => p - 1);
												}}
												className={
													currentPage === 1
														? 'pointer-events-none opacity-50'
														: ''
												}
											/>
										</PaginationItem>

										{Array.from({ length: totalPages }).map((_, i) => {
											const page = i + 1;
											if (
												page === 1 ||
												page === totalPages ||
												(page >= currentPage - 1 && page <= currentPage + 1)
											) {
												return (
													<PaginationItem key={page}>
														<PaginationLink
															href="#"
															onClick={(e) => {
																e.preventDefault();
																setCurrentPage(page);
															}}
															isActive={currentPage === page}
														>
															{page}
														</PaginationLink>
													</PaginationItem>
												);
											} else if (
												page === currentPage - 2 ||
												page === currentPage + 2
											) {
												return (
													<PaginationItem key={page}>
														<PaginationEllipsis />
													</PaginationItem>
												);
											}
											return null;
										})}

										<PaginationItem>
											<PaginationNext
												href="#"
												onClick={(e) => {
													e.preventDefault();
													if (currentPage < totalPages)
														setCurrentPage((p) => p + 1);
												}}
												className={
													currentPage === totalPages
														? 'pointer-events-none opacity-50'
														: ''
												}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							</div>
						)}
					</Card>
				</div>
			)}

			<ApplicantInsightDrawer
				candidate={selectedCandidate}
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
				jobId={params.id}
			/>
			<JobInfoDrawer
				job={job}
				open={jobInfoOpen}
				onOpenChange={setJobInfoOpen}
			/>

			<Dialog open={filtersDialogOpen} onOpenChange={setFiltersDialogOpen}>
				<DialogContent className="sm:max-w-[425px]">
					<DialogHeader>
						<DialogTitle>Filter Candidates</DialogTitle>
						<DialogDescription>
							Refine your ranked candidates list based on specific criteria.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="location" className="text-right">
								Location
							</Label>
							<Select
								value={tempFilters.location || 'any'}
								onValueChange={(val) =>
									setTempFilters({
										...tempFilters,
										location: val === 'any' ? undefined : val
									})
								}
							>
								<SelectTrigger className="col-span-3">
									<SelectValue placeholder="Any Location" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="any">Any Location</SelectItem>
									{job.location?.city && job.location?.country && (
										<SelectItem value={job.location.city.toLowerCase()}>
											{job.location.city}, {job.location.country}
											{job.location.workspaceType
												? ` (${job.location.workspaceType})`
												: ''}
										</SelectItem>
									)}
									<SelectItem value="remote">Remote</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid grid-cols-4 items-start gap-4">
							<Label className="mt-2 text-right">Skills</Label>
							<div className="col-span-3 space-y-3">
								<div className="flex flex-wrap gap-1.5">
									{(tempFilters.skills?.split(',') || [])
										.filter(Boolean)
										.map((skill) => (
											<Badge
												key={skill}
												variant="secondary"
												className="flex items-center gap-1 py-1 pr-1"
											>
												{skill}
												<button
													type="button"
													onClick={() => {
														const newSkills = (
															tempFilters.skills?.split(',') || []
														)
															.filter((s) => s !== skill)
															.join(',');
														setTempFilters({
															...tempFilters,
															skills: newSkills || undefined
														});
													}}
													className="hover:bg-muted rounded-full p-0.5"
												>
													<IconX size={12} />
												</button>
											</Badge>
										))}
								</div>
								<Select
									onValueChange={(val) => {
										const current = tempFilters.skills?.split(',') || [];
										if (!current.includes(val)) {
											setTempFilters({
												...tempFilters,
												skills: [...current, val].filter(Boolean).join(',')
											});
										}
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Add a skill..." />
									</SelectTrigger>
									<SelectContent>
										{(job.requiredSkills || []).map((skill: string) => (
											<SelectItem key={skill} value={skill}>
												<div className="flex w-full items-center justify-between">
													<span>{skill}</span>
													{tempFilters.skills?.split(',').includes(skill) && (
														<IconCheck
															size={14}
															className="text-primary ml-2"
														/>
													)}
												</div>
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-muted-foreground text-[10px] italic">
									Select skills required for this job to filter candidates.
								</p>
							</div>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="limit" className="text-right text-xs">
								Shortlist Size
							</Label>
							<Input
								id="limit"
								type="number"
								min="1"
								value={tempFilters.limit || ''}
								onChange={(e) =>
									setTempFilters({ ...tempFilters, limit: e.target.value })
								}
								className="col-span-3 h-8 text-xs"
							/>
						</div>
					</div>
					<DialogFooter className="gap-2 sm:gap-0">
						<Button
							variant="ghost"
							onClick={() => {
								setTempFilters({ limit: '20' });
							}}
						>
							Clear Filters
						</Button>
						<Button onClick={handleApplyFilters}>Apply Filters</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<FloatingChat jobId={job._id} enabled={isScreened} />
		</div>
	);
}
