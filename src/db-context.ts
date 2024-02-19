import { Pool, PoolConfig } from "pg";

export class PgDbContext {
  pool: Pool;

  constructor(config: PoolConfig) {
    this.pool = new Pool(config || {
      host: 'localhost',
      user: 'postgres',
      password: 'postgres',
      port: 5432,
    })
  }
}
