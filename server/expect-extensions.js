import { expect } from "vitest";
import Grid from "./Grid.js";

/**
 * @typedef {import("../shared/DTOs.js").Grid} GridArray
 */

expect.extend({
  /**
   * @param {GridArray} received
   * @param {GridArray} expected
   */
  toEqualGridArray(received, expected) {
    const pass = this.equals(received, expected);

    if (!pass) {
      return {
        pass,
        message: () =>
          Grid.toStrings([expected, received], ["Expected", "Received"]),
      };
    }

    return {
      pass,
      message: () => "Grids are equal",
    };
  },
});

/**
 * @param {GridArray | undefined} grid
 * @param {GridArray} expectedGrid
 */
function expectGridArrayToEqual(grid, expectedGrid) {
  if (!grid) {
    throw new Error("Grid is null");
  }

  //NOTE: This @ts-ignore is needed because `toEqualGridArray` function is not recognized.
  //NOTE: This could be fixed with type declarations in a .d.ts file,
  //NOTE: but we cannot write typescript because of the subject.
  //@ts-ignore
  expect(grid).toEqualGridArray(expectedGrid);
}

export { expect, expectGridArrayToEqual };
