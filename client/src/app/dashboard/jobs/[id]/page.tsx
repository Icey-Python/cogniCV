'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { MOCK_JOBS, MOCK_RANKED_CANDIDATES } from '@/lib/mock-data';
import { type RankedCandidate } from '@/types';
import { ApplicantInsightDrawer } from '@/components/jobs/applicant-insight-drawer';
import { UploadPanel } from '@/components/jobs/upload-panel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	IconSearch,
	IconTrophy,
	IconUsers,
	IconMapPin,
	IconBriefcase,
	IconUpload,
	IconChevronRight,
	IconBolt,
	IconPaperclip,
} from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

function ScoreCell({ score }: { score: number }) {
	const color =
		score >= 90 ? 'text-emerald-600' : score >= 75 ? 'text-primary' : score >= 60 ? 'text-amber-600' : 'text-red-500';
	return <span className={cn('text-sm font-bold tabular-nums', color)}>{score}</span>;
}

function ScoreBar({ score }: { score: number }) {
	const color =
		score >= 90 ? 'bg-emerald-500' : score >= 75 ? 'bg-primary' : score >= 60 ? 'bg-amber-500' : 'bg-red-500';
	return (
		<div className="h-1.5 w-20 rounded-full bg-muted overflow-hidden">
			<div className={cn('h-full rounded-full', color)} style={{ width: `${score}%` }} />
		</div>
	);
}

