'use client';

import { useParams } from 'next/navigation';
import { useMockTalentByIdQuery } from '@/hooks/query/jobs/queries';
import { IconLoader2, IconSparkles, IconMapPin, IconBriefcase, IconTrophy, IconCircleCheck, IconInfoCircle, IconStar, IconCheck, IconShare, IconLink, IconCopy, IconDownload, IconFileTypeJs, IconExternalLink, IconMessage } from '@tabler/icons-react';
import { TalentProfileView } from '@/components/talent/talent-profile-view';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CircularScoreProgress } from '@/components/jobs/ranked-applicants-table';

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
							CogniCV <span className="text-primary">Talent</span>
						</span>
					</div>
					<div className="text-xs font-medium text-slate-400">
						Shared via Recruitment Portal
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-6 pt-10">
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
							<Badge variant="outline" className="font-medium border-primary border-t-0 border-x-0 rounded-none shadow-none py-2.5">
								{p.availability?.status || 'Active'}
							</Badge>
						</div>
					</div>

					<div className="grid gap-4 md:grid-cols-4">
						<Card className="md:col-span-1">
							<CardContent className="flex items-center justify-between p-5">
								<div>
									<p className="text-muted-foreground text-xs tracking-wider uppercase">
										Match score
									</p>
									<p className="mt-1 text-2xl font-semibold">
										N/A
									</p>
								</div>
								<CircularScoreProgress score={0} />
							</CardContent>
						</Card>
						<Card className="md:col-span-1">
							<CardContent className="p-5">
								<p className="text-muted-foreground text-xs tracking-wider uppercase">
									Ranking
								</p>
								<p className="mt-1 flex items-center text-2xl font-semibold">
									<IconTrophy className="mr-2 size-5 text-amber-600" />
									-
								</p>
								<p className="text-muted-foreground mt-1 text-xs">
									Rank not available
								</p>
							</CardContent>
						</Card>
						<Card className="md:col-span-1">
							<CardContent className="p-5">
								<p className="text-muted-foreground text-xs tracking-wider uppercase">
									Location
								</p>
								<p className="mt-1 flex items-center text-sm font-medium">
									<IconMapPin className="mr-1.5 size-4" /> {p.location}
								</p>
								<p className="text-muted-foreground mt-1 text-xs">
									{p.availability?.status || 'Active'}
								</p>
							</CardContent>
						</Card>
						<Card className="md:col-span-1">
							<CardContent className="p-5">
								<p className="text-muted-foreground text-xs tracking-wider uppercase">
									Coverage
								</p>
								<p className="mt-1 text-2xl font-semibold">0%</p>
								<p className="text-muted-foreground mt-1 text-xs">
									Job requirement alignment
								</p>
							</CardContent>
						</Card>
					</div>

					<div className="grid gap-6 lg:grid-cols-3">
						<div className="space-y-6 lg:col-span-2">
							<TalentProfileView profile={p} />
						</div>

						<div className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="font-lora flex items-center gap-2 text-lg">
										<IconMessage className="size-4" /> Suggested Feedback
									</CardTitle>
									<CardDescription>
										Structured points you can use while giving candidate feedback.
									</CardDescription>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2 text-sm leading-relaxed">
										<li className="bg-muted/20 rounded-md border px-3 py-2">
											Analysis pending. Run AI screening to see tailored feedback points.
										</li>
										<li className="bg-muted/20 rounded-md border px-3 py-2">
											Focus initial screening on core technical competence and cultural alignment.
										</li>
										<li className="bg-muted/20 rounded-md border px-3 py-2">
											Verify availability and start date expectations.
										</li>
									</ul>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="font-lora text-lg">
										Profile Assets
									</CardTitle>
									<CardDescription>
										Download resume for external applicants or structured JSON for
										platform profiles.
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-2">
									<Button
										className="w-full"
										variant="outline"
									>
										<IconFileTypeJs className="mr-2 size-4" /> Download profile
										JSON
									</Button>

									{p.socialLinks?.linkedin && (
										<Button asChild className="w-full" variant="ghost">
											<a
												href={p.socialLinks.linkedin}
												target="_blank"
												rel="noopener noreferrer"
											>
												LinkedIn <IconExternalLink className="ml-2 size-3.5" />
											</a>
										</Button>
									)}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
				<footer className="mt-20 text-center text-sm text-slate-400">
					© {new Date().getFullYear()} CogniCV Recruitment Platform. All rights reserved.
				</footer>
			</main>
		</div>
	);
}
