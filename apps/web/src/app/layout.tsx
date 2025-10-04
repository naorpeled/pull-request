import './global.css';

export const metadata = {
  title: 'PullRequest.dev - Find Good First Issues & Make Your First PR',
  description: 'AI-powered guide to help you discover good first issues and make your first pull request to open source projects',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#4F46E5" />
      </head>
      <body>{children}</body>
    </html>
  );
}
