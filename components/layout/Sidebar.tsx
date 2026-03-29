'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Calendar, BarChart2,
  Trophy, Users, Zap, TrendingUp, ArrowRightLeft,
} from 'lucide-react'

const NAV = [
  { href: '/',             label: 'Home',        icon: LayoutDashboard },
  { href: '/matches',      label: 'Matches',     icon: Calendar },
  { href: '/predictions',  label: 'Predictions', icon: Zap },
  { href: '/competitions', label: 'Leagues',     icon: Trophy },
  { href: '/teams',        label: 'Teams',       icon: Users },
  { href: '/players',      label: 'Players',     icon: BarChart2 },
  { href: '/transfers',    label: 'Transfers',   icon: ArrowRightLeft },
]

const S = {
  sidebar: {
    width: 220,
    background: '#0d1b2a',
    borderRight: '1px solid #1e3a5f',
    display: 'flex',
    flexDirection: 'column' as const,
    flexShrink: 0,
  },
  logoWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '20px 24px',
    borderBottom: '1px solid #1e3a5f',
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: 'linear-gradient(135deg,#00ff87,#00b4d8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontFamily: 'var(--font-syne, Syne, sans-serif)',
    fontSize: 22,
    fontWeight: 800,
    color: '#e8f4fd',
    letterSpacing: '0.02em',
  },
  nav: { flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column' as const, gap: 4 },
  footer: { padding: '16px 20px', borderTop: '1px solid #1e3a5f' },
  footerText: { fontSize: 11, color: '#4a6fa5' },
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={S.sidebar} className="hidden md:flex">
      <div style={S.logoWrap}>
        <div style={S.logoIcon}>
          <TrendingUp size={16} color="#0a0f1e" />
        </div>
        <span style={S.logoText}>XScore</span>
      </div>

      <nav style={S.nav}>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={href} href={href} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  background:   active ? 'rgba(0,255,135,0.08)' : 'transparent',
                  border:       active ? '1px solid rgba(0,255,135,0.18)' : '1px solid transparent',
                  color:        active ? '#00ff87' : '#8bafc7',
                  transition:   'all 0.15s',
                }}
              >
                <Icon size={17} />
                <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
                {active && (
                  <motion.div
                    layoutId="nav-dot"
                    style={{ width: 6, height: 6, borderRadius: 3, background: '#00ff87', marginLeft: 'auto' }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div style={S.footer}>
        <p style={S.footerText}>Powered by Sportradar v4</p>
      </div>
    </aside>
  )
}
