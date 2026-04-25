'use client';

import { type RankedCandidate } from '@/types';
import { cn } from '@/lib/utils';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/components/ui/table';
import {
	IconMapPin,
	IconBolt,
	IconPaperclip,
	IconChevronRight
} from '@tabler/icons-react';

export function CircularScoreProgress({
	score,
	max = 100
}: {
	score: number;
	max?: number;
}) {
	const percentage = (score / max) * 100;
	const color =
		percentage >= 90
			? 'text-emerald-500'
			: percentage >= 75
				? 'text-primary'
				: percentage >= 60
					? 'text-amber-500'
					: 'text-red-500';

	const radius = 16;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (percentage / 100) * circumference;

	return (
		<div className="relative inline-flex items-center justify-center">
			<svg className="size-10 -rotate-90 transform">
				<circle
					className="text-muted/30"
					strokeWidth="3.5"
					stroke="currentColor"
					fill="transparent"
					r={radius}
					cx="20"
					cy="20"
				/>
				<circle
					className={color}
					strokeWidth="3.5"
					strokeDasharray={circumference}
					strokeDashoffset={strokeDashoffset}
					strokeLinecap="round"
					stroke="currentColor"
					fill="transparent"
					r={radius}
					cx="20"
					cy="20"
				/>
			</svg>
			<span className={cn('absolute text-[10px] font-bold', color)}>
				{score}
			</span>
		</div>
	);
}

interface RankedApplicantsTableProps {
	candidates: (RankedCandidate & { job?: { title: string } })[];
	onRowClick: (candidate: RankedCandidate) => void;
	showJob?: boolean;
}

export function RankedApplicantsTable({
	candidates,
	onRowClick,
	showJob = false
}: RankedApplicantsTableProps) {
	return (
		<div className="flex flex-col">
			<Table>
				<TableHeader>
					<TableRow>
						{!showJob && <TableHead className="w-16 pl-6">Rank</TableHead>}
						<TableHead className={showJob ? 'pl-6' : ''}>Candidate</TableHead>
						{showJob && (
							<TableHead className="hidden md:table-cell">
								Applied For
							</TableHead>
						)}
						<TableHead className="hidden md:table-cell">Location</TableHead>
						<TableHead className="hidden sm:table-cell">Source</TableHead>
						<TableHead>Score</TableHead>
						<TableHead className="hidden lg:table-cell">Relevance</TableHead>
						<TableHead className="w-10" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{candidates.length === 0 ? (
						<TableRow>
							<TableCell
								colSpan={showJob ? 7 : 7}
								className="text-muted-foreground py-12 text-center text-sm"
							>
								No candidates match your search.
							</TableCell>
						</TableRow>
					) : (
						candidates.map((candidate, i) => {
							const p = candidate.profileSnapshot;
							return (
								<TableRow
									key={`${candidate.candidateId}-${i}`}
									className="group hover:bg-muted/50 cursor-pointer transition-colors"
									onClick={() => onRowClick(candidate)}
								>
									{!showJob && (
										<TableCell className="pl-6">
											{candidate.rank === 1 ? (
												<span className="flex items-center gap-1 font-bold text-amber-600">
													1
												</span>
											) : (
												<span className="text-muted-foreground font-semibold">
													{candidate.rank}
												</span>
											)}
										</TableCell>
									)}
									<TableCell className={showJob ? 'pl-6' : ''}>
										<div className="flex items-center gap-3">
											<div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold">
												{p.firstName?.[0]}
												{p.lastName?.[0]}
											</div>
											<div className="min-w-0">
												<p className="text-sm font-medium">
													{p.firstName} {p.lastName}
												</p>
												<p className="text-muted-foreground max-w-[200px] truncate text-xs">
													{p.headline}
												</p>
											</div>
										</div>
									</TableCell>
									{showJob && (
										<TableCell className="text-muted-foreground hidden text-sm md:table-cell">
											{candidate.job?.title || 'Unknown Role'}
										</TableCell>
									)}
									<TableCell className="hidden md:table-cell">
										<span className="text-muted-foreground flex items-center gap-1 text-sm">
											<IconMapPin className="size-3.5" /> {p.location}
										</span>
									</TableCell>
									<TableCell className="hidden sm:table-cell">
										<span className="text-muted-foreground flex items-center gap-1 text-xs">
											{candidate.profileSource === 'platform' ||
											candidate.profileSource === 'internal' ? (
												<>
													<IconBolt className="text-primary size-3.5" />{' '}
													Platform
												</>
											) : (
												<>
													<IconPaperclip className="size-3.5" /> External
												</>
											)}
										</span>
									</TableCell>
									<TableCell>
										<CircularScoreProgress score={candidate.matchScore} />
									</TableCell>
									<TableCell className="hidden lg:table-cell">
										<CircularScoreProgress 
											score={candidate.subScores?.relevance ?? 0} 
											max={20} 
										/>
									</TableCell>
									<TableCell>
										<IconChevronRight className="text-muted-foreground size-4 transition-opacity" />
									</TableCell>
								</TableRow>
							);
						})
					)}
				</TableBody>
			</Table>
		</div>
	);
}
