'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DepartmentsTab } from '@/components/organization/departments-tab';
import { LocationsTab } from '@/components/organization/locations-tab';

export default function OrganizationPage() {
	return (
		<div className="max-w-5xl space-y-8">
			<div>
				<h1 className="text-2xl font-semibold">Organization Settings</h1>
				<p className="text-muted-foreground mt-1">Manage your company structure and locations.</p>
			</div>

			<Tabs defaultValue="departments" className="w-full">
				<TabsList className="grid w-full max-w-[400px] grid-cols-2">
					<TabsTrigger value="departments">Departments</TabsTrigger>
					<TabsTrigger value="locations">Locations</TabsTrigger>
				</TabsList>
				<div className="mt-6">
					<TabsContent value="departments" className="mt-0">
						<DepartmentsTab />
					</TabsContent>
					<TabsContent value="locations" className="mt-0">
						<LocationsTab />
					</TabsContent>
				</div>
			</Tabs>
		</div>
	);
}
