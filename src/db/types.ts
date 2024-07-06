import { Err, RedosError, Result, Ok } from "../error-handling";
import eventLoop from "../event";
import {
  AtomicEventFunction,
  AtomicJob,
  atomicEventHandler,
} from "../event/atomic";
import database, { IDatabase } from "./db";

export enum DataType {
  STRING = "string",
  LIST = "list",
  SET = "set",
  ZSET = "zset",
  HASH = "hash",
  STREAM = "stream",
}

// NOTE: https://redis.io/docs/latest/develop/data-types/strings/
export class RedosString {
  private _value: string;
  private _key: string;

  public constructor(value: string, key: string) {
    this._value = value;
    this._key = key;
  }

  public increment(): Result<number, RedosError> {
    const valueBeforeIncr: number = Number.parseInt(this._value);
    if (Number.isNaN(valueBeforeIncr)) {
      return Err(
        new RedosError(
          `Value is not a number at key: ${this._key}`,
          RedosStringErrorKind.NOT_A_NUMBER,
        ),
      );
    }

    const setupIncr: AtomicEventFunction<null, boolean> = () =>
      Number.isInteger(valueBeforeIncr + 1);

    const commitIncr: AtomicEventFunction<null, void> = () => {
      this._value = (valueBeforeIncr + 1).toString();
      database.set(this._key, this._value);
    };

    // TODO: Rollback mechanism
    const rollbackIncr: AtomicEventFunction<null, void> = () => {
      if (this._value === valueBeforeIncr.toString()) {
        return;
      } else {
        return;
      }
    };

    const atomicIncrement: AtomicJob = new AtomicJob([
      {
        object: this,
        isAsync: false,
        handler: atomicEventHandler,
        setup: setupIncr,
        commit: commitIncr,
        rollback: rollbackIncr,
      },
    ]);

    eventLoop.addEvent({
      object: atomicIncrement,
      isAsync: false,
      handler: atomicEventHandler,
    });

    return Ok(Number(this._value));
  }
}

export enum RedosStringErrorKind {
  NOT_A_NUMBER = "NOT_A_NUMBER",
}

// TODO: Custom Enum state machines for generic handling: https://github.com/microsoft/TypeScript/issues/30611
export namespace RedosStringError {
  export function msg(kind: RedosStringErrorKind): string {
    switch (kind) {
      case RedosStringErrorKind.NOT_A_NUMBER:
        return "Value is not a number";
    }
  }
}
