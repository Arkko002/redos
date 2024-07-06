import { Result, RedosError, Err, Ok } from "../../../error-handling";
import { CommandsErrorKind } from "../commands.error";

// TODO: Positional arguments
// TODO: Optional arguments
// TODO: Ranged number arguments
// TODO: Floating point arguments
// TODO: Dates and time arguments
export interface TreeSchema {
  children: SyntaxNode[];
  verifyTokens(tokens: string[]): Result<null, RedosError>;
}

export enum SyntaxNodeType {
  COMMAND,
  LITERAL,
  NUMBER,
  STRING,
  DATE,
  SET,
}

export abstract class SyntaxNode implements TreeSchema {
  abstract value: string;
  abstract type: SyntaxNodeType;
  abstract children: SyntaxNode[];
  public parent: SyntaxNode | null;

  public constructor(parent: SyntaxNode | null = null) {
    if (parent) this.parent = parent;
    else this.parent = null;
  }

  public verifyTokens(tokens: string[]): Result<null, RedosError> {
    return this.verifyToken(tokens[0], tokens.slice(1));
  }

  abstract verifyToken(token: string, args: string[]): Result<null, RedosError>;

  protected matchArgs(args: string[]): Result<null, RedosError> {
    if (args.length !== this.children.length)
      return Err(
        new RedosError(
          `Incorrect number of arguments to ${this.value}, expected: ${this.children.length}, got: ${args.length}`,
          CommandsErrorKind.NOT_ENOUGH_ARGUMNETS,
        ),
      );

    const matchedIndexes: Map<number, number> = new Map();

    args.forEach((arg: string, argIndex: number) => {
      this.children.find((child: SyntaxNode, nodeIndex: number) => {
        if (matchedIndexes.has(nodeIndex)) return false;

        const result = child.verifyToken(arg, []);
        if (result.isOk()) matchedIndexes.set(nodeIndex, argIndex);
        else {
          if (nodeIndex === this.children.length - 1)
            return Err(
              new RedosError(
                `Unknown argument provided to command ${this.value}, got: ${arg}`,
                CommandsErrorKind.INCORRECT_ARGUMENT_VALUE,
              ),
            );
        }
      });
    });

    return Ok(null);
  }

  // TODO:
  // protected findValueInSchema(valueStr: string) {
  //   const found: SyntaxNode | undefined = this.children
  //     .filter((token: SyntaxNode) => token.type === SyntaxNodeType.LITERAL)
  //     .find((literal: SyntaxNode) => literal.value === valueStr);
  // }
}

export class AnyStringSyntaxNode extends SyntaxNode {
  public value: string = "any";
  public type: SyntaxNodeType = SyntaxNodeType.STRING;
  public children: SyntaxNode[] = [];

  public constructor(parent: SyntaxNode) {
    super(parent);
  }

  public verifyToken(token: string): Result<null, RedosError> {
    if (token.length) return Ok(null);
    else
      return Err(
        new RedosError(
          `Empty string provided as argument to parent node: ${this.parent?.value}`,
          CommandsErrorKind.INCORRECT_ARGUMENT_VALUE,
        ),
      );
  }
}

export class NumberSyntaxNode extends SyntaxNode {
  public value: string;
  public type: SyntaxNodeType = SyntaxNodeType.NUMBER;
  public children: SyntaxNode[] = [];

  public constructor(value: string, parent: SyntaxNode) {
    super(parent);
    this.value = value;
  }

  public verifyToken(token: string, args: string[]): Result<null, RedosError> {
    const parsedNumber: number = Number.parseInt(token);
    if (Number.isNaN(parsedNumber))
      return Err(
        new RedosError(
          `Not a number: ${token}`,
          CommandsErrorKind.INCORRECT_ARGUMENT_VALUE,
        ),
      );

    return Ok(null);
  }
}

export class LiteralStringSyntaxNode extends SyntaxNode {
  public value: string;
  public type: SyntaxNodeType = SyntaxNodeType.LITERAL;
  public children: SyntaxNode[];

  public constructor(value: string, children: SyntaxNode[] = []) {
    super();
    this.value = value;
    this.children = children;
  }

  public verifyToken(token: string): Result<null, RedosError> {
    if (token === this.value) {
      return Ok(null);
    } else {
      return Err(
        new RedosError(
          `Incorrect value: ${token}, expected: ${this.value}`,
          CommandsErrorKind.INCORRECT_ARGUMENT_VALUE,
        ),
      );
    }
  }
}

