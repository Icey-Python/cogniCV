'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconBriefcase, IconLayoutDashboard, IconSparkles } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
	{ href: '/', label: 'Home' },
	{ href: '/jobs', label: 'Jobs' },
	{ href: '/dashboard', label: 'Recruiter' }
];

function isActive(pathname: string, href: string): boolean {
	if (href === '/') {
		return pathname === '/';
	}

	return pathname.startsWith(href);
}

export function Navbar() {
	const pathname = usePathname();

	if (pathname.startsWith('/dashboard')) {
		return null;
	}

	return (
		<header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-xl">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
				<Link
					href="/"
					className="inline-flex items-center gap-2 rounded-md px-2 py-1 text-foreground transition-colors hover:bg-accent"
				>
					<div className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
						<IconSparkles className="size-4" />
					</div>
					<span className="font-serif text-xl">CogniCV</span>
				</Link>

				<nav className="hidden items-center gap-2 md:flex">
					{navItems.map((item) => {
						const active = isActive(pathname, item.href);

						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
									active
										? 'bg-primary text-primary-foreground'
										: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
								)}
							>
								{item.label}
							</Link>
						);
					})}
				</nav>
			</div>

			<nav className="border-t border-border/70 px-4 py-2 md:hidden">
				<div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto">
					{navItems.map((item) => {
						const active = isActive(pathname, item.href);

						return (
							<Link
								key={item.href}
								href={item.href}
								className={cn(
									'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
									active
										? 'border-primary bg-primary text-primary-foreground'
										: 'border-border bg-card text-muted-foreground'
								)}
							>
								{item.label}
							</Link>
						);
					})}
					<Link
						href="/dashboard"
						className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
					>
						<IconLayoutDashboard className="mr-1 inline-flex size-3.5" />
						Quick Recruiter
					</Link>
				</div>
			</nav>
		</header>
	);
}
