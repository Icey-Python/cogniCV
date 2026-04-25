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
					<div className="flex items-center gap-2 text-muted-foreground">
						<span>{job.source}</span>
						<span>•</span>
						<span>{job.location?.city}, {job.location?.country}</span>
					</div>
				</div>
				<Badge variant="outline" className="border-primary border-t-0 border-x-0 rounded-none shadow-none py-2.5">
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
				<h2 className="text-xl font-semibold font-lora">Job Description</h2>
				<div className="text-muted-foreground leading-relaxed">
					<MarkdownRenderer content={job.description} />
				</div>
			</div>

			<div className="space-y-4">
				<h2 className="text-xl font-semibold font-lora">Required Skills</h2>
				<div className="flex flex-wrap gap-2">
					{job.requiredSkills.map((skill) => (
						<Badge
							key={skill}
							variant="secondary"
							className="rounded-full px-4 py-1.5"
						>
							{skill}
						</Badge>
					))}
				</div>
			</div>

			<div className="rounded-xl border bg-slate-50/50 p-6">
				<h3 className="font-lora text-lg font-semibold mb-2">Hiring Context</h3>
				<p className="text-muted-foreground text-sm leading-relaxed mb-4">
					Use this information to compare the candidate's AI analysis against the role's actual requirements.
				</p>
				<div className="flex items-center justify-between py-3 border-t text-sm">
					<span className="text-muted-foreground">Job ID</span>
					<span className="font-mono text-xs">{job._id}</span>
				</div>
			</div>
		</div>
	);
}
