import type { Metadata } from 'next'
import { Inter, Syne, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Sidebar }   from '@/components/layout/Sidebar'
import { TopBar }    from '@/components/layout/TopBar'
import { MobileNav } from '@/components/layout/MobileNav'

const inter      = Inter({ subsets:['latin'], variable:'--font-inter', display:'swap' })
const syne       = Syne({ subsets:['latin'], variable:'--font-syne', weight:['600','700','800'], display:'swap' })
const jetbrains  = JetBrains_Mono({ subsets:['latin'], variable:'--font-jetbrains', weight:['400','500'], display:'swap' })

export const metadata: Metadata = {
  title: 'XScore — Premium Football Analytics',
  description: 'Real-time football analysis, predictions & live data',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${syne.variable} ${jetbrains.variable}`}>
      <head>
        <meta name="theme-color" content="#0a0f1e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body style={{ margin:0, padding:0, background:'#0a0f1e', color:'#e8f4fd', fontFamily:'var(--font-inter,Inter,sans-serif)', WebkitFontSmoothing:'antialiased' }}>
        {/* Desktop layout */}
        <div style={{ display:'flex', height:'100dvh', overflow:'hidden' }} className="desktop-shell">
          {/* Sidebar — desktop only */}
          <div className="desktop-sidebar">
            <Sidebar />
          </div>

          {/* Right: topbar + main */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0 }}>
            <TopBar />
            <main style={{ flex:1, overflowY:'auto', padding:'20px 16px' }} className="main-scroll">
              {children}
            </main>
          </div>
        </div>

        {/* Mobile bottom nav */}
        <div className="mobile-nav">
          <MobileNav />
        </div>

        <style>{`
          .desktop-sidebar { display: flex; }
          .mobile-nav      { display: none; }
          .main-scroll     { padding-bottom: 16px; }

          @media (max-width: 768px) {
            .desktop-sidebar { display: none !important; }
            .mobile-nav      { display: block !important; }
            .main-scroll     { padding-bottom: 90px !important; padding-left: 12px !important; padding-right: 12px !important; }
            .desktop-shell   { height: 100dvh; }
          }
        `}</style>
      </body>
    </html>
  )
}
