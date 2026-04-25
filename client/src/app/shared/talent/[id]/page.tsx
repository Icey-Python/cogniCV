'use client';

import { useParams } from 'next/navigation';
import { useMockTalentByIdQuery } from '@/hooks/query/jobs/queries';
import { IconLoader2, IconSparkles } from '@tabler/icons-react';
import { TalentProfileView } from '@/components/talent/talent-profile-view';
import Image from 'next/image';

export default function SharedTalentProfilePage() {
	const params = useParams<{ id: string }>();
	const { data, isLoading } = useMockTalentByIdQuery(params.id);
	const profile = data?.data;

	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<IconLoader2 className="text-primary size-8 animate-spin" />
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="flex h-screen items-center justify-center text-center">
				<p className="text-muted-foreground text-lg">Profile not found or no longer available.</p>
			</div>
		);
	}

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
							CogniCV <span className="text-primary">Talent</span>
						</span>
					</div>
					<div className="text-xs font-medium text-slate-400">
						Shared via Recruitment Portal
					</div>
				</div>
			</header>

			<main className="mx-auto max-w-5xl px-6 pt-10">
				{/* Public Hero */}
				<div className="mb-10 flex flex-col items-center text-center">
					<h1 className="font-lora text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
						{profile.firstName} {profile.lastName}
					</h1>
					<p className="mt-4 text-xl text-slate-500 max-w-2xl">
						{profile.headline}
					</p>
					<div className="mt-6 flex flex-wrap justify-center gap-3">
						<div className="flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-medium border shadow-sm text-slate-600">
							{profile.location || 'Remote'}
						</div>
						<div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-medium border border-emerald-100 text-emerald-700">
							{profile.availability?.status || 'Available'}
						</div>
					</div>
				</div>

				{/* Shared Profile Content */}
				<TalentProfileView profile={profile} />
				
				<footer className="mt-20 text-center text-sm text-slate-400">
					© {new Date().getFullYear()} CogniCV Recruitment Platform. All rights reserved.
				</footer>
			</main>
		</div>
	);
}
