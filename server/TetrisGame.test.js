import { expect, describe, it, vi, beforeEach, afterEach } from "vitest";
import TetrisGame from "./TetrisGame.js";
import {
  GameGridDimensions,
  RotationType,
  Tetrominoes,
} from "./TetrisConsts.js";
import { DROP_RATE } from "./TetrisConfig.js";
import Grid from "./Grid.js";
import { ActionType, CellType } from "../shared/DTOs.js";

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

expect.extend({
  /**
   * @param {import("../shared/DTOs.js").Grid} received
   * @param {import("../shared/DTOs.js").Grid} expected
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

describe("TetrisGame", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should start with one tetromino", () => {
    const { game, playerNames } = createTetrisGame();
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, { x: 4, y: 0 });
    expectGameDataGridEqual(gameData, expectedGrid.array);
  });

  it("should make tetrominoes fall", async () => {
    const { game, playerNames } = createTetrisGame();
    await progressGameByDropCount(1);
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, { x: 4, y: 1 });
    expectGameDataGridEqual(gameData, expectedGrid.array);
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
    const gameDataPlayer1 = getAndValidateGameData(
      game,
      playerNames[0],
      playerNames,
    );
    const gameDataPlayer2 = getAndValidateGameData(
      game,
      playerNames[1],
      playerNames,
    );
    expectGameDataGridEqual(gameDataPlayer1, gameDataPlayer2.grid);
  });

  it("should execute move left actions", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActionForAllPlayers(
      game,
      playerNames,
      ActionType.MoveLeft,
      GameGridDimensions.x,
    );
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, { x: 0, y: 0 });
    expectGameDataGridEqual(gameData, expectedGrid.array);
  });

  it("should execute move right actions", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActionForAllPlayers(
      game,
      playerNames,
      ActionType.MoveRight,
      GameGridDimensions.x,
    );
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const firstTetromino = getTetrominoFromSpawnOrder(0);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, {
      x: GameGridDimensions.x - firstTetromino.width,
      y: 0,
    });
    expectGameDataGridEqual(gameData, expectedGrid.array);
  });

  it("should execute soft drop actions", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActionForAllPlayers(
      game,
      playerNames,
      ActionType.SoftDrop,
      GameGridDimensions.y,
    );
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const firstTetromino = getTetrominoFromSpawnOrder(0);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, {
      x: 4,
      y: GameGridDimensions.y - firstTetromino.height,
    });
    expectGameDataGridEqual(gameData, expectedGrid.array);
  });

  it("should execute hard drop action", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActionForAllPlayers(game, playerNames, ActionType.HardDrop);
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const firstTetromino = getTetrominoFromSpawnOrder(0);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, {
      x: 4,
      y: GameGridDimensions.y - firstTetromino.height,
    });
    expectGameDataGridEqual(gameData, expectedGrid.array);
  });

  it("should execute rotate actions", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActionForAllPlayers(game, playerNames, ActionType.Rotate);
    const gameData1 = getAndValidateGameData(game, playerNames[0], playerNames);
    const expectedGrid1 = Grid.fromRowsCols(
      GameGridDimensions.y,
      GameGridDimensions.x,
    );
    expectedGrid1.array[0][4] = CellType.I;
    expectedGrid1.array[1][4] = CellType.I;
    expectedGrid1.array[2][4] = CellType.I;
    expectedGrid1.array[3][4] = CellType.I;
    expectGameDataGridEqual(gameData1, expectedGrid1.array);
    executeActionForAllPlayers(game, playerNames, ActionType.Rotate);
    const gameData2 = getAndValidateGameData(game, playerNames[0], playerNames);
    const expectedGrid2 = getGridWithTetrominoFromSpawnOrder(0, { x: 4, y: 0 });
    expectGameDataGridEqual(gameData2, expectedGrid2.array);
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
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
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
    expectGameDataGridEqual(gameData, expectedGrid.array);
  });

  it("should do a floor kick when possible", async () => {
    const { game, playerNames } = createTetrisGame();
    await progressGameByDropCount(19);
    executeActionForAllPlayers(game, playerNames, ActionType.Rotate);
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
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
    expectGameDataGridEqual(gameData, expectedGrid.array);
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
 * @param {string} playerName
 * @param {string[]} allPlayerNames
 */
function getAndValidateGameData(game, playerName, allPlayerNames) {
  const gameData = game.getGameData(playerName);
  const otherPlayerNames = allPlayerNames.filter(
    (otherPlayerName) => otherPlayerName !== playerName,
  );
  expectValidGameData(gameData, otherPlayerNames);
  return gameData;
}

/**
 * @param {import("../shared/DTOs.js").GameData} gameData
 * @param {string[]} otherPlayerNames
 */
function expectValidGameData(gameData, otherPlayerNames) {
  const grid = gameData.grid;
  expect(grid.length).toEqual(GameGridDimensions.y);
  grid.forEach((row) => expect(row.length).toEqual(GameGridDimensions.x));

  expect(Object.keys(gameData.playerNameToSpectrum)).toEqual(otherPlayerNames);
  Object.keys(gameData.playerNameToSpectrum).forEach((playerName) => {
    const spectrum = gameData.playerNameToSpectrum[playerName];
    expect(spectrum.length).toEqual(GameGridDimensions.x);
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
 * @param {import("../shared/DTOs.js").GameData} gameData
 * @param {import("../shared/DTOs.js").Grid} expectedGrid
 */
function expectGameDataGridEqual(gameData, expectedGrid) {
  const grid = gameData.grid;
  //NOTE: This @ts-ignore is needed because `toEqualGrid` function is not recognized.
  //NOTE: This could be fixed with type declarations in a .d.ts file,
  //NOTE: but we cannot write typescript because of the subject.
  //@ts-ignore
  expect(grid).toEqualGrid(expectedGrid);
}
