import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { io as ioClient } from "socket.io-client";
import createApp from "./server.js";
import {
  ActionType,
  CellType,
  GameState,
  RulesetType,
  SocketEvents,
} from "../shared/DTOs.js";
import { DefaultGameGridDimensions } from "../shared/Consts.js";

const TestPort = 3001;
const RoomNames = ["testRoom1", "testRoom2"];
const PlayerNames = Array.from({ length: 100 }, (_, i) => `Player${i + 1}`);

//NOTE: ensure the score store does nothing
vi.mock("./ScoreStore.js", () => {
  return {
    default: class {
      constructor() {}
      pushPlayerScores() {}
      getAllScores() {}
      setSocket() {}
      broadcastScores() {}
    },
    convertToPlayerScores: () => {},
  };
});

describe("server", () => {
  /** @type { import("http").Server} */
  let server;
  /** @type {Function} */
  let closeServer;

  beforeEach(async () => {
    ({ server, closeServer } = createApp());
    await new Promise((resolve) =>
      server.listen(TestPort, () => resolve(undefined)),
    );
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
    const socket = await connectSocket(RoomNames[0], PlayerNames[0], false);
    expect(socket.connected).toBe(false);
  });

  it("should receive room updates", async () => {
    const socket = await connectSocket(RoomNames[0], PlayerNames[0]);
    const updateRoomDataPromise = waitFor(socket, SocketEvents.UpdateRoomData);
    await connectSocket(RoomNames[0], PlayerNames[1]);
    const roomData = (await updateRoomDataPromise)[0];
    /** @type {import("../shared/DTOs.js").RoomData} */
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
    /** @type {import("../shared/DTOs.js").RoomData} */
    const expectedRoomData = {
      gameState: GameState.Pending,
      ownerName: PlayerNames[1],
      playerNames: [PlayerNames[1]],
    };
    expect(roomData).toMatchObject(expectedRoomData);
  });

  it("should not start a game when a non-owner tries to start it", async () => {
    await connectSocket(RoomNames[0], PlayerNames[0]);
    const nonOwnerSocket = await connectSocket(RoomNames[0], PlayerNames[1]);
    const noUpdateRoomDataPromise = waitForUnexpectedSocketEventOrTimeout(
      nonOwnerSocket,
      SocketEvents.UpdateRoomData,
    );
    emitStartGame(nonOwnerSocket);
    await noUpdateRoomDataPromise;
  });

  it("should not start a game if one game is already in progress", async () => {
    const ownerSocket = await connectSocket(RoomNames[0], PlayerNames[0]);
    const nonOwnerJoinedRoomPromise = waitFor(
      ownerSocket,
      SocketEvents.UpdateRoomData,
    );
    await connectSocket(RoomNames[0], PlayerNames[1]);
    await nonOwnerJoinedRoomPromise;
    const ownerUpdateRoomDataPromise = waitFor(
      ownerSocket,
      SocketEvents.UpdateRoomData,
    );
    emitStartGame(ownerSocket);
    await ownerUpdateRoomDataPromise;
    const noUpdateRoomDataPromise = waitForUnexpectedSocketEventOrTimeout(
      ownerSocket,
      SocketEvents.UpdateRoomData,
    );
    emitStartGame(ownerSocket);
    await noUpdateRoomDataPromise;
  });

  it("should start a solo game", async () => {
    const ownerSocket = await connectSocket(RoomNames[0], PlayerNames[0]);
    const updateRoomDataPromise = waitFor(
      ownerSocket,
      SocketEvents.UpdateRoomData,
    );
    emitStartGame(ownerSocket);
    await updateRoomDataPromise;
  });

  it("should start a game when the owner starts it", async () => {
    const ownerSocket = await connectSocket(RoomNames[0], PlayerNames[0]);
    const nonOwnerJoinedRoomPromise = waitFor(
      ownerSocket,
      SocketEvents.UpdateRoomData,
    );
    const nonOwnerSocket = await connectSocket(RoomNames[0], PlayerNames[1]);
    await nonOwnerJoinedRoomPromise;
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
    /** @type {import("../shared/DTOs.js").RoomData} */
    const expectedRoomData = {
      gameState: GameState.Playing,
      ownerName: PlayerNames[0],
      playerNames: [PlayerNames[0], PlayerNames[1]],
    };
    expect(ownerRoomData).toMatchObject(expectedRoomData);
    expect(nonOwnerRoomData).toMatchObject(expectedRoomData);
  });

  it("should not join a same room when a game is in progress", async () => {
    const ownerSocket = await connectSocket(RoomNames[0], PlayerNames[0]);
    await connectSocket(RoomNames[0], PlayerNames[1]);
    const updateRoomDataPromise = waitFor(
      ownerSocket,
      SocketEvents.UpdateRoomData,
    );
    emitStartGame(ownerSocket);
    await updateRoomDataPromise;
    const newSocket = await connectSocket(RoomNames[0], PlayerNames[2], false);
    expect(newSocket.connected).toBe(false);
  });

  it("should receive game state updates", async () => {
    const socket = await connectSocket(RoomNames[0], PlayerNames[0]);
    await connectSocket(RoomNames[0], PlayerNames[1]);
    const updateRoomDataPromise = waitFor(socket, SocketEvents.UpdateRoomData);
    const updateGameDataPromise = waitFor(socket, SocketEvents.UpdateGameData);
    emitStartGame(socket);
    await updateRoomDataPromise;
    const gameData = (await updateGameDataPromise)[0];
    /** @type {import("../shared/DTOs.js").GameData} */
    const expectedGameDataStructure = {
      grid: expect.any(Array),
      playerNameToSpectrum: expect.objectContaining({
        [PlayerNames[1]]: expect.any(Array),
      }),
      score: expect.any(Number),
      nextTetromino: expect.any(Number),
    };
    expect(gameData).toMatchObject(expectedGameDataStructure);
  });

  it("should execute game actions", async () => {
    const socket = await connectSocket(RoomNames[0], PlayerNames[0]);
    const otherJoinedRoomPromise = waitFor(socket, SocketEvents.UpdateRoomData);
    await connectSocket(RoomNames[0], PlayerNames[1]);
    await otherJoinedRoomPromise;
    const updateRoomDataPromise = waitFor(socket, SocketEvents.UpdateRoomData);
    emitStartGame(socket);
    await updateRoomDataPromise;
    const updateGameDataPromise = waitFor(socket, SocketEvents.UpdateGameData);
    emitGameAction(socket, ActionType.SoftDrop);
    /** @type {import("../shared/DTOs.js").GameData} */
    const gameData = (await updateGameDataPromise)[0];
    expect(gameData.grid[0].every((cell) => cell === CellType.Empty)).toBe(
      true,
    );
  });
});

/**
 * @param {string} roomName
 * @param {string} playerName
 * @param {boolean} [waitForUpdateRoomData]
 */
async function connectSocket(
  roomName,
  playerName,
  waitForUpdateRoomData = true,
) {
  const socket = ioClient(`http://localhost:${TestPort}`, {
    auth: { roomName, playerName },
    transports: ["websocket"],
    upgrade: false,
  });

  if (waitForUpdateRoomData) {
    const updateRoomDataPromise = waitFor(socket, SocketEvents.UpdateRoomData);
    await waitFor(socket, "connect");
    await updateRoomDataPromise;
  } else {
    await waitFor(socket, "connect");
  }

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
  /** @type {import("../shared/DTOs.js").GameConfig} */
  const gameConfig = {
    gridDimensions: DefaultGameGridDimensions,
    heavy: false,
    ruleset: RulesetType.Classic,
    enabledPowerUps: [],
  };
  socket.emit(SocketEvents.StartGame, gameConfig);
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
    const timeoutId = setTimeout(() => resolve(undefined), 500);
    socket.once(socketEvent, () => {
      clearTimeout(timeoutId);
      reject(new Error("Received update when not expected"));
    });
  });
}
