import { CellType } from "./server/TetrisConsts.js";

/**
 * @typedef {Object} GameData
 * @property {Grid} grid
 * @property {Object<string, Spectrum>} playerNameToSpectrum
 *
 * @typedef {CellType[][]} Grid
 *
 * @typedef {number[]} Spectrum
 *
 * @typedef {Object} RoomData
 * @property {GameState} gameState
 * @property {string} ownerName
 * @property {string[]} playerNames
 *
 * @typedef {number} GameState
 *
 * @typedef {number} ActionType
 *
 * @typedef {Object} GameActionData
 * @property {ActionType} actionType
 */

export const GameState = {
  Pending: 0,
  Playing: 1,
  Ended: 2,
};

export const ActionType = {
  MoveLeft: 0,
  MoveRight: 1,
  Rotate: 2,
  SoftDrop: 3,
  HardDrop: 4,
};

export const SocketEvents = {
  //NOTE: Client to server events:
  GameAction: "gameAction",
  StartGame: "startGame",
  //NOTE: Server to clients events:
  UpdateRoomData: "updateRoomData",
  UpdateGameData: "updateGameData",
};
