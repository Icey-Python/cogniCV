import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CandidateProfile } from '@/types/jobs';
import { IconSparkles, IconX } from '@tabler/icons-react';

export function CandidateInsightsDrawer({
	candidate,
	onClose
}: {
	candidate: CandidateProfile | null;
	onClose: () => void;
}) {
	return (
		<>
			<div
				className={cn(
					'fixed inset-0 z-40 bg-secondary/40 backdrop-blur-[2px] transition-opacity',
					candidate ? 'opacity-100' : 'pointer-events-none opacity-0'
				)}
				onClick={onClose}
			/>
			<aside
				className={cn(
					'fixed right-0 top-0 z-50 h-dvh w-full max-w-md overflow-y-auto border-l border-border bg-popover shadow-2xl transition-transform duration-300',
					candidate ? 'translate-x-0' : 'translate-x-full'
				)}
			>
				{candidate && (
					<div className="flex flex-col h-full">
						<div className="flex items-center justify-between p-6 border-b border-border/50">
							<div className="flex items-center gap-3">
								<div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
									{candidate.name.charAt(0)}
								</div>
								<div>
									<h2 className="font-semibold text-lg">{candidate.name}</h2>
									<p className="text-xs text-muted-foreground">Match Score: {candidate.matchScore}</p>
								</div>
							</div>
							<Button variant="ghost" size="icon" onClick={onClose}>
								<IconX className="size-4" />
							</Button>
						</div>

						<div className="flex-1 p-6 space-y-6">
							<div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
								<div className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary">
									<IconSparkles className="size-4" /> CogniCV AI Analysis
								</div>

								<div className="space-y-6">
									<div>
										<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
											Strengths
										</p>
										<ul className="space-y-2">
											{candidate.strengths.map((s) => (
												<li key={s} className="flex items-start gap-2 text-sm text-foreground">
													<span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-emerald-500" />
													{s}
												</li>
											))}
										</ul>
									</div>
									<div>
										<p className="mb-3 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
											Potential Gaps
										</p>
										<ul className="space-y-2">
											{candidate.gaps.map((g) => (
												<li key={g} className="flex items-start gap-2 text-sm text-foreground">
													<span className="mt-1 flex size-1.5 shrink-0 rounded-full bg-amber-500" />
													{g}
												</li>
											))}
										</ul>
									</div>
									<div className="rounded-lg bg-background/50 p-4 border border-border/50">
										<p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
											Recommendation
										</p>
										<p className="text-sm font-medium leading-relaxed text-foreground">
											{candidate.recommendation}
										</p>
									</div>
								</div>
							</div>

							<div>
								<h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
									Score Breakdown
								</h3>
								<div className="grid gap-4">
									{Object.entries(candidate.subScores).map(([key, value]) => (
										<div key={key}>
											<div className="mb-1.5 flex items-center justify-between text-xs font-medium text-foreground">
												<span className="capitalize">{key}</span>
												<span>{value}/100</span>
											</div>
											<div className="h-1.5 overflow-hidden rounded-full bg-muted">
												<div
													className="h-full rounded-full bg-primary"
													style={{ width: `${value}%` }}
												/>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				)}
			</aside>
		</>
	);
}
