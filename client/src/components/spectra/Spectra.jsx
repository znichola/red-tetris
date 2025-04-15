import { Palette } from "lucide-react";
import "./spectra.css";

/**
 * @typedef {number[]} Spectra
 *
 * @typedef {{
 *     player: string;
 *     spectra: Spectra;
 * }} PlayerInfo
 */

/**
 * @param {Object} props
 * @param {PlayerInfo[]} props.allPlayers
 * @returns {React.JSX.Element}
 */
function SpectraOverview({ allPlayers }) {
  return (
    <div className="standard-dialog thing">
      <div className="title-bar">
        <h1 className="title">spectra</h1>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
        {allPlayers.map((p) => (
          <PlayerView key={p.player} playerInfo={p} />
        ))}
      </div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {PlayerInfo} props.playerInfo
 * @returns {React.JSX.Element}
 */
function PlayerView({ playerInfo }) {
  return (
    <div>
      {playerInfo.player}'s info
      <SpectraView spectra={playerInfo.spectra} />
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Spectra} props.spectra
 * @returns
 */
function SpectraView({ spectra }) {
  return <div>{spectra.toString()}</div>;
}

export { SpectraOverview };