export default function JobDetailPage() {
	const params = useParams<{ id: string }>();
	const job = MOCK_JOBS.find((j) => j._id === params.id);
	const candidates = MOCK_RANKED_CANDIDATES[params.id] ?? [];

	const [search, setSearch] = useState('');
	const [selectedCandidate, setSelectedCandidate] = useState<RankedCandidate | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [showUpload, setShowUpload] = useState(false);
	const [uploadComplete, setUploadComplete] = useState(false);

	const filtered = useMemo(
		() =>
			candidates.filter((c) => {
				const name = `${c.profileSnapshot.firstName} ${c.profileSnapshot.lastName}`.toLowerCase();
				const role = c.profileSnapshot.headline.toLowerCase();
				return name.includes(search.toLowerCase()) || role.includes(search.toLowerCase());
			}),
		[candidates, search]
	);

	const openDrawer = (candidate: RankedCandidate) => {
		setSelectedCandidate(candidate);
		setDrawerOpen(true);
	};

	if (!job) {
		return (
			<div className="text-center py-20">
				<p className="text-muted-foreground">Job not found.</p>
				<Button variant="outline" asChild className="mt-4">
					<Link href="/dashboard/jobs">Back to Jobs</Link>
				</Button>
			</div>
		);
	}

	const hasApplicants = uploadComplete || candidates.length > 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-start gap-4">
				<div className="flex-1 min-w-0">
					<h1 className="text-2xl font-semibold">{job.title}</h1>
					<div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
						<span className="flex items-center gap-1"><IconBriefcase className="size-4" /> {job.department}</span>
						<span className="flex items-center gap-1"><IconMapPin className="size-4" /> {job.location}</span>
						<span className="flex items-center gap-1"><IconUsers className="size-4" /> {job.applicantCount} applicants</span>
					</div>
				</div>
				{job.jobType === 'external' && !showUpload && !uploadComplete && (
					<Button variant="outline" onClick={() => setShowUpload(true)} className="gap-2 shrink-0">
						<IconUpload className="size-4" /> Upload Applicants
					</Button>
				)}
			</div>

			{/* Upload panel (external only) */}
			{job.jobType === 'external' && showUpload && !uploadComplete && (
				<Card>
					<CardHeader>
						<CardTitle className="text-base flex items-center gap-2">
							<IconUpload className="size-4" /> Upload Applicants
						</CardTitle>
						<CardDescription>
							Upload PDF resumes or a CSV. The AI will extract, normalise, and rank all candidates.
						</CardDescription>
					</CardHeader>
					<CardContent>
						<UploadPanel onComplete={() => { setUploadComplete(true); setShowUpload(false); }} />
					</CardContent>
				</Card>
			)}

			{/* Empty states */}
			{!hasApplicants && job.jobType === 'internal' && (
				<Card className="border-dashed">
					<CardContent className="py-16 text-center space-y-3">
						<IconUsers className="size-10 text-muted-foreground mx-auto" />
						<p className="font-medium">No candidates screened yet</p>
						<p className="text-sm text-muted-foreground max-w-sm mx-auto">
							Platform talent profiles matching this role will appear here after AI screening runs.
						</p>
						<Button size="sm" className="mt-2">Run AI Screening</Button>
					</CardContent>
				</Card>
			)}

			{!hasApplicants && job.jobType === 'external' && !showUpload && (
				<Card className="border-dashed">
					<CardContent className="py-16 text-center space-y-3">
						<IconUpload className="size-10 text-muted-foreground mx-auto" />
						<p className="font-medium">No applicants uploaded yet</p>
						<p className="text-sm text-muted-foreground max-w-sm mx-auto">
							Upload PDF resumes or a CSV to begin the AI screening and ranking process.
						</p>
						<Button size="sm" onClick={() => setShowUpload(true)} className="mt-2 gap-2">
							<IconUpload className="size-4" /> Upload Applicants
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Ranking table */}
			{hasApplicants && (
				<Card>
					<CardHeader className="pb-4">
						<div className="flex items-center justify-between gap-4 flex-wrap">
							<div>
								<CardTitle className="text-base flex items-center gap-2">
									<IconTrophy className="size-4 text-primary" />
									AI Ranked Applicants
								</CardTitle>
								<CardDescription className="mt-0.5">
									{filtered.length} candidates ranked. Click any row to view AI reasoning.
								</CardDescription>
							</div>
							<div className="relative">
								<IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
								<Input
									placeholder="Search applicants..."
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									className="pl-9 h-9 w-60"
								/>
							</div>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-16 pl-6">Rank</TableHead>
									<TableHead>Candidate</TableHead>
									<TableHead className="hidden md:table-cell">Location</TableHead>
									<TableHead className="hidden sm:table-cell">Source</TableHead>
									<TableHead>Score</TableHead>
									<TableHead className="hidden lg:table-cell">Availability</TableHead>
									<TableHead className="w-10" />
								</TableRow>
							</TableHeader>
							<TableBody>
								{filtered.length === 0 ? (
									<TableRow>
										<TableCell colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
											No candidates match your search.
										</TableCell>
									</TableRow>
								) : (
									filtered.map((candidate) => {
										const p = candidate.profileSnapshot;
										return (
											<TableRow
												key={candidate.candidateId}
												className="cursor-pointer group hover:bg-muted/50 transition-colors"
												onClick={() => openDrawer(candidate)}
											>
												<TableCell className="pl-6">
													{candidate.rank === 1 ? (
														<span className="flex items-center gap-1 font-bold text-amber-600">
															<IconTrophy className="size-4" /> 1
														</span>
													) : (
														<span className="font-semibold text-muted-foreground">{candidate.rank}</span>
													)}
												</TableCell>
												<TableCell>
													<div className="flex items-center gap-3">
														<div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
															{p.firstName[0]}{p.lastName[0]}
														</div>
														<div className="min-w-0">
															<p className="text-sm font-medium">{p.firstName} {p.lastName}</p>
															<p className="text-xs text-muted-foreground truncate max-w-[200px]">{p.headline}</p>
														</div>
													</div>
												</TableCell>
												<TableCell className="hidden md:table-cell">
													<span className="flex items-center gap-1 text-sm text-muted-foreground">
														<IconMapPin className="size-3.5" /> {p.location}
													</span>
												</TableCell>
												<TableCell className="hidden sm:table-cell">
													<span className="flex items-center gap-1 text-xs text-muted-foreground">
														{candidate.profileSource === 'platform' ? (
															<><IconBolt className="size-3.5 text-primary" /> Platform</>
														) : (
															<><IconPaperclip className="size-3.5" /> External</>
														)}
													</span>
												</TableCell>
												<TableCell>
													<div className="space-y-1">
														<ScoreCell score={candidate.matchScore} />
														<ScoreBar score={candidate.matchScore} />
													</div>
												</TableCell>
												<TableCell className="hidden lg:table-cell">
													<span className={cn(
														'text-xs',
														p.availability.status === 'Available' ? 'text-emerald-600' : 'text-muted-foreground'
													)}>
														{p.availability.status}
													</span>
												</TableCell>
												<TableCell>
													<IconChevronRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
												</TableCell>
											</TableRow>
										);
									})
								)}
							</TableBody>
						</Table>
					</CardContent>
				</Card>
			)}

			<ApplicantInsightDrawer
				candidate={selectedCandidate}
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
			/>
		</div>
	);
}
