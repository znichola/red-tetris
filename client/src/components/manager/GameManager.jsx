import { useSelector } from "react-redux";
import { Link } from "../../router/Router.jsx";
import "./game_manager.css";
import { selectSocket } from "../../redux/socketSlice.js";
import { selectRoom } from "../../redux/roomSlice.js";
import { socket } from "../../socket.js";
import {
  GameState,
  PowerUpCellType,
  SocketEvents,
} from "../../../../shared/DTOs.js";
import { selectGame } from "../../redux/gameSlice.js";
import { useState } from "react";
import {
  DefaultGameGridDimensions,
  MaxGameGridDimensions,
  MinGameGridDimensions,
} from "../../../../shared/Consts.js";

function GameManager() {
  const socketState = useSelector(selectSocket);
  const score = useSelector(selectGame).score;

  /**@type {GameState} */
  const roomState = useSelector(selectRoom).data?.gameState;

  return (
    <div className="standard-dialog thing">
      <div className="title-bar">
        <h1 className="title">
          game managment
          <div
            className={`status-circle ${socketState.isConnected ? "green-circle" : "red-circle"}`}
            data-tooltip={`Socket connection ${socketState.isConnected ? "is good" : "errored"}`}
          />
        </h1>
      </div>
      <div className="dialog-body">
        {roomState == GameState.Ended ? (
          <GameOver />
        ) : roomState == GameState.Playing ? (
          <>
            <div> Game in progress </div>
            <div>
              Score : <strong>{score}</strong>
            </div>
          </>
        ) : roomState == GameState.Pending ? (
          <Pending />
        ) : (
          <div>Room not found, please go back home</div>
        )}
        <PlayersInLobby />
        <div>
          leave? click to return <Link to="/">home</Link>
        </div>
      </div>
    </div>
  );
}

function Pending() {
  const isRoomAdmin = useSelector(selectRoom).isRoomAdmin;
  const [gridDimensions, setGridDimensions] = useState({
    x: DefaultGameGridDimensions.x,
    y: DefaultGameGridDimensions.y,
  });

  const handleGridSizeChange = (e) => {
    const { name, value } = e.target;
    setGridDimensions((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const launchGame = () => {
    if (socket.connected) {
      /** @type {import("../../../../shared/DTOs.js").GameSettings} */
      const gameSettings = {
        gridDimensions,
        //TODO: add powerup selection to the UI
        enabledPowerUps: Object.values(PowerUpCellType),
      };
      socket.emit(SocketEvents.StartGame, gameSettings);
    }
  };

  return (
    <>
      {isRoomAdmin ? (
        <div>
          Launch the game when ready{" "}
          <button className="btn" onClick={launchGame}>
            start
          </button>
          <div>
            <label htmlFor="gridDimensionX">Grid X:</label>
            <input
              type="range"
              id="gridDimensionX"
              name="x"
              value={gridDimensions.x}
              onChange={handleGridSizeChange}
              min={MinGameGridDimensions.x}
              max={MaxGameGridDimensions.x}
            />
            <br />
            <output>{gridDimensions.x}</output>
            <br />

            <label htmlFor="gridDimensionY">Grid Y:</label>
            <input
              type="range"
              id="gridDimensionY"
              name="y"
              value={gridDimensions.y}
              onChange={handleGridSizeChange}
              min={MinGameGridDimensions.y}
              max={MaxGameGridDimensions.y}
            />
            <br />
            <output>{gridDimensions.y}</output>
          </div>
        </div>
      ) : (
        <div>...waiting for game to start</div>
      )}
    </>
  );
}

function GameOver() {
  const isRoomAdmin = useSelector(selectRoom).isRoomAdmin;

  const launchGame = () => {
    if (socket.connected) {
      socket.emit(SocketEvents.StartGame);
    }
  };
  return (
    <>
      {isRoomAdmin ? (
        <div>
          Game over, relaunch when ready{" "}
          <button className="btn" onClick={launchGame}>
            start
          </button>
        </div>
      ) : (
        <div>Game over</div>
      )}
    </>
  );
}

function PlayersInLobby() {
  const players = useSelector(selectRoom).data?.playerNames || [];
  return (
    <div>
      <strong>Players in lobby:</strong>{" "}
      {players.reduce(
        (prev, player) => `${prev}${prev == "" ? "" : ", "} ${player}`,
        "",
      )}
    </div>
  );
}

export { GameManager };
