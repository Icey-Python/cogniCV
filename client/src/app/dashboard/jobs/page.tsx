'use client';

import { useState, useMemo } from 'react';
import { MOCK_JOBS } from '@/lib/mock-data';
import { JobCard } from '@/components/jobs/job-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconPlus, IconSearch, IconFilter } from '@tabler/icons-react';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function JobListingsPage() {
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<string>('all');
	const [typeFilter, setTypeFilter] = useState<string>('all');

	const filteredJobs = useMemo(() => {
		return MOCK_JOBS.filter((job) => {
			const matchesSearch =
				job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				job.department.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus = statusFilter === 'all' || job.status.toLowerCase() === statusFilter;
			const matchesType = typeFilter === 'all' || job.jobType === typeFilter;
			return matchesSearch && matchesStatus && matchesType;
		});
	}, [searchQuery, statusFilter, typeFilter]);

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
			<div className="flex flex-col  sm:flex-row gap-3 items-start sm:items-center justify-between">
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
					<IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
					<Input
						placeholder="Search jobs..."
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className="pl-9"
					/>
				</div>
			</div>

			{/* Results count */}
			<p className="text-sm text-muted-foreground">
				Showing {filteredJobs.length} of {MOCK_JOBS.length} jobs
			</p>

			{/* Job grid */}
			{filteredJobs.length > 0 ? (
				<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
					{filteredJobs.map((job) => (
						<JobCard key={job._id} job={job} />
					))}
				</div>
			) : (
				<div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-lg">
					<IconFilter className="size-10 text-muted-foreground mb-4" />
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
