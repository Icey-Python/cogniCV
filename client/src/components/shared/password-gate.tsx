'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IconLock } from '@tabler/icons-react';

interface PasswordGateProps {
	children: React.ReactNode;
	onVerify: (password: string) => Promise<boolean>;
}

export function PasswordGate({ children, onVerify }: PasswordGateProps) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [password, setPassword] = useState('');
	const [error, setError] = useState(false);
	const [isVerifying, setIsVerifying] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsVerifying(true);
		try {
			const success = await onVerify(password);
			if (success) {
				setIsAuthenticated(true);
				setError(false);
			} else {
				setError(true);
			}
		} catch (err) {
			setError(true);
		} finally {
			setIsVerifying(false);
		}
	};

	if (isAuthenticated) {
		return <>{children}</>;
	}

	return (
		<div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
			<Card className="w-full max-w-md shadow-lg">
				<CardHeader className="text-center pb-2">
					<div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
						<IconLock className="size-6" />
					</div>
					<CardTitle className="text-2xl font-lora">Protected View</CardTitle>
					<CardDescription>
						This applicant analysis is password protected.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4 pt-4">
						<div className="space-y-2">
							<Input
								type="password"
								placeholder="Enter password"
								value={password}
								onChange={(e) => {
									setPassword(e.target.value);
									setError(false);
								}}
								className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
								autoFocus
							/>
							{error && (
								<p className="text-xs text-destructive">Incorrect password. Please try again.</p>
							)}
						</div>
						<Button type="submit" className="w-full" disabled={isVerifying}>
							{isVerifying ? 'Verifying...' : 'Access Analysis'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
