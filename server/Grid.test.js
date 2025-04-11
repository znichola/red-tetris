import { expect, describe, it } from "vitest";
import { CellTypes } from "./TetrisConsts";
import { Grid } from "./Grid";

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
      [CellTypes.None, CellTypes.I, CellTypes.None, CellTypes.None],
      [CellTypes.None, CellTypes.I, CellTypes.None, CellTypes.None],
      [CellTypes.None, CellTypes.I, CellTypes.None, CellTypes.None],
      [CellTypes.None, CellTypes.I, CellTypes.None, CellTypes.None],
    ];
    const grid = Grid.fromArray(array);
    expect(grid.array).toEqual(array);
  });

  it("should not detect an overlap between two grids with no same cells set", () => {
    const gridA = Grid.fromRowsCols(20, 10);
    const gridB = Grid.fromRowsCols(20, 10);

    expect(Grid.overlaps(gridA, gridB)).toBe(false);
  });

  it("should detect overlaps between two grids that have the same cells set", () => {
    const gridA = Grid.fromRowsCols(20, 10);
    const gridB = Grid.fromRowsCols(20, 10);
    gridA.array[4][2] = CellTypes.O;
    gridB.array[4][2] = CellTypes.I;

    expect(Grid.overlaps(gridA, gridB)).toBe(true);
  });

  it("should superimpose two grids correctly", () => {
    const arrayA = [
      [CellTypes.None, CellTypes.I, CellTypes.None, CellTypes.None],
      [CellTypes.None, CellTypes.I, CellTypes.None, CellTypes.None],
      [CellTypes.None, CellTypes.I, CellTypes.None, CellTypes.None],
      [CellTypes.None, CellTypes.I, CellTypes.None, CellTypes.None],
    ];
    const arrayB = [
      [CellTypes.None, CellTypes.None, CellTypes.None, CellTypes.None],
      [CellTypes.None, CellTypes.None, CellTypes.O, CellTypes.O],
      [CellTypes.None, CellTypes.None, CellTypes.O, CellTypes.O],
      [CellTypes.None, CellTypes.None, CellTypes.None, CellTypes.None],
    ];
    const superimposedArray = [
      [CellTypes.None, CellTypes.I, CellTypes.None, CellTypes.None],
      [CellTypes.None, CellTypes.I, CellTypes.O, CellTypes.O],
      [CellTypes.None, CellTypes.I, CellTypes.O, CellTypes.O],
      [CellTypes.None, CellTypes.I, CellTypes.None, CellTypes.None],
    ];
    const gridA = Grid.fromArray(arrayA);
    const gridB = Grid.fromArray(arrayB);
    const superimposedGrid = Grid.superimpose(gridA, gridB);

    expect(superimposedGrid.array).toEqual(superimposedArray);
    expect(gridA.array).toEqual(arrayA);
    expect(gridB.array).toEqual(arrayB);
  });
});
