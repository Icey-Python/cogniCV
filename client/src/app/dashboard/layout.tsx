import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';

import { DashboardBreadcrumb } from '@/components/dashboard-breadcrumb';

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<SidebarInset>
				<header className="flex h-14 shrink-0 items-center gap-2 border-b px-6 sticky top-0 z-10 bg-background">
					<SidebarTrigger className="-ml-1" />
					<Separator orientation="vertical" className="mr-2 h-4 data-[orientation=vertical]:h-4" />
					<DashboardBreadcrumb />
				</header>
				<main className="flex-1 p-6 lg:p-10">
					{children}
				</main>
			</SidebarInset>
		</SidebarProvider>
	);
}
