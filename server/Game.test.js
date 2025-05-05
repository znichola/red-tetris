import { expect, expectGridArrayToEqual } from "./expect-extensions.js";
import { describe, it, vi, beforeEach, afterEach } from "vitest";
import Game from "./Game.js";
import { RotationType, Tetrominoes } from "./TetrisConsts.js";
import { DROP_RATE } from "./TetrisConfig.js";
import Grid from "./Grid.js";
import { ActionType, CellType } from "../shared/DTOs.js";
import { DefaultGameGridDimensions } from "../shared/Consts.js";
import { initialState as intialGameConfigState } from "../client/src/redux/configSlice.js";

// NOTE ensure the score store does nothing
vi.mock("./ScoreStore.js", () => {
  return {
    default: class {
      constructor() {}
      pushPlayerScores() {}
      getAllScores() {}
      setSocket() {}
      broadcastScores() {}
    },
    convertToPlayerScores: () => {},
  };
});

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

describe("Game", () => {
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
    expectGridArrayToEqual(gameData.grid, expectedGrid.array);
  });

  it("should make tetrominoes fall", async () => {
    const { game, playerNames } = createTetrisGame();
    await progressGameByDropCount(1);
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, { x: 4, y: 1 });
    expectGridArrayToEqual(gameData.grid, expectedGrid.array);
  });

  it("should end the game after some time", { timeout: 1000 }, async () => {
    const { game } = createTetrisGame();
    await progressGameByDropCount(DropCountForGameToEndOnItsOwn);
    //NOTE: If the game is still playing, this promise is awaited forever,
    //NOTE: and thus the test fails by timing out.
    await game.gameLoop();
  });

  it("should show the spectra that lost reaching the top of the grid", async () => {
    const { game, playerNames } = createTetrisGame();
    await progressGameByDropCount(DropCountForGameToEndOnItsOwn);
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const spectra = Object.values(gameData.playerNameToSpectrum);
    spectra.forEach((spectrum) =>
      expect(spectrum).toEqual(
        expect.arrayContaining([DefaultGameGridDimensions.y]),
      ),
    );
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
    expectGridArrayToEqual(gameDataPlayer1.grid, gameDataPlayer2.grid);
  });

  it("should execute move left actions", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActions(
      game,
      playerNames,
      ActionType.MoveLeft,
      DefaultGameGridDimensions.x,
    );
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, { x: 0, y: 0 });
    expectGridArrayToEqual(gameData.grid, expectedGrid.array);
  });

  it("should execute move right actions", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActions(
      game,
      playerNames,
      ActionType.MoveRight,
      DefaultGameGridDimensions.x,
    );
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const firstTetromino = getTetrominoFromSpawnOrder(0);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, {
      x: DefaultGameGridDimensions.x - firstTetromino.width,
      y: 0,
    });
    expectGridArrayToEqual(gameData.grid, expectedGrid.array);
  });

  it("should execute soft drop actions", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActions(
      game,
      playerNames,
      ActionType.SoftDrop,
      DefaultGameGridDimensions.y,
    );
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const firstTetromino = getTetrominoFromSpawnOrder(0);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, {
      x: 4,
      y: DefaultGameGridDimensions.y - firstTetromino.height,
    });
    expectGridArrayToEqual(gameData.grid, expectedGrid.array);
  });

  it("should execute hard drop action", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActions(game, playerNames, ActionType.HardDrop);
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const firstTetromino = getTetrominoFromSpawnOrder(0);
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(0, {
      x: 4,
      y: DefaultGameGridDimensions.y - firstTetromino.height,
    });
    expectGridArrayToEqual(gameData.grid, expectedGrid.array);
  });

  it("should execute rotate actions", async () => {
    const { game, playerNames } = createTetrisGame();
    executeActions(game, playerNames, ActionType.Rotate);
    const gameData1 = getAndValidateGameData(game, playerNames[0], playerNames);
    const expectedGrid1 = Grid.fromRowsCols(
      DefaultGameGridDimensions.y,
      DefaultGameGridDimensions.x,
    );
    expectedGrid1.array[0][4] = CellType.I;
    expectedGrid1.array[1][4] = CellType.I;
    expectedGrid1.array[2][4] = CellType.I;
    expectedGrid1.array[3][4] = CellType.I;
    expectGridArrayToEqual(gameData1.grid, expectedGrid1.array);
    executeActions(game, playerNames, ActionType.Rotate);
    const gameData2 = getAndValidateGameData(game, playerNames[0], playerNames);
    const expectedGrid2 = getGridWithTetrominoFromSpawnOrder(0, { x: 4, y: 0 });
    expectGridArrayToEqual(gameData2.grid, expectedGrid2.array);
  });

  it("should do a wall kick when possible", async () => {
    const { game, playerNames } = createTetrisGame();
    await progressGameByDropCount(20);
    executeActions(game, playerNames, ActionType.Rotate);
    executeActions(
      game,
      playerNames,
      ActionType.MoveRight,
      DefaultGameGridDimensions.x,
    );
    executeActions(game, playerNames, ActionType.Rotate);
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const gridWithFirstTetromino = getGridWithTetrominoFromSpawnOrder(0, {
      x: 4,
      y: DefaultGameGridDimensions.y - getTetrominoFromSpawnOrder(0).height,
    });
    const gridWithSecondTetromino = getGridWithTetrominoFromSpawnOrder(1, {
      x: DefaultGameGridDimensions.x - getTetrominoFromSpawnOrder(1).width,
      y: 0,
    });
    const expectedGrid = Grid.superimpose(
      gridWithFirstTetromino,
      gridWithSecondTetromino,
    );
    expectGridArrayToEqual(gameData.grid, expectedGrid.array);
  });

  it("should do a floor kick when possible", async () => {
    const { game, playerNames } = createTetrisGame();
    await progressGameByDropCount(19);
    executeActions(game, playerNames, ActionType.Rotate);
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const firstTetromino = getTetrominoFromSpawnOrder(
      0,
      RotationType.Rotation90,
    );
    const expectedGrid = getGridWithTetrominoFromSpawnOrder(
      0,
      {
        x: 4,
        y: DefaultGameGridDimensions.y - firstTetromino.height,
      },
      RotationType.Rotation90,
    );
    expectGridArrayToEqual(gameData.grid, expectedGrid.array);
  });

  it("should clear lines and attack the opponents", async () => {
    const { game, playerNames } = createTetrisGame();
    await makePlayerClearLine(game, playerNames[0]);
    const gameData = getAndValidateGameData(game, playerNames[0], playerNames);
    const grid = gameData.grid;
    const lastRow = grid[grid.length - 1];
    expect(lastRow.some((cell) => cell === CellType.Empty)).toBe(true);
  });

  it("should not attack the opponents when clearing one line", async () => {
    const playerNames = ["Player1", "Player2", "Player3"];
    const { game } = createTetrisGame(playerNames);
    await makePlayerClearLine(game, playerNames[0]);
    playerNames
      .filter((playerName) => playerName !== playerNames[0])
      .forEach((playerName) => {
        const gameData = getAndValidateGameData(game, playerName, playerNames);
        const grid = gameData.grid;
        const lastRow = grid[grid.length - 1];
        expect(lastRow.some((cell) => cell === CellType.Indestructible)).toBe(
          false,
        );
      });
  });

  it("should attack the opponents when clearing more than one line", async () => {
    const playerNames = ["Player1", "Player2", "Player3"];
    const { game } = createTetrisGame(playerNames);
    await makePlayerClearTwoLines(game, playerNames[0]);
    playerNames
      .filter((playerName) => playerName !== playerNames[0])
      .forEach((playerName) => {
        const gameData = getAndValidateGameData(game, playerName, playerNames);
        const grid = gameData.grid;
        const lastRow = grid[grid.length - 1];
        expect(lastRow.every((cell) => cell === CellType.Indestructible)).toBe(
          true,
        );
      });
  });
});

