import {SelectQueryBuilder} from 'typeorm';
import {DEFAULT_READ_TIME_LIMIT_CEILING_MS} from './constants';

const ER_QUERY_TIMEOUT = 3024;
const ER_QUERY_INTERRUPTED = 1317;
const SELECT_KEYWORD = /^((?:\/\*[\s\S]*?\*\/\s*)?\(?\s*SELECT)\b/i;

export const readTimeLimitCeilingMs = (): number => {
  const raw = process.env.DB_READ_MAX_EXECUTION_TIME_MS;
  const ceiling = raw === undefined || raw.trim() === '' ? NaN : Number(raw);
  return Number.isFinite(ceiling) && ceiling >= 0 ? Math.floor(ceiling) : DEFAULT_READ_TIME_LIMIT_CEILING_MS;
};

export const clampReadTimeLimitMs = (readTimeLimitMs: any): number | null => {
  if (typeof readTimeLimitMs !== 'number' && (typeof readTimeLimitMs !== 'string' || readTimeLimitMs.trim() === '')) {
    return null;
  }

  const ms = Math.floor(Number(readTimeLimitMs));
  const ceiling = readTimeLimitCeilingMs();

  if (!Number.isFinite(ms) || ms <= 0 || ceiling <= 0) {
    return null;
  }

  return Math.min(ms, ceiling);
};

const withMaxExecutionTime = <Q extends SelectQueryBuilder<any>>(queryBuilder: Q, ms: number): Q => {
  const target: any = queryBuilder;

  if (target.maxExecutionTimeMs === undefined) {
    const getQuery = target.getQuery;
    const clone = target.clone;

    target.getQuery = function(this: any) {
      return getQuery.call(this).replace(SELECT_KEYWORD, '$1 /*+ MAX_EXECUTION_TIME(' + this.maxExecutionTimeMs + ') */');
    };

    target.clone = function(this: any) {
      return withMaxExecutionTime(clone.call(this), this.maxExecutionTimeMs);
    };
  }

  target.maxExecutionTimeMs = ms;
  return queryBuilder;
};

export const limitReadTime = <Q extends SelectQueryBuilder<any>>(queryBuilder: Q, readTimeLimitMs: any): Q => {
  const ms = clampReadTimeLimitMs(readTimeLimitMs);
  return ms === null ? queryBuilder : withMaxExecutionTime(queryBuilder, ms);
};

export const isReadTimeLimitExceeded = (error: any): boolean => {
  for (const e of [error, error && error.driverError]) {
    if (!e) {
      continue;
    }

    const errno = Number(e.errno);
    if (errno === ER_QUERY_TIMEOUT || e.code === 'ER_QUERY_TIMEOUT') {
      return true;
    }

    const sql = String(e.query || e.sql || '');
    if ((errno === ER_QUERY_INTERRUPTED || e.code === 'ER_QUERY_INTERRUPTED') && sql.includes('MAX_EXECUTION_TIME(')) {
      return true;
    }
  }

  return false;
};
