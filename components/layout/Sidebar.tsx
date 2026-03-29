'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Calendar, BarChart2, Trophy,
  Users, Zap, TrendingUp, ArrowRightLeft,
} from 'lucide-react'

const NAV = [
  { href: '/',              label: 'Home',         icon: LayoutDashboard },
  { href: '/matches',       label: 'Matches',      icon: Calendar },
  { href: '/predictions',   label: 'Predictions',  icon: Zap },
  { href: '/competitions',  label: 'Competitions', icon: Trophy },
  { href: '/teams',         label: 'Teams',        icon: Users },
  { href: '/players',       label: 'Players',      icon: BarChart2 },
  { href: '/transfers',     label: 'Transfers',    icon: ArrowRightLeft },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex flex-col w-60 bg-surface border-r border-border flex-shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
          <TrendingUp size={16} className="text-background" />
        </div>
        <span className="font-display text-xl font-bold tracking-wide text-text-primary">XScore</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <Link key={href} href={href}>
              <motion.div
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.97 }}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors
                  ${ active
                    ? 'bg-primary/10 text-primary border border-primary/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }
                `}
              >
                <Icon size={18} className={active ? 'text-primary' : ''} />
                <span className="text-sm font-medium">{label}</span>
                {active && (
                  <motion.div
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-xs text-text-muted">Powered by Sportradar</p>
      </div>
    </aside>
  )
}
