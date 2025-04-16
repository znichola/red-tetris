import seedrandom from "seedrandom";
import TetrisGrid from "./TetrisGrid.js";
import { TICK_RATE } from "./TetrisConfig.js";
import { VectorDown, VectorLeft, VectorRight } from "./TetrisConsts.js";
import { ActionType } from "../DTOs.js";

export default class TetrisGame {
  #lastLoopTime = new Date();
  #playerGameStates;
  /** @type {function[]} */
  #gameUpdateListeners = [];

  /**
   * @param {string} playerName
   * @returns {import("../DTOs.js").GameData}
   */
  getGameData(playerName) {
    /** @type {Object<string, import("../DTOs.js").Spectrum>} */
    const playerNameToSpectrum = {};

    this.#playerGameStates
      .filter((playerGameState) => playerGameState.playerName !== playerName)
      .forEach((playerGameState) => {
        playerNameToSpectrum[playerGameState.playerName] =
          playerGameState.grid.spectrum;
      });

    return {
      grid: this.#playerGameStates.find(
        (playerGameState) => playerGameState.playerName === playerName,
      ).grid.gridArray,
      playerNameToSpectrum,
    };
  }

  /**
   * @param {string[]} playerNames
   * @param {any} randomSeed
   */
  constructor(playerNames, randomSeed = null) {
    randomSeed = randomSeed ?? this.#lastLoopTime;
    this.#playerGameStates = playerNames.map((playerName) => ({
      playerName,
      grid: new TetrisGrid(seedrandom(randomSeed)),
    }));
  }

  /**
   * @param {string} playerName
   * @param {import("../DTOs.js").ActionType} actionType
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
        playerGameState.grid.tryMoveTetromino(VectorLeft);
        break;
      case ActionType.MoveRight:
        playerGameState.grid.tryMoveTetromino(VectorRight);
        break;
      case ActionType.Rotate:
        playerGameState.grid.tryRotateTetromino();
        break;
      case ActionType.SoftDrop:
        playerGameState.grid.tryMoveTetromino(VectorDown);
        break;
      case ActionType.HardDrop:
        playerGameState.grid.hardDropTetromino();
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
    while (this.hasMultipleActivePlayers()) {
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
      (playerGameState) => !playerGameState.grid.isGameOver(),
    );

    //TODO: broadcast game over
    if (!winnerGameState) {
      console.log("Game over: Draw!");
    } else {
      console.log(`Game over: ${winnerGameState.playerName} wins!`);
    }
  }

  hasMultipleActivePlayers() {
    return (
      this.#playerGameStates.filter(
        (playerGameState) => !playerGameState.grid.isGameOver(),
      ).length > 1
    );
  }

  /**
   * @param {number} deltaTime
   */
  #updateGrids(deltaTime) {
    this.#playerGameStates.forEach((playerGameState) => {
      if (!playerGameState.grid.isGameOver()) {
        playerGameState.grid.update(deltaTime);
      }
    });
  }

  #broadcastState() {
    this.#gameUpdateListeners.forEach((cb) => cb());
  }
}
