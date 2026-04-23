import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { CandidateProfile } from '@/types/jobs';
import { IconFilter, IconSearch } from '@tabler/icons-react';

type SortMode = 'score-desc' | 'score-asc' | 'name';
type BadgeVariant = 'default' | 'secondary' | 'outline' | 'accent' | 'destructive';

function getAvailabilityVariant(availability: CandidateProfile['availability']): BadgeVariant {
	switch (availability) {
		case 'Available': return 'default';
		case 'Open to opportunities': return 'accent';
		case 'Not available': return 'secondary';
		default: return 'outline';
	}
}

function getScoreTone(score: number): string {
	if (score >= 90) return 'text-primary';
	if (score >= 80) return 'text-foreground';
	return 'text-muted-foreground';
}

export function JobDetailView({
	filteredCandidates,
	query,
	setQuery,
	sortMode,
	setSortMode,
	setDrawerCandidate,
	setSelectedJobId
}: {
	filteredCandidates: CandidateProfile[];
	query: string;
	setQuery: (q: string) => void;
	sortMode: SortMode;
	setSortMode: (m: SortMode) => void;
	setDrawerCandidate: (c: CandidateProfile) => void;
	setSelectedJobId: (id: string | null) => void;
}) {
	return (
		<div className="animate-rise-in space-y-6">
			<div className="flex items-center gap-4 border-b border-border/50 pb-4">
				<Button variant="ghost" onClick={() => setSelectedJobId(null)} className="text-muted-foreground">
					&larr; Back to Jobs
				</Button>
			</div>

			{/* Table Toolbar */}
			<div className="flex flex-wrap gap-4 items-center justify-between bg-card/40 border border-border/60 p-4 rounded-xl">
				<div className="relative w-full max-w-sm">
					<IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search candidates..."
						className="pl-9 bg-background/50"
					/>
				</div>
				<div className="flex items-center gap-3">
					<select
						value={sortMode}
						onChange={(e) => setSortMode(e.target.value as SortMode)}
						className="h-10 rounded-md border border-input bg-background/50 px-3 text-sm focus:outline-hidden"
					>
						<option value="score-desc">Sort: Highest Match</option>
						<option value="score-asc">Sort: Lowest Match</option>
						<option value="name">Sort: Name</option>
					</select>
					<Button variant="outline" size="icon">
						<IconFilter className="size-4" />
					</Button>
				</div>
			</div>

			{/* Ranking Table */}
			<div className="rounded-xl border border-border/60 bg-card/40 overflow-hidden">
				<table className="w-full text-sm text-left">
					<thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
						<tr>
							<th className="px-6 py-4 font-semibold">Rank</th>
							<th className="px-6 py-4 font-semibold">Candidate</th>
							<th className="px-6 py-4 font-semibold hidden md:table-cell">Experience</th>
							<th className="px-6 py-4 font-semibold hidden lg:table-cell">Status</th>
							<th className="px-6 py-4 font-semibold text-right">Match Score</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-border/50">
						{filteredCandidates.map((candidate, i) => (
							<tr
								key={candidate.id}
								onClick={() => setDrawerCandidate(candidate)}
								className="hover:bg-muted/30 cursor-pointer transition-colors group"
							>
								<td className="px-6 py-4 font-medium text-muted-foreground">#{i + 1}</td>
								<td className="px-6 py-4">
									<div className="font-semibold text-foreground group-hover:text-primary transition-colors">
										{candidate.name}
									</div>
									<div className="text-muted-foreground text-xs">{candidate.headline}</div>
								</td>
								<td className="px-6 py-4 hidden md:table-cell">{candidate.yearsExperience} yrs</td>
								<td className="px-6 py-4 hidden lg:table-cell">
									<Badge
										variant={getAvailabilityVariant(candidate.availability)}
										className="font-normal text-[10px]"
									>
										{candidate.availability}
									</Badge>
								</td>
								<td className="px-6 py-4 text-right">
									<span className={cn('text-lg font-bold', getScoreTone(candidate.matchScore))}>
										{candidate.matchScore}
									</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
				{filteredCandidates.length === 0 && (
					<div className="p-12 text-center text-muted-foreground">
						No candidates match the current filters.
					</div>
				)}
			</div>
		</div>
	);
}
