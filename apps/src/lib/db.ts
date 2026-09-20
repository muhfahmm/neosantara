import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

let pool: mysql.Pool | null = null;

export const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'db_presiden_simulator',
    port: parseInt(process.env.DB_PORT || '3306'),
};

/**
 * Initializes and returns a MySQL connection pool connecting to XAMPP MySQL.
 * Automatically creates db_presiden_simulator and imports table structures if needed.
 */
export async function getDbPool(): Promise<mysql.Pool> {
    if (pool) {
        return pool;
    }

    try {
        // Step 1: Connect to MySQL server on XAMPP
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            port: dbConfig.port,
            multipleStatements: true,
        });

        // Step 2: Ensure database exists
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
        await connection.end();

        // Step 3: Establish connection pool
        pool = mysql.createPool({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password,
            database: dbConfig.database,
            port: dbConfig.port,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0,
            multipleStatements: true,
        });

        console.log(`Connected to XAMPP MySQL database '${dbConfig.database}' successfully!`);
        return pool;
    } catch (error: any) {
        console.error("XAMPP MySQL connection or initialization failed:", error.message);
        throw error;
    }
}

/**
 * Helper to query MySQL database
 */
export async function queryDb<T = any>(sql: string, params: any[] = []): Promise<T> {
    const dbPool = await getDbPool();
    const [rows] = await dbPool.execute(sql, params);
    return rows as T;
}
