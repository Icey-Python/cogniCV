import { apiBase } from '@/lib/config';
import { IServerResponse } from '@/types/api';
import { Location } from '../organization/service';

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
	createdAt: string;
	updatedAt: string;
}

export type CreateJobPayload = Omit<Job, '_id' | 'status' | 'source' | 'createdBy' | 'createdAt' | 'updatedAt'> & { source?: JobSource };

export interface JobAnalytics {
	activeJobs: number;
	totalCandidates: number;
	avgMatchScore: number;
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
