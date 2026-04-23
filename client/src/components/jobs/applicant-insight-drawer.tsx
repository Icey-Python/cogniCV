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

interface ApplicantInsightDrawerProps {
	candidate: RankedCandidate | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

function ScoreBar({ score }: { score: number }) {
	const getColor = (s: number) => {
		if (s >= 90) return 'bg-emerald-500';
		if (s >= 75) return 'bg-primary';
		if (s >= 60) return 'bg-amber-500';
		return 'bg-red-500';
	};

	return (
		<div className="flex items-center gap-3">
			<div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
				<div
					className={cn('h-full rounded-full transition-all duration-700', getColor(score))}
					style={{ width: `${score}%` }}
				/>
			</div>
			<span className="text-sm font-bold tabular-nums w-9 text-right">{score}</span>
		</div>
	);
}

function RankBadge({ rank }: { rank: number }) {
	if (rank === 1) {
		return (
			<div className="flex items-center justify-center size-8 rounded-full bg-amber-50 border border-amber-200 text-amber-600 font-bold text-sm">
				<IconTrophy className="size-4" />
			</div>
		);
	}
	return (
		<div className="flex items-center justify-center size-8 rounded-full bg-muted border border-border text-muted-foreground font-bold text-sm">
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
			<SheetContent className="w-full sm:max-w-lg p-0 flex flex-col gap-0" side="right">
				{/* Header */}
				<div className="flex items-start gap-4 p-6 border-b">
					<div className="relative">
						<div className="size-14 rounded-xl bg-primary/10 flex items-center justify-center text-lg font-bold text-primary">
							{initials}
						</div>
						<div className="absolute -bottom-1 -right-1">
							<RankBadge rank={rank} />
						</div>
					</div>
					<div className="flex-1 min-w-0">
						<SheetTitle className="text-xl">
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

				<ScrollArea className="flex-1">
					<div className="p-6 space-y-6">
						{/* Match Score */}
						<div className="rounded-lg border p-5 text-center space-y-1">
							<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">AI Match Score</p>
							<p className={cn('text-5xl font-black tabular-nums', scoreColor)}>{matchScore}</p>
							<p className="text-xs text-muted-foreground">out of 100</p>
						</div>

						{/* Score breakdown */}
						<div className="space-y-3">
							<h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
								<IconChartBar className="size-3.5" /> Score Breakdown
							</h4>
							<div className="rounded-lg border p-4 space-y-3">
								{[
									{ icon: IconBolt, label: 'Skills', score: subScores.skills, weight: '40%' },
									{ icon: IconBriefcase, label: 'Experience', score: subScores.experience, weight: '30%' },
									{ icon: IconSchool, label: 'Education', score: subScores.education, weight: '15%' },
									{ icon: IconClock, label: 'Availability', score: subScores.availability, weight: '15%' },
								].map(({ icon: Icon, label, score, weight }) => (
									<div key={label} className="space-y-1">
										<div className="flex justify-between items-center text-sm">
											<span className="flex items-center gap-1.5 font-medium">
												<Icon className="size-3.5 text-muted-foreground" />
												{label}
											</span>
											<span className="text-[11px] text-muted-foreground">{weight}</span>
										</div>
										<ScoreBar score={score} />
									</div>
								))}
							</div>
						</div>

						{/* AI Recommendation */}
						<div className="space-y-2">
							<h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
								<IconStar className="size-3.5" /> AI Recommendation
							</h4>
							<blockquote className="rounded-lg border-l-4 border-primary bg-primary/5 p-4 text-sm italic leading-relaxed">
								&ldquo;{recommendation}&rdquo;
							</blockquote>
						</div>

						{/* Strengths */}
						<div className="space-y-2">
							<h4 className="text-xs font-medium uppercase tracking-wider text-emerald-600 flex items-center gap-1.5">
								<IconCircleCheck className="size-3.5" /> Strengths
							</h4>
							<ul className="space-y-2">
								{strengths.map((s, i) => (
									<li key={i} className="flex items-start gap-2 text-sm bg-emerald-50 p-3 rounded-lg border border-emerald-100">
										<IconCircleCheck className="size-4 text-emerald-500 shrink-0 mt-0.5" />
										<span>{s}</span>
									</li>
								))}
							</ul>
						</div>

						{/* Gaps */}
						<div className="space-y-2">
							<h4 className="text-xs font-medium uppercase tracking-wider text-amber-600 flex items-center gap-1.5">
								<IconAlertTriangle className="size-3.5" /> Gaps
							</h4>
							<ul className="space-y-2">
								{gaps.map((g, i) => (
									<li key={i} className="flex items-start gap-2 text-sm bg-amber-50 p-3 rounded-lg border border-amber-100">
										<IconAlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
										<span>{g}</span>
									</li>
								))}
							</ul>
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
