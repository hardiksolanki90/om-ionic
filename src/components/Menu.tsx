import { NavLink } from 'react-router-dom'
import { cn } from '../lib/cn'
import {
  LayoutDashboard, Users, Package, Tag, Award, ShoppingCart,
  MapPin, Route, Warehouse, RotateCcw, UserCog, Shield,
  Boxes, BadgeCheck, Power, Ruler, TrendingUp,
  Tags, ClipboardList, UserCheck, Undo2, Layers, Building2,
  AlertTriangle, DollarSign, BarChart2, FileText,
  Truck, Receipt
} from 'lucide-react'
import {
  IonContent,
  IonMenu,
  IonMenuToggle
} from '@ionic/react'
import { useAuth } from '../contexts/AuthContext'
import ThemeToggle from './ThemeToggle'

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
      { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    ],
  },
  {
    heading: 'Catalog',
    items: [
      { label: 'Items', path: '/items', icon: <Package className="w-4 h-4" /> },
      { label: 'Categories', path: '/categories', icon: <Tag className="w-4 h-4" /> },
      { label: 'Brands', path: '/brands', icon: <Award className="w-4 h-4" /> },
      { label: 'Item UOM', path: '/uom', icon: <Ruler className="w-4 h-4" /> },
    ],
  },
  {
      heading: 'Operations',
      items: [
        { label: 'Customers', path: '/customers', icon: <Users className="w-4 h-4" /> },
        { label: 'Salesman', path: '/salesman', icon: <BadgeCheck className="w-4 h-4" /> },
        { label: 'Orders', path: '/orders', icon: <ShoppingCart className="w-4 h-4" /> },
        { label: 'Deliveries', path: '/deliveries', icon: <Truck className="w-4 h-4" /> },
        { label: 'Invoices', path: '/invoices', icon: <Receipt className="w-4 h-4" /> },
        { label: 'Returns', path: '/returns', icon: <RotateCcw className="w-4 h-4" /> },
      ],
    },
  {
    heading: 'Logistics',
    items: [
      { label: 'Areas', path: '/areas', icon: <MapPin className="w-4 h-4" /> },
      { label: 'Routes', path: '/routes', icon: <Route className="w-4 h-4" /> },
      { label: 'Warehouses', path: '/warehouses', icon: <Warehouse className="w-4 h-4" /> },
    ],
  },
  {
    heading: 'System',
    items: [
      { label: 'Users', path: '/users', icon: <UserCog className="w-4 h-4" /> },
      { label: 'Roles', path: '/roles', icon: <Shield className="w-4 h-4" /> },
    ],
  },
  {
    heading: 'Sales Reports',
    items: [
      { label: 'Sales Summary', path: '/reports/sales-summary', icon: <TrendingUp className="w-4 h-4" /> },
      { label: 'Sales by Category', path: '/reports/sales-summary-category-wise', icon: <Tags className="w-4 h-4" /> },
      { label: 'Order Management', path: '/reports/order-management', icon: <ClipboardList className="w-4 h-4" /> },
      { label: 'Customer Sales', path: '/reports/customer-sales', icon: <UserCheck className="w-4 h-4" /> },
      { label: 'Returns', path: '/reports/returns-logistics', icon: <Undo2 className="w-4 h-4" /> },
    ],
  },
  {
    heading: 'Inventory Reports',
    items: [
      { label: 'Inventory & Stock', path: '/reports/inventory-stock', icon: <Layers className="w-4 h-4" /> },
      { label: 'Warehouse Ops', path: '/reports/warehouse-operations', icon: <Building2 className="w-4 h-4" /> },
      { label: 'Stock Summary', path: '/reports/stock-summary', icon: <Package className="w-4 h-4" /> },
      { label: 'Stock Detail', path: '/reports/stock-detail-report', icon: <BarChart2 className="w-4 h-4" /> },
      { label: 'Low Stock', path: '/reports/low-stock-summary', icon: <AlertTriangle className="w-4 h-4" /> },
      { label: 'Rate List', path: '/reports/rate-list', icon: <DollarSign className="w-4 h-4" /> },
      { label: 'Item Sales Summary', path: '/reports/item-sales-purchase-summary', icon: <FileText className="w-4 h-4" /> },
      { label: 'Item by Party', path: '/reports/item-report-by-party', icon: <UserCheck className="w-4 h-4" /> },
    ],
  },
]

export default function Menu() {
  const { logout, user } = useAuth()

  return (
    <IonMenu menuId="main-menu" contentId="main-content" type="overlay">
      <div className="flex flex-col h-full bg-sidebar text-white overflow-y-auto scrollbar-thin">
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-brand-500 flex items-center justify-center flex-shrink-0">
              <Boxes className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight">OrderFlow</span>
          </div>
        </div>

        {/* Nav */}
        <IonContent className="ion-no-padding" style={{ '--background': 'transparent' } as React.CSSProperties}>
          <nav className="flex-1 px-3 py-4 space-y-4">
            {NAV.map((section, i) => (
              <div key={i}>
                {section.heading && (
                  <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {section.heading}
                  </p>
                )}
                <div className="space-y-0.5">
                  {section.items.map(item => (
                    <IonMenuToggle key={item.path} autoHide={false}>
                      <NavLink
                        to={item.path}
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
                    </IonMenuToggle>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </IonContent>
      </div>
    </IonMenu>
  )
}
