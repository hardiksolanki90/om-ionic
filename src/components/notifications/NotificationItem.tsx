import React from 'react'
import { Bell, ShoppingBag, Package, AlertCircle, Clock } from 'lucide-react'
import { cn } from '../../lib/cn'

export type NotificationType = 'order' | 'stock' | 'system' | 'return'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  description: string
  time: string
  isRead: boolean
}

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
}

const icons: Record<NotificationType, React.ReactNode> = {
  order:  <ShoppingBag className="w-4 h-4 text-sky-600 dark:text-sky-400" />,
  stock:  <Package      className="w-4 h-4 text-orange-600 dark:text-orange-400" />,
  return: <AlertCircle  className="w-4 h-4 text-rose-600 dark:text-rose-400" />,
  system: <Bell         className="w-4 h-4 text-violet-600 dark:text-violet-400" />,
}

const bgs: Record<NotificationType, string> = {
  order:  'bg-sky-50 dark:bg-sky-500/10',
  stock:  'bg-orange-50 dark:bg-orange-500/10',
  return: 'bg-rose-50 dark:bg-rose-500/10',
  system: 'bg-violet-50 dark:bg-violet-500/10',
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  return (
    <div 
      className={cn(
        "group relative flex gap-4 p-4 rounded-xl transition-all duration-200 cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-700/60 hover:bg-slate-25 dark:hover:bg-slate-800/50",
        !notification.isRead && "bg-slate-50/50 dark:bg-slate-800/30"
      )}
      onClick={() => onRead(notification.id)}
    >
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110", bgs[notification.type])}>
        {icons[notification.type]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn("text-sm font-semibold truncate", !notification.isRead ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
            {notification.title}
          </h4>
          {!notification.isRead && (
            <span className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
          {notification.description}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-medium">
          <Clock className="w-3 h-3" />
          {notification.time}
        </div>
      </div>

      {notification.isRead && (
        <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
           <span className="text-[10px] text-slate-400">Read</span>
        </div>
      )}
    </div>
  )
}
