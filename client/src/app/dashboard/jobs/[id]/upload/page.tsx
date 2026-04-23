'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MOCK_JOBS } from '@/lib/mock-data';
import { UploadPanel } from '@/components/jobs/upload-panel';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconUpload } from '@tabler/icons-react';

export default function JobUploadPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const job = MOCK_JOBS.find((j) => j._id === params.id);

	const [uploadComplete, setUploadComplete] = useState(false);

	if (!job) {
		return <div className="p-10 text-center text-muted-foreground">Job not found.</div>;
	}

	return (
		<div className="max-w-6xl space-y-6">
			<div>
				<h1 className="text-2xl font-semibold">Upload Applicants</h1>
				<p className="text-muted-foreground mt-1">
					Upload resumes for {job.title}
				</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-base flex items-center gap-2">
						<IconUpload className="size-4" /> Upload Resumes
					</CardTitle>
					<CardDescription>
						Upload PDF resumes or a CSV. The AI will extract, normalise, and rank all candidates.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<UploadPanel 
						onComplete={() => {
							// After a short delay, return to the job page
							setTimeout(() => {
								router.push(`/dashboard/jobs/${job._id}`);
							}, 1500);
						}} 
					/>
				</CardContent>
			</Card>
		</div>
	);
}
