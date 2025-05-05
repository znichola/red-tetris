import { CellType } from "../shared/DTOs.js";

export default class Grid {
  get rows() {
    return this.array.length;
  }

  get cols() {
    return this.array[0].length;
  }

  /**
   * @return {import("../shared/DTOs.js").Spectrum}
   */
  get spectrum() {
    const rowCount = this.array.length;
    const colsCount = this.array[0].length;
    const spectrum = Array(colsCount).fill(0);

    for (let x = 0; x < colsCount; x++) {
      for (let y = 0; y < rowCount; y++) {
        if (this.array[y][x] !== CellType.Empty) {
          spectrum[x] = rowCount - y;
          break;
        }
      }
    }

    return spectrum;
  }

  /**
   * @param {import("../shared/DTOs.js").Grid | null} array
   * @param {number | null} rows
   * @param {number | null} cols
   */
  constructor(array, rows, cols) {
    /** @type {any[][]} */
    let gridArray;

    if (Array.isArray(array) && array.length > 0) {
      gridArray = array;
    } else {
      rows = rows ?? 0;
      cols = cols ?? 0;
      gridArray = Array.from({ length: rows }, () =>
        Array(cols).fill(CellType.Empty),
      );
    }

    this.array = gridArray;
  }

  toString() {
    return Grid.toString(this.array);
  }

  clearAndDropFullRows() {
    let clearedRows = 0;
    const cols = this.array[0].length;
    const createEmptyRow = () => Array(cols).fill(CellType.Empty);

    this.array.forEach((row, index) => {
      if (!isRowFull(row)) {
        return;
      }

      for (let previousIndex = index - 1; previousIndex >= 0; --previousIndex) {
        this.array[previousIndex + 1] = this.array[previousIndex];
      }

      this.array[0] = createEmptyRow();
      ++clearedRows;
    });

    return clearedRows;
  }

  /**
   * Returns `true` if any non-empty rows were pushed out of the grid.
   * @param {number} rowsToPushCount
   * @param {CellType} rowsValue
   * @returns {boolean}
   */
  pushRowsFromBottom(rowsToPushCount, rowsValue) {
    const rows = this.array.length;
    const cols = this.array[0].length;
    let overflowed = false;

    for (let i = 0; i < rows - rowsToPushCount; i++) {
      if (i < rowsToPushCount) {
        if (rowHasNonEmptyCells(this.array[i])) {
          overflowed = true;
        }
      }

      this.array[i] = this.array[i + rowsToPushCount];
    }

    for (let i = rows - rowsToPushCount; i < rows; i++) {
      this.array[i] = Array(cols).fill(rowsValue);
    }

    return overflowed;
  }

  /**
   * @param {import("../shared/DTOs.js").Grid} array
   */
  static toString(array) {
    return array.map((row) => row.join(" ")).join("\n");
  }

  /**
   * @param {import("../shared/DTOs.js").Grid[]} arrays
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

/**
 * @param {CellType[]} row
 */
function isRowFull(row) {
  return row.every(
    (cell) => cell !== CellType.Empty && cell !== CellType.Indestructible,
  );
}

/**
 * @param {CellType[]} row
 */
function rowHasNonEmptyCells(row) {
  return row.some((cell) => cell !== CellType.Empty);
}
