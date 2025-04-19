import { useDispatch } from "react-redux";
import { replaceGrid } from "../../redux/gameSlice.js";
import { mockGrid } from "../board/mockGrid.js";
import { CellType } from "../../../../shared/DTOs.js";

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
              Array.from({ length: 20 }, () =>
                Array.from({ length: 10 }, () => CellType.Empty),
              ),
            ),
          )
        }
      >
        replaceGrid with empty
      </button>
    </div>
  );
}
