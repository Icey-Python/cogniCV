import { useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from './service';
import { queryKeys } from '../keys';
import { toast } from 'sonner';

/**
 * Mutation to create a new user
 */
export const useCreateUserMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: UserService.createUser,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
			toast.success(data.message || 'Account created successfully');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Error creating account');
		}
	});
};

/**
 * Mutation to login a user
 */
export const useLoginMutation = () => {
	return useMutation({
		mutationFn: UserService.login,
		onSuccess: (data) => {
			toast.success(data.message || 'Logged in successfully');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Invalid email or password');
		}
	});
};

/**
 * Mutation to logout a user
 */
export const useLogoutMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: UserService.logout,
		onSuccess: () => {
			queryClient.clear();
			toast.success('Logged out successfully');
			if (typeof window !== 'undefined') {
				window.location.href = '/login';
			}
		},
		onError: () => {
			toast.error('Error logging out');
		}
	});
};

/**
 * Mutation to update user profile details
 */
export const useUpdateProfileMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: UserService.updateProfile,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
			toast.success(data.message || 'Profile updated successfully');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Error updating profile');
		}
	});
};

/**
 * Mutation to update user phone number
 */
export const useUpdatePhoneMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: UserService.updatePhone,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.user });
			toast.success(data.message || 'Phone number updated successfully');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Error updating phone number');
		}
	});
};

/**
 * Mutation to delete a user (Admin only)
 */
export const useDeleteUserMutation = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: UserService.deleteUser,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
			toast.success(data.message || 'User deleted successfully');
		},
		onError: (error: any) => {
			toast.error(error.response?.data?.message || 'Error deleting user');
		}
	});
};
