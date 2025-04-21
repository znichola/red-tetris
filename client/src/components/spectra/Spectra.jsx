import "./spectra.css";
import { useSelector } from "react-redux";
import { selectGame } from "../../redux/gameSlice.js";

/**@typedef {import("../../redux/gameSlice.js").Spectra} Spectra*/
/**@typedef {import("../../redux/gameSlice.js").PlayerInfo} PlayerInfo */

/**
 * @returns {React.JSX.Element}
 */
function SpectraOverview() {
  const allPlayers = useSelector(selectGame).playerInfo;
  const numRows = useSelector(selectGame).grid.length;
  return (
    <div className="standard-dialog thing">
      <div className="title-bar">
        <h1 className="title">spectra</h1>
      </div>
      <div className="spectra-overview">
        {allPlayers.map((p) => (
          <PlayerView key={p.player} playerInfo={p} numRows={numRows} />
        ))}
      </div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {PlayerInfo} props.playerInfo
 * @param {number} props.numRows
 * @returns {React.JSX.Element}
 */
function PlayerView({ playerInfo, numRows }) {
  return (
    <div className="spectra-view">
      <SpectraView spectra={playerInfo.spectra} numRows={numRows} />
      <div>{playerInfo.player}</div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Spectra} props.spectra
 * @param {number} props.numRows
 * @returns {React.JSX.Element}
 */
function SpectraView({ spectra, numRows }) {
  return (
    <div className="grid grid-narrow">
      {[...Array(numRows).keys()].reverse().map((lineNum) => (
        <div key={lineNum} className="line grid-narrow">
          {spectra.map((hightVal, i) => (
            <div
              key={i}
              className={`cell ${lineNum >= hightVal ? "spectra-empty" : "spectra-filled"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export { SpectraOverview };
