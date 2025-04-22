import seedrandom from "seedrandom";
import Player from "./Player.js";
import { TICK_RATE } from "./TetrisConfig.js";
import { VectorDown, VectorLeft, VectorRight } from "./TetrisConsts.js";
import { ActionType } from "../shared/DTOs.js";

export default class Game {
  #isSoloGame;
  #lastLoopTime = new Date();
  #playerGameStates;
  /** @type {function[]} */
  #gameUpdateListeners = [];

  /**
   * @param {string} playerName
   * @returns {import("../shared/DTOs.js").GameData}
   */
  getGameData(playerName) {
    /** @type {Object<string, import("../shared/DTOs.js").Spectrum>} */
    const playerNameToSpectrum = {};

    this.#playerGameStates
      .filter((playerGameState) => playerGameState.playerName !== playerName)
      .forEach((playerGameState) => {
        playerNameToSpectrum[playerGameState.playerName] =
          playerGameState.player.spectrum;
      });

    return {
      grid: this.#playerGameStates.find(
        (playerGameState) => playerGameState.playerName === playerName,
      ).player.gridArray,
      playerNameToSpectrum,
    };
  }

  /**
   * @param {string[]} playerNames
   * @param {any} randomSeed
   */
  constructor(playerNames, randomSeed = null) {
    this.#isSoloGame = playerNames.length === 1;
    randomSeed = randomSeed ?? this.#lastLoopTime;
    this.#playerGameStates = playerNames.map((playerName) => ({
      playerName,
      player: new Player(seedrandom(randomSeed)),
    }));
  }

  /**
   * @param {string} playerName
   * @param {import("../shared/DTOs.js").ActionType} actionType
   */
  doAction(playerName, actionType) {
    const playerGameState = this.#playerGameStates.find(
      (playerGameState) => playerGameState.playerName === playerName,
    );

    if (!playerGameState) {
      return;
    }

    switch (actionType) {
      case ActionType.MoveLeft:
        playerGameState.player.tryMoveTetromino(VectorLeft);
        break;
      case ActionType.MoveRight:
        playerGameState.player.tryMoveTetromino(VectorRight);
        break;
      case ActionType.Rotate:
        playerGameState.player.tryRotateTetromino();
        break;
      case ActionType.SoftDrop:
        playerGameState.player.tryMoveTetromino(VectorDown);
        break;
      case ActionType.HardDrop:
        playerGameState.player.hardDropTetromino();
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
    const winnerGameState = this.#playerGameStates.find(
      (playerGameState) => !playerGameState.player.isGameOver(),
    );

    //TODO: broadcast game over
    if (!winnerGameState) {
      console.log("Game over: Draw!");
    } else {
      console.log(`Game over: ${winnerGameState.playerName} wins!`);
    }
  }

  #isGameOver() {
    if (this.#isSoloGame) {
      return this.#playerGameStates[0].player.isGameOver();
    }

    return !this.#hasMultipleActivePlayers();
  }

  #hasMultipleActivePlayers() {
    return (
      this.#playerGameStates.filter(
        (playerGameState) => !playerGameState.player.isGameOver(),
      ).length > 1
    );
  }

  /**
   * @param {number} deltaTime
   */
  #updateGrids(deltaTime) {
    this.#playerGameStates.forEach((playerGameState) => {
      if (!playerGameState.player.isGameOver()) {
        playerGameState.player.update(deltaTime);
      }
    });
  }

  #broadcastState() {
    this.#gameUpdateListeners.forEach((cb) => cb());
  }
}
