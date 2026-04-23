'use client';

import { useState, useMemo } from 'react';
import { MOCK_RANKED_CANDIDATES, MOCK_JOBS } from '@/lib/mock-data';
import { type RankedCandidate } from '@/types';
import { ApplicantInsightDrawer } from '@/components/jobs/applicant-insight-drawer';
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
import { IconSearch, IconMapPin, IconChevronRight, IconBolt, IconPaperclip } from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const allCandidates = Object.entries(MOCK_RANKED_CANDIDATES).flatMap(([jobId, candidates]) => {
	const job = MOCK_JOBS.find((j) => j._id === jobId);
	return candidates.map((c) => ({ ...c, job }));
});

export default function ApplicantsPage() {
	const [search, setSearch] = useState('');
	const [selected, setSelected] = useState<RankedCandidate | null>(null);
	const [drawerOpen, setDrawerOpen] = useState(false);

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		return allCandidates.filter((c) => {
			const name = `${c.profileSnapshot.firstName} ${c.profileSnapshot.lastName}`.toLowerCase();
			const headline = c.profileSnapshot.headline.toLowerCase();
			const jobTitle = (c.job?.title ?? '').toLowerCase();
			return name.includes(q) || headline.includes(q) || jobTitle.includes(q);
		});
	}, [search]);

	const openDrawer = (candidate: RankedCandidate) => {
		setSelected(candidate);
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
					<IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
					<Input
						placeholder="Search by name, role, or job..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="pl-9 w-72"
					/>
				</div>
			</div>

			<Card>
				<CardHeader className="pb-3">
					<CardTitle className="text-base">
						All Candidates
						<span className="ml-2 text-sm font-normal text-muted-foreground">({filtered.length})</span>
					</CardTitle>
					<CardDescription>Click any row to view full AI reasoning.</CardDescription>
				</CardHeader>
				<CardContent className="p-0">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead className="pl-6">Candidate</TableHead>
								<TableHead className="hidden md:table-cell">Applied For</TableHead>
								<TableHead className="hidden sm:table-cell">Source</TableHead>
								<TableHead>AI Score</TableHead>
								<TableHead className="hidden lg:table-cell">Location</TableHead>
								<TableHead className="hidden lg:table-cell">Availability</TableHead>
								<TableHead className="w-10" />
							</TableRow>
						</TableHeader>
						<TableBody>
							{filtered.length === 0 ? (
								<TableRow>
									<TableCell colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
										No candidates found.
									</TableCell>
								</TableRow>
							) : (
								filtered.map((candidate, i) => {
									const p = candidate.profileSnapshot;
									return (
										<TableRow
											key={`${candidate.candidateId}-${i}`}
											className="cursor-pointer group hover:bg-muted/50 transition-colors"
											onClick={() => openDrawer(candidate)}
										>
											<TableCell className="pl-6">
												<div className="flex items-center gap-3">
													<div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
														{p.firstName[0]}{p.lastName[0]}
													</div>
													<div className="min-w-0">
														<p className="text-sm font-medium">{p.firstName} {p.lastName}</p>
														<p className="text-xs text-muted-foreground truncate max-w-[200px]">{p.headline}</p>
													</div>
												</div>
											</TableCell>
											<TableCell className="hidden md:table-cell">
												<p className="text-sm truncate max-w-[180px]">{candidate.job?.title ?? '-'}</p>
												<p className="text-xs text-muted-foreground">{candidate.job?.department}</p>
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
												<span className={cn(
													'text-sm font-bold tabular-nums',
													candidate.matchScore >= 90 ? 'text-emerald-600' :
													candidate.matchScore >= 75 ? 'text-primary' :
													candidate.matchScore >= 60 ? 'text-amber-600' : 'text-red-500'
												)}>
													{candidate.matchScore}
												</span>
											</TableCell>
											<TableCell className="hidden lg:table-cell">
												<span className="flex items-center gap-1 text-sm text-muted-foreground">
													<IconMapPin className="size-3.5" /> {p.location}
												</span>
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

			<ApplicantInsightDrawer
				candidate={selected}
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
			/>
		</div>
	);
}
