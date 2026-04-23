import { IconActivity, IconBriefcase, IconSparkles, IconUsers } from '@tabler/icons-react';

export function DashboardOverview({
	totalOpenJobs,
	totalApplicants
}: {
	totalOpenJobs: number;
	totalApplicants: number;
}) {
	return (
		<div className="animate-rise-in space-y-6">
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{[
					{ label: 'Open Roles', value: totalOpenJobs, icon: IconBriefcase },
					{ label: 'Total Applicants', value: totalApplicants, icon: IconUsers },
					{ label: 'Top Matches', value: '42', icon: IconSparkles },
					{ label: 'Time to Hire', value: '18d', icon: IconActivity }
				].map((kpi) => (
					<div key={kpi.label} className="rounded-2xl border border-border/60 bg-card/50 p-5 shadow-xs">
						<div className="flex items-center justify-between text-muted-foreground">
							<p className="text-xs font-semibold uppercase tracking-wider">{kpi.label}</p>
							<kpi.icon className="size-4" />
						</div>
						<p className="mt-3 text-3xl font-bold text-foreground">{kpi.value}</p>
					</div>
				))}
			</div>
		</div>
	);
}
