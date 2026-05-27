import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import QueryProvider from '@/src/providers/QueryProvider'
import SupabaseProvider from '@/src/providers/SupabaseProvider'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'ClickBIM – EnergiaBIM',
  description: 'Gerenciamento de projetos BIM para EnergiaBIM',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <SupabaseProvider>
            <QueryProvider>
              {children}
            </QueryProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
