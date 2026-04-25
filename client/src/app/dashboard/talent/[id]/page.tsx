'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useMockTalentByIdQuery } from '@/hooks/query/jobs/queries';
import {
	IconLoader2,
	IconArrowLeft,
	IconDownload,
	IconShare,
	IconCopy
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { TalentProfileView } from '@/components/talent/talent-profile-view';
import { copyToClipboard } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function TalentProfilePage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const { data, isLoading } = useMockTalentByIdQuery(params.id);
	const profile = data?.data;

	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [generatedLink, setGeneratedLink] = useState('');

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
				<div>
					<p className="text-muted-foreground text-lg">Profile not found.</p>
					<Button asChild variant="link" className="mt-2">
						<Link href="/dashboard/jobs">Back to Dashboard</Link>
					</Button>
				</div>
			</div>
		);
	}

	const candidateName = `${profile.firstName} ${profile.lastName}`;

	const handleGenerateLink = () => {
		const baseUrl = window.location.origin;
		const link = `${baseUrl}/shared/talent/${profile._id}`;
		setGeneratedLink(link);
	};

	const handleCopyLink = () => {
		if (generatedLink) {
			copyToClipboard(generatedLink);
			toast.success('Link copied to clipboard');
		}
	};

	return (
		<div className="space-y-8">
			{/* Header Navigation */}
			<div className="flex flex-col items-center space-y-6 text-center">
				<div className="max-w-3xl space-y-4">
					<h1 className="font-lora text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
						{candidateName}
					</h1>
					<p className="text-xl leading-relaxed text-slate-500">
						{profile.headline}
					</p>
					<div className="flex items-center justify-center gap-3">
						<Badge
							variant="outline"
							className="bg-slate-50 px-3 py-1 text-sm font-medium"
						>
							{profile.source === 'internal'
								? 'Platform Profile'
								: 'Imported Profile'}
						</Badge>
						<Badge
							variant="outline"
							className="border-emerald-100 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
						>
							{profile.availability?.status || 'Available'}
						</Badge>

						<div className="flex flex-row items-center gap-2">
							<Dialog
								open={isShareModalOpen}
								onOpenChange={setIsShareModalOpen}
							>
								<DialogTrigger asChild>
									<Button
										variant="outline"
										size="sm"
										className="gap-2"
										onClick={handleGenerateLink}
									>
										<IconShare className="size-4" /> Share
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-md">
									<DialogHeader>
										<DialogTitle>Share Profile</DialogTitle>
										<DialogDescription>
											Anyone with this link will be able to view this
											candidate's full profile.
										</DialogDescription>
									</DialogHeader>
									<div className="flex items-center space-x-2 pt-4">
										<div className="grid flex-1 gap-2">
											<Input
												id="link"
												defaultValue={generatedLink}
												readOnly
												className="h-9"
											/>
										</div>
										<Button size="sm" className="px-3" onClick={handleCopyLink}>
											<span className="sr-only">Copy</span>
											<IconCopy className="h-4 w-4" />
										</Button>
									</div>
								</DialogContent>
							</Dialog>

							<Button variant="outline" size="sm" className="gap-2">
								<IconDownload className="size-4" /> Export
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Reusable Profile View Component */}
			<TalentProfileView profile={profile} />
		</div>
	);
}
