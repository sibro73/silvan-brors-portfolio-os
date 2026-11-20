/**
 * Nur für Tests: echte SQLite-Datenbank (node:sqlite) hinter der D1-Schnittstelle,
 * mit derselben Migration wie in Produktion.
 */
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

import type { D1Like, D1Statement } from './db';

const MIGRATION = new URL('../migrations/0001_init.sql', import.meta.url);

type Value = string | number | bigint | null | Uint8Array;

export function createTestDb(): D1Like & { raw: DatabaseSync } {
  const raw = new DatabaseSync(':memory:');
  raw.exec(readFileSync(MIGRATION, 'utf8'));
  const statement = (sql: string, values: Value[] = []): D1Statement => ({
    bind: (...v: unknown[]) => statement(sql, v as Value[]),
    first: async <T>() => (raw.prepare(sql).get(...values) as T | undefined) ?? null,
    run: async () => ({ meta: { changes: Number(raw.prepare(sql).run(...values).changes) } }),
  });
  return { raw, prepare: (sql: string) => statement(sql) };
}
