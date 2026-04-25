import { useMutation, useQueryClient } from '@tanstack/react-query';
import { OrganizationService } from './service';
import { toast } from 'sonner';
import { queryKeys } from '../keys';

export const useUpdateOrganizationMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: OrganizationService.updateOrganization,
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: queryKeys.organization.details()
			});
			toast.success(
				data.message || 'Organization settings updated successfully'
			);
		},
		onError: (error: any) => {
			toast.error(
				error.response?.data?.message || 'Error updating organization settings'
			);
		}
	});
};
