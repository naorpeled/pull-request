import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pull Request.dev - OSS Contribution Chatbot',
  description: 'Find good first issues to contribute to open source projects',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

