import { useQuery } from '@tanstack/react-query';
import {
  fetchReportCatalog,
  queryReport,
} from '../services/reportingService';
import type {
  ReportDefinition,
  ReportQueryPayload,
  ReportQueryResult,
} from '../types/reporting';

export const REPORT_CATALOG_KEY = ['reports', 'catalog'] as const;

export function useReportCatalog() {
  return useQuery({
    queryKey: REPORT_CATALOG_KEY,
    queryFn: fetchReportCatalog,
    staleTime: 5 * 60 * 1000,
  });
}

export function useReportDefinition(slug: string | undefined) {
  const catalog = useReportCatalog();
  const definition = catalog.data?.find((r) => r.slug === slug);

  return {
    ...catalog,
    definition,
    isLoading: catalog.isLoading,
    isError: catalog.isError,
  };
}

export function useReportQuery(
  slug: string | undefined,
  payload: ReportQueryPayload | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['reports', 'query', slug, payload],
    queryFn: () => queryReport<ReportQueryResult>(slug!, payload!),
    enabled: Boolean(slug && payload && enabled),
    staleTime: 60 * 1000,
    retry: false,
  });
}

export function groupReportsByType(
  reports: ReportDefinition[],
): { type: string; label: string; items: ReportDefinition[] }[] {
  const order = ['operational', 'analytical', 'compliance'];
  const groups = new Map<string, ReportDefinition[]>();

  for (const report of reports) {
    const type = report.reportType || 'operational';
    if (!groups.has(type)) {
      groups.set(type, []);
    }
    groups.get(type)!.push(report);
  }

  return order
    .filter((t) => groups.has(t))
    .map((type) => ({
      type,
      label:
        type === 'operational'
          ? 'Operational'
          : type === 'analytical'
            ? 'Analytical'
            : 'Compliance',
      items: groups.get(type)!.sort((a, b) => a.name.localeCompare(b.name)),
    }));
}
