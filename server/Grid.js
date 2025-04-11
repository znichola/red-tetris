import { CellTypes } from "./TetrisConsts.js";

export default class Grid {
  constructor(array, rows, cols) {
    if (Array.isArray(array) && array.length > 0) {
      this.array = array;
    } else {
      this.array = Array.from({ length: rows }, () =>
        Array(cols).fill(CellTypes.None),
      );
    }
  }

  toString() {
    return Grid.toString(this.array);
  }

  static toString(array) {
    return array.map((row) => row.join(" ")).join("\n");
  }

  static fromArray(array) {
    return new Grid(array, null, null);
  }

  static fromRowsCols(rows, cols) {
    return new Grid(null, rows, cols);
  }

  static superimpose(gridA, gridB) {
    const array = gridA.array.map((row, i) =>
      row.map((cell, j) =>
        cell === CellTypes.None ? gridB.array[i][j] : cell,
      ),
    );
    return Grid.fromArray(array);
  }

  static overlaps(gridA, gridB) {
    return gridA.array.some((row, i) =>
      row.some(
        (cell, j) =>
          cell !== CellTypes.None && gridB.array[i][j] !== CellTypes.None,
      ),
    );
  }
}
