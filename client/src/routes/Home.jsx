import React, { useState } from "react";
import { navigate } from "../router/navigate.js";
import { Scoreboard } from "../components/scoreboard/Scoreboard.jsx";

function Home() {
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState("");

  return (
    <div className="layout">
      <div className="standard-dialog">
        <div className="title-bar">
          <h1 className="title">start game</h1>
        </div>
        <section className="field-row">
          <p
            className="dialog-text"
            style={{
              maxWidth: "20em",
              fontFamily: "monaco",
              fontSize: "x-large",
            }}
          >
            In 1984, deep behind the iron curtain, Tetris was born. Now it’s
            your turn—enter the grid, align your blocks, and join the legacy of
            the tetromino.
          </p>
        </section>
        <form
          className="modeless-dialog"
          onSubmit={(e) => {
            e.preventDefault();
            navigate(
              `/${encodeURIComponent(roomName)}/${encodeURIComponent(playerName)}`,
            );
          }}
        >
          <section className="field-row">
            <label
              htmlFor="roomName"
              style={{ width: "3em", textAlign: "end" }}
            >
              Room
            </label>
            <input
              style={{ width: "100%" }}
              type="text"
              id="roomName"
              placeholder="room id"
              required
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            ></input>
          </section>
          <section className="field-row">
            <label
              htmlFor="playerName"
              style={{ width: "3em", textAlign: "end" }}
            >
              As
            </label>
            <input
              style={{ width: "100%" }}
              type="text"
              id="playerName"
              placeholder="your name"
              required
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
            ></input>
          </section>
          <section className="field-row" style={{ justifyContent: "flex-end" }}>
            <button className="btn" type="submit">
              Join room
            </button>
          </section>
        </form>
      </div>
      <Scoreboard />
    </div>
  );
}

export { Home };
