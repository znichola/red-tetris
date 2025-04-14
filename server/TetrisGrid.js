import Grid from "./Grid.js";
import { DROP_RATE } from "./TetrisConfig.js";
import { TetrominoTypes } from "./TetrisConsts.js";
import Tetromino from "./Tetromino.js";

export default class TetrisGrid {
  #grid = Grid.fromRowsCols(20, 10);
  #prng = null;
  #gameOver = false;
  #currentTetromino = null;
  #nextTetromino = null;
  dropTimer = 0;

  constructor(prng) {
    this.#prng = prng;
    this.#nextTetromino = this.#getRandomTetromino();
    this.#spawnNextTetromino();
  }

  update(deltaTime) {
    this.dropTimer += deltaTime;

    if (this.dropTimer >= 1000 / DROP_RATE) {
      this.dropTimer = 0;

      if (this.#currentTetromino.canDrop(this.#grid)) {
        this.#currentTetromino.drop();
      } else {
        this.#grid = Grid.superimpose(this.#grid, this.#currentTetromino);
        this.#spawnNextTetromino();
      }
    }
  }

  #spawnNextTetromino() {
    this.#currentTetromino = this.#nextTetromino;
    this.#nextTetromino = this.#getRandomTetromino();

    if (Grid.overlaps(this.#grid, this.#currentTetromino)) {
      this.#gameOver = true;
    }
  }

  #getRandomTetromino() {
    const tetrominoTypes = Object.values(TetrominoTypes);
    const randomType =
      tetrominoTypes[Math.floor(this.#prng() * tetrominoTypes.length)];
    return new Tetromino(randomType);
  }

  isGameOver() {
    return this.#gameOver;
  }

  getGridArray() {
    return Grid.superimpose(this.#grid, this.#currentTetromino).array;
  }
}
