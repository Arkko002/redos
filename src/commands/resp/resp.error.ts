export enum RESPErrorKind {
  INVALID_CARRIAGE_RETURN = "INVALID_CARRIAGE_RETURN",
  INVALID_RESP_TYPE = "INVALID_RESP_TYPE",
  INTEGER_NOT_NUMBER = "INTEGER_NOT_NUMBER",
  BULK_STRING_NOT_ENOUGH_DATA = "BULK_STRING_NOT_ENOUGH_DATA",
  BULK_STRING_DECLARED_LENGTH_WRONG = "BULK_STRING_DECLARED_LENGTH_WRONG",
  ARRAY_DECLARED_LENGTH_WRONG = "ARRAY_DECLARED_LENGTH_WRONG",
}
