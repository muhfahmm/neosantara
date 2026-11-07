import { Pool } from 'pg';

let pool: Pool | null = null;

export const dbConfig = {
    host: String(process.env.DB_HOST || process.env.PGHOST || '127.0.0.1'),
    user: String(process.env.DB_USER || process.env.PGUSER || 'postgres'),
    // Secret: never hardcode. Provide via DB_PASSWORD / PGPASSWORD (see apps/.env.example).
    password: process.env.DB_PASSWORD ?? process.env.PGPASSWORD,
    database: String(process.env.DB_NAME || process.env.PGDATABASE || 'db_presiden_simulator'),
    port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432'),
};

/**
 * Initializes and returns a PostgreSQL connection pool.
 */
export async function getDbPool(): Promise<Pool> {
    if (pool) {
        return pool;
    }

    if (!dbConfig.password) {
        throw new Error(
            'Database password is not configured. Set DB_PASSWORD (or PGPASSWORD) in apps/.env.local; see apps/.env.example.'
        );
    }

    try {
        pool = new Pool({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            port: dbConfig.port,
            max: 10,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });

        console.log(`Connected to PostgreSQL database '${dbConfig.database}' successfully!`);
        return pool;
    } catch (error: any) {
        console.error("PostgreSQL connection failure:", error.message);
        throw error;
    }
}

// PERF-TEMP: Development-only query counter/timer (zero-op in production)
let perfTrackerLogged = false;
function trackDevQuery(sql: string, durationMs: number) {
    if (process.env.NODE_ENV !== 'development') return;
    if (!perfTrackerLogged) {
        perfTrackerLogged = true;
    }
    const g = globalThis as unknown as { __PERF_TEMP_DB_COUNT__?: number; __PERF_TEMP_DB_MS__?: number };
    g.__PERF_TEMP_DB_COUNT__ = (g.__PERF_TEMP_DB_COUNT__ ?? 0) + 1;
    g.__PERF_TEMP_DB_MS__ = (g.__PERF_TEMP_DB_MS__ ?? 0) + durationMs;
    if (durationMs > 50) {
        console.log(`[PERF-TEMP:DB] ${durationMs.toFixed(1)}ms | ${sql.slice(0, 90).replace(/\s+/g, ' ')}`);
    }
}

/**
 * Helper to query PostgreSQL database.
 * Returns array of rows for SELECT queries.
 */
export async function queryDb<T = any>(sql: string, params: any[] = []): Promise<T> {
    const dbPool = await getDbPool();
    const t0 = process.env.NODE_ENV === 'development' ? performance.now() : 0;
    const res = await dbPool.query(sql, params);
    if (process.env.NODE_ENV === 'development') {
        trackDevQuery(sql, performance.now() - t0);
    }
    return res.rows as T;
}
