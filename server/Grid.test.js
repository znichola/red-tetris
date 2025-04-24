import { expect, expectGridArrayToEqual } from "./expect-extensions.js";
import { describe, it } from "vitest";
import Grid from "./Grid.js";
import { CellType } from "../shared/DTOs.js";

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

  it("should superimpose two grids correctly", () => {
    const { gridA, gridB, expectedGrid } = createSuperimposeGrids();
    const grid = Grid.superimpose(gridA, gridB).array;
    expectGridArrayToEqual(grid, expectedGrid);
  });

  it("should not modify the original grids after a superimpose", () => {
    const { gridA, gridB, arrayA, arrayB } = createSuperimposeGrids();
    Grid.superimpose(gridA, gridB);
    expectGridArrayToEqual(gridA.array, arrayA);
    expectGridArrayToEqual(gridB.array, arrayB);
  });

  it("should superimpose at positions correctly", () => {
    const grid = Grid.fromRowsCols(4, 4);
    const tetrominoGridJ = createTetrominoGridJ();
    const expected1 = [
      [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
      [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
      [CellType.Empty, CellType.J, CellType.Empty, CellType.Empty],
      [CellType.Empty, CellType.J, CellType.J, CellType.J],
    ];
    const result1 = Grid.superimposeAtPosition(grid, tetrominoGridJ, {
      x: 1,
      y: 2,
    });
    expectGridArrayToEqual(result1.array, expected1);

    const tetrominoGridZ = createTetrominoGridZ();
    const expected2 = [
      [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
      [CellType.Empty, CellType.Z, CellType.Z, CellType.Empty],
      [CellType.Empty, CellType.J, CellType.Z, CellType.Z],
      [CellType.Empty, CellType.J, CellType.J, CellType.J],
    ];
    const result2 = Grid.superimposeAtPosition(result1, tetrominoGridZ, {
      x: 1,
      y: 1,
    });
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

  it("should clear full lines and drop the ones above", () => {
    const grid = Grid.fromArray([
      [CellType.T, CellType.Empty, CellType.Empty, CellType.Empty],
      [CellType.T, CellType.T, CellType.Empty, CellType.Empty],
      [CellType.T, CellType.O, CellType.O, CellType.Z],
      [CellType.Empty, CellType.O, CellType.O, CellType.Empty],
      [CellType.I, CellType.I, CellType.I, CellType.I],
    ]);
    const expectedGrid = [
      [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
      [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
      [CellType.T, CellType.Empty, CellType.Empty, CellType.Empty],
      [CellType.T, CellType.T, CellType.Empty, CellType.Empty],
      [CellType.Empty, CellType.O, CellType.O, CellType.Empty],
    ];
    grid.clearAndDropFullRows();
    expectGridArrayToEqual(grid.array, expectedGrid);
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
