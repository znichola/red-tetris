import { useDispatch, useSelector } from "react-redux";
import {
  initialState,
  replaceGameData,
  selectGame,
} from "../../redux/gameSlice.js";
import { mockGrid } from "../board/mockGrid.js";
import { resetAll } from "../../redux/hooks.js";
import { mockEvenMorePlayers } from "../spectra/mockAllPlayers.js";

export function Debug() {
  const dispatch = useDispatch();
  const startState = useSelector(selectGame);
  return (
    <div className="standard-dialog thing">
      DEBUG:
      <br />
      <button
        className="btn"
        onClick={() =>
          dispatch(replaceGameData({ ...startState, grid: mockGrid }))
        }
      >
        replaceGrid with mock
      </button>
      <button
        className="btn"
        onClick={() => dispatch(replaceGameData(initialState))}
      >
        reset GameState
      </button>
      <button className="btn" onClick={() => dispatch(resetAll())}>
        reset all redux state
      </button>
      <button
        className="btn"
        onClick={() =>
          dispatch(
            replaceGameData({
              ...startState,
              playerNameToSpectrum: mockEvenMorePlayers,
            }),
          )
        }
      >
        set spectra to full
      </button>
    </div>
  );
}
