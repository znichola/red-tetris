import { describe, it, expect } from "vitest";
import ScoreStore from "./ScoreStore.js";
import Player from "./Player.js";

/**
 * @typedef {import("../shared/DTOs.js").GameMode} GameMode
 */

const mockFilename = "test_scores.json";

describe("ScoreStore", () => {
  it("should add a new score record", () => {
    const scoreStore = new ScoreStore(mockFilename);

    scoreStore.pushPlayerScores([{ name: "Alice", score: 50 }], "solo");

    const scores = scoreStore.getAllScores();
    expect(scores.length).toBe(1);
    expect(scores[0]).toMatchObject({
      player: "Alice",
      score: 50,
      gameMode: "solo",
      winner: false,
    });
  });

  it("should merge results form multiple games", () => {
    const scoreStore = new ScoreStore(mockFilename);

    scoreStore.pushPlayerScores([{ name: "Alice", score: 50 }], "solo");
    scoreStore.pushPlayerScores([{ name: "Alice", score: 100 }], "solo");
    scoreStore.pushPlayerScores(
      [
        { name: "Alice", score: 12 },
        { name: "Bobby", score: 900 },
      ],
      "multiplayer",
      "Bobby",
    );

    const scores = scoreStore.getAllScores();
    expect(scores.length).toBe(3);
    expect(scores).toMatchObject([
      {
        player: "Bobby",
        score: 900,
        gameMode: "multiplayer",
        winner: true,
      },
      {
        player: "Alice",
        score: 100,
        gameMode: "solo",
        winner: false,
      },
      {
        player: "Alice",
        score: 12,
        gameMode: "multiplayer",
        winner: false,
      },
    ]);
  });
});
