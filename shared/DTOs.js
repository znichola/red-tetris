/**
 * @typedef {Object} Vector
 * @property {number} x
 * @property {number} y
 *
 * @typedef {Object} StartGameData
 * @property {Vector} gridDimensions
 *
 * @typedef {Object} GameData
 * @property {Grid} grid
 * @property {number} score
 * @property {PlayerNameToSpectrum} playerNameToSpectrum
 *
 * @typedef {CellType[][]} Grid
 *
 * @typedef {Object<string, Spectrum> } PlayerNameToSpectrum
 * @typedef {number[]} Spectrum
 *
 * @typedef {Object} RoomData
 * @property {GameState} gameState
 * @property {string} ownerName
 * @property {string[]} playerNames
 *
 * @typedef {Object} GameActionData
 * @property {ActionType} actionType
 */

/** @readonly @enum {number} */
export const GameState = {
  Pending: 0,
  Playing: 1,
  Ended: 2,
};

/** @readonly @enum {number} */
export const ActionType = {
  MoveLeft: 0,
  MoveRight: 1,
  Rotate: 2,
  SoftDrop: 3,
  HardDrop: 4,
};

/** @readonly @enum {string} */
export const SocketEvents = {
  //NOTE: Client to server events:
  GameAction: "gameAction",
  StartGame: "startGame",
  //NOTE: Server to clients events:
  UpdateRoomData: "updateRoomData",
  UpdateGameData: "updateGameData",
  UpdateScores: "updateScores",
};

/** @readonly @enum {number} */
export const TetrominoType = Object.freeze({
  I: 1,
  O: 2,
  T: 3,
  J: 4,
  L: 5,
  S: 6,
  Z: 7,
});

/** @readonly @enum {number} */
export const CellType = Object.freeze({
  Empty: 0,
  ...TetrominoType,
  Indestructible: 8,
});

/**
 * Use for the scoring table
 * @typedef {"solo" | "multiplayer"} GameMode
 * @typedef {{player: string, score: number, time: string, gameMode: GameMode, winner: boolean}} ScoreRecord
 */
