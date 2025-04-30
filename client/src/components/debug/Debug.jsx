import { useDispatch } from "react-redux";
import { replaceGrid } from "../../redux/gameSlice.js";
import { mockGrid } from "../board/mockGrid.js";
import { CellType } from "../../../../shared/DTOs.js";
import { resetAll } from "../../redux/hooks.js";
import { GameGridDimensions } from "../../../../server/TetrisConsts.js";

export function Debug() {
  const dispatch = useDispatch();
  return (
    <div className="standard-dialog thing">
      DEBUG:
      <br />
      <button className="btn" onClick={() => dispatch(replaceGrid(mockGrid))}>
        replaceGrid with mock
      </button>
      <button
        className="btn"
        onClick={() =>
          dispatch(
            replaceGrid(
              Array.from({ length: GameGridDimensions.y }, () =>
                Array.from(
                  { length: GameGridDimensions.x },
                  () => CellType.Empty,
                ),
              ),
            ),
          )
        }
      >
        replaceGrid with empty
      </button>
      <button className="btn" onClick={() => dispatch(resetAll())}>
        reset all redux state
      </button>
    </div>
  );
}
