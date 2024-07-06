import { LoopEvent, LoopEventHandler } from "./event";

// TODO: Typing, generics are only useful here if they are constrained by internal data types
export interface AtomicEventFunction<
  Params extends AtomicEventFunctionParams,
  Return extends AtomicEventFunctionReturn,
> {
  (params: Params): Return;
}

export type AtomicEventFunctionParams = any;
export type AtomicEventFunctionReturn = any | boolean | void;

// TODO: Typing, generics are only useful here if they are constrained by internal data types
export interface ILoopEventAtomic<T> extends LoopEvent<T> {
  setup: AtomicEventFunction<any, any>;
  commit: AtomicEventFunction<any, any>;
  rollback: AtomicEventFunction<any, any>;
}

export class AtomicJob {
  private _tasks: ILoopEventAtomic<any>[] = [];

  public constructor(tasks: ILoopEventAtomic<any>[]) {
    this._tasks = tasks;
  }

  public addTask(task: ILoopEventAtomic<any>): void {
    this._tasks.push(task);
  }

  public start(): void {
    for (const task of this._tasks) {
      const setupSuccessful: boolean = task.setup(null);
      if (!setupSuccessful) {
        this.rollback();
        return;
      }
    }

    this.commit();
  }

  private rollback(): void {
    for (const task of this._tasks) {
      task.rollback(null);
    }
  }

  private commit(): void {
    for (const task of this._tasks) {
      task.commit(null);
    }
  }
}

interface AtomicEventHandler extends LoopEventHandler<AtomicJob> {}

export const atomicEventHandler: AtomicEventHandler = (
  data: AtomicJob,
): void => {
  data.start();
};
