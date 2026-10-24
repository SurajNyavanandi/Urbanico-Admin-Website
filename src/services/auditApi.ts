import { request } from './api';
import { IAuditLog, IApiResponse } from '../types';

export async function fetchAuditLogsApi(limit = 50): Promise<{ logs: IAuditLog[]; count: number }> {
  try {
    const res = await request<
      IApiResponse & {
        logs?: IAuditLog[];
        data?: { logs?: IAuditLog[]; count?: number } | IAuditLog[];
        count?: number;
      }
    >(`/api/admin/audit-logs?limit=${limit}`);

    let logs: IAuditLog[] = [];
    if (Array.isArray(res.data)) {
      logs = res.data;
    } else if (res.data?.logs && Array.isArray(res.data.logs)) {
      logs = res.data.logs;
    } else if (res.logs && Array.isArray(res.logs)) {
      logs = res.logs;
    }

    return { logs, count: res.count || logs.length };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Urbanico] Audit logs API query:', msg);
    return { logs: [], count: 0 };
  }
}
