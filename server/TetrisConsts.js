/** @readonly @enum {number} */
export const TetrominoTypes = Object.freeze({
  I: 1,
  O: 2,
  T: 3,
  J: 4,
  L: 5,
  S: 6,
  Z: 7,
});

/** @readonly @enum {number} */
export const CellTypes = Object.freeze({
  None: 0,
  ...TetrominoTypes,
});
