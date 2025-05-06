import { DefaultGameGridDimensions } from "../shared/Consts.js";
import {
  CellType,
  PowerUpCellType,
  RulesetType,
  TetrominoType,
} from "../shared/DTOs.js";
import Grid from "./Grid.js";
import Piece from "./Piece.js";
import {
  bombHoleGrid,
  DropRate,
  VectorDown,
  VectorLeft,
  VectorRight,
  VectorUp,
} from "./TetrisConsts.js";
import seedrandom from "seedrandom";

export default class Player {
  #name;
  /** @type {Readonly<import("../shared/DTOs.js").GameConfig>} */
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
  /** @type {import("../shared/DTOs.js").TetrominoType} */
  #duplicatedTetrominoType;
  #duplicatedTetrominoCount = 0;

  get name() {
    return this.#name;
  }

  get score() {
    return this.#score;
  }

  get gridArray() {
    const grid =
      this.#gameConfig.ruleset === RulesetType.Invisible
        ? this.#invisibleGridWithTetromino
        : this.#gridWithTetromino;
    const showShadow =
      this.#gameConfig.ruleset !== RulesetType.Classic ||
      this.#gameConfig.gridDimensions.x > DefaultGameGridDimensions.x ||
      this.#gameConfig.gridDimensions.y > DefaultGameGridDimensions.y;

    return showShadow ? this.#addShadowToGrid(grid).array : grid.array;
  }

  get spectrum() {
    return this.#pileGrid.spectrum;
  }

  get nextTetromino() {
    return this.#nextTetromino;
  }

  get #gridWithTetromino() {
    return Grid.superimposeOnEmptyCellsAtPosition(
      this.#pileGrid,
      this.#currentTetromino,
      this.#currentTetromino.position,
    );
  }

  get #invisibleGridWithTetromino() {
    const emptyGrid = Grid.fromRowsCols(
      this.#pileGrid.rows,
      this.#pileGrid.cols,
    );

    return Grid.superimposeOnEmptyCellsAtPosition(
      emptyGrid,
      this.#currentTetromino,
      this.#currentTetromino.position,
    );
  }

  /**
   * @param {string} name
   * @param {Readonly<import("../shared/DTOs.js").GameConfig>} gameConfig
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

    this.#dropTimer = 1000 / this.#getDropRate();
  }

  tryRotateTetromino() {
    if (this.#currentTetromino.canRotate(this.#pileGrid)) {
      this.#currentTetromino.rotate();

      return;
    }

    const kicks = [
      { direction: VectorLeft, strength: 1 },
      { direction: VectorLeft, strength: 2 },
      { direction: VectorRight, strength: 1 },
      { direction: VectorRight, strength: 2 },
      { direction: VectorUp, strength: 1 },
      { direction: VectorUp, strength: 2 },
      { direction: VectorDown, strength: 1 },
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

    if (this.#dropTimer >= 1000 / this.#getDropRate()) {
      this.#dropTimer = 0;

      if (this.#currentTetromino.canMove(this.#pileGrid, VectorDown)) {
        this.#currentTetromino.move(VectorDown);
      } else {
        this.#pileCurrentTetromino();

        const { clearedRows, clearedSpecialCells } =
          this.#pileGrid.clearAndDropFullRows(Object.values(PowerUpCellType));

        const clearedDuplicationPowerUpsCount = clearedSpecialCells.filter(
          (cell) => cell.type === PowerUpCellType.Duplication,
        ).length;
        this.#duplicatedTetrominoType = this.#currentTetromino.type;
        this.#duplicatedTetrominoCount += clearedDuplicationPowerUpsCount;

        const clearedBombPowerUps = clearedSpecialCells.filter(
          (cell) => cell.type === PowerUpCellType.Bomb,
        );
        clearedBombPowerUps.forEach((bomb) => {
          this.#pileGrid = Grid.superimposeWithOverrideAtPosition(
            this.#pileGrid,
            bombHoleGrid,
            {
              x: bomb.position.x - Math.floor(bombHoleGrid.cols / 2),
              y: bomb.position.y - Math.floor(bombHoleGrid.rows / 2),
            },
          );
        });

        const clearedAttackPowerUpsCount = clearedSpecialCells.filter(
          (cell) => cell.type === PowerUpCellType.Attack,
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
    if (this.#duplicatedTetrominoCount > 0) {
      this.#currentTetromino = this.#getNewTetromino(
        this.#duplicatedTetrominoType,
      );
      --this.#duplicatedTetrominoCount;
    } else {
      this.#currentTetromino = this.#nextTetromino;
      this.#nextTetromino = this.#getRandomTetromino();
    }

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

    return this.#getNewTetromino(randomType);
  }

  /**
   * @param {import("../shared/DTOs.js").TetrominoType} tetrominoType
   */
  #getNewTetromino(tetrominoType) {
    const position = {
      x: Math.floor(this.#pileGrid.cols / 2) - 1,
      y: 0,
    };

    if (tetrominoType === TetrominoType.I) {
      position.y -= 1;
    }

    return new Piece(
      tetrominoType,
      position,
      this.#gameConfig.ruleset === RulesetType.PowerUp
        ? this.#gameConfig.enabledPowerUps
        : [],
      this.#powerUpsPrng,
    );
  }

  isGameOver() {
    return this.#gameOver;
  }

  #getDropRate() {
    return this.#gameConfig.heavy ? DropRate * 3 : DropRate;
  }

  /**
   * @param {Grid} grid
   */
  #addShadowToGrid(grid) {
    const shadow = this.#currentTetromino.duplicate();

    while (shadow.canMove(this.#pileGrid, VectorDown)) {
      shadow.move(VectorDown);
    }

    shadow.array = shadow.array.map((a) =>
      a.map((v) => (v === CellType.Empty ? CellType.Empty : CellType.Shadow)),
    );

    return Grid.superimposeOnEmptyCellsAtPosition(
      grid,
      shadow,
      shadow.position,
    );
  }
}
