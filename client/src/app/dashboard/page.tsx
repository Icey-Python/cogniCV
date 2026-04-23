import { MOCK_JOBS, MOCK_RANKED_CANDIDATES } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconBriefcase, IconUsers, IconStar, IconTrendingUp, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const totalApplicants = MOCK_JOBS.reduce((sum, j) => sum + j.applicantCount, 0);
const activeJobs = MOCK_JOBS.filter((j) => j.status === 'Active').length;

const topCandidates = Object.values(MOCK_RANKED_CANDIDATES)
	.flat()
	.sort((a, b) => b.matchScore - a.matchScore)
	.slice(0, 4);

const stats = [
	{ label: 'Active Jobs', value: activeJobs, icon: IconBriefcase, change: '+2 this week', color: 'text-primary' },
	{ label: 'Total Applicants', value: totalApplicants, icon: IconUsers, change: '+12% vs last month', color: 'text-primary' },
	{ label: 'Shortlisted', value: 28, icon: IconStar, change: '+5 today', color: 'text-primary' },
	{ label: 'Avg. Match Score', value: '83%', icon: IconTrendingUp, change: '+2pts improvement', color: 'text-primary' },
];

export default function DashboardPage() {
	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-semibold">Welcome back</h1>
				<p className="text-muted-foreground mt-1">
					Here is what is happening with your talent pipeline today.
				</p>
			</div>

			{/* Stats */}
			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{stats.map((stat) => (
					<Card key={stat.label}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
							<stat.icon className={cn('size-5', stat.color)} />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold tabular-nums">{stat.value}</div>
							<p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				{/* Recent Jobs */}
				<Card className="lg:col-span-2">
					<CardHeader className="flex flex-row items-center justify-between pb-3">
						<CardTitle className="text-base">Recent Job Postings</CardTitle>
						<Button variant="ghost" size="sm" asChild>
							<Link href="/dashboard/jobs" className="gap-1 text-xs">
								View all <IconArrowRight className="size-3.5" />
							</Link>
						</Button>
					</CardHeader>
					<CardContent className="p-0">
						<div className="divide-y">
							{MOCK_JOBS.filter((j) => j.status === 'Active').map((job) => (
								<Link
									key={job._id}
									href={`/dashboard/jobs/${job._id}`}
									className="flex items-center gap-4 px-6 py-4 hover:bg-muted/50 transition-colors group"
								>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium group-hover:text-primary transition-colors truncate">
											{job.title}
										</p>
										<p className="text-xs text-muted-foreground mt-0.5">
											{job.department} &middot; {job.location}
										</p>
									</div>
									<div className="text-right shrink-0">
										<p className="text-sm font-semibold">{job.applicantCount}</p>
										<p className="text-[11px] text-muted-foreground">applicants</p>
									</div>
								</Link>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Top Matches */}
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-base">Top Matches</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<div className="divide-y">
							{topCandidates.map((candidate, i) => {
								const p = candidate.profileSnapshot;
								return (
									<div key={i} className="flex items-center gap-3 px-6 py-3">
										<div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
											{p.firstName[0]}{p.lastName[0]}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-medium truncate">
												{p.firstName} {p.lastName}
											</p>
											<p className="text-xs text-muted-foreground truncate">{p.headline}</p>
										</div>
										<span className="text-sm font-bold tabular-nums text-primary">
											{candidate.matchScore}
										</span>
									</div>
								);
							})}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
