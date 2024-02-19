import { PgDbContext } from "./db-context";
export declare class Repository<T> {
    private readonly dbContext;
    constructor(dbContext: PgDbContext);
    findAll(): Promise<T[]>;
    findById(id: number): Promise<T | null>;
    findBy(partialT: Partial<T>): Promise<T | null>;
    save(partialT: Partial<T>): Promise<T>;
    update(partialT: Partial<T>): Promise<T>;
    delete(partialT: Partial<T>): Promise<import("pg").QueryResult<any>>;
    private getTableName;
    private generateQueryParamsAndValues;
    private generatePostParamsAndValues;
    private generatePutParamsAndValues;
}
