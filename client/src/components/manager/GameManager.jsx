import { useSelector } from "react-redux";
import { Link } from "../../router/Router.jsx";
import "./game_manager.css";
import { selectSocket } from "../../redux/socketSlice.js";

function GameManager() {
  const socketState = useSelector(selectSocket);
  return (
    <div className="standard-dialog thing">
      <div className="title-bar">
        <h1 className="title">game managment</h1>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
        <div>
          socket status{" "}
          <div className={socketState.isConnected ? "green-circle" : "red-circle"}></div>
        </div>
        <div>...waiting for game to start</div>
        <div>
          launch the game <button className="btn">start</button>
        </div>
        <div>
          leave? click to return <Link to="/">home</Link>
        </div>
      </div>
    </div>
  );
}

export { GameManager };
