import { useDispatch, useSelector } from "react-redux";
import {
  selectGameConfig,
  setGridX,
  setGridY,
  setHeavy,
  setBase,
} from "../../redux/configSlice.js";
import {
  MinGameGridDimensions,
  MaxGameGridDimensions,
} from "../../../../shared/Consts.js";
import "./configurer.css";

function Configurer() {
  const config = useSelector(selectGameConfig);

  return (
    <div className="configure-section">
      <div className="modal-contents">
        <div className="opt-flex">
          <OptsA config={config} />
          <OptsB config={config} />
        </div>
      </div>
    </div>
  );
}

function OptsB({ config }) {
  const dispatch = useDispatch();

  return (
    <div>
      <div className="field-row" style={{ paddingBottom: "0.2em" }}>
        <input
          id="heavy"
          type="checkbox"
          name="heavy"
          checked={config.heavy}
          onChange={(e) => dispatch(setHeavy(e.target.checked))}
        />
        <label htmlFor="heavy">High gravity</label>
      </div>
      <div className="field-row">
        <label htmlFor="gridX">X:</label>
        <input
          type="range"
          id="gridX"
          min={MinGameGridDimensions.x}
          max={MaxGameGridDimensions.x}
          value={config.dim.x}
          onChange={(e) => dispatch(setGridX(Number(e.target.value)))}
        />
        <output>{config.dim.x}</output>
      </div>
      <div className="field-row">
        <label htmlFor="gridY">Y:</label>
        <input
          type="range"
          id="gridY"
          min={MinGameGridDimensions.y}
          max={MaxGameGridDimensions.y}
          value={config.dim.y}
          onChange={(e) => dispatch(setGridY(Number(e.target.value)))}
        />
        <output>{config.dim.y}</output>
      </div>
    </div>
  );
}

function OptsA({ config }) {
  const dispatch = useDispatch();

  return (
    <div>
      <div className="opt-heading">Ruleset</div>
      <div className="field-row">
        <input
          id="classic"
          type="radio"
          name="classic"
          checked={config.base === "classic"}
          onChange={() => dispatch(setBase("classic"))}
        />
        <label htmlFor="classic">Classic</label>
      </div>
      <div className="field-row">
        <input
          id="invisible"
          type="radio"
          name="invisible"
          checked={config.base === "invisible"}
          onChange={() => dispatch(setBase("invisible"))}
        />
        <label htmlFor="invisible">Invisible</label>
      </div>
      <div className="field-row">
        <input
          id="powerup"
          type="radio"
          name="powerup"
          checked={config.base === "powerup"}
          onChange={() => dispatch(setBase("powerup"))}
        />
        <label htmlFor="powerup">Powerup</label>
      </div>
    </div>
  );
}

export default Configurer;