function createTetrisGame(playerNames = ["Player1", "Player2"]) {
  const game = new Game(playerNames, intialGameConfigState, TestsRandomSeed);
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
 * @param {Game} game
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
  expect(grid.length).toEqual(DefaultGameGridDimensions.y);
  grid.forEach((row) =>
    expect(row.length).toEqual(DefaultGameGridDimensions.x),
  );

  expect(Object.keys(gameData.playerNameToSpectrum)).toEqual(otherPlayerNames);
  Object.keys(gameData.playerNameToSpectrum).forEach((playerName) => {
    const spectrum = gameData.playerNameToSpectrum[playerName];
    expect(spectrum.length).toEqual(DefaultGameGridDimensions.x);
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
    DefaultGameGridDimensions.y,
    DefaultGameGridDimensions.x,
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
 * This function depends on the `42` seed and only works at the start of a game.
 * @param {Game} game
 * @param {string} playerName
 */
async function makePlayerClearLine(game, playerName) {
  executeActions(game, [playerName], ActionType.MoveLeft, 99);
  executeActions(game, [playerName], ActionType.HardDrop);
  await progressGameByDropCount(1);
  executeActions(game, [playerName], ActionType.MoveLeft);
  executeActions(game, [playerName], ActionType.HardDrop);
  await progressGameByDropCount(1);
  executeActions(game, [playerName], ActionType.MoveRight, 99);
  executeActions(game, [playerName], ActionType.HardDrop);
  await progressGameByDropCount(1);
  executeActions(game, [playerName], ActionType.MoveLeft, 99);
  executeActions(game, [playerName], ActionType.HardDrop);
  await progressGameByDropCount(1);
  executeActions(game, [playerName], ActionType.Rotate);
  executeActions(game, [playerName], ActionType.MoveRight);
  executeActions(game, [playerName], ActionType.HardDrop);
  await progressGameByDropCount(1);
}

/**
 * This function depends on the `42` seed and only works at the start of a game.
 * @param {Game} game
 * @param {string} playerName
 */
async function makePlayerClearTwoLines(game, playerName) {
  executeActions(game, [playerName], ActionType.MoveLeft, 99);
  executeActions(game, [playerName], ActionType.HardDrop);
  await progressGameByDropCount(1);
  executeActions(game, [playerName], ActionType.MoveLeft);
  executeActions(game, [playerName], ActionType.HardDrop);
  await progressGameByDropCount(1);
  executeActions(game, [playerName], ActionType.MoveRight, 99);
  executeActions(game, [playerName], ActionType.HardDrop);
  await progressGameByDropCount(1);
  executeActions(game, [playerName], ActionType.MoveLeft, 99);
  executeActions(game, [playerName], ActionType.HardDrop);
  await progressGameByDropCount(1);
  executeActions(game, [playerName], ActionType.MoveRight, 99);
  executeActions(game, [playerName], ActionType.HardDrop);
  await progressGameByDropCount(1);
  executeActions(game, [playerName], ActionType.Rotate);
  executeActions(game, [playerName], ActionType.Rotate);
  executeActions(game, [playerName], ActionType.MoveLeft, 2);
  executeActions(game, [playerName], ActionType.HardDrop);
  await progressGameByDropCount(1);
  executeActions(game, [playerName], ActionType.Rotate);
  executeActions(game, [playerName], ActionType.MoveRight, 3);
  executeActions(game, [playerName], ActionType.HardDrop);
  await progressGameByDropCount(1);

  for (let i = 0; i < 5; i++) {
    executeActions(game, [playerName], ActionType.MoveLeft, 99);
    executeActions(game, [playerName], ActionType.HardDrop);
    await progressGameByDropCount(1);
  }

  executeActions(game, [playerName], ActionType.Rotate);
  executeActions(game, [playerName], ActionType.MoveRight);
  executeActions(game, [playerName], ActionType.HardDrop);
  await progressGameByDropCount(1);
}

/**
 * @param {Game} game
 * @param {string[]} playerNames
 * @param {ActionType} action
 * @param {number} actionCount
 */
function executeActions(game, playerNames, action, actionCount = 1) {
  playerNames.forEach((playerName) => {
    for (let i = 0; i < actionCount; i++) {
      game.doAction(playerName, action);
    }
  });
}
