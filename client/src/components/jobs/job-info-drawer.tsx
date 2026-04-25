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
				<div className="flex items-start gap-4 border-b border-gray-100 bg-white px-4 pt-6 pb-3">
					<div className="min-w-0 flex-1">
						<SheetTitle className="font-lora text-2xl">{job.title}</SheetTitle>
						<SheetDescription className="text-muted-foreground mt-0.5 text-sm">
							Quick reference for the role, requirements, and hiring context.
						</SheetDescription>
					</div>
				</div>

				<ScrollArea className="flex-1 bg-white pt-4">
					<div className="space-y-8 px-4">
						<div className="text-muted-foreground text-sm leading-6">
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
										key={skill + '-job-info-drawer'}
										className="bg-primary/10 text-primary rounded-full border-0 px-3 py-1 text-sm font-medium"
									>
										{skill}
									</span>
								))}
							</div>
						</div>
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
