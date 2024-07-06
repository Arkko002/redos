import database, { DatabaseErrorKind } from "../../db/db";
import { RedosError } from "../../error-handling";
import server from "../../server/server";
import { Command } from "../command";
import { CommandEvent, CommandEventHandler } from "../handler/handler";

// TODO: An error is returned if the value stored at key is not a string, because GET only handles string values.
const getHandler: CommandEventHandler = (event: CommandEvent): void => {
  let value: any = database.get(event.args[0]);

  if (value.isOk())
    server.write(createValueResponse(value.unwrap()), event.connectionId);
  else if (value.isErr()) {
    const error: RedosError = value.unwrap();
    if (error.kind === DatabaseErrorKind.KEY_NOT_IN_STORAGE) {
      server.write(createNotFoundResponse(), event.connectionId);
    } else {
      throw error;
    }
  }
};

export const Get: Command = Object.freeze({
  name: "GET",
  arity: 2,
  arguments: [],
  subcommands: [],
  handler: getHandler,
});

// TODO: Type
const createValueResponse = (value: any) => createBulkString(value);
const createNotFoundResponse = (): string => createNilBulkString();

