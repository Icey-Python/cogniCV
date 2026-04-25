'use client';

import { useState, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
	IconUpload,
	IconFileText,
	IconTable,
	IconX,
	IconLoader2,
	IconCircleCheck,
	IconAlertCircle,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

type UploadStatus = 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';

interface UploadedFile {
	name: string;
	size: number;
}

interface UploadPanelProps {
	onComplete: () => void;
}

function formatBytes(bytes: number) {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function DropZone({
	zoneId,
	accept,
	multiple,
	label,
	sublabel,
	icon: Icon,
	onFiles,
}: {
	zoneId: string;
	accept: string;
	multiple: boolean;
	label: string;
	sublabel: string;
	icon: React.ComponentType<{ className?: string }>;
	onFiles: (files: File[]) => void;
}) {
	const [isDragging, setIsDragging] = useState(false);

	const handleDrop = useCallback(
		(e: React.DragEvent) => {
			e.preventDefault();
			setIsDragging(false);
			onFiles(Array.from(e.dataTransfer.files));
		},
		[onFiles]
	);

	return (
		<div
			onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
			onDragLeave={() => setIsDragging(false)}
			onDrop={handleDrop}
			className={cn(
				'rounded-lg border-2 border-dashed p-10 text-center transition-all cursor-pointer',
				isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/20 hover:border-primary/40'
			)}
		>
			<input
				id={`file-upload-${zoneId}`}
				type="file"
				accept={accept}
				multiple={multiple}
				className="hidden"
				onChange={(e) => e.target.files && onFiles(Array.from(e.target.files))}
			/>
			<label htmlFor={`file-upload-${zoneId}`} className="cursor-pointer flex flex-col items-center gap-3">
				<div className="rounded-full bg-primary/10 p-4">
					<Icon className="size-6 text-primary" />
				</div>
				<div>
					<p className="text-sm font-semibold">{label}</p>
					<p className="text-xs text-muted-foreground mt-1">{sublabel}</p>
				</div>
				<Button type="button" variant="outline" size="sm">Browse files</Button>
			</label>
		</div>
	);
}

function StatusBar({ status, progress }: { status: UploadStatus; progress: number }) {
	const messages: Record<UploadStatus, string> = {
		idle: '',
		uploading: 'Uploading files to server...',
		analyzing: 'AI is analyzing and ranking candidates...',
		complete: 'Analysis complete. Ranked candidates are ready.',
		error: 'Something went wrong. Please try again.',
	};

	if (status === 'idle') return null;

	return (
		<div className="rounded-lg border p-4 space-y-3">
			<div className="flex items-center gap-2 text-sm">
				{(status === 'uploading' || status === 'analyzing') && (
					<IconLoader2 className="size-4 animate-spin text-primary" />
				)}
				{status === 'complete' && <IconCircleCheck className="size-4 text-emerald-500" />}
				{status === 'error' && <IconAlertCircle className="size-4 text-destructive" />}
				<span className={cn(
					status === 'complete' && 'text-emerald-600 font-medium',
					status === 'error' && 'text-destructive'
				)}>
					{messages[status]}
				</span>
			</div>
			<div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
				<div
					className={cn(
						'h-full rounded-full transition-all duration-500',
						status === 'complete' ? 'bg-emerald-500' : status === 'error' ? 'bg-destructive' : 'bg-primary'
					)}
					style={{ width: `${progress}%` }}
				/>
			</div>
		</div>
	);
}

export function UploadPanel({ onComplete }: UploadPanelProps) {
	const [files, setFiles] = useState<UploadedFile[]>([]);
	const [status, setStatus] = useState<UploadStatus>('idle');
	const [progress, setProgress] = useState(0);

	const addFiles = (newFiles: File[]) => {
		setFiles((prev) => [...prev, ...newFiles.map((f) => ({ name: f.name, size: f.size }))]);
	};

	const removeFile = (index: number) => {
		setFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const startAnalysis = () => {
		setStatus('uploading');
		setProgress(20);
		setTimeout(() => { setStatus('analyzing'); setProgress(55); }, 1500);
		setTimeout(() => { setProgress(85); }, 3000);
		setTimeout(() => { setStatus('complete'); setProgress(100); onComplete(); }, 5000);
	};

	return (
		<div className="space-y-4">
			<Tabs defaultValue="pdf">
				<TabsList className="grid grid-cols-2 w-full max-w-sm">
					<TabsTrigger value="pdf" className="gap-2">
						<IconFileText className="size-4" /> PDF Resumes
					</TabsTrigger>
					<TabsTrigger value="csv" className="gap-2">
						<IconTable className="size-4" /> CSV / Excel
					</TabsTrigger>
				</TabsList>
				<TabsContent value="pdf" className="mt-4">
					<DropZone
						zoneId="pdf"
						accept=".pdf"
						multiple={true}
						label="Drop PDF resumes here"
						sublabel="Upload multiple resumes at once. AI will extract and rank all candidates."
						icon={IconFileText}
						onFiles={addFiles}
					/>
				</TabsContent>
				<TabsContent value="csv" className="mt-4">
					<DropZone
						zoneId="csv"
						accept=".csv,.xlsx,.xls"
						multiple={false}
						label="Drop CSV or Excel file here"
						sublabel="Upload a spreadsheet with candidate data. Each row becomes a candidate profile."
						icon={IconTable}
						onFiles={addFiles}
					/>
				</TabsContent>
			</Tabs>

			{files.length > 0 && (
				<div className="space-y-2">
					<p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
						Selected files ({files.length})
					</p>
					<div className="space-y-1.5 max-h-40 overflow-y-auto">
						{files.map((file, i) => (
							<div key={i} className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2">
								<div className="flex items-center gap-2 min-w-0">
									<IconFileText className="size-3.5 text-muted-foreground shrink-0" />
									<span className="text-sm truncate">{file.name}</span>
								</div>
								<div className="flex items-center gap-2 shrink-0">
									<span className="text-xs text-muted-foreground">{formatBytes(file.size)}</span>
									<button onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive transition-colors">
										<IconX className="size-3.5" />
									</button>
								</div>
							</div>
						))}
					</div>
					<div className="flex justify-end pt-2">
						<Button onClick={startAnalysis} disabled={status !== 'idle' && status !== 'error'} className="gap-2">
							{status === 'uploading' || status === 'analyzing' ? (
								<IconLoader2 className="size-4 animate-spin" />
							) : (
								<IconUpload className="size-4" />
							)}
							{status === 'idle' ? 'Analyse Candidates' : 'Processing...'}
						</Button>
					</div>
				</div>
			)}

			<StatusBar status={status} progress={progress} />
		</div>
	);
}
