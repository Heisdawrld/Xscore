'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Calendar, Zap, Trophy, Users } from 'lucide-react'

const NAV = [
  { href: '/',             label: 'Home',    icon: LayoutDashboard },
  { href: '/matches',      label: 'Matches', icon: Calendar },
  { href: '/predictions',  label: 'Predict', icon: Zap },
  { href: '/competitions', label: 'Leagues', icon: Trophy },
  { href: '/teams',        label: 'Teams',   icon: Users },
]

export function MobileNav() {
  const pathname = usePathname()
  return (
    <nav style={{
      position:'fixed', bottom:0, left:0, right:0, zIndex:100,
      background:'rgba(10,15,30,0.97)',
      backdropFilter:'blur(20px)',
      WebkitBackdropFilter:'blur(20px)',
      borderTop:'1px solid #1e3a5f',
      display:'flex',
      paddingBottom:'env(safe-area-inset-bottom)',
    }}>
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href==='/' ? pathname==='/' : pathname.startsWith(href)
        return (
          <Link key={href} href={href} style={{ flex:1, textDecoration:'none' }}>
            <div style={{
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              padding:'10px 0 8px',
              color: active ? '#00ff87' : '#4a6fa5',
            }}>
              <div style={{
                padding:'5px 14px', borderRadius:9,
                background: active ? 'rgba(0,255,135,0.1)' : 'transparent',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <Icon size={20} />
              </div>
              <span style={{ fontSize:10, fontWeight: active ? 700 : 400 }}>{label}</span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}
