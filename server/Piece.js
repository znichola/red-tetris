import { CellType, PowerUpCellType } from "../shared/DTOs.js";
import Grid from "./Grid.js";
import { PowerUpSpawnChance, Tetrominoes } from "./TetrisConsts.js";

export default class Piece extends Grid {
  #position;
  #type;

  get position() {
    return this.#position;
  }

  get type() {
    return this.#type;
  }

  /**
   * @param {import("../shared/DTOs.js").TetrominoType} tetrominoType
   * @param {import("./TetrisConsts.js").Vector} position
   * @param {PowerUpCellType[]} enabledPowerUps
   * @param {function} prng
   */
  constructor(tetrominoType, position, enabledPowerUps, prng) {
    const array = structuredClone(Tetrominoes[tetrominoType]);
    super(array, null, null);

    const hasPowerUp = prng() < PowerUpSpawnChance;

    if (hasPowerUp && enabledPowerUps.length > 0) {
      const randomPowerUpIndex = Math.floor(prng() * enabledPowerUps.length);
      const powerUp = enabledPowerUps[randomPowerUpIndex];
      const possiblePowerUpLocations = this.array.flatMap((row, y) =>
        row
          .map((cell, x) => (cell === CellType.Empty ? null : { x, y }))
          .filter((spot) => spot !== null),
      );
      const randomPowerUpLocationIndex = Math.floor(
        Math.random() * possiblePowerUpLocations.length,
      );
      const randomPowerUpLocation =
        possiblePowerUpLocations[randomPowerUpLocationIndex];
      this.array[randomPowerUpLocation.y][randomPowerUpLocation.x] = powerUp;
    }

    this.#position = position;
    this.#type = tetrominoType;
  }

  /**
   * @param {Grid} gameGrid
   * @param {import("./TetrisConsts.js").Vector} direction
   */
  canMove(gameGrid, direction) {
    const movedPosition = {
      x: this.#position.x + direction.x,
      y: this.#position.y + direction.y,
    };
    const overflowsLeft = movedPosition.x < 0;
    const overflowsRight =
      movedPosition.x + this.cols > gameGrid.array[0].length;
    const overflowsBottom = movedPosition.y + this.rows > gameGrid.array.length;
    const overflows = overflowsLeft || overflowsRight || overflowsBottom;

    return (
      !overflows && !Grid.overlapsAtPosition(gameGrid, this, movedPosition)
    );
  }

  /**
   * @param {import("./TetrisConsts.js").Vector} direction
   */
  move(direction) {
    this.#position.x += direction.x;
    this.#position.y += direction.y;
  }

  /**
   * @param {Grid} gameGrid
   * @param {import("./TetrisConsts.js").Vector} offsetMove
   */
  canRotate(gameGrid, offsetMove = { x: 0, y: 0 }) {
    const rotatedTetromino = Grid.fromArray(this.rotateClockwise());
    const movedPosition = {
      x: this.#position.x + offsetMove.x,
      y: this.#position.y + offsetMove.y,
    };
    const overflowsRight =
      movedPosition.x + rotatedTetromino.cols > gameGrid.array[0].length;
    const overflowsBottom =
      movedPosition.y + rotatedTetromino.rows > gameGrid.array.length;
    const overflows = overflowsRight || overflowsBottom;
    const overlaps = Grid.overlapsAtPosition(
      gameGrid,
      rotatedTetromino,
      movedPosition,
    );

    return !overflows && !overlaps;
  }

  rotate() {
    this.array = this.rotateClockwise();
  }

  getScoreValue() {
    return this.array
      .flat(1)
      .reduce((prev, curr) => (curr === CellType.Empty ? prev : prev + 1), 0);
  }
}
