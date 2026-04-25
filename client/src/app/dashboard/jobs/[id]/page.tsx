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
import { Card, CardContent } from '@/components/ui/card';
import { RankedApplicantsTable } from '@/components/jobs/ranked-applicants-table';
import { SimpleApplicantsTable } from '@/components/jobs/simple-applicants-table';
import {
	IconSearch,
	IconUsers,
	IconMapPin,
	IconBriefcase,
	IconUpload,
	IconInfoCircle,
	IconPlayerPlay,
	IconLoader2,
	IconSparkles,
	IconPencil
} from '@tabler/icons-react';
import { FloatingChat } from '@/components/chat/floating-chat';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
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

export default function JobDetailPage() {
	const params = useParams<{ id: string }>();
	const { data: jobData, isLoading: jobLoading } = useJobQuery(
		params.id as string
	);
	const { data: applicantsData, isLoading: applicantsLoading } =
		useJobApplicantsQuery(params.id as string);

	const [isPolling, setIsPolling] = useState(false);

	const { data: screeningData, isLoading: screeningLoading } =
		useScreeningResultsQuery(params.id as string, {
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
	const isScreeningInProgress =
		screeningPending || screeningResult?.status === 'pending';

	useEffect(() => {
		setIsPolling(isScreeningInProgress);
	}, [isScreeningInProgress]);

	const [search, setSearch] = useState('');
	const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [jobInfoOpen, setJobInfoOpen] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);

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

	const activeData =
		rankedCandidates.length > 0 ? filteredRanked : filteredUnscreened;
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
	const isScreened = rankedCandidates.length > 0;

	const progress = screeningResult?.totalCandidates
		? Math.round(
				(rankedCandidates.length / screeningResult.totalCandidates) * 100
			)
		: 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start gap-4">
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
					<AlertDescription className="space-y-3">
						<p>
							Analyzing {allApplicants.length} candidates. We're currently
							processing chunks of applicants to find your best matches.
						</p>
						<div className="space-y-1">
							<div className="flex justify-between text-xs font-medium">
								<span>Progress: {progress}%</span>
								<span>
									{rankedCandidates.length} of{' '}
									{screeningResult?.totalCandidates || allApplicants.length}{' '}
									analyzed
								</span>
							</div>
							<Progress value={progress} className="h-2" />
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
							onClick={() => triggerScreening(job._id)}
							className="ml-4"
						>
							Start Analysis
						</Button>
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
							<h2 className="font-work-sans flex items-center gap-2 text-base font-semibold">
								{isScreened ? 'Ranked Candidates' : 'Applicants'} (
								{isScreened ? filteredRanked.length : filteredUnscreened.length}
								)
							</h2>
						</div>
						<div className="relative">
							<IconSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
							<Input
								placeholder="Search applicants..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="bg-background h-9 w-120 pl-9"
							/>
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
			<FloatingChat jobId={job._id} enabled={isScreened} />
		</div>
	);
}
