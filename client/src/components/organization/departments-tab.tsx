'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconTrash, IconPencil, IconPlus, IconCheck, IconX } from '@tabler/icons-react';

interface Department {
	id: string;
	name: string;
}

export function DepartmentsTab() {
	const [departments, setDepartments] = useState<Department[]>([
		{ id: '1', name: 'Engineering' },
		{ id: '2', name: 'Design' },
		{ id: '3', name: 'Product' },
		{ id: '4', name: 'Marketing' },
	]);
	const [newDept, setNewDept] = useState('');
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editValue, setEditValue] = useState('');

	const handleAdd = () => {
		if (!newDept.trim()) return;
		setDepartments([...departments, { id: Date.now().toString(), name: newDept.trim() }]);
		setNewDept('');
	};

	const handleDelete = (id: string) => {
		setDepartments(departments.filter(d => d.id !== id));
	};

	const startEdit = (dept: Department) => {
		setEditingId(dept.id);
		setEditValue(dept.name);
	};

	const saveEdit = () => {
		if (!editValue.trim() || !editingId) return;
		setDepartments(departments.map(d => d.id === editingId ? { ...d, name: editValue.trim() } : d));
		setEditingId(null);
	};

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
						/>
						<Button onClick={handleAdd} className="gap-2 shrink-0">
							<IconPlus className="size-4" /> Add Department
						</Button>
					</div>

					<div className="space-y-3">
						{departments.map((dept) => (
							<div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg bg-background">
								{editingId === dept.id ? (
									<div className="flex flex-1 items-center gap-2 mr-4">
										<Input
											value={editValue}
											onChange={(e) => setEditValue(e.target.value)}
											onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
											autoFocus
										/>
										<Button size="icon" variant="ghost" onClick={saveEdit} className="text-green-600">
											<IconCheck className="size-4" />
										</Button>
										<Button size="icon" variant="ghost" onClick={() => setEditingId(null)} className="text-muted-foreground">
											<IconX className="size-4" />
										</Button>
									</div>
								) : (
									<>
										<span className="font-medium">{dept.name}</span>
										<div className="flex items-center gap-1">
											<Button size="icon" variant="ghost" onClick={() => startEdit(dept)} className="text-muted-foreground hover:text-foreground">
												<IconPencil className="size-4" />
											</Button>
											<Button size="icon" variant="ghost" onClick={() => handleDelete(dept.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
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
