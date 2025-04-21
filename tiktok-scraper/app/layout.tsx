import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'social tiktok scraper',
  description: 'Created by meeksonJr/mink/mo',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
