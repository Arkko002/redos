import database, { DatabaseErrorKind } from "../../db/db";
import { RedosError } from "../../error-handling";
import server from "../../server/server";
import { Command } from "../command";
import { CommandEvent, CommandEventHandler } from "../handler/handler";

// TODO: An error is returned if the value stored at key is not a string, because GET only handles string values.
// NOTE: https://redis.io/docs/latest/commands/type/
const typeHandler: CommandEventHandler = (event: CommandEvent): void => {};

export const Type: Command = Object.freeze({
  name: "TYPE",
  arity: 2,
  arguments: [],
  subcommands: [],
  handler: typeHandler,
});


// TODO: Type
const createTypeResponse = (type: any) => createBulkString(value);
