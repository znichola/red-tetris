import { CellTypes as CT } from "../../../shared/TetrisConsts.js";
import { Board } from "../components/board/Board.jsx";
import { Link } from "../router/Router.jsx";

// prettier-ignore
const grid = [
  [CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None],
  [CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None],
  [CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None],
  [CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None],
  [CT.None, CT.None, CT.None, CT.None, CT.I,    CT.I,    CT.I,    CT.I,    CT.None, CT.None],
  [CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None],
  [CT.None, CT.None, CT.O,    CT.O,    CT.None, CT.None, CT.None, CT.None, CT.None, CT.None],
  [CT.None, CT.None, CT.O,    CT.O,    CT.None, CT.None, CT.None, CT.None, CT.None, CT.None],
  [CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.T,    CT.None, CT.None, CT.None],
  [CT.None, CT.None, CT.None, CT.None, CT.None, CT.T,    CT.T   , CT.T   , CT.None, CT.None],
  [CT.None, CT.None, CT.Z,    CT.Z,    CT.None, CT.None, CT.O,    CT.O,    CT.None, CT.None],
  [CT.None, CT.None, CT.None, CT.Z,    CT.Z   , CT.None, CT.O,    CT.O,    CT.None, CT.None],
  [CT.None, CT.None, CT.None, CT.None, CT.J,    CT.None, CT.None, CT.None, CT.None, CT.None],
  [CT.None, CT.None, CT.None, CT.None, CT.J,    CT.None, CT.None, CT.None, CT.L   , CT.None],
  [CT.None, CT.None, CT.None, CT.J   , CT.J   , CT.None, CT.None, CT.None, CT.L,    CT.None],
  [CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.L,    CT.L],
  [CT.I   , CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.I],
  [CT.I,    CT.T   , CT.None, CT.None, CT.None, CT.S   , CT.S   , CT.None, CT.None, CT.I],
  [CT.I,    CT.T   , CT.T   , CT.None, CT.S   , CT.S   , CT.None, CT.None, CT.None, CT.I],
  [CT.I,    CT.T   , CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.I],
];

/**
 *
 * @param {Object} props
 * @param {Object<string, string>} props.params
 * @returns {React.JSX.Element}
 */
function Room({ params }) {
  return (
    <div>
      <Link to="/">home</Link>
      <div className="standard-dialog thing">
        <div className="title-bar">
          <h1 className="title">
            {params.room}/{params.player}
          </h1>
        </div>
        <Board grid={grid} />
      </div>
    </div>
  );
}

export { Room };
