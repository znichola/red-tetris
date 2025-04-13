import React from "react";
import { CellTypes } from "../../../shared/TetrisConsts.js";
import "./board.css";
import { Cell } from "./Cell.jsx";

/**
 *
 * @param {Object} params
 * @param {CellTypes[][]} params.grid
 * @returns {React.JSX.Element}
 */
function Board({ grid }) {
  return (
    <div className="grid">
      {grid.map((line, i) => (
        <div id={`${i}`} className="line">
          {line.map((cell, ii) => (
            <Cell id={`${ii}`} tet_color={cell} />
          ))}
        </div>
      ))}
    </div>
  );
}

export { Board };
