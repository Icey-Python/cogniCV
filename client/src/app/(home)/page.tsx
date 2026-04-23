'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
	IconArrowRight,
	IconBriefcase,
	IconBuilding,
	IconLayoutDashboard,
	IconMapPin,
	IconSparkles
} from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MyCookieConsent from '../../hooks/use-cookie-consent';
import { mockJobs } from '@/lib/mock-data';
import { formatDistanceToNow } from 'date-fns';

export default function Home() {
	const previewJobs = mockJobs.slice(0, 3);

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
						<div className="grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-center">
							<div>
								<Badge variant="accent" className="mb-4">
									<IconSparkles className="mr-1 size-3.5" />
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
											<IconBriefcase className="size-4" />
											Browse jobs
											<IconArrowRight className="size-4" />
										</Link>
									</Button>
									<Button asChild variant="outline">
										<Link href="/dashboard" className="gap-2">
											<IconLayoutDashboard className="size-4" />
											Open recruiter dashboard
										</Link>
									</Button>
								</div>
							</div>

							<div className="relative overflow-hidden rounded-2xl border border-border/70 bg-background/80 p-3">
								<Image
									src="/images/hero-placeholder.svg"
									alt="Preview illustration of the CogniCV recruiting workflow dashboard"
									width={1200}
									height={860}
									priority
									className="h-auto w-full rounded-xl border border-border/60 object-cover"
								/>
								<div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/55 to-transparent" />
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

					<section className="mt-12">
						<div className="flex items-center justify-between mb-6">
							<div>
								<h2 className="text-2xl font-semibold text-foreground">Featured Job Openings</h2>
								<p className="text-sm text-muted-foreground mt-1">Discover some of the latest opportunities available.</p>
							</div>
							<Button asChild variant="outline">
								<Link href="/jobs" className="gap-2">
									See all openings
									<IconArrowRight className="size-4" />
								</Link>
							</Button>
						</div>

						<div className="grid gap-4 md:grid-cols-3">
							{previewJobs.map((job) => (
								<Link
									key={job.id}
									href="/jobs"
									className="group rounded-2xl border border-border/70 bg-card/85 p-5 transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-md"
								>
									<div className="flex items-start justify-between gap-3">
										<div>
											<h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
												{job.title}
											</h3>
											<p className="mt-2 inline-flex items-center gap-2 text-sm text-muted-foreground">
												<IconBuilding className="size-4" />
												{job.company}
											</p>
										</div>
									</div>

									<p className="mt-4 line-clamp-2 text-sm text-muted-foreground">
										{job.summary}
									</p>

									<div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
										<span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
											<IconMapPin className="size-3.5" />
											{job.location}
										</span>
										<span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1">
											<IconBriefcase className="size-3.5" />
											{job.type}
										</span>
									</div>
								</Link>
							))}
						</div>
					</section>
				</div>
			</main>
		</>
	);
}
