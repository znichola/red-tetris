import "./spectra.css";
import { useSelector } from "react-redux";
import { selectGame } from "../../redux/gameSlice.js";

/**
 * @typedef {import("../../../../shared/DTOs.js").Spectrum} Spectrum
 */

/**
 * @returns {React.JSX.Element}
 */
function SpectraOverview() {
  const playerNameToSpectrum = useSelector(selectGame).playerNameToSpectrum;
  const playerNames = Object.keys(playerNameToSpectrum);
  const numRows = useSelector(selectGame).grid.length;
  return (
    <div className="standard-dialog thing">
      <div className="title-bar">
        <h1 className="title">spectra</h1>
      </div>
      <div className="spectra-overview">
        {playerNames.map((playerName) => (
          <PlayerView
            key={playerName}
            playerName={playerName}
            spectrum={playerNameToSpectrum[playerName]}
            numRows={numRows}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {string} props.playerName
 * @param {Spectrum} props.spectrum
 * @param {number} props.numRows
 * @returns {React.JSX.Element}
 */
function PlayerView({ playerName, spectrum, numRows }) {
  return (
    <div className="spectra-view">
      <SpectraView spectrum={spectrum} numRows={numRows} />
      <div>{playerName}</div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Spectrum} props.spectrum
 * @param {number} props.numRows
 * @returns {React.JSX.Element}
 */
function SpectraView({ spectrum, numRows }) {
  return (
    <div className="grid grid-narrow">
      {[...Array(numRows).keys()].reverse().map((lineNum) => (
        <div key={lineNum} className="line grid-narrow">
          {spectrum.map((heightVal, i) => (
            <div
              key={i}
              className={`cell ${lineNum >= heightVal ? "spectra-empty" : "spectra-filled"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export { SpectraOverview };
