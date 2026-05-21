import { NavLink } from 'react-router-dom'
import { cn } from '../lib/cn'
import {
  LayoutDashboard, Users, Package, Tag, Award, ShoppingCart,
  MapPin, Route, Warehouse, RotateCcw, UserCog, Shield, Key,
  X, Boxes, BadgeCheck,
} from 'lucide-react'

interface NavItem {
  label: string
  path: string
  icon: React.ReactNode
}

interface NavSection {
  heading?: string
  items: NavItem[]
}

const NAV: NavSection[] = [
  {
    items: [
      { label: 'Dashboard',   path: '/dashboard',   icon: <LayoutDashboard className="w-4 h-4" /> },
    ],
  },
  {
    heading: 'Catalog',
    items: [
      { label: 'Items',       path: '/items',       icon: <Package      className="w-4 h-4" /> },
      { label: 'Categories',  path: '/categories',  icon: <Tag          className="w-4 h-4" /> },
      { label: 'Brands',      path: '/brands',      icon: <Award        className="w-4 h-4" /> },
    ],
  },
  {
    heading: 'Operations',
    items: [
      { label: 'Customers',   path: '/customers',   icon: <Users        className="w-4 h-4" /> },
      { label: 'salesman',    path: '/salesman',    icon: <BadgeCheck   className="w-4 h-4" /> },
      { label: 'Orders',      path: '/orders',      icon: <ShoppingCart className="w-4 h-4" /> },
      { label: 'Returns',     path: '/returns',     icon: <RotateCcw    className="w-4 h-4" /> },
    ],
  },
  {
    heading: 'Logistics',
    items: [
      { label: 'Areas',       path: '/areas',       icon: <MapPin       className="w-4 h-4" /> },
      { label: 'Routes',      path: '/routes',      icon: <Route        className="w-4 h-4" /> },
      { label: 'Warehouses',  path: '/warehouses',  icon: <Warehouse    className="w-4 h-4" /> },
    ],
  },
  {
    heading: 'System',
    items: [
      { label: 'Users',       path: '/users',       icon: <UserCog      className="w-4 h-4" /> },
      { label: 'Roles',       path: '/roles',       icon: <Shield       className="w-4 h-4" /> },
    ],
  },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  return (
    <div className="flex flex-col w-60 h-full bg-sidebar text-white overflow-y-auto scrollbar-thin">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
            <Boxes className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight">OrderFlow</span>
        </div>
        <button
          onClick={onClose}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {NAV.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                {section.heading}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) => cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150',
                    isActive
                      ? 'bg-brand-500 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  )}
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}
