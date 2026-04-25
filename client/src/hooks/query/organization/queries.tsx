import { useQuery } from '@tanstack/react-query';
import { OrganizationService } from './service';
import { queryKeys } from '../keys';

export const useOrganizationQuery = () => {
	return useQuery({
		queryKey: queryKeys.organization.details(),
		queryFn: OrganizationService.getOrganization
	});
};
