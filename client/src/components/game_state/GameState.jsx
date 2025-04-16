import { Link } from "../../router/Router.jsx";

function GameState() {
  return (
    <div className="standard-dialog thing">
      <div className="title-bar">
        <h1 className="title">game status</h1>
      </div>
      leave? click to return <Link to="/">home</Link>
    </div>
  );
}

export { GameState };
