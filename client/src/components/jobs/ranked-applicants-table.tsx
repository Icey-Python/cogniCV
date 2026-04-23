'use client';

import { type RankedCandidate } from '@/types';
import { cn } from '@/lib/utils';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import {
	IconMapPin,
	IconBolt,
	IconPaperclip,
	IconChevronRight,
} from '@tabler/icons-react';

export function CircularScoreProgress({ score }: { score: number }) {
	const color =
		score >= 90 ? 'text-emerald-500' : score >= 75 ? 'text-primary' : score >= 60 ? 'text-amber-500' : 'text-red-500';
	
	const radius = 16;
	const circumference = 2 * Math.PI * radius;
	const strokeDashoffset = circumference - (score / 100) * circumference;

	return (
		<div className="relative inline-flex items-center justify-center">
			<svg className="size-10 transform -rotate-90">
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
			<span className={cn("absolute text-xs font-bold", color)}>{score}</span>
		</div>
	);
}

interface RankedApplicantsTableProps {
	candidates: (RankedCandidate & { job?: { title: string } })[];
	onRowClick: (candidate: RankedCandidate) => void;
	showJob?: boolean;
}

export function RankedApplicantsTable({ candidates, onRowClick, showJob = false }: RankedApplicantsTableProps) {
	return (
		<div className="flex flex-col">
			<Table>
				<TableHeader>
					<TableRow>
						{!showJob && <TableHead className="w-16 pl-6">Rank</TableHead>}
						<TableHead className={showJob ? "pl-6" : ""}>Candidate</TableHead>
						{showJob && <TableHead className="hidden md:table-cell">Applied For</TableHead>}
						<TableHead className="hidden md:table-cell">Location</TableHead>
						<TableHead className="hidden sm:table-cell">Source</TableHead>
						<TableHead>Score</TableHead>
						<TableHead className="hidden lg:table-cell">Availability</TableHead>
						<TableHead className="w-10" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{candidates.length === 0 ? (
						<TableRow>
							<TableCell colSpan={showJob ? 7 : 7} className="py-12 text-center text-muted-foreground text-sm">
								No candidates match your search.
							</TableCell>
						</TableRow>
					) : (
						candidates.map((candidate, i) => {
							const p = candidate.profileSnapshot;
							return (
								<TableRow
									key={`${candidate.candidateId}-${i}`}
									className="cursor-pointer group hover:bg-muted/50 transition-colors"
									onClick={() => onRowClick(candidate)}
								>
									{!showJob && (
										<TableCell className="pl-6">
											{candidate.rank === 1 ? (
												<span className="flex items-center gap-1 font-bold text-amber-600">
													1
												</span>
											) : (
												<span className="font-semibold text-muted-foreground">{candidate.rank}</span>
											)}
										</TableCell>
									)}
									<TableCell className={showJob ? "pl-6" : ""}>
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
									{showJob && (
										<TableCell className="hidden md:table-cell text-sm text-muted-foreground">
											{candidate.job?.title || 'Unknown Role'}
										</TableCell>
									)}
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
										<CircularScoreProgress score={candidate.matchScore} />
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
			
			{candidates.length > 0 && (
				<div className="border-t py-2 px-6 flex items-center justify-between">
					<p className="text-sm text-muted-foreground">
						Showing 1-{candidates.length} of {candidates.length} candidates
					</p>
					<Pagination className="w-auto mx-0">
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious href="#" className="pointer-events-none opacity-50" />
							</PaginationItem>
							<PaginationItem>
								<PaginationLink href="#" isActive>
									1
								</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationNext href="#" className="pointer-events-none opacity-50" />
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}
		</div>
	);
}
