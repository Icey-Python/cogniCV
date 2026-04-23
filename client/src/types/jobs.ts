export type ExperienceLevel =
	| 'Entry'
	| 'Junior'
	| 'Mid'
	| 'Senior'
	| 'Lead';

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract';

export type JobStatus = 'Open' | 'Closing Soon' | 'Paused';

export interface JobListing {
	id: string;
	title: string;
	company: string;
	location: string;
	type: EmploymentType;
	experienceLevel: ExperienceLevel;
	salaryRange: string;
	postedAt: string;
	summary: string;
	description: string;
	requiredSkills: string[];
	niceToHave: string[];
	applicants: number;
	status: JobStatus;
}

export interface CandidateScore {
	skills: number;
	experience: number;
	education: number;
	availability: number;
}

export interface CandidateProfile {
	id: string;
	name: string;
	headline: string;
	location: string;
	availability: 'Available' | 'Open to opportunities' | 'Not available';
	yearsExperience: number;
	skills: string[];
	matchScore: number;
	subScores: CandidateScore;
	strengths: string[];
	gaps: string[];
	recommendation: string;
	appliedAt: string;
}

export interface RecruiterJobView {
	jobId: string;
	screeningState: 'idle' | 'running' | 'complete';
	applicants: CandidateProfile[];
}

export interface UploadDocumentState {
	kind: 'Resume' | 'Cover Letter' | 'Portfolio';
	fileName: string | null;
	required: boolean;
}
