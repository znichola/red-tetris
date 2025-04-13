import React from "react";
import { CellTypes } from "../../../shared/TetrisConsts.js";
import "./cell.css";

/**
 *
 * @param {Object} props
 * @param {CellTypes} props.tet_color
 * @param {string} props.id
 * @returns {React.JSX.Element}
 */
function Cell({ tet_color, id }) {
  /**
   *
   * @param {CellTypes} cellType
   * @returns {string} - color variable from index.css
   */
  const getColor = (cellType) => {
    var color = "--tet-color-";
    if (cellType == CellTypes.I) color += "i";
    else if (cellType == CellTypes.J) color += "j";
    else if (cellType == CellTypes.L) color += "l";
    else if (cellType == CellTypes.O) color += "o";
    else if (cellType == CellTypes.S) color += "s";
    else if (cellType == CellTypes.T) color += "t";
    else if (cellType == CellTypes.Z) color += "z";
    else if (cellType == CellTypes.None) color += "none";
    else color = "--white";

    return color;
  };
  return (
    <div
      id={id}
      className="cell"
      style={{ backgroundColor: `var(${getColor(tet_color)})` }}
    ></div>
  );
}

export { Cell };
