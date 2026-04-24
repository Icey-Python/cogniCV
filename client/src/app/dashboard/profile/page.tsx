'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ProfilePage() {
	const [name, setName] = useState('Recruiter');
	const [email, setEmail] = useState('recruiter@cognicv.ai');
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	return (
		<div className="max-w-4xl space-y-8">
			<div>
				<h1 className="text-2xl font-semibold">Profile Settings</h1>
				<p className="text-muted-foreground mt-1">Manage your account details and password.</p>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>Personal Information</CardTitle>
					<CardDescription>Update your basic profile information.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-2">
						<Label htmlFor="name">Full Name</Label>
						<Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="email">Email Address</Label>
						<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
					</div>
					<Button className="mt-4">Save Changes</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Change Password</CardTitle>
					<CardDescription>Update your password to keep your account secure.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid gap-2">
						<Label htmlFor="current">Current Password</Label>
						<Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="new">New Password</Label>
						<Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
					</div>
					<div className="grid gap-2">
						<Label htmlFor="confirm">Confirm New Password</Label>
						<Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
					</div>
					<Button className="mt-4">Update Password</Button>
				</CardContent>
			</Card>
		</div>
	);
}
