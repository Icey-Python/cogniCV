'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconTrash, IconPlus, IconMapPin, IconGlobe } from '@tabler/icons-react';

type WorkspaceType = 'Remote' | 'Hybrid' | 'On-site';

interface Location {
	id: string;
	country: string;
	city: string;
	workspaceType: WorkspaceType;
	isDefault?: boolean;
}

const COUNTRIES = [
	'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany',
	'France', 'Rwanda', 'Kenya', 'Nigeria', 'South Africa', 'India', 'Japan'
];

export function LocationsTab() {
	const [locations, setLocations] = useState<Location[]>([
		{ id: '1', country: 'Worldwide', city: 'Anywhere', workspaceType: 'Remote', isDefault: true },
		{ id: '2', country: 'Rwanda', city: 'Kigali', workspaceType: 'Hybrid' },
		{ id: '3', country: 'United States', city: 'New York', workspaceType: 'On-site' },
	]);

	const [country, setCountry] = useState('Rwanda');
	const [city, setCity] = useState('');
	const [workspaceType, setWorkspaceType] = useState<WorkspaceType>('Hybrid');

	const handleAdd = () => {
		if (!city.trim() || !country) return;
		setLocations([...locations, {
			id: Date.now().toString(),
			country,
			city: city.trim(),
			workspaceType
		}]);
		setCity('');
	};

	const handleDelete = (id: string) => {
		setLocations(locations.filter(l => l.id !== id));
	};

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
							<select
								className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								value={country}
								onChange={(e) => setCountry(e.target.value)}
							>
								{COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
							</select>
						</div>
						<div className="grid gap-2">
							<Label>City / Town</Label>
							<Input
								placeholder="e.g. Kigali"
								value={city}
								onChange={(e) => setCity(e.target.value)}
							/>
						</div>
						<div className="grid gap-2">
							<Label>Workspace Type</Label>
							<select
								className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								value={workspaceType}
								onChange={(e) => setWorkspaceType(e.target.value as WorkspaceType)}
							>
								<option value="Remote">Remote</option>
								<option value="Hybrid">Hybrid</option>
								<option value="On-site">On-site</option>
							</select>
						</div>
						<Button onClick={handleAdd} className="gap-2">
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
						{locations.map((loc) => (
							<div key={loc.id} className="flex flex-col p-4 border rounded-xl bg-background relative group">
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
											onClick={() => handleDelete(loc.id)}
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
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
