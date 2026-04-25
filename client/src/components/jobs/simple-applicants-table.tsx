'use client';

import { type TalentProfile } from '@/hooks/query/jobs/service';
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
	IconMapPin,
	IconBolt,
	IconPaperclip,
	IconChevronRight,
} from '@tabler/icons-react';

interface SimpleApplicantsTableProps {
	applicants: TalentProfile[];
	onRowClick: (applicant: TalentProfile) => void;
}

export function SimpleApplicantsTable({ applicants, onRowClick }: SimpleApplicantsTableProps) {
	return (
		<div className="flex flex-col">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="pl-6">Candidate</TableHead>
						<TableHead className="hidden md:table-cell">Location</TableHead>
						<TableHead className="hidden sm:table-cell">Source</TableHead>
						<TableHead className="hidden lg:table-cell">Availability</TableHead>
						<TableHead className="w-10" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{applicants.length === 0 ? (
						<TableRow>
							<TableCell colSpan={5} className="py-12 text-center text-muted-foreground text-sm">
								No applicants found.
							</TableCell>
						</TableRow>
					) : (
						applicants.map((applicant, i) => (
							<TableRow
								key={applicant._id || i}
								className="cursor-pointer group hover:bg-muted/50 transition-colors"
								onClick={() => onRowClick(applicant)}
							>
								<TableCell className="pl-6 py-4">
									<div className="flex items-center gap-3">
										<div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
											{(applicant.firstName?.[0] || '')}{(applicant.lastName?.[0] || '')}
										</div>
										<div className="min-w-0">
											<p className="text-sm font-medium">{applicant.firstName} {applicant.lastName}</p>
											<p className="text-xs text-muted-foreground truncate max-w-[200px]">{applicant.headline}</p>
										</div>
									</div>
								</TableCell>
								<TableCell className="hidden md:table-cell">
									<span className="flex items-center gap-1 text-sm text-muted-foreground">
										<IconMapPin className="size-3.5" /> {applicant.location}
									</span>
								</TableCell>
								<TableCell className="hidden sm:table-cell">
									<span className="flex items-center gap-1 text-xs text-muted-foreground capitalize">
										{applicant.source === 'internal' ? (
											<><IconBolt className="size-3.5 text-primary" /> Platform</>
										) : (
											<><IconPaperclip className="size-3.5" /> {applicant.source || 'External'}</>
										)}
									</span>
								</TableCell>
								<TableCell className="hidden lg:table-cell">
									<span className={cn(
										'text-xs',
										applicant.availability?.status === 'Available' ? 'text-emerald-600' : 'text-muted-foreground'
									)}>
										{applicant.availability?.status || 'Active'}
									</span>
								</TableCell>
								<TableCell>
									<IconChevronRight className="size-4 text-muted-foreground transition-opacity" />
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>
		</div>
	);
}
