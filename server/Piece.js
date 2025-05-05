import { CellType } from "../shared/DTOs.js";
import Grid from "./Grid.js";
import { RotateClockwise, RotationType, Tetrominoes } from "./TetrisConsts.js";

export default class Piece extends Grid {
  #tetrominoType;
  #position;
  /** @type {RotationType} */
  #rotation;

  get position() {
    return this.#position;
  }

  /**
   * @param {import("../shared/DTOs.js").TetrominoType} tetrominoType
   * @param {import("./TetrisConsts.js").Vector} position
   */
  constructor(tetrominoType, position) {
    const rotation = RotationType.Rotation0;
    const array = Tetrominoes[tetrominoType][rotation].shape;
    super(array, null, null);
    this.#tetrominoType = tetrominoType;
    this.#position = position;
    this.#rotation = rotation;
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
      movedPosition.x + this.#getTetromino().width > gameGrid.array[0].length;
    const overflowsBottom =
      movedPosition.y + this.#getTetromino().height > gameGrid.array.length;
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
    const nextRotation = RotateClockwise(this.#rotation);
    const rotatedTetromino = Tetrominoes[this.#tetrominoType][nextRotation];
    const movedPosition = {
      x: this.#position.x + offsetMove.x,
      y: this.#position.y + offsetMove.y,
    };
    const overflowsRight =
      movedPosition.x + rotatedTetromino.width > gameGrid.array[0].length;
    const overflowsBottom =
      movedPosition.y + rotatedTetromino.height > gameGrid.array.length;
    const overflows = overflowsRight || overflowsBottom;
    const overlaps = Grid.overlapsAtPosition(
      gameGrid,
      Grid.fromArray(rotatedTetromino.shape),
      movedPosition,
    );

    return !overflows && !overlaps;
  }

  rotate() {
    this.#rotation = RotateClockwise(this.#rotation);
    this.array = this.#getTetromino().shape;
  }

  #getTetromino() {
    return Tetrominoes[this.#tetrominoType][this.#rotation];
  }

  getScoreValue() {
    return this.array
      .flat(1)
      .reduce((prev, curr) => (curr === CellType.Empty ? prev : prev + 1), 0);
  }

  duplicate() {
    const dupe = new Piece(this.#tetrominoType, {
      x: this.#position.x,
      y: this.#position.y,
    });
    dupe.#rotation = this.#rotation;
    dupe.array = this.#getTetromino().shape;
    return dupe;
  }
}
