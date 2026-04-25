'use client';

import { JobCard } from '@/components/jobs/job-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconBriefcase, IconUsers, IconStar, IconTrendingUp, IconArrowRight, IconLoader2 } from '@tabler/icons-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSearchJobsQuery, useJobAnalyticsQuery } from '@/hooks/query/jobs/queries';

export default function DashboardPage() {
	const { data: analyticsData } = useJobAnalyticsQuery();
	const { data: jobsData, isLoading: isJobsLoading } = useSearchJobsQuery('', 'Active', 'all', 1, 3);

	const analytics = analyticsData?.data;
	const recentJobs = jobsData?.data?.jobs || [];

	const stats = [
		{ label: 'Active Jobs', value: analytics?.activeJobs || 0, icon: IconBriefcase, change: 'Total open roles', color: 'text-primary' },
		{ label: 'Total Applicants', value: analytics?.totalCandidates || 0, icon: IconUsers, change: 'Across all jobs', color: 'text-primary' },
		{ label: 'Shortlisted', value: 28, icon: IconStar, change: 'Awaiting review', color: 'text-primary' }, // Hardcoded for now
		{ label: 'Avg. Match Score', value: `${analytics?.avgMatchScore || 0}%`, icon: IconTrendingUp, change: 'AI confidence score', color: 'text-primary' },
	];

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
					{isJobsLoading ? (
						<div className="col-span-full flex justify-center py-10">
							<IconLoader2 className="size-8 animate-spin text-muted-foreground" />
						</div>
					) : recentJobs.length > 0 ? (
						recentJobs.map((job) => (
							<JobCard key={job._id} job={job as any} />
						))
					) : (
						<div className="col-span-full text-center py-10 border rounded-lg bg-muted/10 text-muted-foreground">
							No active jobs found. Create one to get started.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
