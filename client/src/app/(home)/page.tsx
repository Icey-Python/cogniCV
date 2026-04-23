'use client';

import Link from 'next/link';
import {
	ArrowRight,
	Brain,
	BriefcaseBusiness,
	LayoutDashboard,
	Sparkles,
	Upload
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MyCookieConsent from '../../hooks/use-cookie-consent';

export default function Home() {
	return (
		<>
			<MyCookieConsent />
			<main className="relative min-h-screen overflow-hidden bg-background px-4 py-10 md:px-8 md:py-16">
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute -left-16 top-10 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
					<div className="absolute right-0 top-40 h-72 w-72 rounded-full bg-accent/80 blur-3xl" />
				</div>

				<div className="relative mx-auto max-w-7xl">
					<section className="animate-rise-in overflow-hidden rounded-3xl border border-border/70 bg-card/90 p-6 shadow-sm md:p-10">
						<div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
							<div>
								<Badge variant="accent" className="mb-4">
									<Sparkles className="mr-1 size-3.5" />
									AI Talent Screening Platform
								</Badge>
								<h1 className="font-serif text-4xl leading-tight text-foreground md:text-6xl md:leading-tight">
									Modern hiring workflows for candidate and recruiter teams
								</h1>
								<p className="mt-4 max-w-2xl text-sm text-muted-foreground md:text-base">
									Explore open job opportunities, upload documents for analysis,
									then switch to the recruiter dashboard to shortlist with clear
									reasoning cards.
								</p>
								<div className="mt-6 flex flex-wrap gap-3">
									<Button asChild>
										<Link href="/jobs" className="gap-2">
											<BriefcaseBusiness className="size-4" />
											Browse jobs
											<ArrowRight className="size-4" />
										</Link>
									</Button>
									<Button asChild variant="outline">
										<Link href="/dashboard" className="gap-2">
											<LayoutDashboard className="size-4" />
											Open recruiter dashboard
										</Link>
									</Button>
								</div>
							</div>

							<div className="space-y-3 rounded-2xl border border-border/70 bg-background/80 p-4">
								<div className="rounded-xl border border-border/70 bg-card/70 p-4">
									<p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
										<Upload className="size-4 text-primary" />
										Candidate apply flow
									</p>
									<p className="mt-2 text-sm text-muted-foreground">
										Open role details, upload your resume, and submit for AI
										analysis.
									</p>
								</div>
								<div className="rounded-xl border border-border/70 bg-card/70 p-4">
									<p className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
										<Brain className="size-4 text-primary" />
										Recruiter decision engine
									</p>
									<p className="mt-2 text-sm text-muted-foreground">
										Run screening, compare scores, and inspect strengths and gaps
										per candidate.
									</p>
								</div>
							</div>
						</div>
					</section>

					<section className="mt-6 grid gap-4 md:grid-cols-3">
						<article className="rounded-2xl border border-border/70 bg-card/85 p-5">
							<p className="text-xs uppercase tracking-wide text-muted-foreground">
								1. Candidate side
							</p>
							<h2 className="mt-2 text-xl font-semibold text-foreground">
								Discover opportunities
							</h2>
							<p className="mt-2 text-sm text-muted-foreground">
								Filter listings, review detailed requirements, and apply with
								uploaded documents.
							</p>
						</article>
						<article className="rounded-2xl border border-border/70 bg-card/85 p-5">
							<p className="text-xs uppercase tracking-wide text-muted-foreground">
								2. Screening layer
							</p>
							<h2 className="mt-2 text-xl font-semibold text-foreground">
								AI-assisted analysis
							</h2>
							<p className="mt-2 text-sm text-muted-foreground">
								Scores and reasoning are generated for skills, experience,
								education, and availability.
							</p>
						</article>
						<article className="rounded-2xl border border-border/70 bg-card/85 p-5">
							<p className="text-xs uppercase tracking-wide text-muted-foreground">
								3. Recruiter side
							</p>
							<h2 className="mt-2 text-xl font-semibold text-foreground">
								Shortlist with confidence
							</h2>
							<p className="mt-2 text-sm text-muted-foreground">
								Use ranking controls, filters, and reasoning cards to make
								faster and clearer hiring decisions.
							</p>
						</article>
					</section>
				</div>
			</main>
		</>
	);
}
