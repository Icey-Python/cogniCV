import { IconSparkles } from '@tabler/icons-react';
import { LoginForm } from '@/components/login-form';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="relative hidden lg:flex flex-col text-white">
				<Image
					src="/login_image.webp"
					alt="cogniCV Background"
					fill
					priority
					className="absolute inset-0 h-full w-full object-cover brightness-50"
				/>
				<div className="relative z-10 p-10 flex items-center gap-2 font-lora text-xl font-bold">
					<div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
						<IconSparkles className="size-4" />
					</div>
					cogniCV
				</div>
				<div className="relative z-10 mt-auto p-10 mb-10">
					<h1 className="text-4xl font-bold mb-4 font-work-sans">AI-Powered Recruitment</h1>
					<p className="text-lg opacity-90 max-w-md">
						Screen candidates and create jobs in just a few clicks.
					</p>
				</div>
			</div>

			<div className="flex flex-col p-6 md:p-10 relative bg-white">
				<div className="flex flex-1 items-center justify-center">
					<div className="w-full max-w-sm">
						<LoginForm />
					</div>
				</div>
			</div>
		</div>
	);
}


