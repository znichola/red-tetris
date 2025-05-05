import { useSelector } from "react-redux";
import { Link } from "../../router/Router.jsx";
import "./game_manager.css";
import { selectSocket } from "../../redux/socketSlice.js";
import { selectRoom } from "../../redux/roomSlice.js";
import { socket } from "../../socket.js";
import { GameState, SocketEvents } from "../../../../shared/DTOs.js";
import { selectGame } from "../../redux/gameSlice.js";
import Configurer from "../configurer/configurer.jsx";
import { selectGameConfig } from "../../redux/configSlice.js";

function GameManager() {
  const socketState = useSelector(selectSocket);
  const score = useSelector(selectGame).score;

  /** @type {GameState | undefined} */
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
          <GameStarter
            startMessage="Game over, restart when ready"
            waitingMessage="Game over, waiting for the game to be restarted"
          />
        ) : roomState == GameState.Playing ? (
          <>
            <div> Game in progress </div>
            <div>
              Score : <strong>{score}</strong>
            </div>
          </>
        ) : roomState == GameState.Pending ? (
          <GameStarter
            startMessage="Start the game when ready"
            waitingMessage="Waiting for the game to be started"
          />
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

function GameStarter({ startMessage, waitingMessage }) {
  const isRoomAdmin = useSelector(selectRoom).isRoomAdmin;
  const gameConfig = useSelector(selectGameConfig);

  const startGame = () => {
    if (socket.connected) {
      socket.emit(SocketEvents.StartGame, gameConfig);
    }
  };

  return (
    <>
      {isRoomAdmin ? (
        <div>
          {startMessage}{" "}
          <button className="btn" onClick={startGame}>
            start
          </button>
          <Configurer />
        </div>
      ) : (
        <div>{waitingMessage}</div>
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
