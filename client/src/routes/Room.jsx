import { Board } from "../components/board/Board.jsx";
import { mockGrid } from "../components/board/mockGrid.js";
import { GameState } from "../components/game_state/GameState.jsx";
import { mockAllPlayers } from "../components/spectra/mockAllPlayers.js";
import { SpectraOverview } from "../components/spectra/Spectra.jsx";
import "./room.css";

/**
 * @param {Object} props
 * @param {Object<string, string>} props.params
 * @returns {React.JSX.Element}
 */
function Room({ params }) {
  return (
    <div className="layout">
      <Board grid={mockGrid} player={params.player} room={params.room} />
      <GameState />
      <SpectraOverview allPlayers={mockAllPlayers} />
    </div>
  );
}

export { Room };
