'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useAuth } from '@/hooks/query/auth/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/components/ui/form';
import { IconEye, IconEyeOff, IconLoader2 } from '@tabler/icons-react';

const loginSchema = z.object({
	email: z.email({ message: 'Please enter a valid email address.' }),
	password: z.string().min(1, { message: 'Password is required.' })
});

export function LoginForm({
	className,
	...props
}: React.ComponentPropsWithoutRef<'div'>) {
	const { login, isLoading } = useAuth();
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: '',
			password: ''
		}
	});

	const onSubmit = async (values: z.infer<typeof loginSchema>) => {
		await login(values);
	};

	return (
		<div className={cn('flex flex-col gap-8', className)} {...props}>
			<div className="flex flex-col gap-2">
				<h1 className="text-3xl font-bold text-foreground font-lora">
					Welcome Back to cogniCV!
				</h1>
				<p className="text-muted-foreground text-sm">
					Sign in your account
				</p>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6">
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs text-muted-foreground font-normal">Your Email</FormLabel>
								<FormControl>
									<Input
										placeholder="e.g. recruiter@company.com"
										type="email"
										{...field}
										disabled={isLoading}
										className="h-12 rounded-lg"
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-xs text-muted-foreground font-normal">Password</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											type={showPassword ? 'text' : 'password'}
											placeholder="••••••••"
											{...field}
											disabled={isLoading}
											className="h-12 rounded-lg pr-10"
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
										>
											{showPassword ? <IconEyeOff className="size-5" /> : <IconEye className="size-5" />}
										</button>
									</div>
								</FormControl>
								<div className="flex justify-end mt-2">
									<Link
										href="#"
										className="text-xs text-muted-foreground hover:text-primary transition-colors"
									>
										Forgot Password?
									</Link>
								</div>
								<FormMessage />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full h-12 mt-2 rounded-lg text-base" disabled={isLoading}>
						{isLoading ? 'Logging in...' : 'Login'}
					</Button>
				</form>
			</Form>
		</div>
	);
}

