import { CellType } from "./TetrisConsts.js";

export default class Grid {
  /**
   * @param {import("./TetrisConsts.js").GridArray} array
   * @param {number} rows
   * @param {number} cols
   */
  constructor(array, rows, cols) {
    if (Array.isArray(array) && array.length > 0) {
      this.array = array;
    } else {
      this.array = Array.from({ length: rows }, () =>
        Array(cols).fill(CellType.Empty),
      );
    }
  }

  toString() {
    return Grid.toString(this.array);
  }

  /**
   * @param {import("./TetrisConsts.js").GridArray} array
   */
  static toString(array) {
    return array.map((row) => row.join(" ")).join("\n");
  }

  /**
   * @param {import("./TetrisConsts.js").GridArray[]} arrays
   * @param {string[]} headers
   * @param {string} separator
   */
  static toStrings(arrays, headers, separator = "  ") {
    const gridStrings = arrays.map((array) =>
      array.map((row) => row.join(" ")),
    );

    const maxRows = Math.max(...gridStrings.map((g) => g.length));

    let result = [];
    const headerRow = headers
      .map((header, i) => {
        const width = gridStrings[i][0].length;
        return header.padEnd(width);
      })
      .join(separator);
    result.push(headerRow);

    for (let row = 0; row < maxRows; row++) {
      const combined = gridStrings.map((grid) => grid[row]).join(separator);
      result.push(combined);
    }

    return result.join("\n");
  }

  static fromArray(array) {
    return new Grid(array, null, null);
  }

  /**
   * @param {number} rows
   * @param {number} cols
   */
  static fromRowsCols(rows, cols) {
    return new Grid(null, rows, cols);
  }

  /**
   * Superimposes the contents of `gridB` onto another `gridA` at a specified position.
   * `gridA` has priority over `gridB`, meaning cells in `gridA` will not be overwritten
   * by non-empty cells in `gridB`.
   * @param {Grid} gridA
   * @param {Grid} gridB
   * @param {import("./TetrisConsts.js").Vector} gridBPosition
   * @returns {Grid}
   */
  static superimposeAtPosition(gridA, gridB, gridBPosition) {
    const array = structuredClone(gridA.array);

    for (let i = 0; i < gridB.array.length; i++) {
      for (let j = 0; j < gridB.array[i].length; j++) {
        const cellAIndices = {
          y: i + gridBPosition.y,
          x: j + gridBPosition.x,
        };
        const cellA = array[cellAIndices.y][cellAIndices.x];

        if (cellA === CellType.Empty) {
          array[cellAIndices.y][cellAIndices.x] = gridB.array[i][j];
        }
      }
    }

    return Grid.fromArray(array);
  }

  /**
   * @param {Grid} gridA
   * @param {Grid} gridB
   * @returns {Grid}
   */
  static superimpose(gridA, gridB) {
    const array = gridA.array.map((row, i) =>
      row.map((cell, j) =>
        cell === CellType.Empty ? gridB.array[i][j] : cell,
      ),
    );
    return Grid.fromArray(array);
  }

  /**
   * @param {Grid} gridA
   * @param {Grid} gridB
   * @param {import("./TetrisConsts.js").Vector} gridBPosition
   * @returns {boolean}
   */
  static overlapsAtPosition(gridA, gridB, gridBPosition) {
    return gridB.array.some((row, i) =>
      row.some(
        (cell, j) =>
          cell !== CellType.Empty &&
          gridA.array[i + gridBPosition.y]?.[j + gridBPosition.x] !==
            CellType.Empty,
      ),
    );
  }

  /**
   * @param {Grid} gridA
   * @param {Grid} gridB
   * @returns {boolean}
   */
  static overlaps(gridA, gridB) {
    return gridA.array.some((row, i) =>
      row.some(
        (cell, j) =>
          cell !== CellType.Empty && gridB.array[i][j] !== CellType.Empty,
      ),
    );
  }
}
