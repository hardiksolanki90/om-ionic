import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Package,
  RotateCcw,
  ShoppingCart,
  Sparkles,
} from 'lucide-react';
import type { ReportDefinition } from '../../types/reporting';
import {
  MIS_CATALOG_SLUGS,
  MIS_FAVOURITE_SLUG,
  MIS_REPORT_SECTIONS,
} from './misSections';

export const REPORT_FAVOURITES_KEY = 'om-report-favourites';

/** Always shown under Favourite and hidden from other catalog categories. */
export const PREDEFINED_REPORT_FAVOURITES: readonly string[] = [
  MIS_FAVOURITE_SLUG,
  'sales-summary',
  'order-management',
  'stock-summary',
  'customer-sales',
];

export const REPORT_LIST_COLLAPSE_THRESHOLD = 6;

const MIS_SLUG_SET = new Set<string>(MIS_CATALOG_SLUGS);

export function isMisCatalogSlug(slug: string): boolean {
  return MIS_SLUG_SET.has(slug);
}

export function isPredefinedFavourite(slug: string): boolean {
  return PREDEFINED_REPORT_FAVOURITES.includes(slug);
}

export function resolveUserFavourites(raw: string | null): string[] {
  if (raw === null) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed)
      ? parsed.filter((s): s is string => typeof s === 'string')
      : [];
  } catch {
    return [];
  }
}

/** Predefined favourites first, then user-pinned reports (no duplicates). */
/** Map legacy composite slug to the section pinned in Favourite. */
export function normalizeFavouriteSlug(slug: string): string {
  return slug === 'mis-report' ? MIS_FAVOURITE_SLUG : slug;
}

export function mergeCatalogFavourites(userSlugs: string[]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];

  for (const slug of PREDEFINED_REPORT_FAVOURITES) {
    if (!seen.has(slug)) {
      seen.add(slug);
      merged.push(slug);
    }
  }

  for (const slug of userSlugs) {
    const normalized = normalizeFavouriteSlug(slug);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      merged.push(normalized);
    }
  }

  return merged;
}

export interface ReportCatalogCategory {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Static slug membership; `favourite` is resolved from favourites storage. */
  slugs?: readonly string[];
}

