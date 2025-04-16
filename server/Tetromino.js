import Grid from "./Grid.js";
import { RotateClockwise, RotationType, Tetrominoes } from "./TetrisConsts.js";

export default class Tetromino extends Grid {
  #tetrominoType;
  /**
   * @type {RotationType}
   */
  #rotation;
  #position = { x: 4, y: 0 };

  /**
   * @param {import("./TetrisConsts.js").TetrominoType} tetrominoType
   */
  constructor(tetrominoType) {
    const rotation = RotationType.Rotation0;
    const array = Tetrominoes[tetrominoType][rotation].shape;
    super(array, null, null);
    this.#tetrominoType = tetrominoType;
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

    return (
      !overflows && !Grid.overlapsAtPosition(gameGrid, this, movedPosition)
    );
  }

  rotate() {
    this.#rotation = RotateClockwise(this.#rotation);
    this.array = this.#getTetromino().shape;
  }

  getPosition() {
    return this.#position;
  }

  #getTetromino() {
    return Tetrominoes[this.#tetrominoType][this.#rotation];
  }
}
