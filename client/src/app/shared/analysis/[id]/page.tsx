'use client';

import { useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MOCK_JOBS, MOCK_RANKED_CANDIDATES } from '@/lib/mock-data';
import { PasswordGate } from '@/components/shared/password-gate';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CircularScoreProgress } from '@/components/jobs/ranked-applicants-table';
import { IconBriefcase, IconCircleCheck, IconMapPin, IconSparkles, IconTrophy } from '@tabler/icons-react';
import { type Skill } from '@/types';

function hasSkill(profileSkills: Skill[], requiredSkill: string) {
	const needle = requiredSkill.toLowerCase();
	return profileSkills.some((skill) =>
		skill.name.toLowerCase().includes(needle)
	);
}

export default function SharedAnalysisPage() {
	const params = useParams<{ id: string }>();
	
	const entries = useMemo(() => {
		return Object.entries(MOCK_RANKED_CANDIDATES).flatMap(
			([entryJobId, candidates]) => {
				const job = MOCK_JOBS.find((item) => item._id === entryJobId);
				return candidates
					.filter((candidate) => candidate.profileSnapshot._id === params.id)
					.map((candidate) => ({
						jobId: entryJobId,
						job,
						candidate
					}));
			}
		);
	}, [params.id]);

	const selectedEntry = entries[0];
	const candidate = selectedEntry?.candidate;
	const contextJob = selectedEntry?.job;

	if (!candidate) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="w-full max-w-md text-center">
					<CardContent className="pt-6">
						<h2 className="text-xl font-semibold mb-2">Analysis Not Found</h2>
						<p className="text-muted-foreground">This candidate profile could not be located.</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	const p = candidate.profileSnapshot;
	const candidateName = `${p.firstName} ${p.lastName}`;

	const coverage = contextJob ? contextJob.requiredSkills.map((requiredSkill) => ({
		skill: requiredSkill,
		matched: hasSkill(candidate.profileSnapshot.skills, requiredSkill)
	})) : [];

	const coveragePercent = coverage.length === 0 ? 0 : Math.round((coverage.filter((item) => item.matched).length / coverage.length) * 100);

	return (
		<PasswordGate correctPassword="test">
			<div className="min-h-screen bg-muted/10 py-10 px-4">
				<div className="max-w-4xl mx-auto space-y-8">
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
								&ldquo;{candidate.recommendation}&rdquo;
							</div>

							<div className="grid gap-6 md:grid-cols-2 pt-2">
								<div className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
									<p className="text-sm font-semibold tracking-wide text-emerald-700 uppercase">Key strengths</p>
									<ul className="space-y-3 text-sm">
										{candidate.strengths.map((strength, index) => (
											<li key={index} className="leading-relaxed flex gap-2">
												<span className="text-emerald-500 mt-0.5">•</span> <span>{strength}</span>
											</li>
										))}
									</ul>
								</div>
								<div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50/40 p-5">
									<p className="text-sm font-semibold tracking-wide text-gray-700 uppercase">Potential gaps</p>
									<ul className="space-y-3 text-sm">
										{candidate.gaps.map((gap, index) => (
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
										{coverage.map((item) => (
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
			</div>
		</PasswordGate>
	);
}
