'use client';

import { formatDistanceToNow } from 'date-fns';
import {
	BriefcaseBusiness,
	Building2,
	CheckCircle2,
	FileUp,
	MapPin,
	Search,
	Sparkles,
	X
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { mockJobs } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { EmploymentType, ExperienceLevel, JobListing, UploadDocumentState } from '@/types/jobs';

type ApplyState = 'idle' | 'submitting' | 'complete';

type BadgeVariant =
	| 'default'
	| 'secondary'
	| 'outline'
	| 'accent'
	| 'destructive';

const employmentFilters: Array<'All' | EmploymentType> = [
	'All',
	'Full-time',
	'Part-time',
	'Contract'
];

const experienceLevels: Array<'All' | ExperienceLevel> = [
	'All',
	'Entry',
	'Junior',
	'Mid',
	'Senior',
	'Lead'
];

function createInitialDocuments(): UploadDocumentState[] {
	return [
		{ kind: 'Resume', fileName: null, required: true },
		{ kind: 'Cover Letter', fileName: null, required: false },
		{ kind: 'Portfolio', fileName: null, required: false }
	];
}

function getStatusVariant(status: JobListing['status']): BadgeVariant {
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

function getDocumentVariant(fileName: string | null): BadgeVariant {
	return fileName ? 'default' : 'outline';
}

export function JobBoard() {
	const [searchValue, setSearchValue] = useState('');
	const [typeFilter, setTypeFilter] = useState<'All' | EmploymentType>('All');
	const [locationFilter, setLocationFilter] = useState<string>('All');
	const [experienceFilter, setExperienceFilter] = useState<'All' | ExperienceLevel>('All');
	const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
	const [isApplyOpen, setIsApplyOpen] = useState(false);
	const [applyState, setApplyState] = useState<ApplyState>('idle');
	const [coverMessage, setCoverMessage] = useState('');
	const [documents, setDocuments] = useState<UploadDocumentState[]>(
		createInitialDocuments
	);

	const submitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		return () => {
			if (submitTimeoutRef.current) {
				clearTimeout(submitTimeoutRef.current);
			}
		};
	}, []);

	const locationFilters = useMemo(() => {
		const uniqueLocations = new Set(mockJobs.map((job) => job.location));
		return ['All', ...Array.from(uniqueLocations)];
	}, []);

	const filteredJobs = useMemo(() => {
		const query = searchValue.trim().toLowerCase();

		return mockJobs.filter((job) => {
			const queryMatch =
				query.length === 0 ||
				job.title.toLowerCase().includes(query) ||
				job.company.toLowerCase().includes(query) ||
				job.requiredSkills.some((skill) => skill.toLowerCase().includes(query));

			const typeMatch = typeFilter === 'All' || job.type === typeFilter;
			const locationMatch =
				locationFilter === 'All' || job.location === locationFilter;
			const experienceMatch = 
				experienceFilter === 'All' || job.experienceLevel === experienceFilter;

			return queryMatch && typeMatch && locationMatch && experienceMatch;
		});
	}, [locationFilter, searchValue, typeFilter, experienceFilter]);

	const selectedJob = useMemo(
		() => mockJobs.find((job) => job.id === selectedJobId),
		[selectedJobId]
	);

	const openApplyModal = () => {
		setDocuments(createInitialDocuments());
		setCoverMessage('');
		setApplyState('idle');
		setIsApplyOpen(true);
	};

	const closeApplyModal = () => {
		if (submitTimeoutRef.current) {
			clearTimeout(submitTimeoutRef.current);
		}
		setIsApplyOpen(false);
		setApplyState('idle');
	};

	const onUpload = (kind: UploadDocumentState['kind']) => {
		return (event: React.ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0];

			setDocuments((current) =>
				current.map((entry) =>
					entry.kind === kind
						? { ...entry, fileName: file?.name ?? null }
						: entry
				)
			);
		};
	};

	const submitApplication = () => {
		const resume = documents.find((entry) => entry.kind === 'Resume');

		if (!resume?.fileName || !selectedJob) {
			return;
		}

		setApplyState('submitting');
		submitTimeoutRef.current = setTimeout(() => {
			setApplyState('complete');
		}, 1800);
	};

	const resumeUploaded = documents.some(
		(entry) => entry.kind === 'Resume' && entry.fileName
	);

	return (
		<div className="relative min-h-screen overflow-hidden bg-background pb-20">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
				<div className="absolute right-0 top-32 h-72 w-72 rounded-full bg-accent/70 blur-3xl" />
			</div>

			<main className="relative mx-auto max-w-7xl px-4 pt-8 md:px-8">
				<section className="animate-rise-in overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm md:p-8">
					<div className="grid gap-6 md:grid-cols-[1.5fr_1fr] md:items-end">
						<div>
							<p className="mb-3 inline-flex items-center gap-2 text-sm text-muted-foreground">
								<Sparkles className="size-4 text-primary" />
								Curated roles for AI talent products
							</p>
							<h1 className="font-serif text-3xl text-foreground md:text-4xl">
								Find your next high-impact role
							</h1>
							<p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
								Browse jobs, inspect exact skill expectations, and apply with
								your documents for instant AI-powered screening.
							</p>
						</div>

						<div className="grid grid-cols-2 gap-3">
							<div className="rounded-2xl border border-border/70 bg-background/80 p-4">
								<p className="text-xs uppercase tracking-wide text-muted-foreground">
									Open roles
								</p>
								<p className="mt-2 text-2xl font-semibold text-foreground">
									{mockJobs.filter((job) => job.status === 'Open').length}
								</p>
							</div>
							<div className="rounded-2xl border border-border/70 bg-background/80 p-4">
								<p className="text-xs uppercase tracking-wide text-muted-foreground">
									Total applicants
								</p>
								<p className="mt-2 text-2xl font-semibold text-foreground">
									{mockJobs.reduce((sum, role) => sum + role.applicants, 0)}
								</p>
							</div>
						</div>
					</div>
				</section>

				<section className="mt-6 rounded-3xl border border-border/70 bg-card/85 p-4 shadow-sm md:p-5">
					<div className="grid gap-4 lg:grid-cols-[1fr_2fr]">
						<div className="relative col-span-full lg:col-span-1">
							<Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
							<Input
								value={searchValue}
								onChange={(event) => setSearchValue(event.target.value)}
								placeholder="Search by role, company, or skill"
								className="pl-9"
							/>
						</div>

						<div className="col-span-full lg:col-span-1 flex flex-col gap-3">
							<div className="flex flex-wrap gap-2">
								{employmentFilters.map((filter) => (
									<Button
										key={filter}
										type="button"
										variant={typeFilter === filter ? 'default' : 'outline'}
										size="sm"
										onClick={() => setTypeFilter(filter)}
									>
										{filter}
									</Button>
								))}
							</div>

							<div className="flex flex-wrap gap-2">
								{experienceLevels.map((level) => (
									<Button
										key={level}
										type="button"
										variant={experienceFilter === level ? 'default' : 'outline'}
										size="sm"
										onClick={() => setExperienceFilter(level)}
									>
										{level === 'All' ? 'Experience: All' : level}
									</Button>
								))}
							</div>

							<div className="flex flex-wrap gap-2">
								{locationFilters.map((location) => (
									<Button
										key={location}
										type="button"
										variant={locationFilter === location ? 'secondary' : 'outline'}
										size="sm"
										onClick={() => setLocationFilter(location)}
									>
										{location === 'All' ? 'All locations' : location}
									</Button>
								))}
							</div>
						</div>
					</div>
				</section>

				<section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{filteredJobs.map((job, index) => (
						<button
							type="button"
							key={job.id}
							onClick={() => setSelectedJobId(job.id)}
							className={cn(
								'animate-rise-in rounded-2xl border p-5 text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md',
								selectedJobId === job.id
									? 'border-primary/50 bg-primary/5'
									: 'border-border/70 bg-card/90'
							)}
							style={{ animationDelay: `${index * 60}ms` }}
						>
							<div className="flex items-start justify-between gap-3">
								<div>
									<h3 className="text-base font-semibold text-foreground md:text-lg">
										{job.title}
									</h3>
									<p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
										<Building2 className="size-4" />
										{job.company}
									</p>
								</div>
								<Badge variant={getStatusVariant(job.status)}>{job.status}</Badge>
							</div>

							<p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
								{job.summary}
							</p>

							<div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
								<span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
									<MapPin className="size-3.5" />
									{job.location}
								</span>
								<span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
									<BriefcaseBusiness className="size-3.5" />
									{job.type}
								</span>
							</div>

							<div className="mt-5 flex items-center justify-between text-xs">
								<p className="text-muted-foreground">
									{job.applicants} applicants
								</p>
								<p className="font-medium text-primary">
									Posted{' '}
									{formatDistanceToNow(new Date(job.postedAt), {
										addSuffix: true
									})}
								</p>
							</div>
						</button>
					))}
				</section>

				{filteredJobs.length === 0 && (
					<div className="mt-8 rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
						No jobs match your current filters. Try a broader search.
					</div>
				)}
			</main>

			<div
				className={cn(
					'fixed inset-0 z-40 bg-secondary/40 backdrop-blur-[2px] transition-opacity',
					selectedJob ? 'opacity-100' : 'pointer-events-none opacity-0'
				)}
				onClick={() => setSelectedJobId(null)}
			/>

			<aside
				className={cn(
					'fixed right-0 top-0 z-50 h-dvh w-full max-w-2xl overflow-y-auto border-l border-border bg-popover p-5 shadow-2xl transition-transform duration-300 md:p-7',
					selectedJob ? 'translate-x-0' : 'translate-x-full'
				)}
			>
				{selectedJob && (
					<div className="animate-pop-in">
						<div className="mb-6 flex items-start justify-between gap-3">
							<div>
								<p className="text-xs uppercase tracking-wide text-muted-foreground">
									Job details
								</p>
								<h2 className="mt-2 font-serif text-2xl text-foreground md:text-3xl">
									{selectedJob.title}
								</h2>
								<p className="mt-2 text-sm text-muted-foreground">
									{selectedJob.company}
								</p>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={() => setSelectedJobId(null)}
							>
								<X className="size-4" />
							</Button>
						</div>

						<div className="grid gap-3 rounded-2xl border border-border/70 bg-card/80 p-4 text-sm">
							<p className="inline-flex items-center gap-2 text-muted-foreground">
								<MapPin className="size-4" />
								{selectedJob.location}
							</p>
							<p className="inline-flex items-center gap-2 text-muted-foreground">
								<BriefcaseBusiness className="size-4" />
								{selectedJob.type} · {selectedJob.experienceLevel}
							</p>
							<p className="text-muted-foreground">
								Compensation range: {selectedJob.salaryRange}
							</p>
						</div>

						<section className="mt-6">
							<h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
								Role summary
							</h3>
							<p className="leading-7 text-foreground/90">
								{selectedJob.description}
							</p>
						</section>

						<section className="mt-6">
							<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
								Required skills
							</h3>
							<div className="flex flex-wrap gap-2">
								{selectedJob.requiredSkills.map((skill) => (
									<Badge key={skill} variant="default">
										{skill}
									</Badge>
								))}
							</div>
						</section>

						<section className="mt-6">
							<h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
								Bonus signals
							</h3>
							<div className="flex flex-wrap gap-2">
								{selectedJob.niceToHave.map((skill) => (
									<Badge key={skill} variant="outline">
										{skill}
									</Badge>
								))}
							</div>
						</section>

						<div className="mt-8 rounded-2xl border border-primary/30 bg-primary/5 p-4">
							<p className="text-sm text-muted-foreground">
								Upload your documents and get analyzed against this job before
								recruiter review.
							</p>
							<Button className="mt-4 w-full" onClick={openApplyModal}>
								<FileUp className="size-4" />
								Apply and upload docs
							</Button>
						</div>
					</div>
				)}
			</aside>

			{isApplyOpen && selectedJob && (
				<div className="fixed inset-0 z-[60] flex items-center justify-center bg-secondary/50 p-4 backdrop-blur-[2px]">
					<div className="animate-pop-in w-full max-w-2xl rounded-3xl border border-border bg-popover p-5 shadow-2xl md:p-7">
						<div className="mb-6 flex items-start justify-between gap-3">
							<div>
								<p className="text-xs uppercase tracking-wide text-muted-foreground">
									Application flow
								</p>
								<h3 className="mt-2 font-serif text-2xl text-foreground">
									Apply for {selectedJob.title}
								</h3>
							</div>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								onClick={closeApplyModal}
							>
								<X className="size-4" />
							</Button>
						</div>

						<div className="space-y-3">
							{documents.map((doc) => (
								<div
									key={doc.kind}
									className="rounded-2xl border border-border/70 bg-card/80 p-4"
								>
									<div className="mb-3 flex items-center justify-between gap-2">
										<p className="text-sm font-medium text-foreground">
											{doc.kind}
											{doc.required ? ' *' : ''}
										</p>
										<Badge variant={getDocumentVariant(doc.fileName)}>
											{doc.fileName ? 'Uploaded' : 'Missing'}
										</Badge>
									</div>
									<Input
										type="file"
										onChange={onUpload(doc.kind)}
										accept=".pdf,.doc,.docx"
									/>
									{doc.fileName && (
										<p className="mt-2 text-xs text-muted-foreground">
											{doc.fileName}
										</p>
									)}
								</div>
							))}
						</div>

						<div className="mt-4">
							<p className="mb-2 text-sm font-medium text-foreground">
								Message to recruiter
							</p>
							<Textarea
								value={coverMessage}
								onChange={(event) => setCoverMessage(event.target.value)}
								placeholder="Share the context behind your strongest projects and fit for this role."
							/>
						</div>

						{applyState === 'submitting' && (
							<div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
								<p className="font-medium">Analyzing uploaded documents...</p>
								<p className="mt-1 text-muted-foreground">
									Scoring skills, experience, and availability against this job.
								</p>
								<div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
									<div className="h-full w-2/3 animate-pulse rounded-full bg-primary" />
								</div>
							</div>
						)}

						{applyState === 'complete' && (
							<div className="mt-4 rounded-2xl border border-primary/30 bg-primary/10 p-4">
								<p className="inline-flex items-center gap-2 font-medium text-foreground">
									<CheckCircle2 className="size-4 text-primary" />
									Application submitted
								</p>
								<p className="mt-2 text-sm text-muted-foreground">
									Your profile is now in the screening queue. Recruiters will see
									your match score and reasoning insights.
								</p>
							</div>
						)}

						<div className="mt-6 flex flex-wrap items-center justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={closeApplyModal}
							>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={submitApplication}
								disabled={!resumeUploaded || applyState === 'submitting'}
							>
								{applyState === 'complete'
									? 'Submitted'
									: 'Submit for analysis'}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
