import { Board } from "../components/board/Board.jsx";
import { Debug } from "../components/debug/Debug.jsx";
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
      <Board player={params.player} room={params.room} />
      <GameState />
      <SpectraOverview allPlayers={mockAllPlayers} />
      <Debug />
    </div>
  );
}

export { Room };
