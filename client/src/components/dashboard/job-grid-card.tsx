import { Badge } from '@/components/ui/badge';
import type { JobListing, RecruiterJobView } from '@/types/jobs';
import { IconChevronRight } from '@tabler/icons-react';

type ScreeningState = RecruiterJobView['screeningState'];
type BadgeVariant = 'default' | 'secondary' | 'outline' | 'accent' | 'destructive';

function getJobStatusVariant(status: JobListing['status']): BadgeVariant {
	switch (status) {
		case 'Open': return 'default';
		case 'Closing Soon': return 'accent';
		case 'Paused': return 'secondary';
		default: return 'outline';
	}
}

function getScreeningVariant(state: ScreeningState): BadgeVariant {
	switch (state) {
		case 'running': return 'accent';
		case 'complete': return 'default';
		default: return 'outline';
	}
}

export function JobGridCard({
	job,
	onSelect,
	screeningState
}: {
	job: JobListing;
	onSelect: () => void;
	screeningState: ScreeningState;
}) {
	return (
		<button
			onClick={onSelect}
			className="animate-rise-in flex flex-col text-left rounded-2xl border border-border/60 bg-card/40 p-5 shadow-xs transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-sm"
		>
			<div className="flex w-full items-start justify-between gap-3 mb-4">
				<div>
					<h3 className="font-semibold text-foreground text-lg">{job.title}</h3>
					<p className="text-sm text-muted-foreground mt-1">
						{job.location} &bull; {job.type}
					</p>
				</div>
				<Badge variant={getJobStatusVariant(job.status)}>{job.status}</Badge>
			</div>

			<p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
				{job.summary}
			</p>

			<div className="w-full flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
				<div className="flex items-center gap-3">
					<p className="text-xs font-medium text-foreground">{job.applicants} applicants</p>
					{screeningState !== 'idle' && (
						<Badge variant={getScreeningVariant(screeningState)} className="text-[10px]">
							{screeningState}
						</Badge>
					)}
				</div>
				<IconChevronRight className="size-4 text-muted-foreground" />
			</div>
		</button>
	);
}
