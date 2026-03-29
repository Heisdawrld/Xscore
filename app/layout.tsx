import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar }  from '@/components/layout/TopBar'

export const metadata: Metadata = {
  title:       'XScore — Premium Football Analytics',
  description: 'Real-time football analysis, predictions, and live match data',
  themeColor:  '#0a0f1e',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-text-primary font-sans">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
