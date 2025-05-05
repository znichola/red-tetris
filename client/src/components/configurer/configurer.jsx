import { useDispatch, useSelector } from "react-redux";
import {
  selectGameConfig,
  setGridX,
  setGridY,
  setHeavy,
  setRuleset,
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

/**
 * @param {Object} params
 * @param {import("../../../../shared/DTOs.js").GameConfigClient} params.config
 */
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
          value={config.gridDimensions.x}
          onChange={(e) => dispatch(setGridX(Number(e.target.value)))}
        />
        <output>{config.gridDimensions.x}</output>
      </div>
      <div className="field-row">
        <label htmlFor="gridY">Y:</label>
        <input
          type="range"
          id="gridY"
          min={MinGameGridDimensions.y}
          max={MaxGameGridDimensions.y}
          value={config.gridDimensions.y}
          onChange={(e) => dispatch(setGridY(Number(e.target.value)))}
        />
        <output>{config.gridDimensions.y}</output>
      </div>
    </div>
  );
}

/**
 * @param {Object} params
 * @param {import("../../../../shared/DTOs.js").GameConfigClient} params.config
 */
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
          checked={config.ruleset === "classic"}
          onChange={() => dispatch(setRuleset("classic"))}
        />
        <label htmlFor="classic">Classic</label>
      </div>
      <div className="field-row">
        <input
          id="invisible"
          type="radio"
          name="invisible"
          checked={config.ruleset === "invisible"}
          onChange={() => dispatch(setRuleset("invisible"))}
        />
        <label htmlFor="invisible">Invisible</label>
      </div>
      <div className="field-row">
        <input
          id="powerup"
          type="radio"
          name="powerup"
          checked={config.ruleset === "powerup"}
          onChange={() => dispatch(setRuleset("powerup"))}
        />
        <label htmlFor="powerup">Powerup</label>
      </div>
    </div>
  );
}

export default Configurer;
