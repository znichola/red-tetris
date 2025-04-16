import { expect, describe, it, vi, beforeEach, afterEach } from "vitest";
import TetrisGame, { ActionType } from "./TetrisGame.js";
import {
  CellType,
  GameGridDimensions,
  RotationType,
  Tetrominoes,
} from "./TetrisConsts.js";
import { DROP_RATE } from "./TetrisConfig.js";
import Grid from "./Grid.js";

const TestsRandomSeed = 42;
//NOTE: With seed 42, the tetrominoes will always appear in this order:
const TetrominoSpawnOrder = [
  CellType.I,
  CellType.Z,
  CellType.L,
  CellType.O,
  CellType.S,
  CellType.L,
  CellType.Z,
  CellType.O,
  CellType.J,
  CellType.Z,
  CellType.Z,
];
const DropCountForGameToEndOnItsOwn = 120;

describe("TetrisGame", () => {
  expect.extend({
    /**
     * @param {import("./TetrisConsts.js").GridArray} received
     * @param {import("./TetrisConsts.js").GridArray} expected
     */
    toEqualGrid(received, expected) {
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

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should start with one tetromino", () => {
    const { game, playerNames } = createTetrisGame();
    const gameStates = getAndValidateGameStates(game, playerNames);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, { x: 4, y: 0 });
    expectGameStatesGridsEqual(gameStates, expectedGrid.array);
  });

  it("should make tetrominoes fall", async () => {
    const { game, playerNames } = createTetrisGame();
    await progressGameByDropCount(1);
    const gameStates = getAndValidateGameStates(game, playerNames);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, { x: 4, y: 1 });
    expectGameStatesGridsEqual(gameStates, expectedGrid.array);
  });

  it("should end the game after some time", { timeout: 1000 }, async () => {
    const { game } = createTetrisGame();
    await progressGameByDropCount(DropCountForGameToEndOnItsOwn);
    //NOTE: If the game is still playing, this promise is awaited forever,
    //NOTE: and thus the test fails by timing out.
    await game.gameLoop();
  });

  it("should spawn the same tetrominoes for all players", async () => {
    const playerNames = Array.from({ length: 42 }, (_, i) => `Player${i + 1}`);
    const { game } = createTetrisGame(playerNames);
    await progressGameByDropCount(DropCountForGameToEndOnItsOwn);
    const gameStates = getAndValidateGameStates(game, playerNames);
    expectGameStatesGridsEqual(gameStates, gameStates[0].gridArray);
  });

  it("should execute move left actions", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActionForAllPlayers(
      game,
      playerNames,
      ActionType.MoveLeft,
      GameGridDimensions.x,
    );
    const gameStates = getAndValidateGameStates(game, playerNames);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, { x: 0, y: 0 });
    expectGameStatesGridsEqual(gameStates, expectedGrid.array);
  });

  it("should execute move right actions", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActionForAllPlayers(
      game,
      playerNames,
      ActionType.MoveRight,
      GameGridDimensions.x,
    );
    const gameStates = getAndValidateGameStates(game, playerNames);
    const firstTetromino = getTetrominoFromSpawnOrder(0);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, {
      x: GameGridDimensions.x - firstTetromino.width,
      y: 0,
    });
    expectGameStatesGridsEqual(gameStates, expectedGrid.array);
  });

  it("should execute soft drop actions", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActionForAllPlayers(
      game,
      playerNames,
      ActionType.SoftDrop,
      GameGridDimensions.y,
    );
    const gameStates = getAndValidateGameStates(game, playerNames);
    const firstTetromino = getTetrominoFromSpawnOrder(0);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, {
      x: 4,
      y: GameGridDimensions.y - firstTetromino.height,
    });
    expectGameStatesGridsEqual(gameStates, expectedGrid.array);
  });

  it("should execute hard drop action", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActionForAllPlayers(game, playerNames, ActionType.HardDrop);
    const gameStates = getAndValidateGameStates(game, playerNames);
    const firstTetromino = getTetrominoFromSpawnOrder(0);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, {
      x: 4,
      y: GameGridDimensions.y - firstTetromino.height,
    });
    expectGameStatesGridsEqual(gameStates, expectedGrid.array);
  });

  it("should execute rotate actions", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActionForAllPlayers(game, playerNames, ActionType.Rotate);
    const gameStates1 = getAndValidateGameStates(game, playerNames);
    const expectedGrid1 = Grid.fromRowsCols(
      GameGridDimensions.y,
      GameGridDimensions.x,
    );
    expectedGrid1.array[0][4] = CellType.I;
    expectedGrid1.array[1][4] = CellType.I;
    expectedGrid1.array[2][4] = CellType.I;
    expectedGrid1.array[3][4] = CellType.I;
    expectGameStatesGridsEqual(gameStates1, expectedGrid1.array);
    executeActionForAllPlayers(game, playerNames, ActionType.Rotate);
    const gameStates2 = getAndValidateGameStates(game, playerNames);
    const expectedGrid2 = getGridWithTetrominoFromSpawnOrder(0, { x: 4, y: 0 });
    expectGameStatesGridsEqual(gameStates2, expectedGrid2.array);
  });

  it("should do a wall kick when possible", async () => {
    const { game, playerNames } = createTetrisGame();
    await progressGameByDropCount(20);
    executeActionForAllPlayers(game, playerNames, ActionType.Rotate);
    executeActionForAllPlayers(
      game,
      playerNames,
      ActionType.MoveRight,
      GameGridDimensions.x,
    );
    executeActionForAllPlayers(game, playerNames, ActionType.Rotate);
    const gameStates = getAndValidateGameStates(game, playerNames);
    const firstTetromino = getTetrominoFromSpawnOrder(0);
    const gridWithFirstTetromino = getGridWithTetrominoFromSpawnOrder(0, {
      x: 4,
      y: GameGridDimensions.y - firstTetromino.height,
    });
    const secondTetromino = getTetrominoFromSpawnOrder(1);
    const gridWithSecondTetromino = getGridWithTetrominoFromSpawnOrder(1, {
      x: GameGridDimensions.x - secondTetromino.width,
      y: 0,
    });
    const expectedGrid = Grid.superimpose(
      gridWithFirstTetromino,
      gridWithSecondTetromino,
    );
    expectGameStatesGridsEqual(gameStates, expectedGrid.array);
  });

  it("should do a floor kick when possible", async () => {
    const { game, playerNames } = createTetrisGame();
    await progressGameByDropCount(19);
    executeActionForAllPlayers(game, playerNames, ActionType.Rotate);
    const gameStates = getAndValidateGameStates(game, playerNames);
    const firstTetromino = getTetrominoFromSpawnOrder(
      0,
      RotationType.Rotation90,
    );
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(
      0,
      {
        x: 4,
        y: GameGridDimensions.y - firstTetromino.height,
      },
      RotationType.Rotation90,
    );
    expectGameStatesGridsEqual(gameStates, expectedGrid.array);
  });
});

