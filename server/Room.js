import {
  MaxGameGridDimensions,
  MinGameGridDimensions,
} from "../shared/Consts.js";
import { GameState, SocketEvents } from "../shared/DTOs.js";
import Game from "./Game.js";
import { deepFreeze } from "./TetrisConsts.js";

export default class Room {
  #io;
  #name;
  /** @type {GameState} */
  #gameState = GameState.Pending;
  #ownerName;
  /** @type {{ socket: import("socket.io").Socket, name: string }[]} */
  #players = [];
  /** @type {import("./Game.js").default} */
  #tetrisGame;

  get name() {
    return this.#name;
  }

  /**
   * @returns {import("../shared/DTOs.js").RoomData}
   */
  get #roomData() {
    return {
      gameState: this.#gameState,
      ownerName: this.#ownerName,
      playerNames: this.#players.map((player) => player.name),
    };
  }

  /**
   * @param {import("socket.io").Server} io
   * @param {string} name
   * @param {import("socket.io").Socket} socket
   * @param {string} ownerName
   */
  constructor(io, name, socket, ownerName) {
    this.#io = io;
    this.#name = name;
    this.#ownerName = ownerName;
    this.#players = [{ socket, name: ownerName }];
    socket.join(name);
    this.#broadcastRoomData();
  }

  /**
   * @param {import("socket.io").Socket} socket
   * @param {string} playerName
   */
  addPlayer(socket, playerName) {
    this.#players.push({ socket, name: playerName });
    socket.join(this.#name);
    this.#broadcastRoomData();
  }

  /**
   * @param {string} playerName
   */
  removePlayer(playerName) {
    const playerIndex = this.#players.findIndex(
      (player) => player.name === playerName,
    );

    if (playerIndex === -1) {
      return;
    }

    this.#players.splice(playerIndex, 1);
    this.#tetrisGame?.removePlayer(playerName);

    if (this.#ownerName === playerName && this.#players.length > 0) {
      this.#ownerName = this.#players[0].name;
    }

    this.#broadcastRoomData();
  }

  /**
   * @param {string} playerName
   * @param {Readonly<import("../shared/DTOs.js").GameConfig>} gameConfig
   */
  startGame(playerName, gameConfig) {
    gameConfig = deepFreeze(gameConfig);
    const isValidGridHeight =
      gameConfig.gridDimensions.y >= MinGameGridDimensions.y &&
      gameConfig.gridDimensions.y <= MaxGameGridDimensions.y;
    const isValidGridWidth =
      gameConfig.gridDimensions.x >= MinGameGridDimensions.x &&
      gameConfig.gridDimensions.x <= MaxGameGridDimensions.x;
    const isValidGridDimensions = isValidGridHeight && isValidGridWidth;

    if (
      this.#gameState === GameState.Playing ||
      this.#ownerName !== playerName ||
      !isValidGridDimensions
    ) {
      return;
    }

    this.#gameState = GameState.Playing;
    this.#tetrisGame = new Game(
      this.#players.map((player) => player.name),
      gameConfig,
    );
    const OnGameUpdate = this.#OnGameUpdate.bind(this);
    this.#tetrisGame.addGameUpdateListener(OnGameUpdate);
    const OnGameEnd = this.#OnGameEnd.bind(this);
    this.#tetrisGame.gameLoop().then(OnGameEnd);
    this.#broadcastRoomData();
  }

  #OnGameUpdate() {
    this.#players.forEach((player) => {
      const gameData = this.#tetrisGame.getGameData(player.name);
      player.socket.emit(SocketEvents.UpdateGameData, gameData, 42);
    });
  }

  #OnGameEnd() {
    this.#gameState = GameState.Ended;
    this.#tetrisGame.removeAllGameUpdateListeners();
    this.#broadcastRoomData();
  }

  /**
   * @param {string} playerName
   * @param {import("../shared/DTOs.js").ActionType} actionType
   */
  doAction(playerName, actionType) {
    if (this.#gameState !== GameState.Playing) {
      return;
    }

    this.#tetrisGame.doAction(playerName, actionType);
  }

  #broadcastRoomData() {
    this.#io.to(this.#name).emit(SocketEvents.UpdateRoomData, this.#roomData);
  }

  isEmpty() {
    return this.#players.length === 0;
  }

  /**
   * @param {string} playerName
   */
  hasPlayer(playerName) {
    return this.#players.some((player) => player.name === playerName);
  }

  isPlaying() {
    return this.#gameState === GameState.Playing;
  }
}
