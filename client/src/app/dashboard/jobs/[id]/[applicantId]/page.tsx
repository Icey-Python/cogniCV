'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { MOCK_JOBS, MOCK_RANKED_CANDIDATES } from '@/lib/mock-data';
import type { RankedCandidate, Skill } from '@/types';
import type { Job as ServiceJob } from '@/hooks/query/jobs/service';
import { CircularScoreProgress } from '@/components/jobs/ranked-applicants-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { copyToClipboard } from '@/lib/utils';
import {
	IconArrowLeft,
	IconBolt,
	IconBriefcase,
	IconCheck,
	IconCircleCheck,
	IconCopy,
	IconDownload,
	IconExternalLink,
	IconFileTypeJs,
	IconInfoCircle,
	IconMapPin,
	IconMessage,
	IconPaperclip,
	IconSparkles,
	IconTrophy,
	IconUsers,
	IconShare,
	IconLink
} from '@tabler/icons-react';
import { JobInfoDrawer } from '@/components/jobs/job-info-drawer';
import { toast } from 'sonner';

type ApplicantStatus =
	| 'Under Review'
	| 'Shortlisted'
	| 'Accepted for Interview'
	| 'Rejected';

function createObjectDownload(
	fileName: string,
	content: string,
	contentType: string
) {
	const blob = new Blob([content], { type: contentType });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement('a');
	anchor.href = url;
	anchor.download = fileName;
	document.body.appendChild(anchor);
	anchor.click();
	anchor.remove();
	URL.revokeObjectURL(url);
}

function hasSkill(profileSkills: Skill[], requiredSkill: string) {
	const needle = requiredSkill.toLowerCase();
	return profileSkills.some((skill) =>
		skill.name.toLowerCase().includes(needle)
	);
}

