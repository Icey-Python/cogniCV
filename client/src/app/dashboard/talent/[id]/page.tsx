'use client';

import { useParams } from 'next/navigation';
import { useMockTalentByIdQuery } from '@/hooks/query/jobs/queries';
import {
	IconMapPin,
	IconBriefcase,
	IconSchool,
	IconCode,
	IconCertificate,
	IconBrandLinkedin,
	IconBrandGithub,
	IconWorld,
	IconLoader2,
	IconStar,
	IconCalendar,
	IconChevronRight,
	IconBuildingSkyscraper,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

const LEVEL_COLOR: Record<string, string> = {
	Expert: 'bg-violet-100 text-violet-700 border-violet-200',
	Advanced: 'bg-blue-100 text-blue-700 border-blue-200',
	Intermediate: 'bg-emerald-100 text-emerald-700 border-emerald-200',
	Beginner: 'bg-amber-100 text-amber-700 border-amber-200',
};

const AVAILABILITY_COLOR: Record<string, string> = {
	Available: 'bg-emerald-100 text-emerald-700',
	'Open to Opportunities': 'bg-blue-100 text-blue-700',
	'Not Available': 'bg-slate-100 text-slate-600',
};

export default function TalentProfilePage() {
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
				<div>
					<p className="text-muted-foreground text-lg">Profile not found.</p>
				</div>
			</div>
		);
	}

	const initials = `${profile.firstName?.[0] ?? ''}${profile.lastName?.[0] ?? ''}`;

	return (
		<div className="min-h-screen bg-slate-50">
			{/* Hero Header */}
			<div className="bg-gradient-to-br from-slate-900 to-slate-800 px-6 py-12 text-white">
				<div className="mx-auto max-w-4xl">
					<div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
						{/* Avatar */}
						<div className="bg-primary/20 border-primary/30 flex size-24 shrink-0 items-center justify-center rounded-2xl border-2 text-3xl font-bold text-white">
							{initials}
						</div>

						<div className="flex-1">
							<h1 className="text-3xl font-bold">
								{profile.firstName} {profile.lastName}
							</h1>
							<p className="text-slate-300 mt-1 text-lg">{profile.headline}</p>

							<div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-400">
								{profile.location && (
									<span className="flex items-center gap-1.5">
										<IconMapPin className="size-4" /> {profile.location}
									</span>
								)}
								{profile.availability && (
									<span className="flex items-center gap-1.5">
										<IconBriefcase className="size-4" />
										{profile.availability.type}
									</span>
								)}
							</div>

							{/* Social links */}
							<div className="mt-4 flex gap-3">
								{profile.socialLinks?.linkedin && (
									<a
										href={profile.socialLinks.linkedin}
										target="_blank"
										rel="noopener noreferrer"
										className="bg-white/10 hover:bg-white/20 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white transition-colors"
									>
										<IconBrandLinkedin className="size-4" /> LinkedIn
									</a>
								)}
								{profile.socialLinks?.github && (
									<a
										href={profile.socialLinks.github}
										target="_blank"
										rel="noopener noreferrer"
										className="bg-white/10 hover:bg-white/20 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white transition-colors"
									>
										<IconBrandGithub className="size-4" /> GitHub
									</a>
								)}
								{profile.socialLinks?.portfolio && (
									<a
										href={profile.socialLinks.portfolio}
										target="_blank"
										rel="noopener noreferrer"
										className="bg-white/10 hover:bg-white/20 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white transition-colors"
									>
										<IconWorld className="size-4" /> Portfolio
									</a>
								)}
							</div>
						</div>

						{/* Availability badge */}
						{profile.availability && (
							<span
								className={cn(
									'rounded-full px-4 py-1.5 text-sm font-semibold',
									AVAILABILITY_COLOR[profile.availability.status] ??
										'bg-slate-100 text-slate-600'
								)}
							>
								{profile.availability.status}
							</span>
						)}
					</div>
				</div>
			</div>

			<div className="mx-auto max-w-4xl space-y-6 px-6 py-8">
				{/* Bio */}
				{profile.bio && (
					<div className="rounded-xl border bg-white p-6 shadow-sm">
						<h2 className="mb-3 font-semibold text-slate-900">About</h2>
						<p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
					</div>
				)}

				{/* Skills */}
				{profile.skills && profile.skills.length > 0 && (
					<div className="rounded-xl border bg-white p-6 shadow-sm">
						<h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
							<IconCode className="text-primary size-5" /> Skills
						</h2>
						<div className="flex flex-wrap gap-2">
							{profile.skills.map((skill) => (
								<span
									key={skill.name}
									className={cn(
										'flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium',
										LEVEL_COLOR[skill.level] ?? 'bg-slate-100 text-slate-600 border-slate-200'
									)}
								>
									{skill.name}
									<span className="opacity-60 text-xs">· {skill.yearsOfExperience}yr</span>
								</span>
							))}
						</div>
					</div>
				)}

				{/* Languages */}
				{profile.languages && profile.languages.length > 0 && (
					<div className="rounded-xl border bg-white p-6 shadow-sm">
						<h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
							<IconWorld className="text-primary size-5" /> Languages
						</h2>
						<div className="flex flex-wrap gap-2">
							{profile.languages.map((lang) => (
								<span
									key={lang.name}
									className="bg-slate-100 rounded-full px-3 py-1 text-sm font-medium text-slate-700"
								>
									{lang.name} · {lang.proficiency}
								</span>
							))}
						</div>
					</div>
				)}

				{/* Experience */}
				{profile.experience && profile.experience.length > 0 && (
					<div className="rounded-xl border bg-white p-6 shadow-sm">
						<h2 className="mb-5 flex items-center gap-2 font-semibold text-slate-900">
							<IconBuildingSkyscraper className="text-primary size-5" /> Experience
						</h2>
						<div className="space-y-6">
							{profile.experience.map((exp, i) => (
								<div key={i} className="flex gap-4">
									<div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
										<IconBriefcase className="text-primary size-5" />
									</div>
									<div className="flex-1">
										<div className="flex flex-wrap items-center gap-2">
											<p className="font-semibold text-slate-900">{exp.role}</p>
											{exp.isCurrent && (
												<span className="bg-emerald-100 text-emerald-700 rounded-full px-2 py-0.5 text-xs font-medium">
													Current
												</span>
											)}
										</div>
										<p className="text-muted-foreground text-sm">{exp.company}</p>
										<p className="text-muted-foreground mt-0.5 text-xs">
											{exp.startDate} – {exp.endDate ?? 'Present'}
										</p>
										{exp.description && (
											<p className="mt-2 text-sm leading-relaxed text-slate-600">{exp.description}</p>
										)}
										{exp.technologies && exp.technologies.length > 0 && (
											<div className="mt-2 flex flex-wrap gap-1.5">
												{exp.technologies.map((t) => (
													<span key={t} className="bg-slate-100 rounded-md px-2 py-0.5 text-xs text-slate-600">
														{t}
													</span>
												))}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Education */}
				{profile.education && profile.education.length > 0 && (
					<div className="rounded-xl border bg-white p-6 shadow-sm">
						<h2 className="mb-5 flex items-center gap-2 font-semibold text-slate-900">
							<IconSchool className="text-primary size-5" /> Education
						</h2>
						<div className="space-y-4">
							{profile.education.map((edu, i) => (
								<div key={i} className="flex gap-4">
									<div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
										<IconSchool className="text-primary size-5" />
									</div>
									<div>
										<p className="font-semibold text-slate-900">{edu.degree} · {edu.fieldOfStudy}</p>
										<p className="text-muted-foreground text-sm">{edu.institution}</p>
										<p className="text-muted-foreground text-xs">
											{edu.startYear} – {edu.endYear ?? 'Present'}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Projects */}
				{profile.projects && profile.projects.length > 0 && (
					<div className="rounded-xl border bg-white p-6 shadow-sm">
						<h2 className="mb-5 flex items-center gap-2 font-semibold text-slate-900">
							<IconStar className="text-primary size-5" /> Projects
						</h2>
						<div className="space-y-4">
							{profile.projects.map((proj, i) => (
								<div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
									<div className="flex items-start justify-between gap-2">
										<div>
											<p className="font-semibold text-slate-900">{proj.name}</p>
											<p className="text-muted-foreground text-xs">
												<IconCalendar className="mr-1 inline size-3" />
												{proj.startDate} – {proj.endDate}
											</p>
										</div>
										{proj.link && (
											<a
												href={proj.link}
												target="_blank"
												rel="noopener noreferrer"
												className="text-primary flex items-center gap-0.5 text-xs hover:underline"
											>
												View <IconChevronRight className="size-3" />
											</a>
										)}
									</div>
									<p className="mt-2 text-sm text-slate-600">{proj.description}</p>
									<div className="mt-2 flex flex-wrap gap-1.5">
										{proj.technologies.map((t) => (
											<span key={t} className="bg-white rounded-md border px-2 py-0.5 text-xs text-slate-600">
												{t}
											</span>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Certifications */}
				{profile.certifications && profile.certifications.length > 0 && (
					<div className="rounded-xl border bg-white p-6 shadow-sm">
						<h2 className="mb-4 flex items-center gap-2 font-semibold text-slate-900">
							<IconCertificate className="text-primary size-5" /> Certifications
						</h2>
						<div className="space-y-3">
							{profile.certifications.map((cert, i) => (
								<div key={i} className="flex items-center gap-3">
									<div className="bg-amber-100 flex size-9 shrink-0 items-center justify-center rounded-lg">
										<IconCertificate className="size-5 text-amber-600" />
									</div>
									<div>
										<p className="text-sm font-semibold">{cert.name}</p>
										<p className="text-muted-foreground text-xs">{cert.issuer} · {cert.issueDate}</p>
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
