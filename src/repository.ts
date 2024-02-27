import { PgDbContext } from "./db-context";

export class Repository<T> {
  constructor(private readonly dbContext: PgDbContext) {}

  async findAll(): Promise<T[]> {
    const tablename = this.getTableName();
    const client = await this.dbContext.pool.connect();
    try {
      const result = await client.query(`SELECT * FROM ${tablename}`);
      return result.rows;
    } finally {
      client.release();
    }
  }

  async findById(id: number): Promise<T | null> {
    const tablename = this.getTableName();
    const client = await this.dbContext.pool.connect();
    try {
      const result = await client.query(`SELECT * FROM ${tablename} WHERE id = $1`, [id]);
      if (result.rows.length < 1) {
        return null;
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async findBy(partialT: Partial<T>): Promise<T | null> {
    const tablename = this.getTableName();
    const { queryParams, values } = this.generateQueryParamsAndValues(partialT);
    const client = await this.dbContext.pool.connect();
    try {
      const result = await client.query(`SELECT * FROM ${tablename} WHERE ${queryParams}`, values);
      if (result.rows.length < 1) {
        return null;
      }
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async save(partialT: Partial<T>): Promise<T> {
    const tablename = this.getTableName();
    const { postParams, postValuePlaceholders, values } = this.generatePostParamsAndValues(partialT);
    const client = await this.dbContext.pool.connect();
    try {
      const result = await client.query(`INSERT INTO ${tablename} (${postParams}) VALUES (${postValuePlaceholders}) RETURNING *`, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async update(partialT: Partial<T>): Promise<T> {
    const tablename = this.getTableName();
    const { queryParams, conditionParam, values } = this.generatePutParamsAndValues(partialT);
    const client = await this.dbContext.pool.connect();
    try {
      const result = await client.query(`UPDATE ${tablename} SET ${queryParams} WHERE ${conditionParam} RETURNING *`, values);
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  async delete(partialT: Partial<T>) {
    const tablename = this.getTableName();
    const { queryParams, values } = this.generateQueryParamsAndValues(partialT);
    const client = await this.dbContext.pool.connect();
    try {
      const result = await client.query(`DELETE FROM ${tablename} WHERE ${queryParams}`, values);
      return result;
    } finally {
      client.release();
    }
  }

  private getTableName() {
    const repositoryName = this.constructor.name;
    const splittedName = repositoryName.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase().split("_");
    const tablename = splittedName.slice(0, -1).join("_");
    return tablename;
  }

  private generateQueryParamsAndValues(partialT: Partial<T>) {
    const keys = Object.keys(partialT);
    let lastIndex = keys.length - 1;
    let queryParams = ''
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (i === lastIndex) {
        queryParams += `${key} = $${i+1}`;
      } else {
        queryParams += `${key} = $${i+1} AND `;
      }
    }
    const values = Object.values(partialT);
    return { queryParams, values };
  }

  private generatePostParamsAndValues(partialT: Partial<T>) {
    const keys = Object.keys(partialT);
    let lastIndex = keys.length - 1;
    let postParams = ''
    let postValuePlaceholders = ''
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (i === lastIndex) {
        postParams += `${key}`;
        postValuePlaceholders += `$${i+1}`;
      } else {
        postParams += `${key}, `;
        postValuePlaceholders += `$${i+1}, `;
      }
    }
    const values = Object.values(partialT);
    return { postParams, postValuePlaceholders, values };
  }

  private generatePutParamsAndValues(partialT: Partial<T>) {
    if (!("id" in partialT)) {
      throw new Error("bad request");
    }
    const id = partialT["id"];
    const conditionParam = `id = $1`;
    const keys = Object.keys(partialT);
    let lastIndex = keys.length - 1;
    let queryParams = ''
    for (let i = 1; i < keys.length; i++) {
      const key = keys[i];
      if (key === "id") {
        continue;
      }
      if (i === lastIndex) {
        queryParams += `${key} = $${i+1}`;
      } else {
        queryParams += `${key} = $${i+1}, `;
      }
    }
    const valuesWithoutId = Object.values(partialT).filter((val) => val !== id);
    const values = [id].concat(valuesWithoutId);
    return { queryParams, conditionParam, values };
  }
}
