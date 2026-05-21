import { IonMenuButton } from '@ionic/react'
import { Bell, Search, User, LogOut, Briefcase, CheckCircle2 } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { SlidePanel } from './ui/SlidePanel'
import { NotificationItem, Notification } from './notifications/NotificationItem'
import { useState } from 'react'
import ThemeToggle from './ThemeToggle'

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'stock',
    title: 'Low Stock Alert',
    description: 'Rajavadi Kaju is out of stock. Please check inventory levels.',
    time: '5 mins ago',
    isRead: false
  },
  {
    id: '2',
    type: 'order',
    title: 'New Order Received',
    description: 'Order #ORD-1092 placed by Blue Wave Co. for $2,450.',
    time: '2 hours ago',
    isRead: false
  },
  {
    id: '3',
    type: 'return',
    title: 'Return Request',
    description: 'Apex Logistics has requested a return for Cedar Valley order.',
    time: '1 day ago',
    isRead: true
  },
  {
    id: '4',
    type: 'system',
    title: 'System Update',
    description: 'Monthly sales performance report is now ready for review.',
    time: '2 days ago',
    isRead: true
  },
]

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/reports': 'Reports',
  '/customers': 'Customers',
  '/items': 'Items',
  '/categories': 'Categories',
  '/brands': 'Brands',
  '/orders': 'Orders',
  '/areas': 'Areas',
  '/routes': 'Routes',
  '/warehouses': 'Warehouses',
  '/returns': 'Returns',
  '/users': 'Users',
  '/roles': 'Roles',
  '/salesman': 'Salesman',
  '/uom': 'Item UOM',
}

export function TopBar() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const path = '/' + location.pathname.split('/')[1]
  const title = PAGE_TITLES[path] ?? 'Dashboard'

  const [notifications, setNotifications] = useState<Notification[]>(MOCK_NOTIFICATIONS)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)

  const unreadCount = notifications.filter(n => !n.isRead).length

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'AD'

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700/60 flex items-center px-4 gap-3 flex-shrink-0 transition-colors duration-200">
      {/* Hamburger — IonMenuButton auto-wires to IonSplitPane, hides itself on desktop */}
      <div className="md:hidden -ml-1">
        <IonMenuButton menu="main-menu" color="medium" />
      </div>

      <h1 className="text-base font-semibold text-slate-900 dark:text-white truncate">{title}</h1>

      <div className="flex-1" />

      <button
        className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
        aria-label="Notifications"
        onClick={() => setIsNotificationsOpen(true)}
      >
        <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-brand-500 border-2 border-white dark:border-slate-900" />
        )}
      </button>

      <ThemeToggle iconSize={18} />

      <SlidePanel
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        title="Notifications"
        subtitle={`${unreadCount} unread`}
        width="500"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              onClick={markAllAsRead}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark all as read
            </button>
            <span className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">
              Last sync: Just now
            </span>
          </div>
        }
      >
        <div className="space-y-2 py-1">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={markAsRead}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 opacity-40">
              <Bell className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-sm font-medium text-slate-500">All caught up!</p>
            </div>
          )}
        </div>
      </SlidePanel>

      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button className="w-8 h-8 rounded-full bg-brand-500 hover:bg-brand-600 flex items-center justify-center text-xs font-semibold text-white cursor-pointer flex-shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2">
            {initials}
          </button>
        </DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="z-50 min-w-[200px] bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl dark:shadow-2xl p-1.5 animate-in fade-in zoom-in duration-200 origin-top-right mx-4"
            sideOffset={8}
            align="end"
          >
            <div className="px-3 py-2 border-b border-slate-50 dark:border-slate-700 mb-1.5">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{user?.name || 'Admin User'}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate uppercase tracking-wider">{user?.role || 'Administrator'}</p>
            </div>

            <DropdownMenu.Item asChild>
              <Link
                to="/profile"
                className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white outline-none transition-colors cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Your Profile</span>
              </Link>
            </DropdownMenu.Item>

            <DropdownMenu.Item className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white outline-none transition-colors cursor-pointer">
              <LogOut className="w-4 h-4" />
              <button
                onClick={() => logout()}
                className="w-full text-left"
              >
                Sign out
              </button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  )
}
