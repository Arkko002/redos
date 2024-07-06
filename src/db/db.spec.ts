import { describe, expect } from "@jest/globals";
import database from "./db";
import { RedosError, Result } from "../error-handling";

describe("Database", () => {
  it("should store a value in the storage", () => {
    database.delete("TestKey");
    database.set("TestKey", "TestValue");
    const testValue: string = database.get("TestKey").unwrap();

    expect(testValue === "TestValue");
  });

  it("should overwrite an existing key", () => {
    database.delete("TestKey");
    database.set("TestKey", "TestValue");
    database.set("TestKey", "TestValue2", true);
    const testValue: string = database.get("TestKey").unwrap();

    expect(testValue === "TestValue2");
  });

  it("should return an error when overwriting without overwrite flag set", () => {
    database.delete("TestKey");
    database.set("TestKey", "TestValue");
    database.set("TestKey", "TestValue2");
    const testValue: Result<string, RedosError> = database.get("TestKey");

    expect(testValue.type).toBe("error");
  });

  it("should delete an existing key", () => {
    database.delete("TestKey");
    database.set("TestKey", "TestValue");
    database.delete("TestKey");
    const testValue: Result<string, RedosError> = database.get("TestKey");

    expect(testValue.type).toBe("error");
    expect(testValue.unwrap()).toMatchObject({ kind: "KEY_NOT_IN_STORAGE" });
  });
});
