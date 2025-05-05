import { CellType, PowerUpCellType, TetrominoType } from "../shared/DTOs.js";
import Grid from "./Grid.js";
import Piece from "./Piece.js";
import { DROP_RATE } from "./TetrisConfig.js";
import {
  VectorDown,
  VectorLeft,
  VectorRight,
  VectorUp,
} from "./TetrisConsts.js";
import seedrandom from "seedrandom";

export default class Player {
  #name;
  #gameConfig;
  #powerUpsPrng;
  #piecesPrng;
  #score = 0;
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
   * @param {import("../shared/DTOs.js").GameConfig} gameConfig
   * @param {any} randomSeed
   */
  constructor(name, gameConfig, randomSeed) {
    this.#name = name;
    this.#gameConfig = gameConfig;
    this.#powerUpsPrng = seedrandom(randomSeed);
    this.#piecesPrng = seedrandom(randomSeed);
    this.#pileGrid = Grid.fromRowsCols(
      gameConfig.gridDimensions.y,
      gameConfig.gridDimensions.x,
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

      if (direction === VectorDown) {
        this.#dropTimer = 0;
      }
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

        const { clearedRows, clearedSpecialCells } =
          this.#pileGrid.clearAndDropFullRows(Object.values(PowerUpCellType));

        const clearedAttackPowerUpsCount = clearedSpecialCells.filter(
          (cell) => cell === PowerUpCellType.Attack,
        ).length;
        //TODO: implement the rest of the power-ups
        // eslint-disable-next-line no-unused-vars
        const clearedDuplicationPowerUpsCount = clearedSpecialCells.filter(
          (cell) => cell === PowerUpCellType.Duplication,
        ).length;
        // eslint-disable-next-line no-unused-vars
        const clearedBombPowerUpsCount = clearedSpecialCells.filter(
          (cell) => cell === PowerUpCellType.Bomb,
        ).length;

        const attackRowsCount = clearedRows - 1 + clearedAttackPowerUpsCount;

        if (attackRowsCount > 0) {
          this.#attackOpponents(opponents, attackRowsCount);
        }

        this.#score +=
          Math.max(1, clearedRows + 1) * this.#currentTetromino.getScoreValue();

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
    const randomNumber = this.#piecesPrng();
    const randomType =
      tetrominoTypes[Math.floor(randomNumber * tetrominoTypes.length)];
    const position = {
      x: Math.floor(this.#pileGrid.cols / 2) - 1,
      y: 0,
    };

    return new Piece(
      randomType,
      position,
      this.#gameConfig.enabledPowerUps,
      this.#powerUpsPrng,
    );
  }

  isGameOver() {
    return this.#gameOver;
  }
}
