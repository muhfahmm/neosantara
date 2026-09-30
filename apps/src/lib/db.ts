import { Pool } from 'pg';

let pool: Pool | null = null;

export const dbConfig = {
    host: String(process.env.DB_HOST || process.env.PGHOST || '127.0.0.1'),
    user: String(process.env.DB_USER || process.env.PGUSER || 'postgres'),
    password: String(process.env.DB_PASSWORD ?? process.env.PGPASSWORD ?? 'Hiim_110407'),
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

/**
 * Helper to query PostgreSQL database.
 * Returns array of rows for SELECT queries.
 */
export async function queryDb<T = any>(sql: string, params: any[] = []): Promise<T> {
    const dbPool = await getDbPool();
    const res = await dbPool.query(sql, params);
    return res.rows as T;
}
