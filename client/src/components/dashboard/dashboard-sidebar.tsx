import { cn } from '@/lib/utils';
import {
	IconBriefcase,
	IconLayoutDashboard,
	IconSettings,
	IconSparkles,
	IconUpload
} from '@tabler/icons-react';
export type TabType = 'overview' | 'jobs' | 'upload' | 'results' | 'settings';

export const NAV_ITEMS = [
	{ id: 'overview', label: 'Overview', icon: IconLayoutDashboard },
	{ id: 'jobs', label: 'Jobs', icon: IconBriefcase },
	{ id: 'upload', label: 'Upload Profiles', icon: IconUpload },
	{ id: 'results', label: 'Screening Results', icon: IconSparkles },
	{ id: 'settings', label: 'Settings', icon: IconSettings }
] as const;

export function DashboardSidebar({
	activeTab,
	setActiveTab,
	setSelectedJobId,
	selectedJobId
}: {
	activeTab: TabType;
	setActiveTab: (tab: TabType) => void;
	setSelectedJobId: (id: string | null) => void;
	selectedJobId: string | null;
}) {
	return (
		<aside className="w-64 shrink-0 border-r border-border/60 bg-card/40 backdrop-blur-xl">
			<div className="flex h-full flex-col px-4 py-6">
				<div className="mb-8 px-2">
					<div className="gap-2 flex items-center text-xl font-serif font-medium text-primary">
						<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
							<IconSparkles className="size-4" />
						</div>
						CogniCV
					</div>
				</div>

				<nav className="flex flex-1 flex-col gap-1">
					<p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2">
						Workspace
					</p>
					{NAV_ITEMS.map((item) => (
						<button
							key={item.id}
							onClick={() => {
								setActiveTab(item.id as TabType);
								if (item.id !== 'jobs') setSelectedJobId(null);
							}}
							className={cn(
								'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
								activeTab === item.id && !selectedJobId
									? 'bg-accent/80 text-accent-foreground shadow-xs'
									: 'text-muted-foreground hover:bg-accent/40 hover:text-foreground'
							)}
						>
							<item.icon
								className={cn('size-4', activeTab === item.id && !selectedJobId && 'text-primary')}
							/>
							{item.label}
						</button>
					))}
				</nav>
			</div>
		</aside>
	);
}
