'use client';

import { useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useJobQuery } from '@/hooks/query/jobs/queries';
import {
	useMockTalentQuery,
	useMockTalentByIdQuery
} from '@/hooks/query/jobs/queries';
import {
	useUploadInternalMutation,
	useUploadCsvMutation,
	useUploadPdfMutation
} from '@/hooks/query/jobs/mutations';
import { type TalentProfile } from '@/hooks/query/jobs/service';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
	IconBuilding,
	IconWorld,
	IconFileCv,
	IconInfoCircle,
	IconCheck,
	IconLoader2,
	IconArrowLeft,
	IconArrowRight,
	IconUpload,
	IconBrandLinkedin,
	IconBrandGithub,
	IconMapPin,
	IconBriefcase,
	IconUserCheck
} from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type Source = 'internal' | 'csv' | 'pdf';

export default function AddApplicantsPage() {
	const params = useParams<{ id: string }>();
	const router = useRouter();
	const jobId = params.id;

	const { data: jobData } = useJobQuery(jobId);
	const job = jobData?.data;

	const { data: mockData, isLoading: mockLoading } = useMockTalentQuery();
	const mockProfiles: TalentProfile[] = mockData?.data ?? [];

	const uploadInternal = useUploadInternalMutation();
	const uploadCsv = useUploadCsvMutation();
	const uploadPdf = useUploadPdfMutation();

	const [source, setSource] = useState<Source>('internal');
	const [selectedProfiles, setSelectedProfiles] = useState<TalentProfile[]>([]);
	const [jsonInput, setJsonInput] = useState('');
	const [jsonError, setJsonError] = useState('');
	const [submitted, setSubmitted] = useState(false);

	const csvInputRef = useRef<HTMLInputElement>(null);
	const pdfInputRef = useRef<HTMLInputElement>(null);

	// CSV state
	const [csvFile, setCsvFile] = useState<File | null>(null);
	// PDF state
	const [pdfFiles, setPdfFiles] = useState<File[]>([]);

	const toggleProfile = (profile: TalentProfile) => {
		setSelectedProfiles((prev) =>
			prev.find((p) => p._id === profile._id)
				? prev.filter((p) => p._id !== profile._id)
				: [...prev, profile]
		);
	};

	const handleJsonParse = () => {
		try {
			const parsed = JSON.parse(jsonInput);
			const arr = Array.isArray(parsed) ? parsed : [parsed];
			setSelectedProfiles(arr);
			setJsonError('');
		} catch {
			setJsonError('Invalid JSON. Please check the format.');
		}
	};

	const handleSubmit = async () => {
		if (source === 'internal') {
			await uploadInternal.mutateAsync({ jobId, profiles: selectedProfiles });
			setSubmitted(true);
		} else if (source === 'csv' && csvFile) {
			await uploadCsv.mutateAsync({ jobId, file: csvFile });
			setSubmitted(true);
		} else if (source === 'pdf' && pdfFiles.length > 0) {
			await uploadPdf.mutateAsync({ jobId, files: pdfFiles });
			setSubmitted(true);
		}
	};

	if (submitted) {
		return (
			<div className="mx-auto max-w-xl space-y-6 py-24 text-center">
				<div className="bg-primary/5 border-primary/20 mx-auto flex size-20 items-center justify-center rounded-full border">
					<IconCheck className="text-primary size-10" />
				</div>
				<h2 className="font-lora text-2xl font-semibold">Applicants Added!</h2>
				<p className="text-muted-foreground">
					{source === 'pdf'
						? 'Resumes are queued for AI parsing. You can return to the job page to run screening once parsing completes.'
						: 'The applicants have been linked to this job and are ready for AI screening.'}
				</p>
				<Button asChild>
					<Link href={`/dashboard/jobs/${jobId}`}>Back to Job</Link>
				</Button>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-semibold">Add Applicants</h1>
				<p className="text-muted-foreground mt-1">
					Choose how to source candidates for this role.
				</p>
			</div>

			{/* Source selector */}
			<div className="grid max-w-5xl gap-4 sm:grid-cols-3">
				{(
					[
						{
							id: 'internal' as Source,
							icon: <IconBuilding className="mb-3 size-7" />,
							title: 'Internal Talent',
							desc: 'Browse and import from the internal talent pool.'
						},
						{
							id: 'csv' as Source,
							icon: <IconFileCv className="mb-3 size-7" />,
							title: 'CSV / Spreadsheet',
							desc: 'Upload a CSV or XLSX file exported from a job board.'
						},
						{
							id: 'pdf' as Source,
							icon: <IconWorld className="mb-3 size-7" />,
							title: 'PDF Resumes',
							desc: 'Upload a batch of PDF resumes for AI extraction.'
						}
					] as const
				).map(({ id, icon, title, desc }) => (
					<button
						key={id}
						type="button"
						onClick={() => setSource(id)}
						className={cn(
							'rounded-xl border-2 p-6 text-left transition-all',
							source === id
								? 'border-primary bg-primary/5'
								: 'border-border hover:border-primary/30'
						)}
					>
						<div
							className={cn(
								source === id ? 'text-primary' : 'text-muted-foreground'
							)}
						>
							{icon}
						</div>
						<h3 className="font-semibold">{title}</h3>
						<p className="text-muted-foreground mt-1 text-sm leading-relaxed">
							{desc}
						</p>
					</button>
				))}
			</div>

			{/* ─── Internal Talent Panel ─── */}
			{source === 'internal' && (
				<div className="space-y-4 pt-4">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 className="font-lora text-xl">Internal Talent Pool</h2>
							<p className="text-muted-foreground text-sm">
								Select candidates to import, or paste a JSON array of talent
								profiles.
							</p>
						</div>
						<div className="flex items-center gap-3">
							<label className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-3 py-1.5 transition-colors hover:bg-slate-50">
								<input
									type="checkbox"
									className="accent-primary size-4"
									checked={
										mockProfiles.length > 0 &&
										selectedProfiles.length === mockProfiles.length
									}
									onChange={(e) => {
										if (e.target.checked) {
											setSelectedProfiles([...mockProfiles]);
										} else {
											setSelectedProfiles([]);
										}
									}}
								/>
								<span className="text-sm font-medium">Select All</span>
							</label>

							{/* Raw JSON Dialog */}
							<Dialog>
								<DialogTrigger asChild>
									<Button variant="outline" size="sm" className="gap-1.5">
										<IconInfoCircle className="size-4" /> View Raw JSON
									</Button>
								</DialogTrigger>
								<DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
									<DialogHeader>
										<DialogTitle>Internal Talent JSON</DialogTitle>
									</DialogHeader>
									<pre className="bg-muted overflow-auto rounded-lg p-4 text-xs">
										{JSON.stringify(mockProfiles, null, 2)}
									</pre>
								</DialogContent>
							</Dialog>

							{/* Paste JSON Dialog */}
							<Dialog>
								<DialogTrigger asChild>
									<Button variant="outline" size="sm" className="gap-1.5">
										<IconUpload className="size-4" /> Paste JSON
									</Button>
								</DialogTrigger>
								<DialogContent className="max-w-2xl">
									<DialogHeader>
										<DialogTitle>Paste Talent JSON Array</DialogTitle>
									</DialogHeader>
									<Textarea
										className="min-h-[200px] font-mono text-xs"
										placeholder='[{"firstName": "Jane", "lastName": "Doe", ...}]'
										value={jsonInput}
										onChange={(e) => setJsonInput(e.target.value)}
									/>
									{jsonError && (
										<p className="text-destructive text-sm">{jsonError}</p>
									)}
									<Button onClick={handleJsonParse}>Parse &amp; Preview</Button>
								</DialogContent>
							</Dialog>
						</div>
					</div>

					{/* Candidate Cards */}
					{mockLoading ? (
						<div className="flex justify-center py-16">
							<IconLoader2 className="text-muted-foreground size-8 animate-spin" />
						</div>
					) : (
						<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
							{mockProfiles.map((profile) => {
								const selected = selectedProfiles.some(
									(p) => p._id === profile._id
								);
								return (
									<div
										key={profile._id}
										className={cn(
											'group relative cursor-pointer rounded-xl border-2 p-5 transition-all hover:shadow-md',
											selected
												? 'border-primary bg-primary/5'
												: 'border-border hover:border-primary/30'
										)}
										onClick={() => toggleProfile(profile)}
									>
										{selected && (
											<div className="bg-primary text-primary-foreground absolute top-3 right-3 flex size-5 items-center justify-center rounded-full">
												<IconCheck className="size-3" />
											</div>
										)}
										<div className="flex items-start gap-3">
											<div className="bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold">
												{profile.firstName?.[0]}
												{profile.lastName?.[0]}
											</div>
											<div className="min-w-0">
												<p className="truncate font-semibold">
													{profile.firstName} {profile.lastName}
												</p>
												<p className="text-muted-foreground truncate text-xs">
													{profile.headline}
												</p>
											</div>
										</div>
										<div className="text-muted-foreground mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
											{profile.location && (
												<span className="flex items-center gap-1">
													<IconMapPin className="size-3" /> {profile.location}
												</span>
											)}
											{profile.availability && (
												<span className="flex items-center gap-1">
													<IconBriefcase className="size-3" />{' '}
													{profile.availability.type}
												</span>
											)}
										</div>
										{profile.skills && profile.skills.length > 0 && (
											<div className="mt-3 flex flex-wrap gap-1">
												{profile.skills.slice(0, 3).map((s) => (
													<span
														key={s.name}
														className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs"
													>
														{s.name}
													</span>
												))}
												{profile.skills.length > 3 && (
													<span className="text-muted-foreground px-1 text-xs">
														+{profile.skills.length - 3}
													</span>
												)}
											</div>
										)}
										<div className="mt-3 flex items-center justify-between">
											<div className="flex gap-2">
												{profile.socialLinks?.linkedin && (
													<a
														href={profile.socialLinks.linkedin}
														target="_blank"
														rel="noopener noreferrer"
														onClick={(e) => e.stopPropagation()}
													>
														<IconBrandLinkedin className="text-muted-foreground hover:text-primary size-4" />
													</a>
												)}
												{profile.socialLinks?.github && (
													<a
														href={profile.socialLinks.github}
														target="_blank"
														rel="noopener noreferrer"
														onClick={(e) => e.stopPropagation()}
													>
														<IconBrandGithub className="text-muted-foreground hover:text-primary size-4" />
													</a>
												)}
											</div>
											<Link
												href={`/dashboard/talent/${profile._id}`}
												target="_blank"
												onClick={(e) => e.stopPropagation()}
												className="text-primary text-xs hover:underline"
											>
												View Profile →
											</Link>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			)}

			{/* ─── CSV Upload Panel ─── */}
			{source === 'csv' && (
				<div className="space-y-4">
					<h2 className="text-base font-semibold">Upload CSV / Spreadsheet</h2>
					<div
						className="border-border hover:border-primary/40 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-20 transition-colors"
						onClick={() => csvInputRef.current?.click()}
					>
						<IconFileCv className="text-muted-foreground size-12" />
						{csvFile ? (
							<p className="text-sm font-medium">{csvFile.name}</p>
						) : (
							<>
								<p className="font-medium">
									Click to select a CSV or XLSX file
								</p>
								<p className="text-muted-foreground text-sm">
									The AI will extract and normalise all candidates
								</p>
							</>
						)}
					</div>
					<input
						ref={csvInputRef}
						type="file"
						accept=".csv,.xlsx,.xls"
						className="hidden"
						onChange={(e) => setCsvFile(e.target.files?.[0] ?? null)}
					/>
				</div>
			)}

			{/* ─── PDF Upload Panel ─── */}
			{source === 'pdf' && (
				<div className="space-y-4">
					<h2 className="text-base font-semibold">Upload PDF Resumes</h2>
					<div
						className="border-border hover:border-primary/40 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed py-20 transition-colors"
						onClick={() => pdfInputRef.current?.click()}
					>
						<IconUpload className="text-muted-foreground size-12" />
						{pdfFiles.length > 0 ? (
							<p className="text-sm font-medium">
								{pdfFiles.length} file(s) selected
							</p>
						) : (
							<>
								<p className="font-medium">
									Click to select PDF resumes (up to 10)
								</p>
								<p className="text-muted-foreground text-sm">
									Files will be queued for AI extraction
								</p>
							</>
						)}
					</div>
					<input
						ref={pdfInputRef}
						type="file"
						accept=".pdf"
						multiple
						className="hidden"
						onChange={(e) => setPdfFiles(Array.from(e.target.files ?? []))}
					/>
					{pdfFiles.length > 0 && (
						<ul className="space-y-1">
							{pdfFiles.map((f) => (
								<li
									key={f.name}
									className="text-muted-foreground flex items-center gap-2 text-sm"
								>
									<IconFileCv className="size-4 shrink-0" /> {f.name}
								</li>
							))}
						</ul>
					)}
				</div>
			)}

			{/* Footer Actions */}
			<div className="flex items-center justify-between border-t pt-6">
				<Button variant="ghost" asChild>
					<Link href={`/dashboard/jobs/${jobId}`}>Cancel</Link>
				</Button>
				<Button
					onClick={handleSubmit}
					disabled={
						uploadInternal.isPending ||
						uploadCsv.isPending ||
						uploadPdf.isPending ||
						(source === 'internal' && selectedProfiles.length === 0) ||
						(source === 'csv' && !csvFile) ||
						(source === 'pdf' && pdfFiles.length === 0)
					}
					className="gap-2"
				>
					{uploadInternal.isPending ||
					uploadCsv.isPending ||
					uploadPdf.isPending ? (
						<>
							<IconLoader2 className="size-4 animate-spin" /> Importing...
						</>
					) : (
						<>
							<IconUserCheck className="size-4" />
							{source === 'internal'
								? `Import ${selectedProfiles.length} Candidate${selectedProfiles.length !== 1 ? 's' : ''}`
								: source === 'csv'
									? 'Upload CSV'
									: `Upload ${pdfFiles.length} PDF${pdfFiles.length !== 1 ? 's' : ''}`}
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
