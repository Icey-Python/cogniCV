'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { PasswordGate } from '@/components/shared/password-gate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircularScoreProgress } from '@/components/jobs/ranked-applicants-table';
import { IconBriefcase, IconCircleCheck, IconLoader2, IconMapPin, IconSparkles, IconTrophy } from '@tabler/icons-react';
import { type Skill } from '@/types';
import { useSharedAnalysisQuery } from '@/hooks/query/jobs/queries';
import { ShareService } from '@/hooks/query/jobs/service';
import { TalentProfileView } from '@/components/talent/talent-profile-view';
import { JobDetailsView } from '@/components/jobs/job-details-view';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import MarkdownRenderer from '@/components/ui/markdown';

function hasSkill(profileSkills: Skill[], requiredSkill: string) {
	const needle = requiredSkill.toLowerCase();
	return profileSkills.some((skill) =>
		skill.name.toLowerCase().includes(needle)
	);
}

export default function SharedAnalysisPage() {
	const params = useParams<{ id: string }>();
	const [password, setPassword] = useState('');
	const [activeTab, setActiveTab] = useState<'analysis' | 'applicant' | 'job'>('analysis');
	
	const { data, isLoading, error } = useSharedAnalysisQuery(params.id, password);

	const handleVerify = async (enteredPassword: string) => {
		try {
			// Call the service directly to verify the password before updating state
			const res = await ShareService.getSharedAnalysis(params.id, enteredPassword);
			if (res.status === 'success') {
				setPassword(enteredPassword);
				return true;
			}
			return false;
		} catch (err) {
			return false;
		}
	};

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<IconLoader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	// If it's protected and we don't have a valid response yet
	const isUnauthorized = error && (error as any).response?.status === 401;
	const needsPassword = (data as any)?.data?.requirePassword || isUnauthorized;

	if (needsPassword) {
		return (
			<PasswordGate onVerify={handleVerify}>
				<div className="flex min-h-screen items-center justify-center p-4">
					<IconLoader2 className="size-8 animate-spin text-primary" />
				</div>
			</PasswordGate>
		);
	}

	const analysis = data?.data;
	const candidate = analysis?.candidate;
	const contextJob = analysis?.job;

	if (!candidate) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md text-center">
					<CardContent className="pt-6">
						<h2 className="text-xl font-semibold mb-2">Analysis Not Found</h2>
						<p className="text-muted-foreground">This analysis could not be located or may have expired.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const p = candidate.profileSnapshot;
	const candidateName = `${p.firstName} ${p.lastName}`;

	const coverage = contextJob ? contextJob.requiredSkills.map((requiredSkill: string) => ({
		skill: requiredSkill,
		matched: hasSkill(candidate.profileSnapshot.skills || [], requiredSkill)
	})) : [];

	const coveragePercent = coverage.length === 0 ? 0 : Math.round((coverage.filter((item) => item.matched).length / coverage.length) * 100);

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
							CogniCV
						</span>
					</div>

					<nav className="hidden items-center gap-1 sm:flex">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setActiveTab('analysis')}
							className={cn(
								'text-sm font-medium transition-colors',
								activeTab === 'analysis' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'
							)}
						>
							Match Analysis
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setActiveTab('applicant')}
							className={cn(
								'text-sm font-medium transition-colors',
								activeTab === 'applicant' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'
							)}
						>
							Applicant Details
						</Button>
						<Button
							variant="ghost"
							size="sm"
							onClick={() => setActiveTab('job')}
							className={cn(
								'text-sm font-medium transition-colors',
								activeTab === 'job' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-900'
							)}
						>
							Job Details
						</Button>
					</nav>

					<div className="text-xs font-medium text-slate-400">
						Analysis Report
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-6xl px-6 pt-10">
				{activeTab === 'analysis' && (
					<div className="space-y-8">
						{/* Header */}
						<div className="text-center space-y-4">
							<Badge variant="outline" className="mb-2">CogniCV Shared Analysis</Badge>
							<h1 className="font-lora text-4xl">{candidateName}</h1>
							<p className="text-muted-foreground text-lg">{p.headline}</p>
							<div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
								<span className="flex items-center gap-1"><IconMapPin className="size-4" /> {p.location}</span>
								<span className="flex items-center gap-1"><IconBriefcase className="size-4" /> {contextJob?.title || 'Job Match'}</span>
							</div>
						</div>

						{/* Top Metrics */}
						<div className="grid gap-4 md:grid-cols-3">
							<Card>
								<CardContent className="flex items-center justify-between p-6">
									<div>
										<p className="text-muted-foreground text-xs tracking-wider uppercase">Match score</p>
										<p className="mt-1 text-3xl font-semibold">{candidate.matchScore}%</p>
									</div>
									<CircularScoreProgress score={candidate.matchScore} />
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-6">
									<p className="text-muted-foreground text-xs tracking-wider uppercase">Ranking</p>
									<p className="mt-1 flex items-center text-3xl font-semibold">
										<IconTrophy className="mr-2 size-6 text-amber-600" />#{candidate.rank}
									</p>
								</CardContent>
							</Card>
							<Card>
								<CardContent className="p-6">
									<p className="text-muted-foreground text-xs tracking-wider uppercase">Coverage</p>
									<p className="mt-1 text-3xl font-semibold">{coveragePercent}%</p>
									<p className="text-muted-foreground mt-1 text-xs">Requirement alignment</p>
								</CardContent>
							</Card>
						</div>

						{/* Deep Analysis */}
						<Card>
							<CardHeader>
								<CardTitle className="font-lora flex items-center gap-2 text-xl">
									<IconSparkles className="text-primary size-5" /> AI Match Analysis
								</CardTitle>
								<CardDescription>
									Comprehensive breakdown of candidate fit and potential gaps.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="rounded-r-lg border-l-4 border-blue-500 bg-blue-50/60 p-5 text-base leading-relaxed italic">
									<MarkdownRenderer content={candidate.reasoning.recommendation} />
								</div>

								<div className="grid gap-6 md:grid-cols-2 pt-2">
									<div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
										<p className="text-sm font-semibold tracking-wide text-emerald-700 uppercase">Key strengths</p>
										<ul className="space-y-3 text-sm">
											{candidate.reasoning.strengths.map((strength: string, index: number) => (
												<li key={index} className="leading-relaxed flex gap-2">
													<span className="text-emerald-500 mt-0.5">•</span> <span>{strength}</span>
												</li>
											))}
										</ul>
									</div>
									<div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/40 p-5">
										<p className="text-sm font-semibold tracking-wide text-gray-700 uppercase">Potential gaps</p>
										<ul className="space-y-3 text-sm">
											{candidate.reasoning.gaps.map((gap: string, index: number) => (
												<li key={index} className="leading-relaxed flex gap-2">
													<span className="text-gray-400 mt-0.5">•</span> <span>{gap}</span>
												</li>
											))}
										</ul>
									</div>
								</div>

								{contextJob && (
									<div className="space-y-4 pt-6 border-t mt-6">
										<p className="text-muted-foreground flex items-center gap-2 text-sm font-medium tracking-wider uppercase">
											<IconBriefcase className="size-4" /> Requirement match breakdown
										</p>
										<div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
											{coverage.map((item: any) => (
												<div key={item.skill} className="flex items-center justify-between rounded-lg border px-4 py-3 text-sm bg-white">
													<span className="font-medium">{item.skill}</span>
													{item.matched ? (
														<span className="inline-flex items-center text-emerald-600 font-medium">
															<IconCircleCheck className="mr-1 size-4" /> Match
														</span>
													) : (
														<span className="text-muted-foreground text-xs font-medium bg-muted px-2 py-1 rounded-full">Partial</span>
													)}
												</div>
											))}
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				)}

				{activeTab === 'applicant' && (
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

						<div className="grid gap-6 lg:grid-cols-3">
							<div className="space-y-6 lg:col-span-2">
								<TalentProfileView profile={p} />
							</div>
						</div>
					</div>
				)}

				{activeTab === 'job' && contextJob && (
					<JobDetailsView job={contextJob} />
				)}
				
				<footer className="mt-20 text-center text-sm text-slate-400">
					© {new Date().getFullYear()} CogniCV Recruitment Platform. All rights reserved.
				</footer>
			</main>
		</div>
	);
}
