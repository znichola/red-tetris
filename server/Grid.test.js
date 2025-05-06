import { expect, expectGridArrayToEqual } from "./expect-extensions.js";
import { describe, it } from "vitest";
import Grid from "./Grid.js";
import { CellType, PowerUpCellType } from "../shared/DTOs.js";
import { bombHoleGrid } from "./TetrisConsts.js";

describe("Grid", () => {
  it("should create a grid with the correct dimensions", () => {
    const grid = Grid.fromRowsCols(20, 10);
    expect(grid.array.length).toEqual(20);
    grid.array.forEach((row) => {
      expect(row.length).toEqual(10);
    });
  });

  it("should create a grid from an array", () => {
    const array = [
      [CellType.Empty, CellType.I, CellType.Empty, CellType.Empty],
      [CellType.Empty, CellType.I, CellType.Empty, CellType.Empty],
      [CellType.Empty, CellType.I, CellType.Empty, CellType.Empty],
      [CellType.Empty, CellType.I, CellType.Empty, CellType.Empty],
    ];
    const grid = Grid.fromArray(array);
    expectGridArrayToEqual(grid.array, array);
  });

  it("should not detect an overlap between two grids with no same cells set", () => {
    const gridA = Grid.fromRowsCols(20, 10);
    const gridB = Grid.fromRowsCols(20, 10);
    const result = Grid.overlaps(gridA, gridB);
    expect(result).toBe(false);
  });

  it("should detect overlaps between two grids that have the same cells set", () => {
    const gridA = Grid.fromRowsCols(20, 10);
    const gridB = Grid.fromRowsCols(20, 10);
    gridA.array[4][2] = CellType.O;
    gridB.array[4][2] = CellType.I;
    const result = Grid.overlaps(gridA, gridB);
    expect(result).toBe(true);
  });

  it("should not detect an overlap between two grids that have the same cells set but at different positions", () => {
    const gridA = Grid.fromRowsCols(20, 10);
    const gridB = Grid.fromRowsCols(20, 10);
    gridA.array[0][0] = CellType.O;
    gridB.array[0][0] = CellType.I;
    const result1 = Grid.overlapsAtPosition(gridA, gridB, { x: 0, y: 1 });
    expect(result1).toBe(false);

    const grid = Grid.fromRowsCols(20, 10);
    const tetrominoGridO = createTetrominoGridO();
    grid.array[19][2] = CellType.I;
    grid.array[19][3] = CellType.I;
    grid.array[19][4] = CellType.I;
    grid.array[19][5] = CellType.I;
    const result2 = Grid.overlapsAtPosition(grid, tetrominoGridO, {
      x: 0,
      y: 1,
    });
    expect(result2).toBe(false);
  });

  it("should detect overlaps between two grids that have the same cells set and at a different position", () => {
    {
      const gridA = Grid.fromRowsCols(20, 10);
      const gridB = Grid.fromRowsCols(19, 9);
      gridA.array[1][0] = CellType.O;
      gridB.array[0][0] = CellType.I;
      const overlaps = Grid.overlapsAtPosition(gridA, gridB, { x: 0, y: 1 });
      expect(overlaps).toBe(true);
    }

    {
      const grid = Grid.fromRowsCols(20, 10);
      const tetrominoGridO = createTetrominoGridO();
      grid.array[19][2] = CellType.I;
      grid.array[19][3] = CellType.I;
      grid.array[19][4] = CellType.I;
      grid.array[19][5] = CellType.I;
      const overlaps = Grid.overlapsAtPosition(grid, tetrominoGridO, {
        x: 2,
        y: 18,
      });
      expect(overlaps).toBe(true);
    }

    {
      const grid = Grid.fromRowsCols(20, 10);
      grid.array[16][4] = CellType.I;
      grid.array[17][4] = CellType.I;
      grid.array[18][4] = CellType.I;
      grid.array[19][4] = CellType.I;
      const tetrominoGridZ = createTetrominoGridZ();
      const position = { x: 2, y: 16 };
      const overlaps = Grid.overlapsAtPosition(grid, tetrominoGridZ, position);
      expect(overlaps).toBe(true);
    }
  });

  it("should superimpose on empty cells correctly", () => {
    const { gridA, gridB, expectedGrid } = createSuperimposeGrids();
    const grid = Grid.superimposeOnEmptyCells(gridA, gridB).array;
    expectGridArrayToEqual(grid, expectedGrid);
  });

  it("should not modify the original grids after a superimpose on empty cells", () => {
    const { gridA, gridB, arrayA, arrayB } = createSuperimposeGrids();
    Grid.superimposeOnEmptyCells(gridA, gridB);
    expectGridArrayToEqual(gridA.array, arrayA);
    expectGridArrayToEqual(gridB.array, arrayB);
  });

  it("should superimpose on empty cells and at positions correctly", () => {
    const grid = Grid.fromRowsCols(4, 4);
    const tetrominoGridJ = createTetrominoGridJ();
    const expected1 = [
      [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
      [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
      [CellType.Empty, CellType.J, CellType.Empty, CellType.Empty],
      [CellType.Empty, CellType.J, CellType.J, CellType.J],
    ];
    const result1 = Grid.superimposeOnEmptyCellsAtPosition(
      grid,
      tetrominoGridJ,
      {
        x: 1,
        y: 2,
      },
    );
    expectGridArrayToEqual(result1.array, expected1);

    const tetrominoGridZ = createTetrominoGridZ();
    const expected2 = [
      [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
      [CellType.Empty, CellType.Z, CellType.Z, CellType.Empty],
      [CellType.Empty, CellType.J, CellType.Z, CellType.Z],
      [CellType.Empty, CellType.J, CellType.J, CellType.J],
    ];
    const result2 = Grid.superimposeOnEmptyCellsAtPosition(
      result1,
      tetrominoGridZ,
      {
        x: 1,
        y: 1,
      },
    );
    expectGridArrayToEqual(result2.array, expected2);
  });

  it("should return the correct spectrum", () => {
    const grid = Grid.fromArray([
      [CellType.Empty, CellType.I, CellType.Empty, CellType.Empty],
      [CellType.Empty, CellType.I, CellType.Z, CellType.Empty],
      [CellType.Empty, CellType.I, CellType.Z, CellType.Z],
      [CellType.Empty, CellType.I, CellType.Empty, CellType.Z],
    ]);
    const expectedSpectrum = [0, 4, 3, 2];
    expect(grid.spectrum).toEqual(expectedSpectrum);
  });

  it(
    "should clear full lines, drop the ones above, return the number of cleared lines" +
      ", and return the list of special cells cleared",
    () => {
      const grid = Grid.fromArray([
        [CellType.T, CellType.Empty, CellType.Empty, CellType.Empty],
        [CellType.T, CellType.T, CellType.Empty, CellType.Empty],
        [CellType.T, CellType.O, CellType.Bomb, CellType.Z],
        [CellType.Empty, CellType.O, CellType.O, CellType.Empty],
        [CellType.I, CellType.I, CellType.I, CellType.Duplication],
      ]);
      const expectedGrid = [
        [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
        [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
        [CellType.T, CellType.Empty, CellType.Empty, CellType.Empty],
        [CellType.T, CellType.T, CellType.Empty, CellType.Empty],
        [CellType.Empty, CellType.O, CellType.O, CellType.Empty],
      ];
      const { clearedRows, clearedSpecialCells } = grid.clearAndDropFullRows(
        Object.values(PowerUpCellType),
      );
      expectGridArrayToEqual(grid.array, expectedGrid);
      expect(clearedRows).toEqual(2);
      expect(clearedSpecialCells).toEqual([
        { type: CellType.Bomb, position: { x: 2, y: 2 } },
        { type: CellType.Duplication, position: { x: 3, y: 4 } },
      ]);
    },
  );

  it("should push rows from the bottom and return if non-empty rows pushed out", () => {
    const indestructibleRow = [
      CellType.Indestructible,
      CellType.Indestructible,
      CellType.Indestructible,
      CellType.Indestructible,
    ];

    {
      const grid = Grid.fromArray([
        [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
        [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
        [CellType.T, CellType.Empty, CellType.Empty, CellType.T],
        [CellType.T, CellType.T, CellType.T, CellType.T],
        [CellType.I, CellType.I, CellType.I, CellType.I],
      ]);
      const expectedGrid = [
        [CellType.T, CellType.Empty, CellType.Empty, CellType.T],
        [CellType.T, CellType.T, CellType.T, CellType.T],
        [CellType.I, CellType.I, CellType.I, CellType.I],
        indestructibleRow,
        indestructibleRow,
      ];
      const overflowed = grid.pushRowsFromBottom(2, CellType.Indestructible);
      expectGridArrayToEqual(grid.array, expectedGrid);
      expect(overflowed).toEqual(false);
    }

    {
      const grid = Grid.fromArray([
        [CellType.T, CellType.T, CellType.T, CellType.T],
        [CellType.T, CellType.Empty, CellType.Empty, CellType.T],
        [CellType.Empty, CellType.I, CellType.I, CellType.Empty],
        indestructibleRow,
        indestructibleRow,
      ]);
      const expectedGrid = [
        [CellType.T, CellType.Empty, CellType.Empty, CellType.T],
        [CellType.Empty, CellType.I, CellType.I, CellType.Empty],
        indestructibleRow,
        indestructibleRow,
        indestructibleRow,
      ];
      const overflowed = grid.pushRowsFromBottom(1, CellType.Indestructible);
      expectGridArrayToEqual(grid.array, expectedGrid);
      expect(overflowed).toEqual(true);
    }
  });

  it("should rotate clockwise", () => {
    const grid = Grid.fromArray([
      [CellType.Empty, CellType.Z, CellType.Empty],
      [CellType.Empty, CellType.I, CellType.Empty],
      [CellType.Empty, CellType.J, CellType.Empty],
    ]);
    const gridBeforeRotation = grid;
    const expectedGrid = Grid.fromArray([
      [CellType.Empty, CellType.Empty, CellType.Empty],
      [CellType.J, CellType.I, CellType.Z],
      [CellType.Empty, CellType.Empty, CellType.Empty],
    ]);
    const rotated = grid.rotateClockwise();
    expect(grid).toEqual(gridBeforeRotation);
    expectGridArrayToEqual(rotated, expectedGrid.array);
  });

  it("should superimpose with override", () => {
    const grid = Grid.fromArray([
      [CellType.O, CellType.O, CellType.Empty, CellType.O, CellType.O],
      [CellType.O, CellType.O, CellType.Empty, CellType.O, CellType.O],
      [CellType.O, CellType.O, CellType.Bomb, CellType.O, CellType.O],
      [CellType.O, CellType.O, CellType.O, CellType.O, CellType.O],
      [CellType.O, CellType.O, CellType.O, CellType.O, CellType.O],
    ]);
    //prettier-ignore
    const expectedGrid = Grid.fromArray([
      [CellType.O, CellType.O, CellType.Empty, CellType.O, CellType.O],
      [CellType.O, CellType.Empty, CellType.Empty, CellType.Empty, CellType.O],
      [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
      [CellType.O, CellType.Empty, CellType.Empty, CellType.Empty, CellType.O],
      [CellType.O, CellType.O, CellType.Empty, CellType.O, CellType.O],
    ]);
    const gridWithHole = Grid.superimposeWithOverride(grid, bombHoleGrid);
    expectGridArrayToEqual(gridWithHole.array, expectedGrid.array);
  });

  it("should superimpose with override at a position", () => {
    //prettier-ignore
    const grid = Grid.fromArray([
      [CellType.O, CellType.O, CellType.O, CellType.O, CellType.O, CellType.O, CellType.O],
      [CellType.O, CellType.O, CellType.Empty, CellType.O, CellType.O, CellType.O, CellType.O],
      [CellType.O, CellType.O, CellType.O, CellType.O, CellType.Empty, CellType.O, CellType.O],
      [CellType.O, CellType.O, CellType.O, CellType.O, CellType.Empty, CellType.Bomb, CellType.O],
      [CellType.O, CellType.O, CellType.O, CellType.O, CellType.Empty, CellType.O, CellType.O],
    ]);
    //prettier-ignore
    const expectedGrid = Grid.fromArray([
      [CellType.O, CellType.O, CellType.O, CellType.O, CellType.O, CellType.O, CellType.O],
      [CellType.O, CellType.O, CellType.Empty, CellType.O, CellType.O, CellType.Empty, CellType.O],
      [CellType.O, CellType.O, CellType.O, CellType.O, CellType.Empty, CellType.Empty, CellType.Empty],
      [CellType.O, CellType.O, CellType.O, CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
      [CellType.O, CellType.O, CellType.O, CellType.O, CellType.Empty, CellType.Empty, CellType.Empty],
    ]);
    const gridWithHole = Grid.superimposeWithOverrideAtPosition(
      grid,
      bombHoleGrid,
      {
        x: 5 - Math.floor(bombHoleGrid.cols / 2),
        y: 3 - Math.floor(bombHoleGrid.rows / 2),
      },
    );
    expectGridArrayToEqual(gridWithHole.array, expectedGrid.array);
  });
});

function createSuperimposeGrids() {
  const arrayA = [
    [CellType.Empty, CellType.I, CellType.Empty, CellType.Empty],
    [CellType.Empty, CellType.I, CellType.Empty, CellType.Empty],
    [CellType.Empty, CellType.I, CellType.Empty, CellType.Empty],
    [CellType.Empty, CellType.I, CellType.Empty, CellType.Empty],
  ];
  const arrayB = [
    [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
    [CellType.Empty, CellType.Empty, CellType.O, CellType.O],
    [CellType.Empty, CellType.Empty, CellType.O, CellType.O],
    [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
  ];
  const expectedGrid = [
    [CellType.Empty, CellType.I, CellType.Empty, CellType.Empty],
    [CellType.Empty, CellType.I, CellType.O, CellType.O],
    [CellType.Empty, CellType.I, CellType.O, CellType.O],
    [CellType.Empty, CellType.I, CellType.Empty, CellType.Empty],
  ];

  return {
    arrayA,
    arrayB,
    expectedGrid,
    gridA: Grid.fromArray(arrayA),
    gridB: Grid.fromArray(arrayB),
  };
}

function createTetrominoGridO() {
  return Grid.fromArray([
    [CellType.O, CellType.O],
    [CellType.O, CellType.O],
  ]);
}

function createTetrominoGridZ() {
  return Grid.fromArray([
    [CellType.Z, CellType.Z, CellType.Empty],
    [CellType.Empty, CellType.Z, CellType.Z],
  ]);
}

function createTetrominoGridJ() {
  return Grid.fromArray([
    [CellType.J, CellType.Empty, CellType.Empty],
    [CellType.J, CellType.J, CellType.J],
  ]);
}
