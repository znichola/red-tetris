import { CellTypes as CT } from "../../../shared/TetrisConsts.js";
import { Board } from "../components/board/Board.jsx";
import { GameState } from "../components/game_state/GameState.jsx";
import { SpectraOverview } from "../components/spectra/Spectra.jsx";
import "./room.css";

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

const allPlayers = [
  {
    player: "Alice",
    spectra: [9, 2, 1, 0, 0, 3, 2, 5, 8, 3],
  },
  {
    player: "Bobby",
    spectra: [0, 1, 3, 0, 4, 5, 6, 3, 3, 0],
  },
  {
    player: "Celina",
    spectra: [3, 4, 1, 0, 2, 3, 4, 0, 0, 0],
  },
];

/**
 *
 * @param {Object} props
 * @param {Object<string, string>} props.params
 * @returns {React.JSX.Element}
 */
function Room({ params }) {
  return (
    <div className="layout">
      <Board grid={grid} player={params.player} room={params.room} />
      <GameState />
      <SpectraOverview allPlayers={allPlayers} />
    </div>
  );
}

export { Room };
