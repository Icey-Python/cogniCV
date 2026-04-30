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
	IconCopy,
	IconPrinter
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
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TalentProfilePDF } from '@/components/talent/TalentProfilePDF';

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
		}
	};

	return (
		<div className="mx-auto max-w-4xl space-y-8 rounded-lg border px-6 py-16">
			{/* Header Navigation */}
			<div className="flex flex-col space-y-6">
				<div className="space-y-1">
					<div className="flex items-center justify-between">
						<h1 className="font-lora text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
							{candidateName}
						</h1>

						<div className="flex flex-row items-center gap-2">
							<PDFDownloadLink
								document={<TalentProfilePDF profile={profile} />}
								fileName={`${profile.firstName}-${profile.lastName}-profile.pdf`}
							>
								{({ loading }) => (
									<Button variant="outline" className="gap-2" disabled={loading}>
										<IconPrinter className="size-4" />
										{loading ? 'Preparing...' : 'Download PDF'}
									</Button>
								)}
							</PDFDownloadLink>
							<Dialog
								open={isShareModalOpen}
								onOpenChange={setIsShareModalOpen}
							>
								<DialogTrigger asChild>
									<Button
										variant="outline"
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
						</div>
					</div>
					<p className="text-sm text-slate-500">{profile.headline}</p>
				</div>
			</div>

			{/* Reusable Profile View Component */}
			<TalentProfileView profile={profile} />
		</div>
	);
}
