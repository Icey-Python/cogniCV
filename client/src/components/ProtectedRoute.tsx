'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UserRole } from '@/types/api';
import { useAuth } from '@/hooks/query/auth/useAuth';

interface ProtectedRouteProps {
	children: React.ReactNode;
	allowedRoles?: UserRole[];
	fallbackPath?: string;
}

/**
 * Component that protects routes based on authentication and role
 * Redirects to login if not authenticated
 * Shows 403 or redirects if user doesn't have required role
 */
export function ProtectedRoute({
	children,
	allowedRoles,
	fallbackPath = '/'
}: ProtectedRouteProps) {
	const router = useRouter();
	const pathname = usePathname();
	const { user, isLoading, isAuthenticated } = useAuth();

	useEffect(() => {
		// Don't redirect while loading
		if (isLoading) return;

		// Redirect to login if not authenticated
		if (!isAuthenticated) {
			// Store intended destination for redirect after login
			const returnUrl = encodeURIComponent(pathname);
			router.push(`${fallbackPath}?returnUrl=${returnUrl}`);
			return;
		}

		// Check role-based access if roles specified
		if (allowedRoles && allowedRoles.length > 0 && user) {
			const hasAccess = allowedRoles.includes(user.role as UserRole);

			if (!hasAccess) {
				// Redirect based on user's actual role
				if (user.role === UserRole.ADMIN) {
					router.push('/admin');
				} else if (user.role === UserRole.RECRUITER) {
					router.push('/dashboard');
				} else {
					router.push('/');
				}
			}
		}
	}, [
		isLoading,
		isAuthenticated,
		user,
		allowedRoles,
		router,
		pathname,
		fallbackPath
	]);

	// Show loading state
	if (isLoading) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="flex flex-col items-center gap-4">
					<div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
					<p className="text-muted-foreground text-sm">Loading...</p>
				</div>
			</div>
		);
	}

	// Don't render children if not authenticated
	if (!isAuthenticated) {
		return null;
	}

	// Don't render children if role check fails
	if (allowedRoles && allowedRoles.length > 0 && user) {
		const hasAccess = allowedRoles.includes(user.role as UserRole);
		if (!hasAccess) {
			return (
				<div className="flex h-screen items-center justify-center">
					<div className="text-center">
						<h1 className="text-4xl font-bold">403</h1>
						<p className="text-muted-foreground">Access Denied</p>
						<p className="text-muted-foreground mt-2 text-sm">
							You don't have permission to access this page.
						</p>
					</div>
				</div>
			);
		}
	}

	return <>{children}</>;
}
