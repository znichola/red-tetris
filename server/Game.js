import seedrandom from "seedrandom";
import Player from "./Player.js";
import { TICK_RATE } from "./TetrisConfig.js";
import { VectorDown, VectorLeft, VectorRight } from "./TetrisConsts.js";
import { ActionType } from "../shared/DTOs.js";
import { scoreStore } from "./server.js";
import { convertToPlayerScores } from "./ScoreStore.js";

export default class Game {
  #isSoloGame;
  #lastLoopTime = new Date();
  #players;
  /** @type {function[]} */
  #gameUpdateListeners = [];

  /**
   * @param {string} playerName
   * @returns {import("../shared/DTOs.js").GameData}
   */
  getGameData(playerName) {
    /** @type {Object<string, import("../shared/DTOs.js").Spectrum>} */
    const playerNameToSpectrum = {};

    this.#players
      .filter((player) => player.name !== playerName)
      .forEach((player) => {
        playerNameToSpectrum[player.name] = player.spectrum;
      });
    const player = this.#players.find((player) => player.name === playerName);
    return {
      grid: player.gridArray,
      playerNameToSpectrum,
      score: player.score,
    };
  }

  /**
   * @param {string[]} playerNames
   * @param {import("../shared/DTOs.js").GameConfigClient} startGameData
   * @param {any} randomSeed
   */
  constructor(playerNames, startGameData, randomSeed = null) {
    this.#isSoloGame = playerNames.length === 1;
    randomSeed = randomSeed ?? this.#lastLoopTime;
    this.#players = playerNames.map(
      (playerName) =>
        new Player(playerName, startGameData, seedrandom(randomSeed)),
    );
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

    //NOTE: A draw can occur when all players game over at the same time.
    const winnerGameState = this.#players.find(
      (player) => !player.isGameOver(),
    );

    //TODO: Decide on what to broadcast when a solo game ends, since there's no winner found for now.
    //TODO: Broadcast game over
    if (!winnerGameState) {
      console.log("Game over: Draw!");
    } else {
      console.log(`Game over: ${winnerGameState.name} wins!`);
    }

    /**@type {import("../shared/DTOs.js").GameMode} */
    const gameMode = this.#isSoloGame ? "solo" : "multiplayer";

    scoreStore.pushPlayerScores(
      convertToPlayerScores(this.#players),
      gameMode,
      winnerGameState?.name,
    );
  }

  #isGameOver() {
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
