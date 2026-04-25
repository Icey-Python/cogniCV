'use client';

import {
	IconMapPin,
	IconBriefcase,
	IconSchool,
	IconCode,
	IconCertificate,
	IconBrandLinkedin,
	IconBrandGithub,
	IconWorld,
	IconStar,
	IconBuildingSkyscraper,
	IconMail,
	IconExternalLink
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';
import { CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type {
	TalentProfile,
	Skill,
	Experience,
	Project,
	Education,
	Certification
} from '@/types';

const LEVEL_COLOR: Record<string, string> = {
	Expert: 'bg-violet-50 text-violet-700 border-violet-100',
	Advanced: 'bg-blue-50 text-blue-700 border-blue-100',
	Intermediate: 'bg-emerald-50 text-emerald-700 border-emerald-100',
	Beginner: 'bg-amber-50 text-amber-700 border-amber-100'
};

interface TalentProfileViewProps {
	profile: TalentProfile;
}

export function TalentProfileView({ profile }: TalentProfileViewProps) {
	return (
		<div className="flex flex-col gap-6">
			{/* Bio/About - Moved to Top */}
			{profile.bio && (
				<p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
			)}

			{/* Top Section: Personal Information & Education/Certifications */}
			<div className="grid gap-12 lg:grid-cols-2">
				{/* Column 1: Personal Information */}
				<div>
					<CardTitle className="font-lora mb-4 text-lg">
						Personal Information
					</CardTitle>
					<div className="space-y-6">
						<div className="space-y-4">
							<div className="flex items-center gap-3 text-sm">
								<IconMail className="size-4 text-slate-400" />
								<span className="truncate">{profile.email}</span>
							</div>
							{profile.location && (
								<div className="flex items-center gap-3 text-sm">
									<IconMapPin className="size-4 text-slate-400" />
									<span>{profile.location}</span>
								</div>
							)}
							<div className="flex items-center gap-3 text-sm">
								<IconBriefcase className="size-4 text-slate-400" />
								<span>
									{profile.experience?.length || 0} Professional Roles
								</span>
							</div>
							<div className="flex items-center gap-3 text-sm">
								<div
									className={cn(
										'size-2 rounded-full',
										profile.availability?.status === 'Available'
											? 'bg-emerald-500'
											: 'bg-amber-500'
									)}
								/>
								<span>{profile.availability?.status || 'Active'}</span>
							</div>

							{/* Social Links moved below availability */}
							<div className="flex flex-wrap gap-2 pt-2">
								{profile.socialLinks?.linkedin && (
									<a
										href={profile.socialLinks.linkedin}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-slate-50"
									>
										<IconBrandLinkedin className="size-4 text-blue-600" />{' '}
										LinkedIn
									</a>
								)}
								{profile.socialLinks?.github && (
									<a
										href={profile.socialLinks.github}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-slate-50"
									>
										<IconBrandGithub className="size-4" /> GitHub
									</a>
								)}
								{profile.socialLinks?.portfolio && (
									<a
										href={profile.socialLinks.portfolio}
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors hover:bg-slate-50"
									>
										<IconWorld className="size-4 text-slate-500" /> Portfolio
									</a>
								)}
							</div>
						</div>

						{/* Technical Skills - Border-t removed */}
						<div className="pt-2">
							<p className="mb-3 text-sm font-medium">Technical Skills</p>
							<div className="flex flex-wrap gap-2">
								{profile.skills?.map((skill: Skill) => (
									<Badge
										key={skill.name}
										variant="outline"
										className={cn(
											'rounded-full px-4 py-1 font-medium',
											LEVEL_COLOR[skill.level] || 'bg-slate-50'
										)}
									>
										{skill.name}
									</Badge>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Column 2: Education & Certifications */}
				<div className="space-y-10">
					{/* Education */}
					{profile.education && profile.education.length > 0 && (
						<div className="space-y-4">
							<CardTitle className="font-lora flex items-center gap-2 text-lg">
								<IconSchool className="text-primary" size={20} /> Education
							</CardTitle>
							<div className="space-y-4">
								{profile.education.map((edu: Education, i: number) => (
									<div key={i} className="bg-card space-y-1 rounded-lg">
										<p className="text-base font-semibold">{edu.degree}</p>
										<p className="text-muted-foreground text-sm">
											{edu.institution}
										</p>
										<p className="text-sm tracking-wider text-slate-400 uppercase">
											{edu.startYear} – {edu.endYear ?? 'Present'}
										</p>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Certifications */}
					{profile.certifications && profile.certifications.length > 0 && (
						<div className="space-y-4">
							<CardTitle className="font-lora flex items-center gap-2 text-base">
								<IconCertificate className="text-primary size-4" />{' '}
								Certifications
							</CardTitle>
							<div className="space-y-3">
								{profile.certifications.map(
									(cert: Certification, i: number) => (
										<div key={i} className="flex items-center gap-3">
											<div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-amber-100 bg-amber-50">
												<IconCertificate className="size-4 text-amber-600" />
											</div>
											<div className="min-w-0">
												<p className="truncate text-xs font-semibold">
													{cert.name}
												</p>
												<p className="text-muted-foreground truncate text-[10px]">
													{cert.issuer}
												</p>
											</div>
										</div>
									)
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Bottom Section: Experience & Projects */}
			<div className="mt-4 grid gap-12 lg:grid-cols-2">
				{/* Column 1: Experience */}
				<div className="space-y-6">
					{profile.experience && profile.experience.length > 0 && (
						<div className="space-y-4">
							<CardTitle className="font-lora flex items-center gap-2 text-lg">
								<IconBuildingSkyscraper className="text-primary size-4" />{' '}
								Experience
							</CardTitle>
							<div className="space-y-8">
								{profile.experience.map((exp: Experience, i: number) => (
									<div key={i} className="group flex gap-4">
										<div className="flex-1 space-y-1">
											<div className="flex flex-wrap items-center justify-between gap-2">
												<p className="font-semibold">{exp.role}</p>
												{exp.isCurrent && (
													<Badge
														variant="secondary"
														className="border-emerald-100 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
													>
														Current
													</Badge>
												)}
											</div>
											<p className="text-muted-foreground text-sm font-medium">
												{exp.company}
											</p>
											<p className="text-muted-foreground text-xs">
												{exp.startDate} – {exp.endDate ?? 'Present'}
											</p>
											{exp.description && (
												<p className="mt-3 text-sm leading-relaxed text-slate-600">
													{exp.description}
												</p>
											)}
											{exp.technologies && exp.technologies.length > 0 && (
												<div className="mt-3 flex flex-wrap gap-1.5">
													{exp.technologies.map((t: string) => (
														<Badge
															key={t}
															variant="outline"
															className="h-5 px-2 py-0 text-[10px] font-normal tracking-wider uppercase"
														>
															{t}
														</Badge>
													))}
												</div>
											)}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>

				{/* Column 2: Featured Projects */}
				<div className="space-y-6">
					{profile.projects && profile.projects.length > 0 && (
						<div className="space-y-4">
							<CardTitle className="font-lora flex items-center gap-2 text-lg">
								<IconStar className="text-primary size-4" /> Featured Projects
							</CardTitle>
							<div className="grid gap-6 sm:grid-cols-1">
								{profile.projects.map((proj: Project, i: number) => (
									<div
										key={i}
										className="bg-card rounded-xl p-4 transition-colors hover:bg-slate-50/50"
									>
										<div className="flex items-start justify-between gap-2">
											<p className="text-base font-semibold">{proj.name}</p>
											{proj.link && (
												<a
													href={proj.link}
													target="_blank"
													rel="noopener noreferrer"
													className="text-primary hover:bg-primary/10 rounded p-1 transition-colors"
												>
													<IconExternalLink className="size-3.5" />
												</a>
											)}
										</div>
										<p className="mt-2 text-sm leading-relaxed text-slate-600">
											{proj.description}
										</p>
										<div className="mt-3 flex flex-wrap gap-1">
											{proj.technologies.map((t: string) => (
												<span
													key={t}
													className="rounded border bg-white px-2 py-1 text-xs text-slate-500"
												>
													{t}
												</span>
											))}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
