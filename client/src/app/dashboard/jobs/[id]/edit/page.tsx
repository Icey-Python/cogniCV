'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
	IconCircleCheck,
	IconX,
	IconPlus,
	IconChevronLeft,
	IconChevronRight,
	IconDeviceFloppy,
	IconArrowLeft
} from '@tabler/icons-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useJobQuery } from '@/hooks/query/jobs/queries';
import { useUpdateJobMutation } from '@/hooks/query/jobs/mutations';
import { useOrganizationQuery } from '@/hooks/query/organization/queries';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui/select';

type EmploymentType = 'Full-time' | 'Part-time' | 'Contract';
type ExperienceLevel = 'Entry' | 'Junior' | 'Mid' | 'Senior' | 'Lead';

const EMPLOYMENT_TYPES: EmploymentType[] = [
	'Full-time',
	'Part-time',
	'Contract'
];
const EXPERIENCE_LEVELS: ExperienceLevel[] = [
	'Entry',
	'Junior',
	'Mid',
	'Senior',
	'Lead'
];

export default function EditJobPage() {
	const router = useRouter();
	const params = useParams<{ id: string }>();
	const jobId = params.id;
	const { data: jobData } = useJobQuery(jobId as string);
	const job = jobData?.data;

	const { data: orgData } = useOrganizationQuery();
	const dbLocations = orgData?.data?.locations || [];

	const updateJob = useUpdateJobMutation();

	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [locationId, setLocationId] = useState('');
	const [employmentType, setEmploymentType] =
		useState<EmploymentType>('Full-time');
	const [experienceLevel, setExperienceLevel] =
		useState<ExperienceLevel>('Mid');
	const [skills, setSkills] = useState<string[]>([]);
	const [skillInput, setSkillInput] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [saved, setSaved] = useState(false);

	useEffect(() => {
		if (job) {
			setTitle(job.title);
			setDescription(job.description);
			setEmploymentType(job.type as EmploymentType);
			setExperienceLevel(job.experienceLevel as ExperienceLevel);
			setSkills(job.requiredSkills || []);

			// Try to find the matching location ID
			if (job.location) {
				const loc = dbLocations.find(
					(l) =>
						l.city === job.location.city && l.country === job.location.country
				);
				if (loc) setLocationId(loc._id);
			}
		}
	}, [job, dbLocations]);

	const addSkill = () => {
		const trimmed = skillInput.trim();
		if (trimmed && !skills.includes(trimmed)) {
			setSkills((prev) => [...prev, trimmed]);
			setSkillInput('');
		}
	};

	const removeSkill = (skill: string) =>
		setSkills((prev) => prev.filter((s) => s !== skill));

	const handleSave = () => {
		setIsSaving(true);

		const locObj = dbLocations.find((l) => l._id === locationId);

		updateJob.mutate(
			{
				id: jobId as string,
				data: {
					title,
					description,
					requiredSkills: skills,
					experienceLevel: experienceLevel as any,
					type: employmentType as any,
					...(locObj ? { location: locObj } : {})
				}
			},
			{
				onSuccess: () => {
					setIsSaving(false);
					setSaved(true);
				},
				onError: () => {
					setIsSaving(false);
				}
			}
		);
	};

	if (saved) {
		return (
			<div className="mx-auto max-w-2xl space-y-8 py-24 text-center">
				<div className="relative mx-auto size-24">
					<div className="bg-primary/10 absolute inset-0 animate-ping rounded-full opacity-20" />
					<div className="bg-primary/5 border-primary/20 relative flex size-full items-center justify-center rounded-full border">
						<svg
							viewBox="0 0 24 24"
							fill="none"
							className="text-primary size-12"
							stroke="currentColor"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M20 6L9 17L4 12" />
						</svg>
					</div>
				</div>
				<div className="space-y-2">
					<h2 className="font-lora text-3xl font-semibold">Job Updated</h2>
					<p className="text-muted-foreground mx-auto max-w-md">
						Your changes to the job listing have been successfully saved.
					</p>
				</div>
				<div className="flex justify-center gap-4 pt-4">
					<Button variant="outline" size="lg" asChild className="min-w-[160px]">
						<Link href={`/dashboard/jobs/${jobId}`}>View Job Details</Link>
					</Button>
					<Button size="lg" asChild className="min-w-[160px]">
						<Link href="/dashboard/jobs">Back to All Jobs</Link>
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-6xl space-y-8">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<div>
						<h1 className="text-2xl font-semibold">Edit Job Listing</h1>
						<p className="text-muted-foreground mt-1">
							Update the details for this role.
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
				{/* Left column: Main form */}
				<div className="space-y-6 lg:col-span-2">
					<Card className="p-8">
						<div className="space-y-6">
							<div className="grid gap-2">
								<Label htmlFor="title">Job Title</Label>
								<Input
									id="title"
									placeholder="e.g. Senior Frontend Engineer"
									value={title}
									onChange={(e) => setTitle(e.target.value)}
								/>
							</div>

							<div className="grid gap-2">
								<Label htmlFor="description">Job Description</Label>
								<Textarea
									id="description"
									placeholder="Describe the role and responsibilities..."
									className="min-h-[200px]"
									value={description}
									onChange={(e) => setDescription(e.target.value)}
								/>
							</div>

							<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
								<div className="grid gap-2">
									<Label htmlFor="location">Location</Label>
									<Select value={locationId} onValueChange={setLocationId}>
										<SelectTrigger id="location">
											<SelectValue placeholder="Select location" />
										</SelectTrigger>
										<SelectContent>
											{dbLocations.map((l) => (
												<SelectItem key={l._id} value={l._id}>
													{l.city}, {l.country} ({l.workspaceType})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</div>
					</Card>

					<Card className="p-8">
						<div className="space-y-6">
							<div>
								<h2 className="text-lg font-semibold">Requirements & Terms</h2>
								<p className="text-muted-foreground mt-1 text-sm">
									These details help the AI rank candidates effectively.
								</p>
							</div>

							<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
								<div className="grid gap-4">
									<Label>Employment Type</Label>
									<div className="flex flex-wrap gap-2">
										{EMPLOYMENT_TYPES.map((t) => (
											<button
												key={t}
												type="button"
												onClick={() => setEmploymentType(t)}
												className={cn(
													'rounded-md border px-4 py-2 text-sm font-medium transition-all',
													employmentType === t
														? 'border-primary bg-primary text-primary-foreground shadow-sm'
														: 'border-border hover:border-primary/40 bg-white'
												)}
											>
												{t}
											</button>
										))}
									</div>
								</div>
								<div className="grid gap-4">
									<Label>Experience Level</Label>
									<div className="flex flex-wrap gap-2">
										{EXPERIENCE_LEVELS.map((l) => (
											<button
												key={l}
												type="button"
												onClick={() => setExperienceLevel(l)}
												className={cn(
													'rounded-md border px-4 py-2 text-sm font-medium transition-all',
													experienceLevel === l
														? 'border-primary bg-primary text-primary-foreground shadow-sm'
														: 'border-border hover:border-primary/40 bg-white'
												)}
											>
												{l}
											</button>
										))}
									</div>
								</div>
							</div>

							<div className="grid gap-2">
								<Label>Required Skills</Label>
								<div className="flex gap-2">
									<Input
										placeholder="Type a skill and press Enter"
										value={skillInput}
										onChange={(e) => setSkillInput(e.target.value)}
										onKeyDown={(e) =>
											e.key === 'Enter' && (e.preventDefault(), addSkill())
										}
									/>
									<Button
										type="button"
										onClick={addSkill}
										size="icon"
										variant="outline"
									>
										<IconPlus className="size-4" />
									</Button>
								</div>
								<div className="mt-2 flex flex-wrap gap-2">
									{skills.map((skill) => (
										<span
											key={skill}
											className="bg-primary/5 text-primary border-primary/10 inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium"
										>
											{skill}
											<button
												type="button"
												onClick={() => removeSkill(skill)}
												className="hover:text-primary-foreground hover:bg-primary rounded-full p-0.5 transition-colors"
											>
												<IconX className="size-3" />
											</button>
										</span>
									))}
								</div>
							</div>
						</div>
					</Card>
				</div>

				{/* Right column: Info & Actions */}
				<div className="space-y-6">
					<Card className="border-slate-200 bg-slate-50 p-6">
						<h3 className="mb-2 text-sm font-semibold">Editor Note</h3>
						<p className="text-muted-foreground text-sm leading-relaxed">
							Updating job requirements will re-trigger AI candidate ranking for
							existing applicants to ensure match scores remain accurate.
						</p>
					</Card>

					<div className="flex flex-col gap-3">
						<Button
							onClick={handleSave}
							disabled={isSaving}
							className="h-11 w-full"
						>
							{isSaving ? 'Saving Changes...' : 'Save All Changes'}
						</Button>
						<Button
							variant="outline"
							className="h-11 w-full"
							onClick={() => router.back()}
						>
							Discard Changes
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
