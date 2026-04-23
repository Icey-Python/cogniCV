'use client';

import { type RankedCandidate } from '@/types';
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetDescription,
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
	IconBolt,
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
			<div className="flex items-center justify-center size-8 rounded-full bg-white border border-amber-200 text-amber-600 font-bold text-sm">
				<IconTrophy className="size-4" />
			</div>
		);
	}
	return (
		<div className="flex items-center justify-center size-8 rounded-full bg-white border border-border text-muted-foreground font-bold text-sm">
			{rank}
		</div>
	);
}

export function ApplicantInsightDrawer({
	candidate,
	open,
	onOpenChange,
}: ApplicantInsightDrawerProps) {
	if (!candidate) return null;

	const { profileSnapshot: p, subScores, strengths, gaps, recommendation, matchScore, rank, profileSource } = candidate;
	const initials = `${p.firstName[0]}${p.lastName[0]}`;

	const scoreColor =
		matchScore >= 90 ? 'text-emerald-600' : matchScore >= 75 ? 'text-primary' : matchScore >= 60 ? 'text-amber-600' : 'text-red-500';

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full sm:max-w-lg p-0 flex flex-col gap-0 border-l border-border bg-white" side="right">
				{/* Header */}
				<div className="flex items-start gap-4 p-6 border-b border-border bg-white">
					<div className="relative">
						<div className="size-14 rounded-xl border border-border bg-white flex items-center justify-center text-lg font-bold text-primary">
							{initials}
						</div>
						<div className="absolute -bottom-1 -right-1">
							<RankBadge rank={rank} />
						</div>
					</div>
					<div className="flex-1 min-w-0">
						<SheetTitle className="text-xl font-serif">
							{p.firstName} {p.lastName}
						</SheetTitle>
						<SheetDescription className="text-sm mt-0.5">{p.headline}</SheetDescription>
						<div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
							<span className="flex items-center gap-1">
								{profileSource === 'platform' ? <IconBolt className="size-3.5 text-primary" /> : <IconExternalLink className="size-3.5" />}
								{profileSource === 'platform' ? 'Platform' : 'External'}
							</span>
							<span>{p.location}</span>
							<span className={p.availability.status === 'Available' ? 'text-emerald-600' : ''}>
								{p.availability.status}
							</span>
						</div>
					</div>
				</div>

				<ScrollArea className="flex-1 bg-white">
					<div className="p-6 space-y-8">
						{/* Match Score & Breakdown Grid */}
						<div className="grid grid-cols-2 gap-6">
							<div className="flex flex-col items-center justify-center rounded-lg border border-border p-6 text-center">
								<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-4">Overall Match</p>
								<div className="scale-150 transform">
									<CircularScoreProgress score={matchScore} />
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								{[
									{ label: 'Skills', score: subScores.skills },
									{ label: 'Experience', score: subScores.experience },
									{ label: 'Education', score: subScores.education },
									{ label: 'Availability', score: subScores.availability },
								].map(({ label, score }) => (
									<div key={label} className="flex flex-col items-center justify-center rounded-lg border border-border p-3 text-center">
										<CircularScoreProgress score={score} />
										<span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-2">{label}</span>
									</div>
								))}
							</div>
						</div>

						{/* AI Recommendation */}
						<div className="space-y-3">
							<h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
								<IconStar className="size-3.5 text-primary" /> AI Recommendation
							</h4>
							<blockquote className="border-l-4 border-primary pl-4 py-1 text-sm italic leading-relaxed text-foreground">
								&ldquo;{recommendation}&rdquo;
							</blockquote>
						</div>

						{/* Strengths & Gaps */}
						<div className="grid gap-6 sm:grid-cols-2">
							<div className="space-y-3">
								<h4 className="text-xs font-medium uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
									<IconCircleCheck className="size-3.5" /> Strengths
								</h4>
								<ul className="space-y-3">
									{strengths.map((s, i) => (
										<li key={i} className="flex items-start gap-2 text-sm border-l-2 border-emerald-500 pl-3 py-0.5">
											<span className="leading-snug">{s}</span>
										</li>
									))}
								</ul>
							</div>
							<div className="space-y-3">
								<h4 className="text-xs font-medium uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
									<IconAlertTriangle className="size-3.5" /> Gaps
								</h4>
								<ul className="space-y-3">
									{gaps.map((g, i) => (
										<li key={i} className="flex items-start gap-2 text-sm border-l-2 border-amber-500 pl-3 py-0.5">
											<span className="leading-snug">{g}</span>
										</li>
									))}
								</ul>
							</div>
						</div>

						{/* Skills */}
						<div className="space-y-2">
							<h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Skills</h4>
							<div className="flex flex-wrap gap-2">
								{p.skills.map((skill) => (
									<span
										key={skill.name}
										className="text-xs px-2 py-0.5 rounded-md bg-primary/5 text-primary/80 border border-primary/10"
									>
										{skill.name}
										<span className="ml-1 text-muted-foreground">{skill.yearsOfExperience}y</span>
									</span>
								))}
							</div>
						</div>

						{/* Experience */}
						{p.experience.length > 0 && (
							<div className="space-y-2">
								<h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Experience</h4>
								<div className="space-y-3">
									{p.experience.map((exp, i) => (
										<div key={i} className="rounded-lg border p-3 space-y-1">
											<div className="flex items-center justify-between">
												<p className="text-sm font-semibold">{exp.role}</p>
												{exp.isCurrent && (
													<span className="text-[10px] text-emerald-600 border border-emerald-200 rounded px-1.5 py-0.5">
														Current
													</span>
												)}
											</div>
											<p className="text-xs text-muted-foreground">
												{exp.company} &middot; {exp.startDate} &ndash; {exp.isCurrent ? 'Present' : exp.endDate}
											</p>
											<p className="text-xs text-muted-foreground leading-relaxed">{exp.description}</p>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Social links */}
						{p.socialLinks && (
							<div className="flex gap-2 pt-2 border-t">
								{p.socialLinks.linkedin && (
									<Button variant="outline" size="sm" asChild>
										<a href={p.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
											LinkedIn <IconExternalLink className="ml-1.5 size-3" />
										</a>
									</Button>
								)}
								{p.socialLinks.github && (
									<Button variant="outline" size="sm" asChild>
										<a href={p.socialLinks.github} target="_blank" rel="noopener noreferrer">
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
