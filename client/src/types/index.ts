// ─── Talent Profile (Umurava Schema) ─────────────────────────────────────────

export interface Skill {
	name: string;
	level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
	yearsOfExperience: number;
}

export interface Language {
	name: string;
	proficiency: 'Basic' | 'Conversational' | 'Fluent' | 'Native';
}

export interface Experience {
	company: string;
	role: string;
	startDate: string;
	endDate?: string;
	description: string;
	technologies: string[];
	isCurrent: boolean;
}

export interface Education {
	institution: string;
	degree: string;
	fieldOfStudy: string;
	startYear: number;
	endYear: number;
}

export interface Certification {
	name: string;
	issuer: string;
	issueDate: string;
}

export interface Project {
	name: string;
	description: string;
	technologies: string[];
	role: string;
	link?: string;
	startDate: string;
	endDate: string;
}

export interface Availability {
	status: 'Available' | 'Open to Opportunities' | 'Not Available';
	type: 'Full-time' | 'Part-time' | 'Contract';
	startDate?: string;
}

export interface SocialLinks {
	linkedin?: string;
	github?: string;
	portfolio?: string;
}

export interface TalentProfile {
	_id?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	headline?: string;
	bio?: string;
	location?: string;
	skills?: Skill[];
	languages?: Language[];
	experience?: Experience[];
	education?: Education[];
	certifications?: Certification[];
	projects?: Project[];
	availability?: Availability;
	socialLinks?: SocialLinks;
	source?: 'csv' | 'pdf' | 'xlsx' | 'internal' | 'platform' | 'external';
	parsingStatus?: 'success' | 'partial' | 'failed' | 'pending';
	resumeUrl?: string;
}

// ─── AI Screening Output ──────────────────────────────────────────────────────

export interface SubScores {
	skills: number;
	experience: number;
	education: number;
	relevance: number;
}

export interface RankedCandidate {
	rank: number;
	candidateId: string;
	profileSource: 'internal' | 'csv' | 'pdf' | 'xlsx' | 'platform' | 'external';
	matchScore: number;
	subScores: SubScores;
	reasoning: {
		strengths: string[];
		gaps: string[];
		recommendation: string;
	};
	profileSnapshot: TalentProfile;
}

// ─── Job ──────────────────────────────────────────────────────────────────────

export type JobType = 'internal' | 'external';
export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract';
export type ExperienceLevel = 'Entry' | 'Junior' | 'Mid' | 'Senior' | 'Lead';
export type JobStatus = 'Active' | 'Closed' | 'Draft';

export interface Job {
	_id: string;
	title: string;
	description: string;
	department: string;
	requiredSkills: string[];
	experienceLevel: ExperienceLevel;
	type: EmploymentType;
	jobType: JobType;
	location: string;
	status: JobStatus;
	applicantCount: number;
	createdAt: string;
}
