import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { io as ioClient } from "socket.io-client";
import createApp from "./server.js";
import { ActionType, GameState, SocketEvents } from "../DTOs.js";
import { CellType } from "./TetrisConsts.js";

const TestPort = 3001;
const RoomNames = ["testRoom1", "testRoom2"];
const PlayerNames = Array.from({ length: 100 }, (_, i) => `Player${i + 1}`);

describe("server", () => {
  /** @type { import("http").Server} */
  let server;
  /** @type {function} */
  let closeServer;

  beforeEach(async () => {
    ({ server, closeServer } = createApp());
    await new Promise((resolve) => server.listen(TestPort, () => resolve()));
  });

  afterEach(async () => {
    await new Promise((resolve) => closeServer(resolve));
  });

  it("should join a room", async () => {
    const socket = await connectSocket(RoomNames[0], PlayerNames[0]);
    expect(socket.connected).toBe(true);
  });

  it("should not join the same room with the same name twice", async () => {
    await connectSocket(RoomNames[0], PlayerNames[0]);
    const socket = await connectSocket(RoomNames[0], PlayerNames[0]);
    expect(socket.connected).toBe(false);
  });

  it("should receive room updates", async () => {
    const socket = await connectSocket(RoomNames[0], PlayerNames[0]);
    const updateRoomDataPromise = waitFor(socket, SocketEvents.UpdateRoomData);
    await connectSocket(RoomNames[0], PlayerNames[1]);
    const roomData = (await updateRoomDataPromise)[0];
    /** @type {import("../DTOs.js").RoomData} */
    const expectedRoomData = {
      gameState: GameState.Pending,
      ownerName: PlayerNames[0],
      playerNames: [PlayerNames[0], PlayerNames[1]],
    };
    expect(roomData).toMatchObject(expectedRoomData);
  });

  it("should set a new owner if the previous owner leaves", async () => {
    const ownerSocket = await connectSocket(RoomNames[0], PlayerNames[0]);
    const nonOwnerSocket = await connectSocket(RoomNames[0], PlayerNames[1]);
    const updateRoomDataPromise = waitFor(
      nonOwnerSocket,
      SocketEvents.UpdateRoomData,
    );
    ownerSocket.disconnect();
    const roomData = (await updateRoomDataPromise)[0];
    /** @type {import("../DTOs.js").RoomData} */
    const expectedRoomData = {
      gameState: GameState.Pending,
      ownerName: PlayerNames[1],
      playerNames: [PlayerNames[1]],
    };
    expect(roomData).toMatchObject(expectedRoomData);
  });

  it("should not start a game with less than 2 players", async () => {
    const ownerSocket = await connectSocket(RoomNames[0], PlayerNames[0]);
    const noRoomDataUpdatePromise = waitForUnexpectedSocketEventOrTimeout(
      ownerSocket,
      SocketEvents.UpdateRoomData,
    );
    emitStartGame(ownerSocket);
    await noRoomDataUpdatePromise;
  });

  it("should not start a game when a non-owner tries to start it", async () => {
    await connectSocket(RoomNames[0], PlayerNames[0]);
    const nonOwnerSocket = await connectSocket(RoomNames[0], PlayerNames[1]);
    const noRoomDataUpdatePromise = waitForUnexpectedSocketEventOrTimeout(
      nonOwnerSocket,
      SocketEvents.UpdateRoomData,
    );
    emitStartGame(nonOwnerSocket);
    await noRoomDataUpdatePromise;
  });

  it("should not start a game if one game is already in progress", async () => {
    const ownerSocket = await connectSocket(RoomNames[0], PlayerNames[0]);
    await connectSocket(RoomNames[0], PlayerNames[1]);
    const ownerUpdateRoomDataPromise = waitFor(
      ownerSocket,
      SocketEvents.UpdateRoomData,
    );
    emitStartGame(ownerSocket);
    await ownerUpdateRoomDataPromise;
    const noRoomDataUpdatePromise = waitForUnexpectedSocketEventOrTimeout(
      ownerSocket,
      SocketEvents.UpdateRoomData,
    );
    emitStartGame(ownerSocket);
    await noRoomDataUpdatePromise;
  });

  it("should start a game when the owner starts it", async () => {
    const ownerSocket = await connectSocket(RoomNames[0], PlayerNames[0]);
    const nonOwnerSocket = await connectSocket(RoomNames[0], PlayerNames[1]);
    const ownerUpdateRoomDataPromise = waitFor(
      ownerSocket,
      SocketEvents.UpdateRoomData,
    );
    const nonOwnerUpdateRoomDataPromise = waitFor(
      nonOwnerSocket,
      SocketEvents.UpdateRoomData,
    );
    emitStartGame(ownerSocket);
    const ownerRoomData = (await ownerUpdateRoomDataPromise)[0];
    const nonOwnerRoomData = (await nonOwnerUpdateRoomDataPromise)[0];
    /** @type {import("../DTOs.js").RoomData} */
    const expectedRoomData = {
      gameState: GameState.Playing,
      ownerName: PlayerNames[0],
      playerNames: [PlayerNames[0], PlayerNames[1]],
    };
    expect(ownerRoomData).toMatchObject(expectedRoomData);
    expect(nonOwnerRoomData).toMatchObject(expectedRoomData);
  });

  it("should receive game state updates", async () => {
    const socket = await connectSocket(RoomNames[0], PlayerNames[0]);
    await connectSocket(RoomNames[0], PlayerNames[1]);
    const updateRoomDataPromise = waitFor(socket, SocketEvents.UpdateRoomData);
    const updateGameDataPromise = waitFor(socket, SocketEvents.UpdateGameData);
    emitStartGame(socket);
    /** @type {import("../DTOs.js").GameData} */
    await updateRoomDataPromise;
    const gameData = (await updateGameDataPromise)[0];
    /** @type {import("../DTOs.js").GameData} */
    const expectedGameDataStructure = {
      grid: expect.any(Array),
      playerNameToSpectrum: expect.objectContaining({
        [PlayerNames[1]]: expect.any(Array),
      }),
    };
    expect(gameData).toMatchObject(expectedGameDataStructure);
  });

  it("should execute game actions", async () => {
    const socket = await connectSocket(RoomNames[0], PlayerNames[0]);
    await connectSocket(RoomNames[0], PlayerNames[1]);
    const updateRoomDataPromise = waitFor(socket, SocketEvents.UpdateRoomData);
    emitStartGame(socket);
    await updateRoomDataPromise;
    const updateGameDataPromise = waitFor(socket, SocketEvents.UpdateGameData);
    emitGameAction(socket, ActionType.HardDrop);
    /** @type {import("../DTOs.js").GameData} */
    const gameData = (await updateGameDataPromise)[0];
    expect(gameData.grid[0].every((cell) => cell === CellType.Empty)).toBe(
      true,
    );
  });
});

/**
 * @param {string} roomName
 * @param {string} playerName
 */
async function connectSocket(roomName, playerName) {
  const socket = ioClient(`http://localhost:${TestPort}`, {
    query: { roomName, playerName },
  });
  await waitFor(socket, "connect");

  return socket;
}

/**
 * @param {import("socket.io-client").Socket} socket
 * @param {string} event
 * @returns {Promise<any>}
 */
function waitFor(socket, event) {
  return new Promise((resolve) =>
    socket.once(event, (...args) => resolve(args)),
  );
}

/**
 * @param {import("socket.io-client").Socket} socket
 */
function emitStartGame(socket) {
  socket.emit(SocketEvents.StartGame);
}

/**
 * @param {import("socket.io-client").Socket} socket
 * @param {ActionType} actionType
 */
function emitGameAction(socket, actionType) {
  socket.emit(SocketEvents.GameAction, actionType);
}

/**
 * @param {import("socket.io-client").Socket} socket
 * @param {string} socketEvent
 */
function waitForUnexpectedSocketEventOrTimeout(socket, socketEvent) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => resolve(), 500);
    socket.once(socketEvent, () => {
      clearTimeout(timeoutId);
      reject(new Error("Received update when not expected"));
    });
  });
}
