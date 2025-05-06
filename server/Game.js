import Player from "./Player.js";
import { TICK_RATE } from "./TetrisConfig.js";
import { VectorDown, VectorLeft, VectorRight } from "./TetrisConsts.js";
import { ActionType, RulesetType } from "../shared/DTOs.js";
import { scoreStore } from "./server.js";
import { convertToPlayerScores } from "./ScoreStore.js";
import { DefaultGameGridDimensions } from "../shared/Consts.js";

export default class Game {
  #isSoloGame;
  #gameConfig;
  #lastLoopTime = new Date();
  #players;
  /** @type {function[]} */
  #gameUpdateListeners = [];

  /**
   * @param {string} playerName
   * @returns {import("../shared/DTOs.js").GameData | null}
   */
  getGameData(playerName) {
    /** @type {Object<string, import("../shared/DTOs.js").Spectrum>} */
    const playerNameToSpectrum = {};
    const player = this.#players.find((player) => player.name === playerName);

    if (!player) {
      return null;
    }

    const otherPlayers = this.#players.filter(
      (player) => player.name !== playerName,
    );
    otherPlayers.forEach((player) => {
      playerNameToSpectrum[player.name] = player.spectrum;
    });

    return {
      grid: player.gridArray,
      playerNameToSpectrum,
      score: player.score,
    };
  }

  /**
   * @param {string[]} playerNames
   * @param {Readonly<import("../shared/DTOs.js").GameConfig>} gameConfig
   * @param {any} randomSeed
   */
  constructor(playerNames, gameConfig, randomSeed = null) {
    this.#isSoloGame = playerNames.length === 1;
    this.#gameConfig = gameConfig;
    randomSeed = randomSeed ?? this.#lastLoopTime;
    this.#players = playerNames.map(
      (playerName) => new Player(playerName, gameConfig, randomSeed),
    );
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
  }

  /**
   * @param {string} playerName
   * @param {import("../shared/DTOs.js").ActionType} actionType
   */
  doAction(playerName, actionType) {
    const player = this.#players.find((player) => player.name === playerName);

    if (!player) {
      return;
    }

    switch (actionType) {
      case ActionType.MoveLeft:
        player.tryMoveTetromino(VectorLeft);
        break;
      case ActionType.MoveRight:
        player.tryMoveTetromino(VectorRight);
        break;
      case ActionType.Rotate:
        player.tryRotateTetromino();
        break;
      case ActionType.SoftDrop:
        player.tryMoveTetromino(VectorDown);
        break;
      case ActionType.HardDrop:
        player.hardDropTetromino();
        break;
    }
  }

  /**
   * @param {function} cb
   */
  addGameUpdateListener(cb) {
    this.#gameUpdateListeners.push(cb);
  }

  removeAllGameUpdateListeners() {
    this.#gameUpdateListeners = [];
  }

  async gameLoop() {
    while (!this.#isGameOver()) {
      const currentTime = new Date();
      const deltaTime = currentTime.getTime() - this.#lastLoopTime.getTime();
      this.#lastLoopTime = currentTime;
      this.#updateGrids(deltaTime);
      //TODO: `broadcastState` calls could be optimized:
      //TODO: since the boards will not necessarily change every tick,
      //TODO: we could skip some broadcasts when no changes are made.
      this.#broadcastState();
      await new Promise((res) => setTimeout(res, 1000 / TICK_RATE));
    }

    //NOTE: It is possible no winner is declared if one of the following happens:
    //NOTE:  - It's a solo game
    //NOTE:  - The game ends in a draw (all players game over at the same time)
    const winnerPlayer = this.#players.find((player) => !player.isGameOver());

    const battle = this.#isSoloGame ? null : "battle";
    const heavy = this.#gameConfig.heavy ? "heavy" : null;
    const ruleSet = Object.entries(RulesetType).find(
      ([, value]) => value === this.#gameConfig.ruleset,
    )?.[0];
    const gridDimension =
      this.#gameConfig.gridDimensions.x === DefaultGameGridDimensions.x &&
      this.#gameConfig.gridDimensions.y === DefaultGameGridDimensions.y
        ? null
        : `${this.#gameConfig.gridDimensions.x}x${this.#gameConfig.gridDimensions.y}`;
    const gameMode = [battle, heavy, ruleSet, gridDimension]
      .filter((x) => x !== null)
      .join("-")
      .toLowerCase();

    scoreStore.pushPlayerScores(
      convertToPlayerScores(this.#players),
      gameMode,
      winnerPlayer?.name,
    );
  }

  #isGameOver() {
    if (this.#players.length === 0) {
      return true;
    }

    if (this.#isSoloGame) {
      return this.#players[0].isGameOver();
    }

    return !this.#hasMultipleActivePlayers();
  }

  #hasMultipleActivePlayers() {
    return this.#players.filter((player) => !player.isGameOver()).length > 1;
  }

  /**
   * @param {number} deltaTime
   */
  #updateGrids(deltaTime) {
    this.#players.forEach((player) => {
      if (player.isGameOver()) {
        return;
      }

      const opponents = this.#players.filter(
        (opponent) => opponent.name !== player.name,
      );
      player.update(deltaTime, opponents);
    });
  }

  #broadcastState() {
    this.#gameUpdateListeners.forEach((cb) => cb());
  }
}
