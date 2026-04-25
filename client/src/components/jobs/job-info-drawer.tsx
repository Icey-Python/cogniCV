'use client';

import { type Job } from '@/hooks/query/jobs/service';
import {
	Sheet,
	SheetContent,
	SheetTitle,
	SheetDescription
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import MarkdownRenderer from '@/components/ui/markdown';

interface JobInfoDrawerProps {
	job: Job | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function JobInfoDrawer({ job, open, onOpenChange }: JobInfoDrawerProps) {
	if (!job) return null;

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="border-border flex w-full flex-col gap-0 border-l bg-white p-0 pb-12 sm:max-w-lg"
			>
				<div className="flex items-start gap-4 border-b border-gray-100 bg-white px-4 py-6">
					<div className="min-w-0 flex-1">
						<SheetTitle className="font-serif text-2xl">Job details</SheetTitle>
						<SheetDescription className="text-muted-foreground mt-0.5 text-sm">
							Quick reference for the role, requirements, and hiring context.
						</SheetDescription>
					</div>
				</div>

				<ScrollArea className="mt-4 flex-1 bg-white">
					<div className="space-y-8 px-4">
						<h2 className="text-foreground mt-3 text-xl font-semibold">
							ROLE : {job.title}
						</h2>
						<div className="text-muted-foreground -mt-4 text-sm leading-6">
							<MarkdownRenderer content={job.description} />
						</div>

						<div className="mt-6 grid gap-3 sm:grid-cols-2">
							<div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
								<p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
									Source
								</p>
								<p className="text-foreground mt-2 text-sm">{job.source}</p>
							</div>
							<div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
								<p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
									Location
								</p>
								<p className="text-foreground mt-2 flex items-center gap-2 text-sm">
									{job.location?.city}, {job.location?.country}
								</p>
							</div>
							<div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
								<p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
									Employment type
								</p>
								<p className="text-foreground mt-2">{job.type}</p>
							</div>
							<div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
								<p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
									Experience level
								</p>
								<p className="text-foreground mt-2 text-sm">
									{job.experienceLevel}
								</p>
							</div>
						</div>

						<div className="">
							<h3 className="text-muted-foreground font-lora text-lg font-semibold uppercase">
								Required skills
							</h3>
							<div className="mt-4 flex flex-wrap gap-2">
								{job.requiredSkills.map((skill) => (
									<span
										key={skill}
										className="border-input bg-muted/70 text-foreground rounded-full border px-3 py-1 text-xs font-medium"
									>
										{skill}
									</span>
								))}
							</div>
						</div>

						<div>
							<h3 className="text-muted-foreground font-lora text-lg font-semibold uppercase">
								Hiring Context
							</h3>
							<div className="flex items-start justify-between gap-4">
								<p className="text-muted-foreground mt-2 text-sm leading-6">
									Use this information to compare the candidate's AI analysis
									against the role's actual requirements.
								</p>

								<span className="border-primary/20 bg-primary/10 text-primary inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold">
									{job.status}
								</span>
							</div>
							<div className="mt-4 grid gap-2">
								<div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
									<span className="text-muted-foreground">Applicants</span>
									<span className="font-medium">0</span>
								</div>
								<div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 text-sm">
									<span className="text-muted-foreground">Job ID</span>
									<span className="text-foreground font-medium">{job._id}</span>
								</div>
							</div>
						</div>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
