export interface IAsyncEvent {
  then(onFulfilled?: Function, onRejected?: Function): void;
}

// NOTE: Implementation specs: https://promisesaplus.com/
// https://www.promisejs.org/implementing/
export class AsyncEvent implements IAsyncEvent {
  private state: AsyncState = AsyncState.Pending;
  // TODO: Data types
  private value: any | null = null;
  private rejectionReason: any | null = null;

  // TODO: onFulfilled or onRejected must not be called until the execution context stack contains only platform code. [3.1].
  public then(onFulfilled?: Function, onRejected?: Function): AsyncEvent {
    switch (this.state) {
      case AsyncState.Pending: {
        //may transition to either the fulfilled or rejected state.
        break;
      }
      case AsyncState.Fulfilled: {
        // not transition to any other state.
        // must have a value, which must not change.
        if (onFulfilled) {
          onFulfilled(this.value);
        }
        break;
      }
      case AsyncState.Rejected: {
        // must not transition to any other state.
        // must have a reason, which must not change.
        if (onRejected) onRejected(this.rejectionReason);
        break;
      }
    }
  }
}

enum AsyncState {
  Pending,
  Fulfilled,
  Rejected,
}
