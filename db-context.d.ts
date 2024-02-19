import { Pool, PoolConfig } from "pg";
export declare class PgDbContext {
    pool: Pool;
    constructor(config: PoolConfig);
}
