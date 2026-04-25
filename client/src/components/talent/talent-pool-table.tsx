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
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '@/components/ui/pagination';
import {
	IconMapPin,
	IconChevronRight,
	IconCode,
	IconBriefcase
} from '@tabler/icons-react';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';

interface TalentPoolTableProps {
	talent: TalentProfile[];
}

export function TalentPoolTable({ talent }: TalentPoolTableProps) {
	const router = useRouter();

	return (
		<div className="flex flex-col">
			<Table>
				<TableHeader>
					<TableRow className="hover:bg-transparent">
						<TableHead className="pl-6">Candidate</TableHead>
						<TableHead className="hidden md:table-cell">Location</TableHead>
						<TableHead className="hidden lg:table-cell">Experience</TableHead>
						<TableHead className="hidden sm:table-cell">Top Skills</TableHead>
						<TableHead>Availability</TableHead>
						<TableHead className="w-10" />
					</TableRow>
				</TableHeader>
				<TableBody>
					{talent.length === 0 ? (
						<TableRow>
							<TableCell colSpan={6} className="py-12 text-center text-muted-foreground text-sm">
								No talent found matching your criteria.
							</TableCell>
						</TableRow>
					) : (
						talent.map((profile) => (
							<TableRow
								key={profile._id}
								className="cursor-pointer group hover:bg-slate-50/50 transition-colors"
								onClick={() => router.push(`/dashboard/talent/${profile._id}`)}
							>
								<TableCell className="pl-6 py-4">
									<div className="flex items-center gap-3">
										<div className="size-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0 border border-primary/5">
											{(profile.firstName?.[0] || '?')}{(profile.lastName?.[0] || '')}
										</div>
										<div className="min-w-0">
											<p className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors">
												{profile.firstName || 'Unknown'} {profile.lastName || ''}
											</p>
											<p className="text-xs text-muted-foreground truncate max-w-[250px]">
												{profile.headline || 'No headline'}
											</p>
										</div>
									</div>
								</TableCell>
								<TableCell className="hidden md:table-cell">
									<span className="flex items-center gap-1.5 text-sm text-slate-600">
										<IconMapPin className="size-3.5 text-slate-400" /> {profile.location}
									</span>
								</TableCell>
								<TableCell className="hidden lg:table-cell">
									<span className="flex items-center gap-1.5 text-sm text-slate-600">
										<IconBriefcase className="size-3.5 text-slate-400" /> {profile.experience?.length || 0} Roles
									</span>
								</TableCell>
								<TableCell className="hidden sm:table-cell">
									<div className="flex flex-wrap gap-1">
										{profile.skills?.slice(0, 3).map((skill) => (
											<Badge key={skill.name} variant="secondary" className="px-1.5 py-0 text-[10px] bg-slate-100 text-slate-600 font-medium">
												{skill.name}
											</Badge>
										))}
										{(profile.skills?.length || 0) > 3 && (
											<span className="text-[10px] text-slate-400">+{profile.skills!.length - 3}</span>
										)}
									</div>
								</TableCell>
								<TableCell>
									<Badge variant="outline" className={cn(
										'text-[10px] font-semibold uppercase tracking-wider px-2 h-5 border-none',
										profile.availability?.status === 'Available' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
									)}>
										{profile.availability?.status || 'Active'}
									</Badge>
								</TableCell>
								<TableCell className="pr-6">
									<IconChevronRight className="size-4 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-0.5" />
								</TableCell>
							</TableRow>
						))
					)}
				</TableBody>
			</Table>

			{talent.length > 0 && (
				<div className="border-t py-3 px-6 flex items-center justify-between bg-slate-50/30">
					<p className="text-xs text-muted-foreground">
						Showing 1-{talent.length} of {talent.length} candidates in pool
					</p>
					<Pagination className="w-auto mx-0">
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious href="#" className="pointer-events-none opacity-50 scale-90" />
							</PaginationItem>
							<PaginationItem>
								<PaginationLink href="#" isActive className="h-8 w-8 text-xs">
									1
								</PaginationLink>
							</PaginationItem>
							<PaginationItem>
								<PaginationNext href="#" className="pointer-events-none opacity-50 scale-90" />
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</div>
			)}
		</div>
	);
}
