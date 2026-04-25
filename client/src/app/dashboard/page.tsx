import { MOCK_JOBS } from '@/lib/mock-data';
import { JobCard } from '@/components/jobs/job-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconBriefcase, IconUsers, IconStar, IconTrendingUp, IconArrowRight } from '@tabler/icons-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const totalApplicants = MOCK_JOBS.reduce((sum, j) => sum + j.applicantCount, 0);
const activeJobs = MOCK_JOBS.filter((j) => j.status === 'Active').length;

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

			{/* Recent Jobs */}
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h2 className="text-xl font-semibold font-lora">Recent Job Postings</h2>
					<Link
						href="/dashboard/jobs"
						className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
					>
						View all <IconArrowRight className="size-4" />
					</Link>
				</div>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{MOCK_JOBS.filter((j) => j.status === 'Active')
						.slice(0, 3)
						.map((job) => (
							<JobCard key={job._id} job={job} />
						))}
				</div>
			</div>
		</div>
	);
}
