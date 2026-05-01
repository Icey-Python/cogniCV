'use client';

import { toast } from 'sonner';
import Image from 'next/image';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function IntegrationsTab() {
	const handleConnect = () => {
		toast.error('Not available for Your Organization contact admin');
	};

	return (
		<div className="space-y-6">
			<div>
				<div className="my-8 flex flex-row items-center gap-4 space-y-0">
					<div className="bg-background flex h-12 w-12 items-center justify-center rounded-lg border p-2">
						<Image src="/slack.svg" alt="Slack" width={32} height={32} />
					</div>
					<div>
						<CardTitle className="text-xl font-medium">
							Slack Integration
						</CardTitle>
						<CardDescription>
							Talk to our AI agent about job listings, candidates, and analysis.
						</CardDescription>
					</div>
				</div>
				<div className="space-y-4">
					<div className="rounded-xl border bg-slate-50 p-6">
						<div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
							<div className="max-w-lg space-y-1">
								<h3 className="flex items-center gap-2 text-lg font-semibold">
									<Image
										src="/slack-wordmark.svg"
										alt="Slack"
										width={80}
										height={20}
										className="dark:invert"
									/>
								</h3>
								<p className="text-muted-foreground mt-4 text-sm leading-relaxed">
									Bring CogniCV intelligence into your Slack workspace. Get
									instant answers about top candidates, summarize screening
									results, and receive notifications when new applications are
									ranked.
								</p>
								<ul className="grid grid-cols-1 gap-x-8 gap-y-2 pt-2 md:grid-cols-2">
									<li className="text-muted-foreground flex items-center gap-2 text-sm">
										<div className="h-1.5 w-1.5 rounded-full bg-green-500" />
										RAG-powered analysis
									</li>
									<li className="text-muted-foreground flex items-center gap-2 text-sm">
										<div className="h-1.5 w-1.5 rounded-full bg-green-500" />
										Interactive candidate cards
									</li>
									<li className="text-muted-foreground flex items-center gap-2 text-sm">
										<div className="h-1.5 w-1.5 rounded-full bg-green-500" />
										Natural language queries
									</li>
									<li className="text-muted-foreground flex items-center gap-2 text-sm">
										<div className="h-1.5 w-1.5 rounded-full bg-green-500" />
										Direct workspace mentions
									</li>
								</ul>
							</div>
							<div className="flex w-full flex-col items-center gap-3 md:w-auto">
								<Button
									onClick={handleConnect}
									variant="outline"
									className="h-12 w-full px-6 transition-colors hover:bg-slate-50 md:w-auto"
								>
									<Image src="/logo.png" alt="Slack" width={30} height={30} />
									Add to Slack
								</Button>
								<p className="text-muted-foreground text-[10px] font-medium tracking-widest uppercase">
									Enterprise Ready
								</p>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 gap-4 pt-4 md:grid-cols-3">
						<Card className="bg-background border-dashed shadow-none">
							<CardHeader className="pb-2">
								<CardTitle className="font-medium">Quick Mentions</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-sm italic">
									"@cogniCV who is the best match for the Product Designer
									role?"
								</p>
							</CardContent>
						</Card>
						<Card className="bg-background border-dashed shadow-none">
							<CardHeader className="pb-2">
								<CardTitle className="font-medium">Deep Analysis</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-sm italic">
									"Why was Sarah ranked as #1 for the Senior Developer role?"
								</p>
							</CardContent>
						</Card>
						<Card className="bg-background border-dashed shadow-none">
							<CardHeader className="pb-2">
								<CardTitle className="font-medium">Skills Check</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground text-sm italic">
									"Does any candidate for the Marketing Manager role have SEO
									experience?"
								</p>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</div>
	);
}
