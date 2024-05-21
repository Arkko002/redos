import { CommandsErrorKind } from "../commands/commands/commands.error";
import { CommandHandlerErrorKind } from "../commands/handler/handler.error";
import { RESPErrorKind } from "../commands/resp/resp.error";
import { OptionErrorKind } from "./option";

export class CustomError extends Error {
  constructor(
    public message: string,
    public kind: ErrorKind,
  ) {
    super(message);
  }
}

export type ErrorKind =
  | RESPErrorKind
  | CommandHandlerErrorKind
  | OptionErrorKind
  | CommandsErrorKind;