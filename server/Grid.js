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

  /**
   * @typedef {{
   *  type: CellType,
   *  position: import("./TetrisConsts.js").Vector
   * }} ClearedSpecialCell
   *
   * @param {CellType[]} specialCells
   * @returns {{
   *  clearedRows: number,
   *  clearedSpecialCells: ClearedSpecialCell[]
   *  }}
   */
  clearAndDropFullRows(specialCells) {
    let clearedRows = 0;
    const cols = this.array[0].length;
    const createEmptyRow = () => Array(cols).fill(CellType.Empty);
    const clearedSpecialCells = [];

    this.array.forEach((row, index) => {
      if (!isRowFull(row)) {
        return;
      }

      const specialCellsInRow = row.reduce((acc, cell, x) => {
        if (specialCells.includes(cell)) {
          /** @type {ClearedSpecialCell} */
          const clearedSpecialCell = {
            type: cell,
            position: { x, y: index },
          };
          acc.push(clearedSpecialCell);
        }
        return acc;
      }, []);
      clearedSpecialCells.push(...specialCellsInRow);

      for (let previousIndex = index - 1; previousIndex >= 0; --previousIndex) {
        this.array[previousIndex + 1] = this.array[previousIndex];
      }

      this.array[0] = createEmptyRow();
      ++clearedRows;
    });

    return { clearedRows, clearedSpecialCells };
  }

  /**
   * Returns `true` if any non-empty rows were pushed out of the grid.
   * @param {number} rowsToPushCount
   * @param {CellType} rowsValue
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

  rotateClockwise() {
    return this.array[0].map((_, index) =>
      this.array.map((row) => row[index]).reverse(),
    );
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

  /**
   * @param {any[][]} array
   */
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
   * @param {Grid} baseGrid
   * @param {Grid} overlayGrid
   */
  static superimposeOnEmptyCells(baseGrid, overlayGrid) {
    return Grid.superimposeGrids(baseGrid, overlayGrid);
  }

  /**
   * @param {Grid} baseGrid
   * @param {Grid} overlayGrid
   * @param {import("./TetrisConsts.js").Vector} position
   */
  static superimposeOnEmptyCellsAtPosition(baseGrid, overlayGrid, position) {
    return Grid.superimposeGrids(baseGrid, overlayGrid, { position });
  }

  /**
   * @param {Grid} baseGrid
   * @param {Grid} overlayGrid
   */
  static superimposeWithOverride(baseGrid, overlayGrid) {
    return Grid.superimposeGrids(baseGrid, overlayGrid, {
      cellMergeStrategy: (baseCell, overlayCell) =>
        overlayCell !== CellType.None ? overlayCell : baseCell,
    });
  }

  /**
   * @param {Grid} baseGrid
   * @param {Grid} overlayGrid
   * @param {import("./TetrisConsts.js").Vector} position
   */
  static superimposeWithOverrideAtPosition(baseGrid, overlayGrid, position) {
    return Grid.superimposeGrids(baseGrid, overlayGrid, {
      position,
      cellMergeStrategy: (baseCell, overlayCell) =>
        overlayCell !== CellType.None ? overlayCell : baseCell,
    });
  }

  /**
   * @param {Grid} baseGrid
   * @param {Grid} overlayGrid
   * @param {Object} options
   * @param {import("./TetrisConsts.js").Vector} [options.position]
   * @param {function(CellType, CellType): CellType} [options.cellMergeStrategy]
   */
  static superimposeGrids(baseGrid, overlayGrid, options = {}) {
    const position = options.position || { x: 0, y: 0 };
    const cellMergeStrategy =
      options.cellMergeStrategy ||
      ((baseCell, overlayCell) =>
        baseCell === CellType.Empty ? overlayCell : baseCell);

    const resultArray = structuredClone(baseGrid.array);

    for (let i = 0; i < overlayGrid.array.length; i++) {
      for (let j = 0; j < overlayGrid.array[i].length; j++) {
        const baseY = i + position.y;
        const baseX = j + position.x;

        if (
          baseY < 0 ||
          baseY >= resultArray.length ||
          baseX < 0 ||
          baseX >= resultArray[0].length
        ) {
          continue;
        }

        const overlayCell = overlayGrid.array[i][j];
        const baseCell = resultArray[baseY][baseX];
        resultArray[baseY][baseX] = cellMergeStrategy(baseCell, overlayCell);
      }
    }

    return Grid.fromArray(resultArray);
  }

  /**
   * @param {Grid} gridA
   * @param {Grid} gridB
   * @param {import("./TetrisConsts.js").Vector} gridBPosition
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
