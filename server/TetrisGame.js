import seedrandom from "seedrandom";
import TetrisGrid from "./TetrisGrid.js";
import { TICK_RATE } from "./TetrisConfig.js";
import { VectorDown, VectorLeft, VectorRight } from "./TetrisConsts.js";

/**
 * @typedef {number} ActionType
 */
export const ActionType = {
  MoveLeft: 0,
  MoveRight: 1,
  Rotate: 2,
  SoftDrop: 3,
  HardDrop: 4,
};

export default class TetrisGame {
  #lastLoopTime = new Date();
  #playerGameStates;

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
   * @param {ActionType} actionType
   */
  doAction(playerName, actionType) {
    const player = this.#playerGameStates.find(
      (playerGameState) => playerGameState.playerName === playerName,
    );

    if (!player) {
      throw new Error(`Player ${playerName} not found`);
    }

    switch (actionType) {
      case ActionType.MoveLeft:
        player.grid.tryMoveTetromino(VectorLeft);
        break;
      case ActionType.MoveRight:
        player.grid.tryMoveTetromino(VectorRight);
        break;
      case ActionType.Rotate:
        player.grid.tryRotateTetromino();
        break;
      case ActionType.SoftDrop:
        player.grid.tryMoveTetromino(VectorDown);
        break;
      case ActionType.HardDrop:
        player.grid.hardDropTetromino();
        break;
    }
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
    //TODO
  }

  /**
   * @returns {import("./TetrisConsts.js").GameStates}
   */
  getGameStates() {
    return this.#playerGameStates.map((playerGameState) => ({
      playerName: playerGameState.playerName,
      gridArray: playerGameState.grid.getGridArray(),
    }));
  }
}
