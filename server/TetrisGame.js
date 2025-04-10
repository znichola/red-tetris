import seedrandom from "seedrandom";
import { TetrisGrid } from "./TetrisGrid.js";
import { TICK_RATE } from "./TetrisConfig.js";

export class TetrisGame {
  #lastLoopTime = new Date();

  constructor(playerNames) {
    this.playerNames = playerNames;
    this.gameStates = playerNames.map((playerName) => ({
      playerName,
      grid: new TetrisGrid(seedrandom(this.#lastLoopTime)),
    }));
  }

  async gameLoop() {
    while (this.hasMultipleActivePlayers()) {
      const currentTime = new Date();
      const deltaTime = currentTime - this.#lastLoopTime;
      this.#lastLoopTime = currentTime;
      this.#processInputs();
      this.#updateGrids(deltaTime);
      //TODO: `broadcastState` calls could be optimized:
      //TODO: since the boards will not necessarily change every tick,
      //TODO: we could skip some broadcasts when no changes are made.
      this.#broadcastState();
      await new Promise((res) => setTimeout(res, 1000 / TICK_RATE));
    }

    //NOTE: A draw can occur when all players game over at the same time.
    const winner = this.gameStates.find((player) => !player.grid.isGameOver());

    if (!winner) {
      console.log("Game over: Draw!");
    } else {
      console.log(`Game over: ${winner.playerName} wins!`);
    }
  }

  hasMultipleActivePlayers() {
    return (
      this.gameStates.filter((gameState) => !gameState.grid.isGameOver())
        .length > 1
    );
  }

  #processInputs() {
    //TODO
  }

  #updateGrids(deltaTime) {
    this.gameStates.forEach((gameState) => {
      if (!gameState.grid.isGameOver()) {
        gameState.grid.update(deltaTime);
      }
    });
  }

  #broadcastState() {
    //TODO
  }

  getState() {
    return this.gameStates.map((player) => ({
      playerName: player.playerName,
      gridArray: player.grid.getGridArray(),
    }));
  }
}
