import { CellType, TetrominoType } from "../shared/DTOs.js";
import Grid from "./Grid.js";
import Piece from "./Piece.js";
import { DROP_RATE } from "./TetrisConfig.js";
import {
  VectorDown,
  VectorLeft,
  VectorRight,
  VectorUp,
} from "./TetrisConsts.js";

export default class Player {
  #name;
  #score = 0;
  #prng;
  #pileGrid;
  #gameOver = false;
  /** @type {import("./Piece.js").default} */
  #currentTetromino;
  #nextTetromino;
  #dropTimer = 0;

  get name() {
    return this.#name;
  }

  get score() {
    return this.#score;
  }

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

  /**
   * @param {string} name
   * @param {import("../shared/DTOs.js").StartGameData} startGameData
   * @param {function} prng
   */
  constructor(name, startGameData, prng) {
    this.#name = name;
    this.#prng = prng;
    this.#pileGrid = Grid.fromRowsCols(
      startGameData.gridDimensions.y,
      startGameData.gridDimensions.x,
    );
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

    this.#dropTimer = 1000 / DROP_RATE;
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

  /**
   * @param {number} deltaTime
   * @param {Player[]} opponents
   */
  update(deltaTime, opponents) {
    this.#dropTimer += deltaTime;

    if (this.#dropTimer >= 1000 / DROP_RATE) {
      this.#dropTimer = 0;

      if (this.#currentTetromino.canMove(this.#pileGrid, VectorDown)) {
        this.#currentTetromino.move(VectorDown);
      } else {
        this.#pileCurrentTetromino();
        const clearedRows = this.#pileGrid.clearAndDropFullRows();
        const attackRowsCount = clearedRows - 1;
        this.#score +=
          Math.max(1, clearedRows + 1) * this.#currentTetromino.getScoreValue();

        if (attackRowsCount > 0) {
          this.#attackOpponents(opponents, attackRowsCount);
        }

        this.#spawnNextTetromino();
      }
    }
  }

  #pileCurrentTetromino() {
    this.#pileGrid = this.#gridWithTetromino;
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
      this.#pileCurrentTetromino();
      this.#gameOver = true;
    }
  }

  /**
   * @param {Player[]} opponents
   * @param {number} attackRowsCount
   */
  #attackOpponents(opponents, attackRowsCount) {
    opponents.forEach((opponent) => {
      opponent.receiveAttack(attackRowsCount);
    });
  }

  /**
   * @param {number} attackRowsCount
   */
  receiveAttack(attackRowsCount) {
    const overflowed = this.#pileGrid.pushRowsFromBottom(
      attackRowsCount,
      CellType.Indestructible,
    );

    if (overflowed) {
      this.#gameOver = true;
    }
  }

  #getRandomTetromino() {
    const tetrominoTypes = Object.values(TetrominoType);
    const randomNumber = this.#prng();
    const randomType =
      tetrominoTypes[Math.floor(randomNumber * tetrominoTypes.length)];
    const position = {
      x: Math.floor(this.#pileGrid.cols / 2) - 1,
      y: 0,
    };

    return new Piece(randomType, position);
  }

  isGameOver() {
    return this.#gameOver;
  }
}
