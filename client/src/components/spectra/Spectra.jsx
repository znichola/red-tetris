import "./spectra.css";
import { useSelector } from "react-redux";
import { convertSpectaToArray, selectGame } from "../../redux/gameSlice.js";
import ClipText from "../cliptext/ClipText.jsx";

/**
 * @typedef {import("../../../../shared/DTOs.js").Spectrum} Spectrum
 *
 * @typedef {ReturnType<convertSpectaToArray>[0]} PlayerInfo
 */
/**
 * @returns {React.JSX.Element}
 */
function SpectraOverview() {
  const allPlayers = convertSpectaToArray(
    useSelector(selectGame).playerNameToSpectrum,
  );
  const numRows = useSelector(selectGame).grid.length;

  const chunks = [];
  let max = 6;
  for (let i = 0; i < allPlayers.length; i += max) {
    if (i >= 6) {
      max = 9;
    }
    chunks.push(allPlayers.slice(i, i + max));
  }

  return (
    <>
      {chunks.map((players, i) => (
        <SingleSpectraOverview
          key={i}
          index={i}
          allPlayers={players}
          numRows={numRows}
        />
      ))}
    </>
  );
}

/**
 * @param {Object} props
 * @param {PlayerInfo[]} props.allPlayers
 * @param {number} props.numRows
 * @param {number} props.index
 * @returns {React.JSX.Element}
 */
function SingleSpectraOverview({ allPlayers, numRows, index }) {
  return (
    <div className="standard-dialog thing">
      <div className="title-bar">
        <h1 className="title">{`spectra ${index > 0 ? index : ""}`}</h1>
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
      <ClipText text={playerInfo.player} maxWidth="8em" />
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Spectrum} props.spectra
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
