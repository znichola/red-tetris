import fs from "fs";
import path from "path";

/** @typedef {{player: string, score: number, time: string, wasWinner: boolean}} ScoreRecord*/

export default class ScoreStore {
  #filePath;
  #permanentStoreActive = false;

  /**@type {ScoreRecord[]} */
  #scores = [];

  constructor(filename = "game_scores.json") {
    this.#filePath = path.resolve(filename);
    this.#loadScores();
  }

  /**
   * @param {import("./Player.js").default[]} players
   * @param {string | null} winnerName
   */
  pushPlayerScores(players, winnerName = null) {
    const now = new Date();
    const newScores = players.map((player) => ({
      player: player.name,
      score: player.score,
      time: now.toISOString(),
      wasWinner: player.name === winnerName,
    }));

    this.#scores.push(...newScores);
    this.#saveScores();
  }

  getAllScores() {
    return this.#scores;
  }

  #loadScores() {
    // NOTE this is a read from a file, but it could easily be switched to a database call
    if (fs.existsSync(this.#filePath)) {
      const fileContent = fs.readFileSync(this.#filePath, "utf-8");
      try {
        this.#scores = JSON.parse(fileContent);
        this.#permanentStoreActive = true;
        console.log(`Score store loaded from ${this.#filePath}`);
      } catch (err) {
        console.error(
          "⚠️ Failed to parse scores. Starting with empty list and using in memory store.",
          err,
        );
        this.#scores = [];
      }
    } else {
      console.error(
        `⚠️ Game score file ${this.#filePath} not found! Starting with empty list and using in memory store.`,
      );
      this.#scores = [];
    }
  }

  #saveScores() {
    // NOTE this is a write to file, but it could easily be switched to a database call
    if (this.#permanentStoreActive) {
      fs.writeFileSync(this.#filePath, JSON.stringify(this.#scores, null, 2));
    }
  }
}
