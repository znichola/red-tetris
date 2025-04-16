/**
 * @typedef {number} TetrominoType
 */
export const TetrominoType = Object.freeze({
  I: 1,
  O: 2,
  T: 3,
  J: 4,
  L: 5,
  S: 6,
  Z: 7,
});

/**
 * @typedef {number} CellType
 */
export const CellType = Object.freeze({
  Empty: 0,
  ...TetrominoType,
});

/** @typedef {number} RotationType */

export const RotationType = Object.freeze({
  Rotation0: 0,
  Rotation90: 1,
  Rotation180: 2,
  Rotation270: 3,
});

/**
 * @param {RotationType} rotationType
 * @return {RotationType}
 */
export function RotateClockwise(rotationType) {
  return (rotationType + 1) % 4;
}

const TetrominoesDefinitions = deepFreeze({
  [TetrominoType.I]: {
    [RotationType.Rotation0]: [
      [CellType.I, CellType.I, CellType.I, CellType.I],
    ],
    [RotationType.Rotation90]: [
      [CellType.I],
      [CellType.I],
      [CellType.I],
      [CellType.I],
    ],
    [RotationType.Rotation180]: RotationType.Rotation0,
    [RotationType.Rotation270]: RotationType.Rotation90,
  },
  [TetrominoType.O]: {
    [RotationType.Rotation0]: [
      [CellType.O, CellType.O],
      [CellType.O, CellType.O],
    ],
    [RotationType.Rotation90]: RotationType.Rotation0,
    [RotationType.Rotation180]: RotationType.Rotation0,
    [RotationType.Rotation270]: RotationType.Rotation0,
  },
  [TetrominoType.T]: {
    [RotationType.Rotation0]: [
      [CellType.Empty, CellType.T, CellType.Empty],
      [CellType.T, CellType.T, CellType.T],
    ],
    [RotationType.Rotation90]: [
      [CellType.T, CellType.Empty],
      [CellType.T, CellType.T],
      [CellType.T, CellType.Empty],
    ],
    [RotationType.Rotation180]: [
      [CellType.T, CellType.T, CellType.T],
      [CellType.Empty, CellType.T, CellType.Empty],
    ],
    [RotationType.Rotation270]: [
      [CellType.Empty, CellType.T],
      [CellType.T, CellType.T],
      [CellType.Empty, CellType.T],
    ],
  },
  [TetrominoType.J]: {
    [RotationType.Rotation0]: [
      [CellType.J, CellType.Empty, CellType.Empty],
      [CellType.J, CellType.J, CellType.J],
    ],
    [RotationType.Rotation90]: [
      [CellType.J, CellType.J],
      [CellType.J, CellType.Empty],
      [CellType.J, CellType.Empty],
    ],
    [RotationType.Rotation180]: [
      [CellType.J, CellType.J, CellType.J],
      [CellType.Empty, CellType.Empty, CellType.J],
    ],
    [RotationType.Rotation270]: [
      [CellType.Empty, CellType.J],
      [CellType.Empty, CellType.J],
      [CellType.J, CellType.J],
    ],
  },
  [TetrominoType.L]: {
    [RotationType.Rotation0]: [
      [CellType.Empty, CellType.Empty, CellType.L],
      [CellType.L, CellType.L, CellType.L],
    ],
    [RotationType.Rotation90]: [
      [CellType.L, CellType.Empty],
      [CellType.L, CellType.Empty],
      [CellType.L, CellType.L],
    ],
    [RotationType.Rotation180]: [
      [CellType.L, CellType.L, CellType.L],
      [CellType.L, CellType.Empty, CellType.Empty],
    ],
    [RotationType.Rotation270]: [
      [CellType.L, CellType.L],
      [CellType.Empty, CellType.L],
      [CellType.Empty, CellType.L],
    ],
  },
  [TetrominoType.S]: {
    [RotationType.Rotation0]: [
      [CellType.Empty, CellType.S, CellType.S],
      [CellType.S, CellType.S, CellType.Empty],
    ],
    [RotationType.Rotation90]: [
      [CellType.S, CellType.Empty],
      [CellType.S, CellType.S],
      [CellType.Empty, CellType.S],
    ],
    [RotationType.Rotation180]: RotationType.Rotation0,
    [RotationType.Rotation270]: RotationType.Rotation90,
  },
  [TetrominoType.Z]: {
    [RotationType.Rotation0]: [
      [CellType.Z, CellType.Z, CellType.Empty],
      [CellType.Empty, CellType.Z, CellType.Z],
    ],
    [RotationType.Rotation90]: [
      [CellType.Empty, CellType.Z],
      [CellType.Z, CellType.Z],
      [CellType.Z, CellType.Empty],
    ],
    [RotationType.Rotation180]: RotationType.Rotation0,
    [RotationType.Rotation270]: RotationType.Rotation90,
  },
});

export const Tetrominoes = createTetrominoes(TetrominoesDefinitions);

/**
 * @typedef {Object<string, Tetromino>} TetrominoCollection
 *
 * @typedef {Object<string, TetrominoRotation>} Tetromino
 *
 * @typedef {Object} TetrominoRotation
 * @property {CellType[][]} shape
 * @property {number} width
 * @property {number} height
 */

function createTetrominoes(tetrominoDefinitions) {
  /**
   * @type {TetrominoCollection}
   */
  const tetrominoes = {};

  for (const [tetrominoType, rotations] of Object.entries(
    tetrominoDefinitions,
  )) {
    tetrominoes[tetrominoType] = {};

    for (const [rotation, definition] of Object.entries(rotations)) {
      const isAlias = typeof definition === "number";

      if (isAlias) {
        const sourceRotation = definition;
        tetrominoes[tetrominoType][rotation] =
          tetrominoes[tetrominoType][sourceRotation];
      } else {
        tetrominoes[tetrominoType][rotation] = {
          shape: definition,
          width: definition[0].length,
          height: definition.length,
        };
      }
    }
  }

  return deepFreeze(tetrominoes);
}

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

/**
 * @typedef {Object} Vector
 * @property {number} x
 * @property {number} y
 */

/**
 * @type {Vector}
 */
export const VectorLeft = Object.freeze({ x: -1, y: 0 });
/**
 * @type {Vector}
 */
export const VectorRight = Object.freeze({ x: 1, y: 0 });
/**
 * @type {Vector}
 */
export const VectorUp = Object.freeze({ x: 0, y: -1 });
/**
 * @type {Vector}
 */
export const VectorDown = Object.freeze({ x: 0, y: 1 });

export const GameGridDimensions = Object.freeze({
  x: 10,
  y: 20,
});
