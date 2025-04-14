import React, { useState } from "react";
import { navigate } from "../router/navigate.js";

function Home() {
  const [roomName, setRoomName] = useState("");
  const [playerName, setPlayerName] = useState("");

  return (
    <div>
      join a room to start playing
      <form
        onSubmit={(e) => {
          e.preventDefault();
          navigate(`/${roomName}/${playerName}`);
        }}
      >
        <div>
          <label htmlFor="roomName">Room:</label>
          <input
            type="text"
            id="roomName"
            placeholder="room id"
            required
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          ></input>
        </div>
        <div>
          <label htmlFor="playerName">As:</label>
          <input
            type="text"
            id="playerName"
            placeholder="your name"
            required
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          ></input>
        </div>
        <button type="submit">Join room</button>
      </form>
    </div>
  );
}

export { Home };
