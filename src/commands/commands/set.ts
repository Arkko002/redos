import { assert } from "console";
import database from "../../db/db";
import { Command } from "../command";
import { CommandEvent, CommandEventHandler } from "../handler/handler";
import { Err, RedosError, Result } from "../../error-handling";
import { CommandsErrorKind } from "./commands.error";
import { SyntaxNode, SyntaxNodeType, AnyStringSyntaxNode } from "./schema";
import server from "../../server";

const setHandler: CommandEventHandler = (event: CommandEvent): void => {
  const setSyntaxNode = new SetCommandSyntaxNode(null);
  const syntaxTreeValid: Result<null, RedosError> = setSyntaxNode.verifyTokens([
    event.name,
    ...event.args,
  ]);

  if (syntaxTreeValid.isErr()) {
    server.write(
      createErrorResponse(syntaxTreeValid.error.message),
      event.connectionId,
    );
    return;
  }

  const value: Result<string, RedosError> = database.set(
    event.args[0],
    event.args[1],
  );

  server.write(createValueResponse(value.unwrap()), event.connectionId);
};

// TODO: const Set as context and description providing object, SyntaxNode as AST node with veryfication
export const Set: Command = Object.freeze({
  name: "set",
  arity: -3,
  arguments: [],
  subcommands: [],
  handler: setHandler,
});

describe("SET", () => {
  it("should store a value in the storage", () => {
    database.delete("TestKey");
    database.set("TestKey", "TestValue");
    const testValue: string | undefined = database.get("TestKey").unwrap();

    assert(testValue === "TestValue");
  });

  it("should overwrite an existing key", () => {
    database.delete("TestKey");
    database.set("TestKey", "TestValue");
  });
});

class SetCommandSyntaxNode extends SyntaxNode {
  public value: string = "set";
  public type: SyntaxNodeType = SyntaxNodeType.COMMAND;
  public children: SyntaxNode[] = [
    new AnyStringSyntaxNode(this),
    new AnyStringSyntaxNode(this),
  ];

  public constructor(parent: SyntaxNode | null) {
    super(parent);
  }

  public verifyToken(token: string, args: string[]): Result<null, RedosError> {
    if (token !== this.value)
      return Err(
        new RedosError(
          `Incorrect command name: ${token}, expected: ${this.value}`,
          CommandsErrorKind.INCORRECT_ARGUMENT_VALUE,
        ),
      );

    return super.matchArgs(args);
  }
}

const createValueResponse = (value: string) => createBulkString(value);
const createNotFoundResponse = (): string => createNilBulkString();
const createErrorResponse = (msg: string) => createBulkString(msg); // TODO: Error response on SET

