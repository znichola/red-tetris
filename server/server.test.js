import { beforeAll, afterAll, describe, it, expect } from "vitest";
import { io as ioc } from "socket.io-client";
import createApp from "./server.js";

/**
 * @param {import("socket.io").Socket} socket
 * @param {string} event
*/
// eslint-disable-next-line no-unused-vars
function waitFor(socket, event) {
  return new Promise((resolve) => {
    socket.once(event, resolve);
  });
}

describe("my awesome project", () => {
  const TestPort = 3001;
  /** @type {import("socket.io").Server} */
  let io;
  /** @type { import("http").Server} */
  let server;
  /** @type {import("socket.io-client").Socket} */
  let clientSocket;

  beforeAll(async () => {
    ({ io, server } = createApp());
    server.listen(TestPort);
    clientSocket = ioc(`http://localhost:${TestPort}`);
    await new Promise((resolve) => clientSocket.on("connect", () => resolve()));
  });

  afterAll(() => {
    clientSocket.disconnect();
    io.close();
    server.close();
  });

  it("should work with emitWithAck()", async () => {
    const result = await clientSocket.emitWithAck("hello");
    expect(result).toEqual("world");
  });
});
