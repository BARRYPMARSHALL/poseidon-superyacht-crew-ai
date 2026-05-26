declare module 'sql.js' {
  interface SqlJsDatabase {
    run(sql: string, params?: any[]): void;
    exec(sql: string): any[];
    prepare(sql: string): SqlJsStatement;
    export(): Uint8Array;
    getRowsModified(): number;
    close(): void;
  }
  interface SqlJsStatement {
    bind(params?: any[]): boolean;
    step(): boolean;
    get(): any[];
    getColumnNames(): string[];
    free(): boolean;
    getAsObject(params?: any): any;
  }
  interface SqlJsStatic {
    Database: new (data?: ArrayLike<number> | Buffer | null) => SqlJsDatabase;
  }
  export default function initSqlJs(config?: any): Promise<SqlJsStatic>;
}
