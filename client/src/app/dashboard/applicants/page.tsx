'use client';

import { useState, useMemo } from 'react';
import { MOCK_RANKED_CANDIDATES, MOCK_JOBS } from '@/lib/mock-data';
import { type RankedCandidate } from '@/types';
import { ApplicantInsightDrawer } from '@/components/jobs/applicant-insight-drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription
} from '@/components/ui/card';
import { RankedApplicantsTable } from '@/components/jobs/ranked-applicants-table';
import { IconSearch } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const allCandidates = Object.entries(MOCK_RANKED_CANDIDATES).flatMap(
	([jobId, candidates]) => {
		const job = MOCK_JOBS.find((j) => j._id === jobId);
		return candidates.map((c) => ({ ...c, job }));
	}
);

export default function ApplicantsPage() {
	const [search, setSearch] = useState('');
	const [selected, setSelected] = useState<RankedCandidate | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [selectedJobId, setSelectedJobId] = useState<string | undefined>(
		undefined
	);

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return allCandidates.filter((c) => {
			const name =
				`${c.profileSnapshot.firstName} ${c.profileSnapshot.lastName}`.toLowerCase();
			const headline = c.profileSnapshot.headline.toLowerCase();
			const jobTitle = (c.job?.title ?? '').toLowerCase();
			return name.includes(q) || headline.includes(q) || jobTitle.includes(q);
		});
	}, [search]);

	const openDrawer = (candidate: RankedCandidate) => {
		setSelected(candidate);
		setSelectedJobId(
			(candidate as RankedCandidate & { job?: { _id: string } }).job?._id
		);
		setDrawerOpen(true);
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Applicants</h1>
					<p className="text-muted-foreground mt-1">
						All candidates across your jobs. Click any row to see AI insights.
					</p>
				</div>
				<div className="relative">
					<IconSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
					<Input
						placeholder="Search by name, role, or job..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="w-120 pl-9"
					/>
				</div>
			</div>

			<Card>
				<RankedApplicantsTable
					candidates={filtered}
					onRowClick={openDrawer}
					showJob
				/>
			</Card>

			<ApplicantInsightDrawer
				candidate={selected}
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
				jobId={selectedJobId}
			/>
		</div>
	);
}
