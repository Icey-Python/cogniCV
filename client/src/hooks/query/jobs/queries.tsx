import { useQuery } from '@tanstack/react-query';
import { JobService, ApplicantService, ScreeningService } from './service';
import { queryKeys } from '../keys';

export const useJobsQuery = (page = 1, limit = 10) => {
	return useQuery({
		queryKey: [...queryKeys.jobs.lists(), { page, limit }],
		queryFn: () => JobService.getJobs(page, limit),
	});
};

export const useSearchJobsQuery = (q?: string, status?: string, source?: string, page = 1, limit = 10) => {
	return useQuery({
		queryKey: [...queryKeys.jobs.lists(), { q, status, source, page, limit }],
		queryFn: () => JobService.searchJobs(q, status, source, page, limit),
	});
};

export const useJobAnalyticsQuery = () => {
	return useQuery({
		queryKey: queryKeys.jobs.analytics(),
		queryFn: () => JobService.getJobAnalytics(),
	});
};

export const useJobQuery = (id: string) => {
	return useQuery({
		queryKey: queryKeys.jobs.detail(id),
		queryFn: () => JobService.getJobById(id),
		enabled: !!id,
	});
};

export const useJobApplicantsQuery = (jobId: string) => {
	return useQuery({
		queryKey: ['applicants', 'job', jobId],
		queryFn: () => ApplicantService.getJobApplicants(jobId),
		enabled: !!jobId,
	});
};

export const useScreeningResultsQuery = (jobId: string) => {
	return useQuery({
		queryKey: ['screening', 'results', jobId],
		queryFn: () => ScreeningService.getScreeningResults(jobId),
		enabled: !!jobId,
		retry: false, // Don't retry if not found
	});
};

export const useMockTalentQuery = () => {
	return useQuery({
		queryKey: ['applicants', 'mock'],
		queryFn: ApplicantService.getMockTalent,
	});
};

export const useMockTalentByIdQuery = (id: string) => {
	return useQuery({
		queryKey: ['applicants', 'mock', id],
		queryFn: () => ApplicantService.getMockTalentById(id),
		enabled: !!id,
	});
};
