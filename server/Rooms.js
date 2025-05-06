import { SocketEvents } from "../shared/DTOs.js";
import Room from "./Room.js";
import { deepFreeze } from "./TetrisConsts.js";

export default class Rooms {
  #io;
  /** @type {Map<string, Room>} */
  #rooms = new Map();

  /**
   * @param {import("socket.io").Server} io
   */
  constructor(io) {
    this.#io = io;
  }

  /**
   * @param {import("socket.io").Socket} socket
   * @param {string} roomName
   * @param {string} playerName
   * @return {boolean}
   */
  tryAddPlayer(socket, roomName, playerName) {
    let room = this.#rooms.get(roomName);

    if (!room) {
      room = new Room(this.#io, roomName, socket, playerName);
      this.#rooms.set(roomName, room);
    } else if (room.hasPlayer(playerName) || room.isPlaying()) {
      return false;
    } else {
      room.addPlayer(socket, playerName);
    }

    socket.on(SocketEvents.StartGame, (gameConfig) => {
      /** @type {Readonly<import("../shared/DTOs.js").GameConfig>} */
      const frozenGameConfig = deepFreeze(gameConfig);
      this.#OnStartGame(room, playerName, frozenGameConfig);
    });
    socket.on(SocketEvents.GameAction, (actionType) =>
      this.#OnGameAction(room, playerName, actionType),
    );
    socket.on("disconnect", () => this.#OnDisconnect(room, playerName));

    return true;
  }

  /**
   * @param {Room} room
   * @param {string} playerName
   * @param {Readonly<import("../shared/DTOs.js").GameConfig>} gameConfig
   */
  #OnStartGame(room, playerName, gameConfig) {
    room.startGame(playerName, gameConfig);
  }

  /**
   * @param {Room} room
   * @param {string} playerName
   * @param {any} actionType
   */
  #OnGameAction(room, playerName, actionType) {
    if (typeof actionType !== "number") {
      return;
    }

    room.doAction(playerName, actionType);
  }

  /**
   * @param {Room} room
   * @param {string} playerName
   */
  #OnDisconnect(room, playerName) {
    this.#removePlayer(room, playerName);
  }

  /**
   * @param {Room} room
   * @param {string} playerName
   */
  #removePlayer(room, playerName) {
    room.removePlayer(playerName);

    if (room.isEmpty()) {
      this.#rooms.delete(room.name);
    }
  }
}
