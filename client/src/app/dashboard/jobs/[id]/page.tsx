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
import { RankedApplicantsTable } from '@/components/jobs/ranked-applicants-table';
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
					<Button variant="outline" asChild className="gap-2 shrink-0">
						<Link href={`/dashboard/jobs/${job._id}/upload`}>
							<IconUpload className="size-4" /> Import Applications
						</Link>
					</Button>
				)}
			</div>



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
						<Button size="sm" asChild className="mt-2 gap-2">
							<Link href={`/dashboard/jobs/${job._id}/upload`}>
								<IconUpload className="size-4" /> Import Applications
							</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Ranking table */}
			{hasApplicants && (
				<div className="space-y-4">
					<div className="flex items-center justify-between gap-4 flex-wrap">
						<div>
							<h2 className="text-base font-work-sans font-semibold flex items-center gap-2">
								Top 20 applicants
							</h2>
						</div>
						<div className="relative">
							<IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Search applicants..."
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className="pl-9 h-9 w-120 bg-background"
							/>
						</div>
					</div>
					<Card>
						<RankedApplicantsTable candidates={filtered} onRowClick={openDrawer} />
					</Card>
				</div>
			)}

			<ApplicantInsightDrawer
				candidate={selectedCandidate}
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
			/>
		</div>
	);
}
