import Grid from "./Grid.js";
import { CellType, TetrominoType } from "../shared/DTOs.js";

export const TickRate = 20;
export const DropRate = 1;

export const Tetrominoes = deepFreeze({
  [TetrominoType.I]: [[CellType.I, CellType.I, CellType.I, CellType.I]],
  [TetrominoType.O]: [
    [CellType.O, CellType.O],
    [CellType.O, CellType.O],
  ],
  [TetrominoType.T]: [
    [CellType.Empty, CellType.T, CellType.Empty],
    [CellType.T, CellType.T, CellType.T],
  ],
  [TetrominoType.J]: [
    [CellType.J, CellType.Empty, CellType.Empty],
    [CellType.J, CellType.J, CellType.J],
  ],
  [TetrominoType.L]: [
    [CellType.Empty, CellType.Empty, CellType.L],
    [CellType.L, CellType.L, CellType.L],
  ],
  [TetrominoType.S]: [
    [CellType.Empty, CellType.S, CellType.S],
    [CellType.S, CellType.S, CellType.Empty],
  ],
  [TetrominoType.Z]: [
    [CellType.Z, CellType.Z, CellType.Empty],
    [CellType.Empty, CellType.Z, CellType.Z],
  ],
});

/**
 * This should not be used on cyclic objects, as it would cause a stack overflow.
 * @template T
 * @param {T & Record<string|symbol, any>} object
 * @return {Readonly<T>}
 */
export function deepFreeze(object) {
  const propNames = Reflect.ownKeys(object);

  for (const name of propNames) {
    const value = object[name];

    if ((value && typeof value === "object") || typeof value === "function") {
      deepFreeze(value);
    }
  }

  return Object.freeze(object);
}

/** @typedef {import("../shared/DTOs.js").Vector} Vector */

/** @type {Vector} */
export const VectorLeft = Object.freeze({ x: -1, y: 0 });
/** @type {Vector} */
export const VectorRight = Object.freeze({ x: 1, y: 0 });
/** @type {Vector} */
export const VectorUp = Object.freeze({ x: 0, y: -1 });
/** @type {Vector} */
export const VectorDown = Object.freeze({ x: 0, y: 1 });

export const PowerUpSpawnChance = 0.1;

// prettier-ignore
export const bombHoleGrid = Grid.fromArray([
  [CellType.None, CellType.None, CellType.Empty, CellType.None, CellType.None],
  [CellType.None, CellType.Empty, CellType.Empty, CellType.Empty, CellType.None],
  [CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty, CellType.Empty],
  [CellType.None, CellType.Empty, CellType.Empty, CellType.Empty, CellType.None],
  [CellType.None, CellType.None, CellType.Empty, CellType.None, CellType.None],
]);
