'use client';

import { useParams } from 'next/navigation';
import { useMockTalentByIdQuery } from '@/hooks/query/jobs/queries';
import { IconLoader2, IconSparkles, IconMapPin, IconBriefcase, IconTrophy, IconCircleCheck, IconInfoCircle, IconStar, IconCheck, IconShare, IconLink, IconCopy, IconDownload, IconFileTypeJs, IconExternalLink, IconMessage, IconPrinter } from '@tabler/icons-react';
import { TalentProfileView } from '@/components/talent/talent-profile-view';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CircularScoreProgress } from '@/components/jobs/ranked-applicants-table';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TalentProfilePDF } from '@/components/talent/TalentProfilePDF';

export default function SharedTalentProfilePage() {
	const params = useParams<{ id: string }>();
	const { data, isLoading } = useMockTalentByIdQuery(params.id);
	const p = data?.data;

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<IconLoader2 className="text-primary size-8 animate-spin" />
			</div>
		);
	}

	if (!p) {
		return (
			<div className="flex h-screen items-center justify-center text-center">
				<p className="text-muted-foreground text-lg">Profile not found or no longer available.</p>
			</div>
		);
	}

	const candidateName = `${p.firstName} ${p.lastName}`;

	return (
		<div className="min-h-screen bg-slate-50/50 pb-20">
			{/* Public Branding Header */}
			<header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
				<div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
					<div className="flex items-center gap-2">
						<div className="bg-primary flex size-8 items-center justify-center rounded-lg">
							<IconSparkles className="size-5 text-white" />
						</div>
						<span className="font-lora text-xl font-bold tracking-tight text-slate-900">
							cogniCV
						</span>
					</div>
					<div className="text-xs font-medium text-slate-400">
						Shared via Recruitment Portal
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-6 pt-10">
				<div className="space-y-6">
					<div className="flex flex-wrap items-start justify-between gap-4">
						<div className="space-y-2">
							<h1 className="font-lora text-3xl">{candidateName}</h1>
							<div className="flex items-center gap-3">
								<p className="text-muted-foreground max-w-3xl text-sm">
									{p.source === 'internal'
										? 'Platform Profile'
										: 'External Applicant'} | {" "}
									{p.headline}
								</p>
							</div>
						</div>
						<div className="flex items-center gap-2">
							<PDFDownloadLink
								document={<TalentProfilePDF profile={p} />}
								fileName={`${p.firstName}-${p.lastName}-profile.pdf`}
							>
								{({ loading }) => (
									<Button variant="outline" size="sm" className="gap-2" disabled={loading}>
										<IconPrinter className="size-4" />
										{loading ? 'Preparing...' : 'Download Profile'}
									</Button>
								)}
							</PDFDownloadLink>
							<Badge variant="outline" className="font-medium border-primary border-t-0 border-x-0 rounded-none shadow-none py-2.5">
								{p.availability?.status || 'Active'}
							</Badge>
						</div>
					</div>

					<div className="grid gap-6 lg:grid-cols-3">
						<div className="space-y-6 lg:col-span-2">
							<TalentProfileView profile={p} />
						</div>
					</div>
				</div>
				<footer className="mt-20 text-center text-sm text-slate-400">
					© {new Date().getFullYear()} cogniCV Recruitment Platform. All rights reserved.
				</footer>
			</main>
		</div>
	);
}
