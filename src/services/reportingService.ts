import api from '../lib/Axios';
import type {
  ReportDefinition,
  ReportQueryPayload,
} from '../types/reporting';

export type { ReportDateRange, ReportQueryPayload, ReportDefinition } from '../types/reporting';

/** Axios interceptor already unwraps to response body (see lib/Axios.tsx). */
type ApiEnvelope<T> = { success?: boolean; data?: T; message?: string };

function unwrap<T>(body: ApiEnvelope<T>, label: string): T {
  if (body?.data !== undefined && body.data !== null) {
    return body.data;
  }
  throw new Error(body?.message ?? `Invalid ${label} response from API`);
}

export async function fetchReportCatalog(): Promise<ReportDefinition[]> {
  const body = (await api.get('/admin/reports')) as ApiEnvelope<ReportDefinition[]>;
  const data = unwrap(body, 'report catalog');
  return Array.isArray(data) ? data : [];
}

export async function queryReport<T = unknown>(
  slug: string,
  payload: ReportQueryPayload,
): Promise<T> {
  const body = (await api.post(`/admin/reports/${slug}/query`, payload)) as ApiEnvelope<T>;
  return unwrap(body, 'report query');
}

export async function fetchSavedReportViews() {
  const body = (await api.get('/admin/reports/views')) as ApiEnvelope<unknown[]>;
  return unwrap(body, 'saved views');
}

export async function createSavedReportView(payload: {
  reportSlug: string;
  name: string;
  isFavourite?: boolean;
  filterPayload: Record<string, unknown>;
  columnPayload?: Record<string, unknown>;
}) {
  const body = (await api.post('/admin/reports/views', payload)) as ApiEnvelope<unknown>;
  return unwrap(body, 'saved view');
}
