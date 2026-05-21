import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle,
  BarChart3,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react';

export const MIS_API_SLUG = 'mis-report';

export type MisSectionId =
  | 'overview'
  | 'daily-sales'
  | 'order-status'
  | 'top-customers'
  | 'top-items'
  | 'top-salesmen'
  | 'low-stock';

export interface MisReportSection {
  id: MisSectionId;
  slug: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export const MIS_REPORT_SECTIONS: MisReportSection[] = [
  {
    id: 'overview',
    slug: 'mis-overview',
    name: 'MIS Overview',
    description: 'Executive KPIs and period comparison',
    icon: LayoutDashboard,
  },
  {
    id: 'daily-sales',
    slug: 'mis-daily-sales',
    name: 'MIS Daily Sales',
    description: 'Net sales trend by day',
    icon: BarChart3,
  },
  {
    id: 'order-status',
    slug: 'mis-order-status',
    name: 'MIS Order Status',
    description: 'Orders grouped by current status',
    icon: ShoppingCart,
  },
  {
    id: 'top-customers',
    slug: 'mis-top-customers',
    name: 'MIS Top Customers',
    description: 'Highest net sales by customer',
    icon: Users,
  },
  {
    id: 'top-items',
    slug: 'mis-top-items',
    name: 'MIS Top Items',
    description: 'Best-selling products in the period',
    icon: Package,
  },
  {
    id: 'top-salesmen',
    slug: 'mis-top-salesmen',
    name: 'MIS Top Salesmen',
    description: 'Sales performance by salesman',
    icon: Users,
  },
  {
    id: 'low-stock',
    slug: 'mis-low-stock',
    name: 'MIS Low Stock',
    description: 'SKUs at or below reorder threshold',
    icon: AlertTriangle,
  },
];

/** All MIS pages shown in the MIS catalog card. */
export const MIS_CATALOG_SLUGS: readonly string[] = MIS_REPORT_SECTIONS.map(
  (s) => s.slug,
);

/** Only this MIS report is pinned under Favourite. */
export const MIS_FAVOURITE_SLUG = 'mis-overview';

export function isMisReportSlug(slug: string): boolean {
  return slug === MIS_API_SLUG || MIS_CATALOG_SLUGS.includes(slug);
}

export function getMisSectionBySlug(slug: string): MisReportSection | undefined {
  return MIS_REPORT_SECTIONS.find((s) => s.slug === slug);
}
