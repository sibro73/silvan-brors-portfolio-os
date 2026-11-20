import { useEffect, useState } from 'react';

import { type AgentsReport, agentsReport as fallbackReport } from '../data';
import { API_TIMEOUT_MS, API_URL, getJson } from './http';

const isString = (v: unknown): v is string => typeof v === 'string';

function isChannel(v: unknown): v is AgentsReport['channels'][number] {
  if (typeof v !== 'object' || v === null) return false;
  const c = v as Record<string, unknown>;
  return (
    isString(c.name) &&
    typeof c.barWidth === 'number' &&
    c.barWidth >= 0 &&
    c.barWidth <= 100 &&
    isString(c.views) &&
    (c.highlight === undefined || typeof c.highlight === 'boolean')
  );
}

/** Nur Berichte in genau der Form, die das Fenster anzeigen kann. */
export function isAgentsReport(v: unknown): v is AgentsReport {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    isString(r.meta) &&
    isString(r.week) &&
    isString(r.title) &&
    isString(r.intro) &&
    Array.isArray(r.channels) &&
    r.channels.length > 0 &&
    r.channels.every(isChannel) &&
    isString(r.recommendation) &&
    (r.note === undefined || isString(r.note))
  );
}

/**
 * Holt `GET /api/agents/report`. Wirft nie: ohne Backend, ohne Bericht (404) oder bei
 * unerwarteter Antwort kommt der gespeicherte Bericht aus `data/` zurück.
 */
export async function fetchAgentsReport(
  baseUrl: string = API_URL,
  timeoutMs: number = API_TIMEOUT_MS,
): Promise<AgentsReport> {
  const res = await getJson(baseUrl, '/api/agents/report', timeoutMs);
  return res && isAgentsReport(res.body) ? res.body : fallbackReport;
}

/** Zeigt sofort den gespeicherten Bericht und tauscht ihn aus, sobald das Backend antwortet. */
export function useAgentsReport(load: () => Promise<AgentsReport> = fetchAgentsReport) {
  const [report, setReport] = useState<AgentsReport>(fallbackReport);
  useEffect(() => {
    let active = true;
    load().then((next) => {
      if (active) setReport(next);
    });
    return () => {
      active = false;
    };
  }, [load]);
  return report;
}
