import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JobService, ApplicantService, ScreeningService, ShareService } from './service';
import { queryKeys } from '../keys';
import { toast } from 'sonner';

export const useCreateJobMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: JobService.createJob,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
			toast.success(data.message || 'Job created successfully');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Error creating job');
		}
	});
};

export const useUpdateJobMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: JobService.updateJob,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
			queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(data.data._id) });
			toast.success(data.message || 'Job updated successfully');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Error updating job');
		}
	});
};

export const useDeleteJobMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: JobService.deleteJob,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.jobs.lists() });
			toast.success(data.message || 'Job deleted successfully');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Error deleting job');
		}
	});
};

export const useUploadInternalMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ApplicantService.uploadInternal,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['applicants', 'job', data.data.jobId] });
			toast.success(data.message || 'Applicants imported successfully');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Error importing applicants');
		}
	});
};

export const useUploadCsvMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ApplicantService.uploadCsv,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['applicants', 'job', data.data.jobId] });
			toast.success(data.message || 'CSV uploaded successfully');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Error uploading CSV');
		}
	});
};

export const useUploadPdfMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ApplicantService.uploadPdf,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['applicants', 'job'] }); // Invalidate all job applicants for now
			toast.success(`${data.data?.queued ?? 0} resumes queued for processing`);
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Error uploading PDFs');
		}
	});
};

export const useTriggerScreeningMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (jobId: string) => ScreeningService.triggerScreening(jobId),
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ['screening', 'results', data.data.jobId] });
			toast.success(data.message || 'Screening completed successfully');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Error during screening');
		}
	});
};

export const useGenerateShareLinkMutation = () => {
	return useMutation({
		mutationFn: ShareService.generateShareLink,
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Error generating share link');
		}
	});
};
