import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	IconCheck,
	IconFileSpreadsheet,
	IconFileTypePdf,
	IconRobot,
	IconUpload
} from '@tabler/icons-react';
import React, { useState } from 'react';

export function UploadProfilesView() {
	const [isDragging, setIsDragging] = useState(false);
	const [files, setFiles] = useState<
		{ name: string; type: 'csv' | 'pdf'; status: 'pending' | 'parsing' | 'success' }[]
	>([]);

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);

		const droppedFiles = Array.from(e.dataTransfer.files).map((f) => ({
			name: f.name,
			type: f.name.endsWith('.csv') ? 'csv' : ('pdf' as 'csv' | 'pdf'),
			status: 'pending' as const
		}));

		setFiles((prev) => [...prev, ...droppedFiles]);
	};

	const startParsing = () => {
		setFiles((prev) => prev.map((f) => ({ ...f, status: 'parsing' })));
		setTimeout(() => {
			setFiles((prev) => prev.map((f) => ({ ...f, status: 'success' })));
		}, 3000);
	};

	return (
		<div className="animate-rise-in space-y-6">
			<div className="rounded-2xl border border-border/60 bg-card/40 p-6 shadow-xs">
				<h2 className="text-lg font-semibold mb-2">Batch Upload Profiles</h2>
				<p className="text-sm text-muted-foreground mb-6">
					Upload external candidate data via CSV or bulk PDF resumes. Our AI will automatically parse
					and normalise them to the Umurava TalentProfile schema.
				</p>

				<div
					onDragOver={(e) => {
						e.preventDefault();
						setIsDragging(true);
					}}
					onDragLeave={() => setIsDragging(false)}
					onDrop={handleDrop}
					className={cn(
						'flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 transition-colors',
						isDragging
							? 'border-primary bg-primary/5'
							: 'border-border/60 bg-background/50 hover:bg-muted/50'
					)}
				>
					<IconUpload
						className={cn('size-10 mb-4', isDragging ? 'text-primary' : 'text-muted-foreground')}
					/>
					<p className="text-sm font-medium">Drag and drop files here</p>
					<p className="text-xs text-muted-foreground mt-1">
						Supports .csv, .xlsx, .pdf (Max 50MB batch)
					</p>
					<Button variant="secondary" className="mt-6" size="sm">
						Browse Files
					</Button>
				</div>

				{files.length > 0 && (
					<div className="mt-8 space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-semibold">Upload Queue ({files.length})</h3>
							<Button
								size="sm"
								onClick={startParsing}
								disabled={files.every((f) => f.status === 'success' || f.status === 'parsing')}
								className="gap-2"
							>
								<IconRobot className="size-4" /> Run Parsing Engine
							</Button>
						</div>

						<div className="grid gap-3">
							{files.map((file, i) => (
								<div
									key={i}
									className="flex items-center justify-between p-3 rounded-lg border border-border/50 bg-background/50"
								>
									<div className="flex items-center gap-3">
										{file.type === 'csv' ? (
											<IconFileSpreadsheet className="size-5 text-emerald-500" />
										) : (
											<IconFileTypePdf className="size-5 text-rose-500" />
										)}
										<span className="text-sm font-medium">{file.name}</span>
									</div>
									<div>
										{file.status === 'pending' && <Badge variant="secondary">Ready</Badge>}
										{file.status === 'parsing' && (
											<Badge variant="accent" className="animate-pulse">
												Parsing via AI...
											</Badge>
										)}
										{file.status === 'success' && (
											<Badge
												variant="default"
												className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
											>
												<IconCheck className="size-3 mr-1" /> Mapped to Schema
											</Badge>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