export const REPORT_CATALOG_CATEGORIES: ReportCatalogCategory[] = [
  {
    id: 'favourite',
    label: 'Favourite',
    icon: Sparkles,
  },
  {
    id: 'mis',
    label: 'MIS',
    icon: LayoutDashboard,
    slugs: MIS_CATALOG_SLUGS,
  },
  {
    id: 'sales',
    label: 'Sales & Orders',
    icon: ShoppingCart,
    slugs: [
      'sales-summary',
      'sales-summary-category-wise',
      'order-management',
      'customer-sales',
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    slugs: [
      'stock-summary',
      'stock-detail-report',
      'low-stock-summary',
      'rate-list',
      'item-sales-purchase-summary',
      'item-report-by-party',
      'inventory-stock',
      'warehouse-operations',
    ],
  },
  {
    id: 'returns',
    label: 'Returns',
    icon: RotateCcw,
    slugs: ['returns-logistics'],
  },
];

/** Display name without trailing " Report". */
export function reportDisplayName(name: string): string {
  return name.replace(/\s+Report\s*$/i, '').trim() || name;
}

/** Shorter labels inside the MIS category card. */
export function misCatalogDisplayName(name: string): string {
  return name.replace(/^MIS\s+/i, '').trim() || name;
}

/** Virtual MIS section entries when API catalog only has `mis-report`. */
export function augmentCatalogWithMisSections(
  reports: ReportDefinition[],
): ReportDefinition[] {
  const bySlug = new Map(reports.map((r) => [r.slug, r]));
  const misParent = bySlug.get('mis-report');
  const augmented = [...reports];

  for (const section of MIS_REPORT_SECTIONS) {
    if (bySlug.has(section.slug)) {
      continue;
    }

    augmented.push({
      uuid: `mis-section-${section.id}`,
      slug: section.slug,
      name: section.name,
      reportType: misParent?.reportType ?? 'analytical',
      baseTable: misParent?.baseTable ?? 'rpt_summary_sales_daily',
      allowedMetrics: misParent?.allowedMetrics ?? [],
      allowedDimensions: misParent?.allowedDimensions ?? [],
      defaultFilters: misParent?.defaultFilters ?? {},
    });
  }

  return augmented.filter((r) => r.slug !== 'mis-report');
}

function buildMisSectionDefinition(
  section: (typeof MIS_REPORT_SECTIONS)[number],
  misParent: ReportDefinition | undefined,
): ReportDefinition {
  return {
    uuid: `mis-section-${section.id}`,
    slug: section.slug,
    name: section.name,
    reportType: misParent?.reportType ?? 'analytical',
    baseTable: misParent?.baseTable ?? 'rpt_summary_sales_daily',
    allowedMetrics: misParent?.allowedMetrics ?? [],
    allowedDimensions: misParent?.allowedDimensions ?? [],
    defaultFilters: misParent?.defaultFilters ?? {},
  };
}

/** Resolve a catalog row even when the API only exposes `mis-report`. */
export function resolveCatalogReportBySlug(
  slug: string,
  bySlug: Map<string, ReportDefinition>,
  rawReports: ReportDefinition[],
): ReportDefinition | undefined {
  const normalized = normalizeFavouriteSlug(slug);
  const existing = bySlug.get(normalized);
  if (existing) {
    return existing;
  }

  const section = MIS_REPORT_SECTIONS.find((s) => s.slug === normalized);
  if (!section) {
    return undefined;
  }

  const misParent =
    bySlug.get('mis-report') ??
    rawReports.find((r) => r.slug === 'mis-report');

  return buildMisSectionDefinition(section, misParent);
}

export function groupReportsForCatalog(
  reports: ReportDefinition[],
  favouriteSlugs: string[],
): { category: ReportCatalogCategory; items: ReportDefinition[] }[] {
  const catalogReports = augmentCatalogWithMisSections(reports);
  const bySlug = new Map(catalogReports.map((r) => [r.slug, r]));
  const favouriteSet = new Set(favouriteSlugs);
  const resolve = (slug: string) =>
    resolveCatalogReportBySlug(slug, bySlug, reports);

  const result: { category: ReportCatalogCategory; items: ReportDefinition[] }[] = [];

  for (const category of REPORT_CATALOG_CATEGORIES) {
    let items: ReportDefinition[];

    if (category.id === 'favourite') {
      items = favouriteSlugs
        .map((slug) => resolve(slug))
        .filter((r): r is ReportDefinition => Boolean(r));
    } else if (category.id === 'mis') {
      items = (category.slugs ?? [])
        .map((slug) => resolve(slug))
        .filter((r): r is ReportDefinition => Boolean(r));
    } else {
      items = (category.slugs ?? [])
        .map((slug) => resolve(slug))
        .filter((r): r is ReportDefinition => Boolean(r))
        .filter((r) => !favouriteSet.has(r.slug) && !isMisCatalogSlug(r.slug));
    }

    if (category.id === 'favourite' || items.length > 0) {
      result.push({ category, items });
    }
  }

  const assigned = new Set(
    result.flatMap((g) => g.items.map((r) => r.slug)),
  );
  const unassigned = catalogReports.filter(
    (r) =>
      !assigned.has(r.slug) &&
      !favouriteSet.has(r.slug) &&
      !isMisCatalogSlug(r.slug),
  );
  if (unassigned.length > 0) {
    const salesGroup = result.find((g) => g.category.id === 'sales');
    if (salesGroup) {
      salesGroup.items.push(...unassigned);
    }
  }

  return result;
}
