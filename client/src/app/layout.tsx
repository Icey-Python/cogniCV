import './globals.css';
import { Work_Sans, Lora, JetBrains_Mono } from 'next/font/google';
import type { Metadata, Viewport } from 'next';

const fontWorkSans = Work_Sans({
	subsets: ['latin'],
	variable: '--font-work-sans'
});

const fontLora = Lora({
	subsets: ['latin'],
	variable: '--font-lora'
});

const fontJetBrainsMono = JetBrains_Mono({
	subsets: ['latin'],
	variable: '--font-jetbrains-mono'
});

export const metadata: Metadata = {
	title: 'cogniCV | AI-powered ATS analyzer for job seekers',
	description:
		'cogniCV is an AI-powered ATS analyzer designed to help job seekers optimize their resumes for Applicant Tracking Systems (ATS). With cogniCV, users can easily upload their resumes and receive detailed feedback on how well their resumes are likely to perform in ATS screenings. The tool provides actionable insights and recommendations to improve resume formatting, keyword usage, and overall content, increasing the chances of getting noticed by recruiters and landing job interviews.',
	metadataBase: new URL('https://yourwebsite.com'),
	openGraph: {
		type: 'website',
		locale: 'en_US',
		url: '/',
		images: '/opengraph-image.png' // TODO: Update extension for your image
	},
	robots: {
		index: true,
		follow: true,
		nocache: true,
		googleBot: {
			'index': true,
			'follow': true,
			'noimageindex': false,
			'max-video-preview': -1,
			'max-image-preview': 'large',
			'max-snippet': -1
		}
	},
	keywords: ['Add', 'your', 'keywords', 'here'],
	category: 'Add your category here'
};
export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1
};

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${fontWorkSans.className} ${fontLora.variable} ${fontJetBrainsMono.variable} antialiased`}
			>
				<div className="bg-background text-foreground min-h-screen">
					{children}
				</div>
			</body>
		</html>
	);
}
