'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { MOCK_RANKED_CANDIDATES } from '@/lib/mock-data'
import { type RankedCandidate } from '@/types'
import { useJobQuery } from '@/hooks/query/jobs/queries'
import { ApplicantInsightDrawer } from '@/components/jobs/applicant-insight-drawer'
import { JobInfoDrawer } from '@/components/jobs/job-info-drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { RankedApplicantsTable } from '@/components/jobs/ranked-applicants-table'
import {
	IconSearch,
	IconUsers,
	IconMapPin,
	IconBriefcase,
	IconUpload,
	IconInfoCircle,
	IconPencilUp,
	IconPencil
} from '@tabler/icons-react'
import { FloatingChat } from '@/components/chat/floating-chat'
import Link from 'next/link'

export default function JobDetailPage() {
	const params = useParams<{ id: string }>()
	const { data, isLoading } = useJobQuery(params.id as string)
	const job = data?.data
	const candidates = MOCK_RANKED_CANDIDATES[params.id] ?? []

	const [search, setSearch] = useState('')
	const [selectedCandidate, setSelectedCandidate] =
		useState<RankedCandidate | null>(null)
	const [drawerOpen, setDrawerOpen] = useState(false)
	const [jobInfoOpen, setJobInfoOpen] = useState(false)
	const [showUpload, setShowUpload] = useState(false)
	const [uploadComplete, setUploadComplete] = useState(false)

	const filtered = useMemo(
		() =>
			candidates.filter((c) => {
				const name =
					`${c.profileSnapshot.firstName} ${c.profileSnapshot.lastName}`.toLowerCase()
				const role = c.profileSnapshot.headline.toLowerCase()
				return (
					name.includes(search.toLowerCase()) ||
					role.includes(search.toLowerCase())
				)
			}),
		[candidates, search]
	)

	const openDrawer = (candidate: RankedCandidate) => {
		setSelectedCandidate(candidate)
		setDrawerOpen(true)
	}

	if (isLoading) {
		return <div className="flex justify-center py-20 text-muted-foreground">Loading job details...</div>
	}

	if (!job) {
		return (
			<div className='py-20 text-center'>
				<p className='text-muted-foreground'>Job not found.</p>
				<Button variant='outline' asChild className='mt-4'>
					<Link href='/dashboard/jobs'>Back to Jobs</Link>
				</Button>
			</div>
		)
	}

	const hasApplicants = uploadComplete || candidates.length > 0

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex items-start gap-4'>
				<div className='min-w-0 flex-1'>
					<div className='flex items-center gap-3'>
						<h1 className='text-2xl font-semibold'>{job.title} </h1>
						<button
							onClick={() => setJobInfoOpen(true)}
							type='button'
							aria-label='Job info'
							className='mt-1 cursor-pointer'
						>
							<IconInfoCircle size={18} />
						</button>
					</div>
					<div className='text-muted-foreground mt-2 flex flex-wrap gap-4 text-sm'>
						<span className='flex items-center gap-1'>
							<IconBriefcase className='size-4' /> {job.experienceLevel}
						</span>
						<span className='flex items-center gap-1'>
							<IconMapPin className='size-4' /> {job.location?.city}, {job.location?.country}
						</span>
						<span className='flex items-center gap-1'>
							<IconUsers className='size-4' /> 0 applicants
						</span>
					</div>
				</div>
				<div className='flex items-center gap-2'>
					{job.source === 'External' && !showUpload && !uploadComplete && (
						<Button variant='default' asChild className='shrink-0 gap-2'>
							<Link href={`/dashboard/jobs/${job._id}/upload`}>
								Import Applications
							</Link>
						</Button>
					)}

					<Button asChild>
						<Link href={`/dashboard/jobs/${job._id}/edit`}>Edit</Link>
					</Button>
				</div>
			</div>

			{/* Empty states */}
			{!hasApplicants && job.source === 'Internal' && (
				<Card className='border-dashed'>
					<CardContent className='space-y-3 py-16 text-center'>
						<IconUsers className='text-muted-foreground mx-auto size-10' />
						<p className='font-medium'>No candidates screened yet</p>
						<p className='text-muted-foreground mx-auto max-w-sm text-sm'>
							Platform talent profiles matching this role will appear here after
							AI screening runs.
						</p>
						<Button size='sm' className='mt-2'>
							Run AI Screening
						</Button>
					</CardContent>
				</Card>
			)}

			{!hasApplicants && job.source === 'External' && !showUpload && (
				<Card className='border-dashed'>
					<CardContent className='space-y-3 py-16 text-center'>
						<IconUpload className='text-muted-foreground mx-auto size-10' />
						<p className='font-medium'>No applicants uploaded yet</p>
						<p className='text-muted-foreground mx-auto max-w-sm text-sm'>
							Upload PDF resumes or a CSV to begin the AI screening and ranking
							process.
						</p>
						<Button size='sm' asChild className='mt-2 gap-2'>
							<Link href={`/dashboard/jobs/${job._id}/upload`}>
								<IconUpload className='size-4' /> Import Applications
							</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			{/* Ranking table */}
			{hasApplicants && (
				<div className='space-y-4 mt-8'>
					<div className='flex flex-wrap items-center justify-between gap-4'>
						<div>
							<h2 className='font-work-sans flex items-center gap-2 text-base font-semibold'>
								Top 20 applicants
							</h2>
						</div>
						<div className='relative'>
							<IconSearch className='text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2' />
							<Input
								placeholder='Search applicants...'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								className='bg-background h-9 w-120 pl-9'
							/>
						</div>
					</div>
					<Card>
						<RankedApplicantsTable
							candidates={filtered}
							onRowClick={openDrawer}
						/>
					</Card>
				</div>
			)}

			<ApplicantInsightDrawer
				candidate={selectedCandidate}
				open={drawerOpen}
				onOpenChange={setDrawerOpen}
				jobId={params.id}
			/>
			<JobInfoDrawer
				job={job}
				open={jobInfoOpen}
				onOpenChange={setJobInfoOpen}
			/>
			<FloatingChat />
		</div>
	)
}
