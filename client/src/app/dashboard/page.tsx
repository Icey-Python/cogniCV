'use client';

import { JobCard } from '@/components/jobs/job-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
	IconBriefcase,
	IconUsers,
	IconBuilding,
	IconMapPin,
	IconArrowRight,
	IconLoader2
} from '@tabler/icons-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	useSearchJobsQuery,
	useJobAnalyticsQuery
} from '@/hooks/query/jobs/queries';

const SlackIcon = ({ className }: { className?: string }) => (
	<div className={cn('flex items-center justify-center', className)}>
		<Image src="/slack.svg" alt="Slack" width={20} height={20} />
	</div>
);

export default function DashboardPage() {
	const { data: analyticsData } = useJobAnalyticsQuery();
	const { data: jobsData, isLoading: isJobsLoading } = useSearchJobsQuery(
		'',
		'Active',
		'all',
		1,
		3
	);

	const analytics = analyticsData?.data;
	const recentJobs = jobsData?.data?.jobs || [];

	const stats = [
		{
			label: 'Active Jobs',
			value: analytics?.activeJobs || 0,
			icon: IconBriefcase,
			change: 'Open roles',
			color: 'text-primary'
		},
		{
			label: 'Talent Pool',
			value: (analytics?.totalTalentPool || 0).toLocaleString(),
			icon: IconUsers,
			change: 'Available talent base',
			color: 'text-primary'
		},
		{
			label: 'Departments',
			value: analytics?.departments || 0,
			icon: IconBuilding,
			change: 'Number of departments',
			color: 'text-primary'
		},
		{
			label: 'Slack Integration',
			value: 'Inactive',
			icon: SlackIcon,
			change: 'Connect to workspace',
			color: 'text-muted-foreground',
			href: '/dashboard/organization?tab=integrations'
		}
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
							<CardTitle className="text-muted-foreground text-sm font-medium">
								{stat.label}
							</CardTitle>
							<stat.icon className={cn('size-5', stat.color)} />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold tabular-nums">
								{stat.value}
							</div>
							<p className="text-muted-foreground mt-1 text-xs">
								{stat.href ? (
									<Link
										href={stat.href}
										className="text-primary hover:underline font-medium"
									>
										{stat.change}
									</Link>
								) : (
									stat.change
								)}
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Recent Jobs */}
			<div className="space-y-6">
				<div className="flex items-center justify-between">
					<h2 className="font-lora text-xl font-semibold">
						Recent Job Postings
					</h2>
					<Link
						href="/dashboard/jobs"
						className="text-primary flex items-center gap-1 text-sm font-medium hover:underline"
					>
						View all <IconArrowRight className="size-4" />
					</Link>
				</div>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{isJobsLoading ? (
						<div className="col-span-full flex justify-center py-10">
							<IconLoader2 className="text-muted-foreground size-8 animate-spin" />
						</div>
					) : recentJobs.length > 0 ? (
						recentJobs.map((job) => <JobCard key={job._id} job={job as any} />)
					) : (
						<div className="bg-muted/10 text-muted-foreground col-span-full rounded-lg border py-10 text-center">
							No active jobs found. Create one to get started.
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
