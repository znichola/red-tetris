import React from "react";
import { CellType } from "../../../../shared/TetrisConsts.js";
import "./board.css";
import {
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigUp,
  Space,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useKeyPress } from "../../hooks/useKeyPress.js";

/**
 * @param {Object} props
 * @param {CellType[][]} props.grid
 * @param {string} props.room
 * @param {string} props.player
 * @returns {React.JSX.Element}
 */
function Board({ room, player, grid }) {
  return (
    <div className="standard-dialog thing">
      <div className="title-bar">
        <h1 className="title">
          {room}/{player}
        </h1>
      </div>
      <Grid grid={grid} />
    </div>
  );
}

/**
 * @param {Object} props
 * @param {CellType[][]} props.grid
 * @returns {React.JSX.Element}
 */
function Grid({ grid }) {
  return (
    <>
      <div className="grid">
        {grid.map((line, i) => (
          <div key={`${i}`} className="line">
            {line.map((cell, ii) => (
              <Cell key={`${ii}`} tet_color={cell} />
            ))}
          </div>
        ))}
      </div>
      <div className="keypad-buffer">
        <Keypad />
      </div>
    </>
  );
}

/**
 * @param {Object} props
 * @param {CellType} props.tet_color
 * @returns {React.JSX.Element}
 */
function Cell({ tet_color }) {
  /**
   * @param {CellType} cellType
   * @returns {string} - color variable from index.css
   */
  const getColor = (cellType) => {
    var color = "--tet-color-";
    if (cellType == CellType.I) color += "i";
    else if (cellType == CellType.J) color += "j";
    else if (cellType == CellType.L) color += "l";
    else if (cellType == CellType.O) color += "o";
    else if (cellType == CellType.S) color += "s";
    else if (cellType == CellType.T) color += "t";
    else if (cellType == CellType.Z) color += "z";
    else if (cellType == CellType.Empty) color += "empty";
    else color = "--white";

    return color;
  };
  return (
    <div
      className="cell"
      style={{ backgroundColor: `var(${getColor(tet_color)})` }}
    ></div>
  );
}

function Keypad() {
  return (
    <div className="keypad-line">
      <Button
        className="space"
        icon={Space}
        shortcutKeyCodes={["Space"]}
        onClick={() => console.log("space")}
      />
      <Button
        className="up"
        icon={ArrowBigUp}
        shortcutKeyCodes={["ArrowUp", "KeyW"]}
        onClick={() => console.log("up")}
      />
      <Button
        className="left"
        icon={ArrowBigLeft}
        shortcutKeyCodes={["ArrowLeft", "KeyA"]}
        onClick={() => console.log("left")}
      />
      <Button
        className="down"
        icon={ArrowBigDown}
        shortcutKeyCodes={["ArrowDown", "KeyS"]}
        onClick={() => console.log("down")}
      />
      <Button
        className="right"
        icon={ArrowBigRight}
        shortcutKeyCodes={["ArrowRight", "KeyD"]}
        onClick={() => console.log("right")}
      />
    </div>
  );
}

/**
 * @param {Object} props
 * @param {import("lucide-react").LucideIcon} props.icon
 * @param {() => void} props.onClick
 * @param {string=} props.className
 * @param {string[]=} props.shortcutKeyCodes
 * @returns {React.JSX.Element}
 */
function Button({ icon, className, shortcutKeyCodes = [], onClick }) {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    if (keyPressed == false) return;
    const timer = setTimeout(() => {
      setKeyPressed(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [keyPressed]);

  const handleClick = () => {
    if (keyPressed == false) {
      setKeyPressed(true);
      onClick();
    }
  };

  useKeyPress(shortcutKeyCodes, handleClick);

  const Icon = icon;
  return (
    <button
      type="button"
      aria-label={shortcutKeyCodes[0] || ""}
      className={`btn move-btn ${className || ""} ${keyPressed ? "pressed" : ""}`}
      onClick={handleClick}
    >
      <Icon size={35} strokeWidth={2} />
    </button>
  );
}

export { Board, Keypad };
