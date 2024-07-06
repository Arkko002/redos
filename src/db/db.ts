import { Err, Ok, RedosError, Result } from "../error-handling";

// TODO: Typing for values stored in db
export interface IDatabase {
  get(key: string): Result<any, RedosError>;
  exists(key: string): Result<boolean, RedosError>;
  type(key: any): Result<any, RedosError>;
  set(key: string, value: string): Result<string, RedosError>;
  delete(key: any): Result<null, RedosError>;
}

// NOTE: https://github.com/redis/redis/blob/unstable/src/db.c#L75
// NOTE: https://redis.io/docs/latest/develop/use/keyspace/
class Database implements IDatabase {
  private static _instance: Database;
  private values: Map<string, any> = new Map();

  private constructor() {}

  public exists(key: string): Result<boolean, RedosError> {
    throw new Error("Method not implemented.");
  }

  public type(key: any): Result<any, RedosError> {
    throw new Error("Method not implemented.");
  }

  public static get Instance(): Database {
    return this._instance || (this._instance = new Database());
  }

  public get(key: string): Result<any, RedosError> {
    const value: string | undefined = this.values.get(key);
    if (value) {
      return Ok(value);
    }

    return Err(
      new RedosError(
        `Key not found in storage: ${key}`,
        DatabaseErrorKind.KEY_NOT_IN_STORAGE,
      ),
    );
  }

  // TODO: Options, TTL, flags
  public set(
    key: string,
    value: string,
    overwrite?: boolean,
  ): Result<string, RedosError> {
    // TODO: Set overwrite flag
    if (this.values.has(key) && !overwrite) {
      return Err(
        new RedosError(
          `Key already exists in storage: ${key}`,
          DatabaseErrorKind.CANNOT_OVERWRITE_KEY,
        ),
      );
    }

    this.values.set(key, value);
    return Ok(value);
  }

  public delete(key: string): Result<null, RedosError> {
    if (!this.values.has(key)) {
      return Err(
        new RedosError(
          `Key doesn't exist in database: ${key}`,
          DatabaseErrorKind.KEY_NOT_IN_STORAGE,
        ),
      );
    }

    this.values.delete(key);
    return Ok(null);
  }
}

export enum DatabaseErrorKind {
  KEY_NOT_IN_STORAGE,
  CANNOT_OVERWRITE_KEY,
}

const database: Database = Database.Instance;

export default database;

