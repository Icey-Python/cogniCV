'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/query/auth/useAuth';
import { useUpdateProfileMutation, useUpdatePasswordMutation } from '@/hooks/query/user/mutations';
import { toast } from 'sonner';

export default function ProfilePage() {
	const { user, isLoading } = useAuth();
	const updateProfile = useUpdateProfileMutation();
	const updatePassword = useUpdatePasswordMutation();

	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	
	const [currentPassword, setCurrentPassword] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	useEffect(() => {
		if (user) {
			setName(user.name || '');
			setEmail(user.email || '');
		}
	}, [user]);

	const handleSaveProfile = () => {
		if (!name || !email) {
			toast.error('Name and email are required');
			return;
		}
		updateProfile.mutate({ name, email });
	};

	const handleUpdatePassword = () => {
		if (!currentPassword || !newPassword || !confirmPassword) {
			toast.error('All password fields are required');
			return;
		}
		if (newPassword !== confirmPassword) {
			toast.error('New passwords do not match');
			return;
		}
		updatePassword.mutate(
			{ currentPassword, newPassword },
			{
				onSuccess: () => {
					setCurrentPassword('');
					setNewPassword('');
					setConfirmPassword('');
				}
			}
		);
	};

	if (isLoading) return null;

	return (
		<div className="max-w-4xl space-y-8">
			<div>
				<h1 className="text-2xl font-semibold">Profile Settings</h1>
				<p className="text-muted-foreground mt-1">Manage your account details and password.</p>
			</div>

			<div className="space-y-12">
				<section className="flex flex-col gap-6">
					<div>
						<h2 className="text-lg font-semibold">Personal Information</h2>
						<p className="text-sm text-muted-foreground mt-1">Update your basic profile information and how we should address you.</p>
					</div>
					<div className="space-y-4 max-w-xl">
						<div className="grid gap-2">
							<Label htmlFor="name">Full Name</Label>
							<Input id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={updateProfile.isPending} className="h-11" />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="email">Email Address</Label>
							<Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={updateProfile.isPending} className="h-11" />
						</div>
						<div className="pt-2">
							<Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
								{updateProfile.isPending ? 'Saving...' : 'Save Changes'}
							</Button>
						</div>
					</div>
				</section>

				<section className="flex flex-col gap-6">
					<div>
						<h2 className="text-lg font-semibold">Change Password</h2>
						<p className="text-sm text-muted-foreground mt-1">Update your password to keep your account secure.</p>
					</div>
					<div className="space-y-4 max-w-xl">
						<div className="grid gap-2">
							<Label htmlFor="current">Current Password</Label>
							<Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} disabled={updatePassword.isPending} className="h-11" />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="new">New Password</Label>
							<Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} disabled={updatePassword.isPending} className="h-11" />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="confirm">Confirm New Password</Label>
							<Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={updatePassword.isPending} className="h-11" />
						</div>
						<div className="pt-2">
							<Button onClick={handleUpdatePassword} disabled={updatePassword.isPending}>
								{updatePassword.isPending ? 'Updating...' : 'Update Password'}
							</Button>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
