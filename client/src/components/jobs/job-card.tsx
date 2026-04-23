import { type Job } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconBriefcase, IconMapPin, IconClock, IconUsers, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface JobCardProps {
	job: Job;
}

const statusDot: Record<Job['status'], string> = {
	Active: 'bg-emerald-500',
	Closed: 'bg-slate-400',
	Draft: 'bg-amber-400',
};

export function JobCard({ job }: JobCardProps) {
	return (
		<Link href={`/dashboard/jobs/${job._id}`} className="group block h-full">
			<Card className="h-full transition-all duration-200 hover:border-primary/40 cursor-pointer">
				<CardHeader className="pb-3">
					<CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2 font-lora">
						{job.title}
					</CardTitle>
					<p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed my-2">
						{job.description}
					</p>
				</CardHeader>
				<CardContent className="pt-0 space-y-4">
					<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<IconBriefcase className="size-3.5" /> {job.department}
						</span>
						<span className="flex items-center gap-1">
							<IconMapPin className="size-3.5" /> {job.location}
						</span>
						<span className="flex items-center gap-1">
							<IconClock className="size-3.5" /> {job.type}
						</span>
					</div>

					<div className="flex flex-wrap gap-1.5">
						{job.requiredSkills.slice(0, 3).map((skill) => (
							<span
								key={skill}
								className="text-xs px-2 py-0.5 rounded-md bg-primary/5 text-primary/80 border border-primary/10"
							>
								{skill}
							</span>
						))}
						{job.requiredSkills.length > 3 && (
							<span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
								+{job.requiredSkills.length - 3}
							</span>
						)}
					</div>

					<div className="flex items-center justify-between pt-3 border-t">
						<div className="flex items-center gap-1.5 text-sm">
							<IconUsers className="size-4 text-muted-foreground" />
							<span className="font-semibold">{job.applicantCount}</span>
							<span className="text-muted-foreground">applicants</span>
						</div>
						<div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
							View <IconArrowRight className="size-3" />
						</div>
					</div>
				</CardContent>
			</Card>
		</Link>
	);
}
