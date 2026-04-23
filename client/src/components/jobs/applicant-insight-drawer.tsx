'use client';

import { type RankedCandidate } from '@/types';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
	IconCircleCheck,
	IconAlertTriangle,
	IconTrophy,
	IconBriefcase,
	IconSchool,
	IconClock,
	IconExternalLink,
	IconStar,
	IconChartBar,
	IconBolt
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

import { CircularScoreProgress } from '@/components/jobs/ranked-applicants-table';

interface ApplicantInsightDrawerProps {
	candidate: RankedCandidate | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function RankBadge({ rank }: { rank: number }) {
	if (rank === 1) {
		return (
			<div className="flex size-8 items-center justify-center rounded-full border border-amber-200 bg-white text-sm font-bold text-amber-600">
				<IconTrophy className="size-4" />
			</div>
		);
	}
	return (
		<div className="border-border text-muted-foreground flex size-8 items-center justify-center rounded-full border bg-white text-sm font-bold">
			{rank}
		</div>
	);
}

export function ApplicantInsightDrawer({
	candidate,
	open,
	onOpenChange
}: ApplicantInsightDrawerProps) {
	if (!candidate) return null;

	const {
		profileSnapshot: p,
		subScores,
		strengths,
		gaps,
		recommendation,
		matchScore,
		rank,
		profileSource
	} = candidate;
	const initials = `${p.firstName[0]}${p.lastName[0]}`;

	const scoreColor =
		matchScore >= 90
			? 'text-emerald-600'
			: matchScore >= 75
				? 'text-primary'
				: matchScore >= 60
					? 'text-amber-600'
					: 'text-red-500';

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				className="border-border flex w-full flex-col gap-0 border-l bg-white p-0 sm:max-w-lg"
				side="right"
			>
				{/* Header */}
				<div className="flex items-start gap-4 border-b border-gray-100 bg-white p-6">
					<div className="min-w-0 flex-1">
						<SheetTitle className="font-serif text-2xl">
							{p.firstName} {p.lastName}
						</SheetTitle>
						<SheetDescription className="mt-0.5 text-sm">
							{p.headline}
						</SheetDescription>
						<div className="text-muted-foreground mt-3 flex items-center gap-3 text-xs">
							<span className="flex items-center gap-1">
								{profileSource === 'platform' ? (
									<IconBolt className="text-primary size-3.5" />
								) : (
									<IconExternalLink className="size-3.5" />
								)}
								{profileSource === 'platform' ? 'Platform' : 'External'}
							</span>
							<span>{p.location}</span>
							<span
								className={
									p.availability.status === 'Available'
										? 'text-emerald-600'
										: ''
								}
							>
								{p.availability.status}
							</span>
						</div>
					</div>
				</div>

				<ScrollArea className="flex-1 bg-white">
					<div className="space-y-12 p-6">
						{/* Match Score & Breakdown Grid */}
						<div className="grid grid-cols-2 gap-4">
							<div className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-gray-50 p-6 text-center">
								<p className="text-muted-foreground mb-4 text-xs font-medium tracking-wider uppercase">
									Overall Match
								</p>
								<div className="scale-150 transform">
									<CircularScoreProgress score={matchScore} />
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								{[
									{ label: 'Skills', score: subScores.skills },
									{ label: 'Experience', score: subScores.experience },
									{ label: 'Education', score: subScores.education },
									{ label: 'Availability', score: subScores.availability }
								].map(({ label, score }) => (
									<div
										key={label}
										className="flex flex-col items-center justify-center rounded-lg border border-gray-100 bg-gray-50 p-3 text-center"
									>
										<CircularScoreProgress score={score} />
										<span className="text-muted-foreground mt-2 text-[10px] font-medium tracking-wider uppercase">
											{label}
										</span>
									</div>
								))}
							</div>
						</div>

						{/* AI Recommendation */}
						<div className="space-y-3">
							<h4 className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium tracking-wider uppercase">
								<IconStar className="text-primary size-3.5" /> AI Recommendation
							</h4>
							<blockquote className="border-primary text-foreground border-l-4 bg-gray-50 py-4 pl-4 text-sm leading-relaxed italic">
								&ldquo;{recommendation}&rdquo;
							</blockquote>
						</div>

						{/* Strengths & Gaps */}
						<div className="flex flex-col gap-4">
							<div className="space-y-3">
								<h4 className="flex items-center gap-1.5 text-sm font-medium tracking-wider text-emerald-600 uppercase">
									<IconCircleCheck className="size-3.5" /> Strengths
								</h4>
								<ul className="space-y-3">
									{strengths.map((s, i) => (
										<li
											key={i}
											className="flex items-start gap-2 border-l-2 border-gray-200 py-0.5 pl-3 text-sm"
										>
											<span className="leading-snug">{s}</span>
										</li>
									))}
								</ul>
							</div>
							<div className="space-y-3">
								<h4 className="flex items-center gap-1.5 text-sm font-medium tracking-wider text-amber-600 uppercase">
									<IconAlertTriangle className="size-3.5" /> Gaps
								</h4>
								<ul className="space-y-3">
									{gaps.map((g, i) => (
										<li
											key={i}
											className="flex items-start gap-2 border-l-2 border-gray-200 py-0.5 pl-3 text-sm"
										>
											<span className="leading-snug">{g}</span>
										</li>
									))}
								</ul>
							</div>
						</div>

						{/* Skills */}
						<div className="space-y-2">
							<h4 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
								Skills
							</h4>
							<div className="flex flex-wrap gap-2">
								{p.skills.map((skill) => (
									<span
										key={skill.name}
										className="bg-primary/5 text-primary/80 border-primary/10 rounded-md border px-2 py-0.5 text-xs"
									>
										{skill.name}
										<span className="text-muted-foreground ml-1">
											{skill.yearsOfExperience}y
										</span>
									</span>
								))}
							</div>
						</div>

						{/* Experience */}
						{p.experience.length > 0 && (
							<div className="space-y-2">
								<h4 className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
									Experience
								</h4>
								<div className="space-y-3">
									{p.experience.map((exp, i) => (
										<div key={i} className="space-y-1 rounded-lg border p-3">
											<div className="flex items-center justify-between">
												<p className="font-lora text-sm font-semibold">
													{exp.role}
												</p>
												{exp.isCurrent && (
													<span className="rounded border border-emerald-200 px-1.5 py-0.5 text-[10px] text-emerald-600">
														Current
													</span>
												)}
											</div>
											<p className="text-muted-foreground text-xs">
												{exp.company} &middot; {exp.startDate} &ndash;{' '}
												{exp.isCurrent ? 'Present' : exp.endDate}
											</p>
											<p className="text-muted-foreground text-xs leading-relaxed">
												{exp.description}
											</p>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Social links */}
						{p.socialLinks && (
							<div className="flex gap-2 pt-2">
								{p.socialLinks.linkedin && (
									<Button variant="outline" size="sm" asChild>
										<a
											href={p.socialLinks.linkedin}
											target="_blank"
											rel="noopener noreferrer"
										>
											LinkedIn <IconExternalLink className="ml-1.5 size-3" />
										</a>
									</Button>
								)}
								{p.socialLinks.github && (
									<Button variant="outline" size="sm" asChild>
										<a
											href={p.socialLinks.github}
											target="_blank"
											rel="noopener noreferrer"
										>
											GitHub <IconExternalLink className="ml-1.5 size-3" />
										</a>
									</Button>
								)}
							</div>
						)}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
