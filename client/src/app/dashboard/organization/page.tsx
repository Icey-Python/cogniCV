'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { DepartmentsTab } from '@/components/organization/departments-tab';
import { LocationsTab } from '@/components/organization/locations-tab';
import { IntegrationsTab } from '@/components/organization/integrations-tab';

function OrganizationContent() {
	const searchParams = useSearchParams();
	const defaultTab = searchParams.get('tab') || 'departments';

	return (
		<div className="max-w-5xl space-y-8">
			<div>
				<h1 className="text-2xl font-semibold">Organization Settings</h1>
				<p className="text-muted-foreground mt-1">Manage your company structure and locations.</p>
			</div>

			<Tabs defaultValue={defaultTab} className="w-full">
				<TabsList className="grid w-full max-w-[600px] grid-cols-3">
					<TabsTrigger value="departments">Departments</TabsTrigger>
					<TabsTrigger value="locations">Locations</TabsTrigger>
					<TabsTrigger value="integrations">Integrations</TabsTrigger>
				</TabsList>
				<div className="mt-6">
					<TabsContent value="departments" className="mt-0">
						<DepartmentsTab />
					</TabsContent>
					<TabsContent value="locations" className="mt-0">
						<LocationsTab />
					</TabsContent>
					<TabsContent value="integrations" className="mt-0">
						<IntegrationsTab />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}

export default function OrganizationPage() {
	return (
		<Suspense>
			<OrganizationContent />
		</Suspense>
	);
}
