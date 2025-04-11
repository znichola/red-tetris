import Grid from "./Grid.js";
import { CellTypes } from "./TetrisConsts.js";

export default class Tetromino extends Grid {
  #position = { x: 4, y: 0 };
  //TODO: Implement all tetromino types, for now we have only the O:
  // eslint-disable-next-line no-unused-private-class-members
  #tetrominoType = null;
  #emptyGrid = Grid.fromRowsCols(20, 10);

  constructor(tetrominoType) {
    const emptyGrid = Grid.fromRowsCols(20, 10);
    super(emptyGrid.array, null, null);
    this.#tetrominoType = tetrominoType;
    this.array = this.#getGridFromPosition(this.#position);
  }

  #getGridFromPosition(nextPosition) {
    const grid = structuredClone(this.#emptyGrid.array);
    //TODO: Implement all tetromino types, for now we have only the O:
    grid[nextPosition.y][nextPosition.x] = CellTypes.O;
    grid[nextPosition.y][nextPosition.x + 1] = CellTypes.O;
    grid[nextPosition.y + 1][nextPosition.x] = CellTypes.O;
    grid[nextPosition.y + 1][nextPosition.x + 1] = CellTypes.O;
    return grid;
  }

  drop() {
    ++this.#position.y;
    this.array = this.#getGridFromPosition(this.#position);
  }

  canDrop(gameGrid) {
    const nextPosition = { x: this.#position.x, y: this.#position.y + 1 };

    //TODO: Implement all tetromino types, for now we have only the O:
    //TODO: Won't always be `+ 1` for all tetrominoes, but for now we have only the O so it works:
    if (nextPosition.y + 1 >= gameGrid.array.length) {
      return false;
    }

    const nextGrid = Grid.fromArray(this.#getGridFromPosition(nextPosition));
    return !Grid.overlaps(gameGrid, nextGrid);
  }
}
