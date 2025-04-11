import { expect, describe, it, vi, beforeEach, afterEach } from "vitest";
import TetrisGame from "./TetrisGame";
import { CellTypes } from "./TetrisConsts";
import { DROP_RATE } from "./TetrisConfig";

describe("TetrisGame", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should start with one tetromino", () => {
    const players = ["Player1", "Player2"];
    const game = createTetrisGame(players);
    const gameStates = game.getState();

    expectValidGameStates(gameStates, players.length);
    expect(
      gameStates.every((gameState) => !isEmptyRow(gameState.gridArray[0])),
    ).toBe(true);
  });

  it("should make tetrominoes fall", async () => {
    const players = ["Player1", "Player2"];
    const game = createTetrisGame(players);
    game.gameLoop();
    await dropXTimes(1);
    const gameStates = game.getState();

    expectValidGameStates(gameStates, players.length);
    expect(
      gameStates.every((gameState) => isEmptyRow(gameState.gridArray[0])),
    ).toBe(true);
  });

  it("should end the game after some time", { timeout: 1000 }, async () => {
    const players = ["Player1", "Player2"];
    const game = createTetrisGame(players);
    game.gameLoop();
    await dropXTimes(100);

    //NOTE: If the game is still looping, this awaits forever, and thus the test fails by timeout.
    await game.gameLoop();
  });
});

async function dropXTimes(times) {
  await vi.advanceTimersByTimeAsync(DROP_RATE * 1000 * times);
}

function createTetrisGame(playerNames) {
  const randomSeed = 42;
  return new TetrisGame(playerNames, randomSeed);
}

function expectValidGameStates(gameStates, playerCount) {
  expect(gameStates).toHaveLength(playerCount);
  gameStates.every((gameState) =>
    expect(gameState).toEqual({
      playerName: expect.any(String),
      gridArray: expect.arrayContaining([
        expect.arrayContaining([expect.any(Number)]),
      ]),
    }),
  );
  gameStates.every((gameState) =>
    expect(gameState.gridArray.length).toEqual(20),
  );
  gameStates.every((gameState) =>
    gameState.gridArray.every((row) => expect(row.length).toEqual(10)),
  );
}

function isEmptyRow(row) {
  return row.every((cell) => cell === CellTypes.None);
}
