import { UUID, randomUUID } from "crypto";

class Cell {
  public id: UUID;
  public value: string;

  public transitions: Set<Cell>;
  public stepHandler: CellTransitionHanlder;
  // TODO: Better lifecycle managing
  public enterHandler?: Function;
  public exitHandler?: Function;
  public stayHandler?: Function;

  public constructor(
    value: string,
    stepHandler?: CellTransitionHanlder,
    enterHandler?: Function,
    exitHanlder?: Function,
    stayHanlder?: Function,
  ) {
    this.value = value;
    this.id = randomUUID();
    this.transitions = new Set();
    this.stepHandler = stepHandler ? stepHandler : this.defaultStepHandler;
    this.exitHandler = exitHanlder;
    this.enterHandler = enterHandler;
    this.stayHandler = stayHanlder;
  }

  public enter() {
    if (this.enterHandler && typeof this.enterHandler === "function") {
      this.enterHandler(this.value);
    }
  }

  public exit() {
    if (this.exitHandler && typeof this.exitHandler === "function") {
      this.exitHandler(this.value);
    }
  }

  public stay() {
    if (this.stayHandler && typeof this.stayHandler === "function") {
      this.stayHandler(this.value);
    }
  }

  public step(): Cell {
    const next: Cell = this.stepHandler(this.value, this.transitions);

    if (next.id !== this.id) {
      this.exit();
    } else if (next.id === this.id) {
      this.stay();
    }

    return next;
  }

  public addTransition(to: Cell): void {
    this.transitions.add(to);
  }

  private defaultStepHandler(): Cell {
    if (this.transitions.size) return this.transitions.keys().next().value;
    else throw Error();
  }
}

function createCells(values: string[]): Cell[] {
  return values.map((cellValue: string) => new Cell(cellValue));
}

interface Transition<T extends string> {
  from: T;
  to: T;
}

export function createStateMachine<T extends string>(
  cellValues: T[],
  transitions: Transition<T>[],
) {
  const cells: Cell[] = createCells(cellValues);

  for (const transition of transitions) {
    const from: Cell | undefined = cells.find(
      (cell: Cell) => cell.value === transition.from,
    );
    const to: Cell | undefined = cells.find(
      (cell: Cell) => cell.value === transition.to,
    );
    from!.transitions.add(to!);
  }
}

interface CellTransitionHanlder {
  (value: any, transitions: Set<Cell>): Cell;
}

