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
  return (
    <div className="standard-dialog thing">
      <div className="title-bar">
        <h1 className="title">spectra</h1>
      </div>
      <div className="spectra-overview">
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
    <div className="spectra-view">
      <SpectraView spectra={playerInfo.spectra} />
      <div>{playerInfo.player}</div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Spectra} props.spectra
 * @returns
 */
function SpectraView({ spectra }) {
  return (
    <div className="grid grid-narrow">
      {[...Array(20).keys()].reverse().map((lineNum) => (
        <div key={lineNum} className="line grid-narrow">
          {spectra.map((hightVal, i) => (
            <div
              key={i}
              className="cell"
              style={{
                backgroundColor:
                  lineNum >= hightVal
                    ? "var(--tet-color-empty)"
                    : "var(--grey)",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export { SpectraOverview };
