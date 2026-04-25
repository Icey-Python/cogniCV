'use client';

import { useState } from 'react';
import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	IconPlus,
	IconSearch,
	IconFilter,
	IconLoader2
} from '@tabler/icons-react';
import Link from 'next/link';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import { useSearchJobsQuery } from '@/hooks/query/jobs/queries';

export default function JobListingsPage() {
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [typeFilter, setTypeFilter] = useState<string>('all');

	const { data, isLoading } = useSearchJobsQuery(
		searchQuery,
		statusFilter,
		typeFilter
	);

	const jobs = data?.data?.jobs || [];
	const totalJobs = data?.data?.totalJobs || 0;

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-semibold">Job Listings</h1>
					<p className="text-muted-foreground mt-1">
						Manage your active job postings and review applicants.
					</p>
				</div>
				<Button asChild>
					<Link href="/dashboard/jobs/new" className="gap-2">
						<IconPlus className="size-4" /> New Job
					</Link>
				</Button>
			</div>

			{/* Filters — no background */}
			<div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
				<div className="flex items-center gap-2">
					<Select value={statusFilter} onValueChange={setStatusFilter}>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Status" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Statuses</SelectItem>
							<SelectItem value="active">Active</SelectItem>
							<SelectItem value="closed">Closed</SelectItem>
							<SelectItem value="draft">Draft</SelectItem>
						</SelectContent>
					</Select>
					<Select value={typeFilter} onValueChange={setTypeFilter}>
						<SelectTrigger className="w-[140px]">
							<SelectValue placeholder="Type" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All Types</SelectItem>
							<SelectItem value="internal">Internal</SelectItem>
							<SelectItem value="external">External</SelectItem>
						</SelectContent>
					</Select>
				</div>
				<div className="relative w-full flex-2 sm:max-w-md">
					<IconSearch className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
					<Input
						placeholder="Search jobs..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			{/* Results count */}
			<p className="text-muted-foreground text-sm">
				Showing {jobs.length} of {totalJobs} jobs
			</p>

			{/* Job grid */}
			{isLoading ? (
				<div className="flex items-center justify-center py-20">
					<IconLoader2 className="text-muted-foreground size-8 animate-spin" />
				</div>
			) : jobs.length > 0 ? (
				<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
					{jobs.map((job) => {
						return <JobCard key={job._id} job={job} />;
					})}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-20 text-center">
					<IconFilter className="text-muted-foreground mb-4 size-10" />
					<h3 className="text-lg font-medium">No jobs found</h3>
					<p className="text-muted-foreground mt-1 max-w-sm">
						Try adjusting your search query or filters.
					</p>
					<Button
						variant="link"
						onClick={() => {
							setSearchQuery('');
							setStatusFilter('all');
							setTypeFilter('all');
						}}
						className="mt-2"
					>
						Clear all filters
					</Button>
				</div>
			)}
		</div>
	);
}
