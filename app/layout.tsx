import type { Metadata } from 'next'
import './globals.css'
import { SITE_NAME, INSTITUTE_NAME_EN } from '@/lib/constants'

export const metadata: Metadata = {
  title: `${SITE_NAME} — ${INSTITUTE_NAME_EN}`,
  description: `Official ${SITE_NAME} Digital Result Verification and Marksheet Portal for ${INSTITUTE_NAME_EN}.`,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700;800&family=Poppins:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
