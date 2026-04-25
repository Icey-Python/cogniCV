'use client';

import { type Job } from '@/hooks/query/jobs/service';
import MarkdownRenderer from '@/components/ui/markdown';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface JobDetailsViewProps {
	job: Job;
}

export function JobDetailsView({ job }: JobDetailsViewProps) {
	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<h1 className="font-lora text-3xl">{job.title}</h1>
					<div className="text-muted-foreground flex items-center gap-2">
						<span>{job.source}</span>
						<span>•</span>
						<span>
							{job.location?.city}, {job.location?.country}
						</span>
					</div>
				</div>
				<Badge
					variant="outline"
					className="border-primary rounded-none border-x-0 border-t-0 py-2.5 shadow-none"
				>
					{job.status}
				</Badge>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardContent className="p-4">
						<p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
							Source
						</p>
						<p className="text-foreground mt-2 text-sm">{job.source}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
							Location
						</p>
						<p className="text-foreground mt-2 text-sm">
							{job.location?.city}, {job.location?.country}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
							Employment type
						</p>
						<p className="text-foreground mt-2 text-sm">{job.type}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
							Experience level
						</p>
						<p className="text-foreground mt-2 text-sm">
							{job.experienceLevel}
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="space-y-4">
				<h2 className="font-lora text-xl font-semibold">Job Description</h2>
				<div className="text-muted-foreground leading-relaxed">
					<MarkdownRenderer content={job.description} />
				</div>
			</div>

			<div className="space-y-4">
				<h2 className="font-lora text-xl font-semibold">Required Skills</h2>
				<div className="flex flex-wrap gap-2">
					{job.requiredSkills.map((skill) => (
						<Badge
							key={skill}
							variant="outline"
							className="bg-primary/10 text-primary rounded-full border-0 px-4 py-1.5 text-sm"
						>
							{skill}
						</Badge>
					))}
				</div>
			</div>
		</div>
	);
}