export default function ApplicantDetailPage() {
	const params = useParams();
	const jobId = params.id;
	const applicationId = params.applicantId;

	const entries = useMemo(() => {
		return Object.entries(MOCK_RANKED_CANDIDATES).flatMap(
			([entryJobId, candidates]) => {
				const job = MOCK_JOBS.find((item) => item._id === entryJobId);
				return candidates
					.filter(
						(candidate) => candidate.profileSnapshot._id === applicationId
					)
					.map((candidate) => ({
						jobId: entryJobId,
						job,
						candidate
					}));
			}
		);
	}, [params.id]);

	const selectedEntry = useMemo(() => {
		if (entries.length === 0) {
			return null;
		}

		if (jobId) {
			const byJob = entries.find((entry) => entry.jobId === jobId);
			if (byJob) {
				return byJob;
			}
		}

		return [...entries].sort(
			(a, b) => b.candidate.matchScore - a.candidate.matchScore
		)[0];
	}, [entries, jobId]);

	const candidate = selectedEntry?.candidate;
	const contextJob = selectedEntry?.job;
	const contextJobId = selectedEntry?.jobId;

	const peers = useMemo(() => {
		if (!contextJobId) {
			return [] as RankedCandidate[];
		}
		return [...(MOCK_RANKED_CANDIDATES[contextJobId] ?? [])].sort(
			(a, b) => a.rank - b.rank
		);
	}, [contextJobId]);

	const coverage = useMemo(() => {
		if (!candidate || !contextJob) {
			return [] as { skill: string; matched: boolean }[];
		}
		return contextJob.requiredSkills.map((requiredSkill) => ({
			skill: requiredSkill,
			matched: hasSkill(candidate.profileSnapshot.skills, requiredSkill)
		}));
	}, [candidate, contextJob]);

	const coveragePercent =
		coverage.length === 0
			? 0
			: Math.round(
					(coverage.filter((item) => item.matched).length / coverage.length) *
						100
				);

	const [status, setStatus] = useState<ApplicantStatus>('Under Review');
	const [statusSaved, setStatusSaved] = useState(false);
	const [jobInfoOpen, setJobInfoOpen] = useState(false);
	const [shareModalOpen, setShareModalOpen] = useState(false);
	const [shareType, setShareType] = useState('public');
	const [sharePassword, setSharePassword] = useState('');
	const [generatedLink, setGeneratedLink] = useState('');

	const recruiterDraft = useMemo(() => {
		if (!candidate || !contextJob) {
			return '';
		}

		const candidateName = `${candidate.profileSnapshot.firstName} ${candidate.profileSnapshot.lastName}`;
		const topStrength = candidate.strengths[0] || 'your profile quality';
		const keyGap = candidate.gaps[0] || 'the final fit details';

		return `Subject: Update on your application for ${contextJob.title}\n\nHi ${candidate.profileSnapshot.firstName},\n\nThank you for applying for the ${contextJob.title} role. After reviewing your profile, we were especially impressed by ${topStrength.toLowerCase()}.\n\nWe would like to discuss your fit further, including ${keyGap.toLowerCase()}.\n\nIf you are available, please reply with your interview availability for this week.\n\nBest regards,\nHiring Team`;
	}, [candidate, contextJob]);

	const [customMessage, setCustomMessage] = useState(recruiterDraft);

	if (!candidate) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Applicant Not Found</CardTitle>
					<CardDescription>
						This applicant was not found in current ranked candidate data.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild variant="outline">
						<Link href="/dashboard/applicants">
							<IconArrowLeft className="mr-2 size-4" /> Back to applicants
						</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	const p = candidate.profileSnapshot;
	const candidateName = `${p.firstName} ${p.lastName}`;
	const percentile =
		peers.length > 0
			? Math.max(
					1,
					Math.round(((peers.length - candidate.rank + 1) / peers.length) * 100)
				)
			: 0;

	const suggestedFeedback = [
		`Highlight ${candidate.strengths[0]?.toLowerCase() || 'your strongest fit point'} in the first interview stage.`,
		candidate.gaps[0]
			? `Validate risk around ${candidate.gaps[0].toLowerCase()} with one focused assessment question.`
			: 'Keep validation focused on team collaboration and delivery ownership.',
		`Probe readiness for ${contextJob?.experienceLevel || 'the'} role scope with examples of measurable impact.`
	];

	const handleAcceptForInterview = () => {
		setStatus('Accepted for Interview');
		setStatusSaved(true);
	};

	const handleCopyMessage = async () => {
		try {
			await navigator.clipboard.writeText(customMessage);
			setStatusSaved(true);
		} catch {
			setStatusSaved(false);
		}
	};

	const handleDownloadProfileJson = () => {
		createObjectDownload(
			`${p.firstName.toLowerCase()}-${p.lastName.toLowerCase()}-profile.json`,
			JSON.stringify(p, null, 2),
			'application/json'
		);
	};

	const handleDownloadExternalResume = () => {
		const content = [
			`${candidateName}`,
			`${p.headline}`,
			`Location: ${p.location}`,
			`Email: ${p.email}`,
			'',
			'Experience',
			...p.experience.map(
				(exp) =>
					`- ${exp.role} @ ${exp.company} (${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate})\n  ${exp.description}`
			),
			'',
			'Skills',
			...p.skills.map(
				(skill) => `- ${skill.name} (${skill.yearsOfExperience} years)`
			)
		].join('\n');

		createObjectDownload(
			`${p.firstName.toLowerCase()}-${p.lastName.toLowerCase()}-resume.txt`,
			content,
			'text/plain'
		);
	};

	const handleGenerateLink = () => {
		const baseUrl = window.location.origin;
		const link = `${baseUrl}/shared/analysis/${candidate.profileSnapshot._id}`;
		setGeneratedLink(link);
	};

	const handleCopyLink = () => {
		if (generatedLink) {
			copyToClipboard(generatedLink);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="space-y-2">
					<h1 className="font-lora text-3xl">{candidateName}</h1>
					<div className="flex items-center gap-3">
						<p className="text-muted-foreground max-w-3xl text-sm">
						{candidate.profileSource === 'platform'
							? 'Platform Profile'
							: 'External Applicant'} | {" "}
				    	 {p.headline}
						</p>
						<button
							onClick={() => setJobInfoOpen(true)}
							type="button"
							aria-label="Job info"
							className="cursor-pointer"
						>
							<IconInfoCircle size={16} />
						</button>
					</div>
				</div>
				<div className="flex items-center gap-2">
					<Badge variant="outline" className="font-medium border-primary border-t-0 border-x-0 rounded-none shadown-none py-2.5">
						{status}
					</Badge>
					<Button
						variant="default"
						onClick={() => setShareModalOpen(true)}
						className="mr-2 gap-2"
					>
						<IconShare className="size-4" /> Share Analysis
					</Button>
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
								{candidate.matchScore}%
							</p>
						</div>
						<CircularScoreProgress score={candidate.matchScore} />
					</CardContent>
				</Card>
				<Card className="md:col-span-1">
					<CardContent className="p-5">
						<p className="text-muted-foreground text-xs tracking-wider uppercase">
							Ranking
						</p>
						<p className="mt-1 flex items-center text-2xl font-semibold">
							<IconTrophy className="mr-2 size-5 text-amber-600" />#
							{candidate.rank}
						</p>
						<p className="text-muted-foreground mt-1 text-xs">
							Top {percentile}% in {contextJob?.title || 'the selected role'}{' '}
							applicant pool
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
							{p.availability.status}
						</p>
					</CardContent>
				</Card>
				<Card className="md:col-span-1">
					<CardContent className="p-5">
						<p className="text-muted-foreground text-xs tracking-wider uppercase">
							Coverage
						</p>
						<p className="mt-1 text-2xl font-semibold">{coveragePercent}%</p>
						<p className="text-muted-foreground mt-1 text-xs">
							Job requirement alignment
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-3">
				<div className="space-y-6 lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle className="font-lora flex items-center gap-2 text-lg">
								<IconSparkles className="text-primary size-4" /> AI Match
								Analysis
							</CardTitle>
							<CardDescription>
								Extended analysis between role requirements and candidate
								profile.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-5">
							<div className="rounded-r-lg border-l-4 border-blue-500 bg-blue-50/60 p-4 text-sm leading-relaxed italic">
								&ldquo;{candidate.recommendation}&rdquo;
							</div>

							{contextJob && (
								<div className="space-y-3">
									<p className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wider uppercase">
										<IconBriefcase className="size-3.5" /> Requirement match for{' '}
										{contextJob.title}
									</p>
									<div className="grid gap-2 sm:grid-cols-2">
										{coverage.map((item) => (
											<div
												key={item.skill}
												className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
											>
												<span>{item.skill}</span>
												{item.matched ? (
													<span className="inline-flex items-center text-emerald-600">
														<IconCircleCheck className="mr-1 size-3.5" /> Match
													</span>
												) : (
													<span className="text-muted-foreground">Partial</span>
												)}
											</div>
										))}
									</div>
								</div>
							)}

							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
									<p className="text-sm font-semibold text-emerald-700">
										Key strengths
									</p>
									<ul className="space-y-2 text-sm">
										{candidate.strengths.map((strength, index) => (
											<li key={index} className="leading-relaxed">
												• {strength}
											</li>
										))}
									</ul>
								</div>
								<div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50/40 p-4">
									<p className="text-sm font-semibold text-gray-700">
										Potential gaps
									</p>
									<ul className="space-y-2 text-sm">
										{candidate.gaps.map((gap, index) => (
											<li key={index} className="leading-relaxed">
												• {gap}
											</li>
										))}
									</ul>
								</div>
							</div>
						</CardContent>
					</Card>

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
								{suggestedFeedback.map((feedback, index) => (
									<li
										key={index}
										className="bg-muted/20 rounded-md border px-3 py-2"
									>
										{feedback}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				</div>

				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle className="font-lora text-lg">
								Applicant Workflow
							</CardTitle>
							<CardDescription>
								Update applicant status and trigger interview progression.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
									Current status
								</p>
								<Select
									value={status}
									onValueChange={(value) => {
										setStatus(value as ApplicantStatus);
										setStatusSaved(false);
									}}
								>
									<SelectTrigger>
										<SelectValue placeholder="Update status" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Under Review">Under Review</SelectItem>
										<SelectItem value="Shortlisted">Shortlisted</SelectItem>
										<SelectItem value="Accepted for Interview">
											Accepted for Interview
										</SelectItem>
										<SelectItem value="Rejected">Rejected</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<Button className="w-full" onClick={handleAcceptForInterview}>
								<IconCheck className="mr-2 size-4" /> Accept for interview
							</Button>
							{statusSaved && (
								<p className="text-xs text-emerald-600">
									Status/message updated for recruiter workflow.
								</p>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle className="font-lora text-lg">
								Custom Response Message
							</CardTitle>
							<CardDescription>
								Copy and send this email draft to the applicant.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<textarea
								value={customMessage}
								onChange={(event) => {
									setCustomMessage(event.target.value);
									setStatusSaved(false);
								}}
								rows={12}
								className="focus:ring-ring w-full resize-y rounded-md border bg-white p-3 text-xs leading-relaxed outline-none focus:ring-2"
							/>
							<div className="grid grid-cols-2 gap-2">
								<Button
									variant="outline"
									onClick={() => setCustomMessage(recruiterDraft)}
								>
									Reset draft
								</Button>
								<Button onClick={handleCopyMessage}>
									<IconCopy className="mr-2 size-4" /> Copy message
								</Button>
							</div>
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
							{candidate.profileSource === 'external' ? (
								<Button
									className="w-full"
									variant="outline"
									onClick={handleDownloadExternalResume}
								>
									<IconDownload className="mr-2 size-4" /> Download resume
								</Button>
							) : (
								<Button
									className="w-full"
									variant="outline"
									onClick={handleDownloadProfileJson}
								>
									<IconFileTypeJs className="mr-2 size-4" /> Download profile
									JSON
								</Button>
							)}

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
			<JobInfoDrawer
				job={(contextJob as unknown as ServiceJob) ?? null}
				open={jobInfoOpen}
				onOpenChange={setJobInfoOpen}
			/>
			<Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Share Analysis</DialogTitle>
						<DialogDescription>
							Share this candidate's AI analysis details. Read-only view.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label>Visibility</Label>
							<Select
								value={shareType}
								onValueChange={(val) => {
									setShareType(val);
									setGeneratedLink('');
								}}
							>
								<SelectTrigger>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="public">Public Link</SelectItem>
									<SelectItem value="protected">Password Protected</SelectItem>
								</SelectContent>
							</Select>
						</div>
						{shareType === 'protected' && (
							<div className="grid gap-2">
								<Label htmlFor="password">Password</Label>
								<Input
									id="password"
									type="password"
									value={sharePassword}
									onChange={(e) => setSharePassword(e.target.value)}
									placeholder="Set a password..."
								/>
							</div>
						)}
						<Button onClick={handleGenerateLink} className="mt-2 w-full">
							<IconLink className="mr-2 size-4" /> Generate Link
						</Button>
						{generatedLink && (
							<div className="mt-4 flex items-center gap-2">
								<Input
									value={generatedLink}
									readOnly
									className="bg-muted text-muted-foreground"
								/>
								<Button
									size="icon"
									onClick={handleCopyLink}
									className="shrink-0"
								>
									<IconCopy className="size-4" />
								</Button>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
