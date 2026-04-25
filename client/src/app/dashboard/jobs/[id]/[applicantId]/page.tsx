'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import type { RankedCandidate, Skill, TalentProfile } from '@/types';
import { useJobQuery, useJobApplicantsQuery, useScreeningResultsQuery } from '@/hooks/query/jobs/queries';
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
	IconShare,
	IconLink,
	IconLoader2,
	IconStar
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
	const params = useParams<{ id: string; applicantId: string }>();
	const jobId = params.id;
	const applicantId = params.applicantId;

	const { data: jobData, isLoading: jobLoading } = useJobQuery(jobId);
	const { data: applicantsData, isLoading: applicantsLoading } = useJobApplicantsQuery(jobId);
	const { data: screeningData, isLoading: screeningLoading } = useScreeningResultsQuery(jobId);

	const job = jobData?.data;
	const allApplicants = useMemo(() => {
		if (!applicantsData?.data) return [];
		return [...applicantsData.data.external, ...applicantsData.data.platform];
	}, [applicantsData]);

	const candidateProfile = useMemo(() => {
		return allApplicants.find(a => a._id === applicantId);
	}, [allApplicants, applicantId]);

	const rankedEntry = useMemo(() => {
		if (!screeningData?.data) return null;
		return screeningData.data.rankedCandidates.find(c => c.candidateId === applicantId || c.profileSnapshot._id === applicantId);
	}, [screeningData, applicantId]);

	const isScreened = !!rankedEntry;

	const peers = useMemo(() => {
		return screeningData?.data?.rankedCandidates || [];
	}, [screeningData]);

	const coverage = useMemo(() => {
		if (!candidateProfile || !job) {
			return [] as { skill: string; matched: boolean }[];
		}
		return job.requiredSkills.map((requiredSkill) => ({
			skill: requiredSkill,
			matched: hasSkill(candidateProfile.skills || [], requiredSkill)
		}));
	}, [candidateProfile, job]);

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
		if (!candidateProfile || !job) return '';

		const candidateName = `${candidateProfile.firstName || ''} ${candidateProfile.lastName || ''}`.trim() || 'Candidate';
		const topStrength = rankedEntry?.reasoning.strengths[0] || 'your profile quality';
		const keyGap = rankedEntry?.reasoning.gaps[0] || 'the final fit details';

		return `Subject: Update on your application for ${job.title}\n\nHi ${candidateProfile.firstName || 'there'},\n\nThank you for applying for the ${job.title} role. After reviewing your profile, we were especially impressed by ${topStrength.toLowerCase()}.\n\nWe would like to discuss your fit further, including ${keyGap.toLowerCase()}.\n\nIf you are available, please reply with your interview availability for this week.\n\nBest regards,\nHiring Team`;
	}, [candidateProfile, job, rankedEntry]);

	const [customMessage, setCustomMessage] = useState('');

	// Update custom message when recruiterDraft changes
	useMemo(() => {
		if (recruiterDraft && !customMessage) {
			setCustomMessage(recruiterDraft);
		}
	}, [recruiterDraft]);

	if (jobLoading || applicantsLoading) {
		return (
			<div className="flex justify-center py-20 text-muted-foreground">
				<IconLoader2 className="mr-2 size-6 animate-spin" />
				Loading applicant details...
			</div>
		);
	}

	if (!candidateProfile) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Applicant Not Found</CardTitle>
					<CardDescription>
						This applicant was not found for the selected job.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<Button asChild variant="outline">
						<Link href={`/dashboard/jobs/${jobId}`}>
							<IconArrowLeft className="mr-2 size-4" /> Back to job dashboard
						</Link>
					</Button>
				</CardContent>
			</Card>
		);
	}

	const p = candidateProfile;
	const candidateName = `${p.firstName || ''} ${p.lastName || ''}`.trim() || 'Anonymous Applicant';
	
	const percentile = (isScreened && rankedEntry)
		? Math.max(1, Math.round(((peers.length - rankedEntry.rank + 1) / peers.length) * 100))
		: 0;

	const suggestedFeedback = isScreened && rankedEntry ? [
		`Highlight ${rankedEntry.reasoning.strengths[0]?.toLowerCase() || 'your strongest fit point'} in the first interview stage.`,
		rankedEntry.reasoning.gaps[0]
			? `Validate risk around ${rankedEntry.reasoning.gaps[0].toLowerCase()} with one focused assessment question.`
			: 'Keep validation focused on team collaboration and delivery ownership.',
		`Probe readiness for ${job?.experienceLevel || 'the'} role scope with examples of measurable impact.`
	] : [
		'Analysis pending. Run AI screening to see tailored feedback points.',
		'Focus initial screening on core technical competence and cultural alignment.',
		'Verify availability and start date expectations.'
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
			`${(p.firstName || 'applicant').toLowerCase()}-${(p.lastName || 'profile').toLowerCase()}.json`,
			JSON.stringify(p, null, 2),
			'application/json'
		);
	};

	const handleDownloadExternalResume = () => {
		const content = [
			`${candidateName}`,
			`${p.headline || ''}`,
			`Location: ${p.location || 'Not specified'}`,
			`Email: ${p.email || 'Not specified'}`,
			'',
			'Experience',
			...(p.experience || []).map(
				(exp) =>
					`- ${exp.role} @ ${exp.company} (${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate || ''})\n  ${exp.description}`
			),
			'',
			'Skills',
			...(p.skills || []).map(
				(skill) => `- ${skill.name} (${skill.yearsOfExperience} years)`
			)
		].join('\n');

		createObjectDownload(
			`${(p.firstName || 'applicant').toLowerCase()}-${(p.lastName || 'resume').toLowerCase()}.txt`,
			content,
			'text/plain'
		);
	};

	const handleGenerateLink = () => {
		const baseUrl = window.location.origin;
		const link = `${baseUrl}/shared/analysis/${p._id}`;
		setGeneratedLink(link);
	};

	const handleCopyLink = () => {
		if (generatedLink) {
			copyToClipboard(generatedLink);
			toast.success('Link copied to clipboard');
		}
	};

	return (
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
					<Badge variant="outline" className="font-medium border-primary border-t-0 border-x-0 rounded-none shadow-none py-2.5">
						{status}
					</Badge>
					<Button
						variant="default"
						onClick={() => setShareModalOpen(true)}
						className="mr-2 gap-2"
						disabled={!isScreened}
					>
						<IconShare className="size-4" /> Share Analysis
					</Button>
				</div>
			</div>

			{!isScreened && (
				<Card className="bg-primary/5 border-primary/20">
					<CardContent className="flex items-center justify-between p-6">
						<div className="flex items-center gap-4">
							<div className="size-12 rounded-full bg-primary/10 flex items-center justify-center">
								<IconSparkles className="size-6 text-primary" />
							</div>
							<div>
								<h3 className="text-lg font-semibold">Analysis Pending</h3>
								<p className="text-sm text-muted-foreground">This candidate hasn't been screened by AI yet. All match scores and analysis are currently unavailable.</p>
							</div>
						</div>
						<Button asChild variant="outline" size="sm">
							<Link href={`/dashboard/jobs/${jobId}`}>Go to dashboard to screen</Link>
						</Button>
					</CardContent>
				</Card>
			)}

			<div className="grid gap-4 md:grid-cols-4">
				<Card className="md:col-span-1">
					<CardContent className="flex items-center justify-between p-5">
						<div>
							<p className="text-muted-foreground text-xs tracking-wider uppercase">
								Match score
							</p>
							<p className="mt-1 text-2xl font-semibold">
								{isScreened ? `${rankedEntry?.matchScore}%` : 'N/A'}
							</p>
						</div>
						<CircularScoreProgress score={rankedEntry?.matchScore || 0} />
					</CardContent>
				</Card>
				<Card className="md:col-span-1">
					<CardContent className="p-5">
						<p className="text-muted-foreground text-xs tracking-wider uppercase">
							Ranking
						</p>
						<p className="mt-1 flex items-center text-2xl font-semibold">
							<IconTrophy className="mr-2 size-5 text-amber-600" />
							{isScreened ? `#${rankedEntry?.rank}` : '-'}
						</p>
						<p className="text-muted-foreground mt-1 text-xs">
							{isScreened 
								? `Top ${percentile}% in ${job?.title || 'this role'} pool`
								: 'Rank not available'}
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
							{isScreened && rankedEntry ? (
								<div className="rounded-r-lg border-l-4 border-blue-500 bg-blue-50/60 p-4 text-sm leading-relaxed italic">
									&ldquo;{rankedEntry.reasoning.recommendation}&rdquo;
								</div>
							) : (
								<div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
									<IconInfoCircle className="mx-auto size-8 opacity-20 mb-3" />
									<p className="text-sm italic">Detailed AI recommendation will appear here after screening.</p>
								</div>
							)}

							{job && (
								<div className="space-y-3">
									<p className="text-muted-foreground flex items-center gap-2 text-xs font-medium tracking-wider uppercase">
										<IconBriefcase className="size-3.5" /> Requirement match for{' '}
										{job.title}
									</p>
									<div className="grid gap-2 sm:grid-cols-2">
										{coverage.map((item) => (
											<div
												key={item.skill}
												className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
											>
												<span>{item.skill}</span>
												{item.matched ? (
													<span className="inline-flex items-center text-emerald-600 font-medium">
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

							{isScreened && rankedEntry && (
								<div className="grid gap-4 sm:grid-cols-2">
									<div className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
										<p className="text-sm font-semibold text-emerald-700">
											Key strengths
										</p>
										<ul className="space-y-2 text-sm">
											{rankedEntry.reasoning.strengths.map((strength, index) => (
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
											{rankedEntry.reasoning.gaps.map((gap, index) => (
												<li key={index} className="leading-relaxed">
													• {gap}
												</li>
											))}
										</ul>
									</div>
								</div>
							)}
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

					<Card>
						<CardHeader>
							<CardTitle className="font-lora flex items-center gap-2 text-lg">
								<IconStar className="size-4" /> Detailed Breakdown
							</CardTitle>
							<CardDescription>
								Score distribution across key evaluation metrics.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
								{[
									{ label: 'Skills', score: (rankedEntry?.subScores as any)?.skillMatch ?? (rankedEntry?.subScores as any)?.skills ?? 0, max: 40 },
									{ label: 'Experience', score: (rankedEntry?.subScores as any)?.experienceRelevance ?? (rankedEntry?.subScores as any)?.experience ?? 0, max: 30 },
									{ label: 'Education', score: (rankedEntry?.subScores as any)?.educationalAlignment ?? (rankedEntry?.subScores as any)?.education ?? 0, max: 15 },
									{ label: 'Availability', score: (rankedEntry?.subScores as any)?.culturalFit ?? (rankedEntry?.subScores as any)?.availability ?? 0, max: 15 }
								].map(({ label, score, max }) => (
									<div key={label} className="flex flex-col items-center justify-center rounded-lg border bg-gray-50/50 p-4 text-center">
										<CircularScoreProgress score={score} max={max} />
										<span className="text-muted-foreground mt-2 text-[10px] font-medium tracking-wider uppercase">
											{label}
										</span>
									</div>
								))}
							</div>
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
								<p className="text-xs text-emerald-600 mt-2">
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
								placeholder="Drafting recruiter message..."
							/>
							<div className="grid grid-cols-2 gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCustomMessage(recruiterDraft)}
								>
									Reset draft
								</Button>
								<Button size="sm" onClick={handleCopyMessage}>
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
							{p.source !== 'internal' ? (
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
				job={job ?? null}
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
