import Grid from "./Grid.js";
import { DROP_RATE } from "./TetrisConfig.js";
import {
  VectorDown,
  TetrominoType,
  GameGridDimensions,
  VectorLeft,
  VectorRight,
  VectorUp,
} from "./TetrisConsts.js";
import Tetromino from "./Tetromino.js";

export default class TetrisGrid {
  #pileGrid = Grid.fromRowsCols(GameGridDimensions.y, GameGridDimensions.x);
  #prng;
  #gameOver = false;
  /**
   * @type {import("./Tetromino.js").default}
   */
  #currentTetromino;
  #nextTetromino;
  #dropTimer = 0;

  get gridArray() {
    return this.#gridWithTetromino.array;
  }

  get spectrum() {
    return this.#pileGrid.spectrum;
  }

  get #gridWithTetromino() {
    return Grid.superimposeAtPosition(
      this.#pileGrid,
      this.#currentTetromino,
      this.#currentTetromino.position,
    );
  }

  constructor(prng) {
    this.#prng = prng;
    this.#nextTetromino = this.#getRandomTetromino();
    this.#spawnNextTetromino();
  }

  /**
   * @param {import("./TetrisConsts.js").Vector} direction
   */
  tryMoveTetromino(direction) {
    if (this.#currentTetromino.canMove(this.#pileGrid, direction)) {
      this.#currentTetromino.move(direction);
    }
  }

  hardDropTetromino() {
    while (this.#currentTetromino.canMove(this.#pileGrid, VectorDown)) {
      this.#currentTetromino.move(VectorDown);
    }
  }

  tryRotateTetromino() {
    if (this.#currentTetromino.canRotate(this.#pileGrid)) {
      this.#currentTetromino.rotate();

      return;
    }

    const kicks = [
      { direction: VectorLeft, strength: 1 },
      { direction: VectorRight, strength: 1 },
      { direction: VectorUp, strength: 1 },
      { direction: VectorUp, strength: 2 },
      { direction: VectorUp, strength: 3 },
    ];

    for (const { direction, strength } of kicks) {
      const offset = {
        x: direction.x * strength,
        y: direction.y * strength,
      };

      if (this.#currentTetromino.canRotate(this.#pileGrid, offset)) {
        this.#currentTetromino.move(offset);
        this.#currentTetromino.rotate();

        return;
      }
    }
  }

  #pileCurrentTetromino() {
    this.#pileGrid = this.#gridWithTetromino;
    this.#spawnNextTetromino();
  }

  /**
   * @param {number} deltaTime
   */
  update(deltaTime) {
    this.#dropTimer += deltaTime;

    if (this.#dropTimer >= 1000 / DROP_RATE) {
      this.#dropTimer = 0;

      if (this.#currentTetromino.canMove(this.#pileGrid, VectorDown)) {
        this.#currentTetromino.move(VectorDown);
      } else {
        this.#pileCurrentTetromino();
      }
    }
  }

  #spawnNextTetromino() {
    this.#currentTetromino = this.#nextTetromino;
    this.#nextTetromino = this.#getRandomTetromino();

    if (
      Grid.overlapsAtPosition(
        this.#pileGrid,
        this.#currentTetromino,
        this.#currentTetromino.position,
      )
    ) {
      this.#gameOver = true;
    }
  }

  #getRandomTetromino() {
    const tetrominoTypes = Object.values(TetrominoType);
    const randomType =
      tetrominoTypes[Math.floor(this.#prng() * tetrominoTypes.length)];
    return new Tetromino(randomType);
  }

  isGameOver() {
    return this.#gameOver;
  }
}
