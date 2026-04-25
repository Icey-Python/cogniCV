import { useMutation, useQueryClient } from '@tanstack/react-query';
import { JobService } from './service';
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
