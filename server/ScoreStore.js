import fs from "fs";
import path from "path";
import { SocketEvents } from "../shared/DTOs.js";

/**
 * @typedef {import("../shared/DTOs.js").GameMode} GameMode
 * @typedef {import("../shared/DTOs.js").ScoreRecord} ScoreRecord
 */

export default class ScoreStore {
  #filePath;
  #permanentStoreActive = false;
  #io;

  /**@type {ScoreRecord[]} */
  #scores = [];

  constructor(filename = "game_scores.json") {
    this.#filePath = path.resolve(filename);
    this.#loadScores();
  }

  // NOTE I'm converting the players to a simpler list becasue testing the ScoreStore
  // with player class does so much that mocking it is non trivial

  /**
   * @param {{name: string, score: number}[]} players
   * @param {GameMode} gameMode
   * @param {string | null} winnerName
   */
  pushPlayerScores(players, gameMode, winnerName = null) {
    const now = new Date().toISOString();

    players.forEach((player) => {
      const existingIndex = this.#scores.findIndex(
        (record) =>
          record.gameMode === gameMode && record.player === player.name,
      );

      const updatedRecord = {
        player: player.name,
        score: player.score,
        time: now,
        gameMode: gameMode,
        winner: winnerName == player.name,
      };

      if (existingIndex !== -1) {
        this.#scores[existingIndex] = updatedRecord;
      } else {
        this.#scores.push(updatedRecord);
      }
    });

    this.#scores.sort((a, b) => b.score - a.score);

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

    this.broadcastScores();
  }

  setSocket(io) {
    this.#io = io;
  }

  broadcastScores() {
    this.#io?.emit(SocketEvents.UpdateScores, this.#scores);
  }
}

/**
 * @param {import ("./Player.js").default[]} players
 */
export const convertToPlayerScores = (players) =>
  players.map((p) => ({ name: p.name, score: p.score }));