function createTetrisGame(playerNames = ["Player1", "Player2"]) {
  const game = new TetrisGame(playerNames, TestsRandomSeed);
  game.gameLoop();
  return { game, playerNames };
}

/**
 * @param {number} dropCount
 */
async function progressGameByDropCount(dropCount) {
  await vi.advanceTimersByTimeAsync(DROP_RATE * 1000 * dropCount);
}

/**
 * @param {TetrisGame} game
 * @param {string[]} playerNames
 */
function getAndValidateGameStates(game, playerNames) {
  const gameStates = game.getGameStates();
  expectValidGameStates(gameStates, playerNames.length);
  return gameStates;
}

/**
 * @param {import("./TetrisConsts.js").GameStates} gameStates
 * @param {number} playerCount
 */
function expectValidGameStates(gameStates, playerCount) {
  expect(gameStates).toHaveLength(playerCount);
  gameStates.forEach((gameState) => {
    expect(gameState).toEqual({
      playerName: expect.any(String),
      gridArray: expect.arrayContaining([
        expect.arrayContaining([expect.any(Number)]),
      ]),
    });
    expect(gameState.gridArray.length).toEqual(GameGridDimensions.y);
    gameState.gridArray.forEach((row) =>
      expect(row.length).toEqual(GameGridDimensions.x),
    );
  });
}

/**
 * @param {number} spawnOrderIndex
 * @param {import("./TetrisConsts.js").Vector} tetrominoPosition
 * @param {RotationType} tetrominoRotation
 */
function getGridWithTetrominoFromSpawnOrder(
  spawnOrderIndex,
  tetrominoPosition,
  tetrominoRotation = RotationType.Rotation0,
) {
  const tetromino = getTetrominoFromSpawnOrder(
    spawnOrderIndex,
    tetrominoRotation,
  );
  const emptyGameGrid = Grid.fromRowsCols(
    GameGridDimensions.y,
    GameGridDimensions.x,
  );
  const expectedGrid = Grid.superimposeAtPosition(
    emptyGameGrid,
    Grid.fromArray(tetromino.shape),
    tetrominoPosition,
  );

  return expectedGrid;
}

/**
 * @param {number} spawnOrderIndex
 * @param {RotationType} tetrominoRotation
 */
function getTetrominoFromSpawnOrder(
  spawnOrderIndex,
  tetrominoRotation = RotationType.Rotation0,
) {
  return Tetrominoes[TetrominoSpawnOrder[spawnOrderIndex]][tetrominoRotation];
}

/**
 * @param {TetrisGame} game
 * @param {string[]} playerNames
 * @param {ActionType} action
 * @param {number} actionCount
 */
function executeActionForAllPlayers(
  game,
  playerNames,
  action,
  actionCount = 1,
) {
  playerNames.forEach((playerName) => {
    for (let i = 0; i < actionCount; i++) {
      game.doAction(playerName, action);
    }
  });
}

/**
 * @param {import("./TetrisConsts.js").GameStates} gameStates
 * @param {import("./TetrisConsts.js").GridArray} expectedGrid
 */
function expectGameStatesGridsEqual(gameStates, expectedGrid) {
  gameStates.forEach((gameState) =>
    //NOTE: This @ts-ignore is needed because `toEqualGrid` function is not recognized.
    //NOTE: This could be fixed with type declarations in a .d.ts file,
    //NOTE: but we cannot write typescript because of the subject.
    //@ts-ignore
    expect(gameState.gridArray).toEqualGrid(expectedGrid),
  );
}
