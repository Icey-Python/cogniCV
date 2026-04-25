'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconTrash, IconPlus, IconMapPin, IconGlobe } from '@tabler/icons-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CountryDropdown } from '@/components/ui/country-dropdown';
import { useOrganizationQuery } from '@/hooks/query/organization/queries';
import { useUpdateOrganizationMutation } from '@/hooks/query/organization/mutations';
import { Location, WorkspaceType } from '@/hooks/query/organization/service';

export function LocationsTab() {
	const { data: orgData, isLoading } = useOrganizationQuery();
	const updateOrg = useUpdateOrganizationMutation();

	const [locations, setLocations] = useState<Location[]>([]);

	const [country, setCountry] = useState('Rwanda');
	const [city, setCity] = useState('');
	const [workspaceType, setWorkspaceType] = useState<WorkspaceType>('Hybrid');

	useEffect(() => {
		if (orgData?.data?.locations) {
			setLocations(orgData.data.locations);
		}
	}, [orgData]);

	const handleAdd = () => {
		if (!city.trim() || !country) return;
		const updated = [
			...locations, 
			{
				country,
				city: city.trim(),
				workspaceType,
				isDefault: locations.length === 0
			}
		];
		updateOrg.mutate({ locations: updated }, {
			onSuccess: () => {
				setCity('');
			}
		});
	};

	const handleDelete = (id: string) => {
		const updated = locations.filter(l => l._id !== id);
		updateOrg.mutate({ locations: updated });
	};

	if (isLoading) {
		return <div className="p-4 text-center text-muted-foreground">Loading locations...</div>;
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Add Location</CardTitle>
					<CardDescription>Add a new office or remote hiring location.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 sm:grid-cols-4 items-end">
						<div className="grid gap-2">
							<Label>Country</Label>
							<CountryDropdown
								defaultValue={country}
								onChange={(c) => setCountry(c.name)}
							/>
						</div>
						<div className="grid gap-2">
							<Label>City / Town</Label>
							<Input
								placeholder="e.g. Kigali"
								value={city}
								onChange={(e) => setCity(e.target.value)}
								disabled={updateOrg.isPending}
							/>
						</div>
						<div className="grid gap-2">
							<Label>Workspace Type</Label>
							<Select value={workspaceType} onValueChange={(v) => setWorkspaceType(v as WorkspaceType)} disabled={updateOrg.isPending}>
								<SelectTrigger>
									<SelectValue placeholder="Select type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Remote">Remote</SelectItem>
									<SelectItem value="Hybrid">Hybrid</SelectItem>
									<SelectItem value="On-site">On-site</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<Button onClick={handleAdd} className="gap-2" disabled={updateOrg.isPending}>
							<IconPlus className="size-4" /> Add
						</Button>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Active Locations</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{locations.map((loc, index) => (
							<div key={loc._id || index} className="flex flex-col p-4 border rounded-xl bg-background relative group">
								<div className="flex items-start justify-between mb-2">
									<div className="flex items-center gap-2 text-primary">
										{loc.isDefault ? <IconGlobe className="size-5" /> : <IconMapPin className="size-5" />}
										<span className="font-semibold text-foreground">
											{loc.city}{loc.city !== 'Anywhere' ? ',' : ''} {loc.country}
										</span>
									</div>
									{!loc.isDefault && (
										<Button
											size="icon"
											variant="ghost"
											onClick={() => loc._id && handleDelete(loc._id)}
											disabled={updateOrg.isPending}
											className="h-6 w-6 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-destructive hover:bg-destructive/10"
										>
											<IconTrash className="size-4" />
										</Button>
									)}
								</div>
								<div className="mt-auto pt-2 flex items-center justify-between">
									<span className="text-xs font-medium px-2 py-1 bg-muted rounded-full">
										{loc.workspaceType}
									</span>
									{loc.isDefault && (
										<span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
											Default
										</span>
									)}
								</div>
							</div>
						))}
						{locations.length === 0 && (
							<p className="text-muted-foreground py-2 col-span-full">No locations found. Add one above.</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
