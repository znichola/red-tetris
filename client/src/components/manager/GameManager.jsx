import { useSelector } from "react-redux";
import { Link } from "../../router/Router.jsx";
import "./game_manager.css";
import { selectSocket } from "../../redux/socketSlice.js";
import { selectRoom } from "../../redux/roomSlice.js";
import { socket } from "../../socket.js";
import { GameState, SocketEvents } from "../../../../shared/DTOs.js";

function GameManager() {
  const socketState = useSelector(selectSocket);

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
          <div>Game over</div>
        ) : roomState == GameState.Playing ? (
          <div>Game in progress</div>
        ) : roomState == GameState.Pending ? (
          <Pending />
        ) : (
          <div>Unknown room state</div>
        )}
        <div>
          leave? click to return <Link to="/">home</Link>
        </div>
      </div>
    </div>
  );
}

function Pending() {
  const isRoomAdmin = useSelector(selectRoom).isRoomAdmin;

  const launchGame = () => {
    if (socket.active) {
      socket.emit(SocketEvents.StartGame);
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
        </div>
      ) : (
        <div>...waiting for game to start</div>
      )}
    </>
  );
}

export { GameManager };
