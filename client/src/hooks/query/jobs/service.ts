import { apiBase } from '@/lib/config';
import { IServerResponse } from '@/types/api';
import { Location } from '../organization/service';
import { RankedCandidate, TalentProfile } from '@/types';

export type { TalentProfile };

export enum ExperienceLevel {
	ENTRY = 'Entry',
	JUNIOR = 'Junior',
	MID = 'Mid',
	SENIOR = 'Senior',
	LEAD = 'Lead',
}

export enum JobType {
	FULL_TIME = 'Full-time',
	PART_TIME = 'Part-time',
	CONTRACT = 'Contract',
}

export enum JobStatus {
	ACTIVE = 'Active',
	CLOSED = 'Closed',
	DRAFT = 'Draft',
}

export enum JobSource {
	INTERNAL = 'Internal',
	EXTERNAL = 'External',
}

export interface Job {
	_id: string;
	title: string;
	description: string;
	requiredSkills: string[];
	experienceLevel: ExperienceLevel;
	type: JobType;
	status: JobStatus;
	source: JobSource;
	location: Location;
	aiFocusArea?: string;
	createdBy: string;
	applicantCount?: number;
	createdAt: string;
	updatedAt: string;
}

export type CreateJobPayload = Omit<Job, '_id' | 'status' | 'source' | 'createdBy' | 'createdAt' | 'updatedAt'> & { source?: JobSource };

export interface JobAnalytics {
	activeJobs: number;
	totalTalentPool: number;
	departments: number;
	locations: number;
}

export const JobService = {
	createJob: async (data: CreateJobPayload) => {
		const response = await apiBase.post<IServerResponse<Job>>('/jobs', data);
		return response.data;
	},

	getJobs: async (page = 1, limit = 10) => {
		const response = await apiBase.get<IServerResponse<{ jobs: Job[]; totalJobs: number; page: number; totalPages: number }>>(`/jobs?page=${page}&limit=${limit}`);
		return response.data;
	},

	searchJobs: async (q?: string, status?: string, source?: string, page = 1, limit = 10) => {
		const params = new URLSearchParams();
		if (q) params.append('q', q);
		if (status) params.append('status', status);
		if (source) params.append('source', source);
		params.append('page', page.toString());
		params.append('limit', limit.toString());
		const response = await apiBase.get<IServerResponse<{ jobs: Job[]; totalJobs: number; page: number; totalPages: number }>>(`/jobs/search?${params.toString()}`);
		return response.data;
	},

	getJobAnalytics: async () => {
		const response = await apiBase.get<IServerResponse<JobAnalytics>>('/jobs/analytics');
		return response.data;
	},

	getJobById: async (id: string) => {
		const response = await apiBase.get<IServerResponse<Job>>(`/jobs/${id}`);
		return response.data;
	},

	updateJob: async ({ id, data }: { id: string; data: Partial<CreateJobPayload> }) => {
		const response = await apiBase.put<IServerResponse<Job>>(`/jobs/${id}`, data);
		return response.data;
	},

	deleteJob: async (id: string) => {
		const response = await apiBase.delete<IServerResponse<null>>(`/jobs/${id}`);
		return response.data;
	}
};

// ─── Applicant Service ────────────────────────────────────────────────────────

export const ApplicantService = {
	getMockTalent: async () => {
		const response = await apiBase.get<IServerResponse<TalentProfile[]>>('/applicants/profiles/mock');
		return response.data;
	},

	getMockTalentById: async (id: string) => {
		const response = await apiBase.get<IServerResponse<TalentProfile>>(`/applicants/profiles/mock/${id}`);
		return response.data;
	},

	uploadInternal: async ({ jobId, profiles }: { jobId: string; profiles: TalentProfile[] }) => {
		const response = await apiBase.post<IServerResponse<{ total: number; jobId: string }>>(`/applicants/jobs/${jobId}/upload/internal`, { profiles });
		return response.data;
	},

	uploadCsv: async ({ jobId, file }: { jobId: string; file: File }) => {
		const formData = new FormData();
		formData.append('file', file);
		const response = await apiBase.post<IServerResponse<{ total: number; jobId: string }>>(`/applicants/jobs/${jobId}/upload/csv`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		return response.data;
	},

	uploadPdf: async ({ jobId, files }: { jobId: string; files: File[] }) => {
		const formData = new FormData();
		files.forEach((f) => formData.append('files', f));
		const response = await apiBase.post<IServerResponse<{ total: number; queued: number; failed: number }>>(`/applicants/jobs/${jobId}/upload/pdf`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' },
		});
		return response.data;
	},

	getJobApplicants: async (jobId: string) => {
		const response = await apiBase.get<IServerResponse<{ external: TalentProfile[]; platform: TalentProfile[] }>>(`/applicants/jobs/${jobId}/applicants`);
		return response.data;
	},
};

// ─── Screening Service ───────────────────────────────────────────────────────

export interface ScreeningResult {
	_id: string;
	jobId: string;
	status: 'pending' | 'completed' | 'failed';
	rankedCandidates: RankedCandidate[];
	totalCandidates: number;
	error?: string;
	createdAt: string;
}

export const ScreeningService = {
	triggerScreening: async (jobId: string) => {
		const response = await apiBase.post<IServerResponse<ScreeningResult>>(`/screening/${jobId}/trigger`);
		return response.data;
	},

	getScreeningResults: async (jobId: string, params?: Record<string, string | number>) => {
		const queryParams = new URLSearchParams();
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== '') {
					queryParams.append(key, String(value));
				}
			});
		}
		const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
		const response = await apiBase.get<IServerResponse<ScreeningResult>>(`/screening/${jobId}/results${queryString}`);
		return response.data;
	},

	downloadScreeningCsv: async (jobId: string, params?: Record<string, string | number>) => {
		const queryParams = new URLSearchParams();
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== '') {
					queryParams.append(key, String(value));
				}
			});
		}
		const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
		const response = await apiBase.get(`/screening/${jobId}/download${queryString}`, {
			responseType: 'blob'
		});
		
		const url = window.URL.createObjectURL(new Blob([response.data]));
		const link = document.createElement('a');
		link.href = url;
		link.setAttribute('download', `candidates-${jobId}.csv`);
		document.body.appendChild(link);
		link.click();
		link.parentNode?.removeChild(link);
		window.URL.revokeObjectURL(url);
	}
};

// ─── Share Service ──────────────────────────────────────────────────────────

export const ShareService = {
	generateShareLink: async (data: { jobId: string; candidateId: string; type: string; password?: string }) => {
		const response = await apiBase.post<IServerResponse<{ shareId: string }>>('/share/generate', data);
		return response.data;
	},

	getSharedAnalysis: async (shareId: string, password?: string) => {
		const response = await apiBase.post<IServerResponse<{ job: Job; candidate: RankedCandidate; isProtected: boolean }>>(`/share/${shareId}`, { password });
		return response.data;
	},
};
