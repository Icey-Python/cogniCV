'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconTrash, IconPencil, IconPlus, IconCheck, IconX } from '@tabler/icons-react';
import { useOrganizationQuery } from '@/hooks/query/organization/queries';
import { useUpdateOrganizationMutation } from '@/hooks/query/organization/mutations';
import { Department } from '@/hooks/query/organization/service';

export function DepartmentsTab() {
	const { data: orgData, isLoading } = useOrganizationQuery();
	const updateOrg = useUpdateOrganizationMutation();

	const [departments, setDepartments] = useState<Department[]>([]);
	const [newDept, setNewDept] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editValue, setEditValue] = useState('');

	useEffect(() => {
		if (orgData?.data?.departments) {
			setDepartments(orgData.data.departments);
		}
	}, [orgData]);

	const handleAdd = () => {
		if (!newDept.trim()) return;
		const updated = [...departments, { name: newDept.trim() }];
		updateOrg.mutate({ departments: updated }, {
			onSuccess: () => {
				setNewDept('');
			}
		});
	};

	const handleDelete = (id: string) => {
		const updated = departments.filter(d => d._id !== id);
		updateOrg.mutate({ departments: updated });
	};

	const startEdit = (dept: Department) => {
		if (!dept._id) return;
		setEditingId(dept._id);
		setEditValue(dept.name);
	};

	const saveEdit = () => {
		if (!editValue.trim() || !editingId) return;
		const updated = departments.map(d => d._id === editingId ? { ...d, name: editValue.trim() } : d);
		updateOrg.mutate({ departments: updated }, {
			onSuccess: () => {
				setEditingId(null);
			}
		});
	};

	if (isLoading) {
		return <div className="p-4 text-center text-muted-foreground">Loading departments...</div>;
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<CardTitle>Departments</CardTitle>
					<CardDescription>Manage your organization's departments.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex gap-3 mb-6">
						<Input
							placeholder="New department name..."
							value={newDept}
							onChange={(e) => setNewDept(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
							disabled={updateOrg.isPending}
						/>
						<Button onClick={handleAdd} className="gap-2 shrink-0" disabled={updateOrg.isPending}>
							<IconPlus className="size-4" /> Add Department
						</Button>
					</div>

					<div className="space-y-3">
						{departments.map((dept, index) => (
							<div key={dept._id || index} className="flex items-center justify-between p-3 border rounded-lg bg-background">
								{editingId && editingId === dept._id ? (
									<div className="flex flex-1 items-center gap-2 mr-4">
										<Input
											value={editValue}
											onChange={(e) => setEditValue(e.target.value)}
											onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
											disabled={updateOrg.isPending}
											autoFocus
										/>
										<Button size="icon" variant="ghost" onClick={saveEdit} className="text-green-600" disabled={updateOrg.isPending}>
											<IconCheck className="size-4" />
										</Button>
										<Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="text-muted-foreground" disabled={updateOrg.isPending}>
											<IconX className="size-4" />
										</Button>
									</div>
								) : (
									<>
										<span className="font-medium">{dept.name}</span>
										<div className="flex items-center gap-1">
											<Button size="icon" variant="ghost" onClick={() => startEdit(dept)} className="text-muted-foreground hover:text-foreground" disabled={updateOrg.isPending}>
												<IconPencil className="size-4" />
											</Button>
											<Button size="icon" variant="ghost" onClick={() => dept._id && handleDelete(dept._id)} className="text-destructive hover:text-destructive hover:bg-destructive/10" disabled={updateOrg.isPending}>
												<IconTrash className="size-4" />
											</Button>
										</div>
									</>
								)}
							</div>
						))}
						{departments.length === 0 && (
							<p className="text-center text-muted-foreground py-4">No departments found. Add one above.</p>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
