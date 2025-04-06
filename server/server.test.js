import { expect, describe, it, afterAll, vi } from "vitest";
import { logRoomConfig } from "./server";

describe("Server example test", () => {
  it("log funciton should print to console the info", () => {
    const consoleMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => undefined);

    afterAll(() => {
      consoleMock.mockReset();
    });
    logRoomConfig("foobar", "george");
    expect(consoleMock).toHaveBeenCalledOnce();
    expect(consoleMock).toHaveBeenLastCalledWith("Room: foobar, Player: george");
  });
});
