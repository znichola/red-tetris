import React from "react";
import { CellTypes } from "../../../../shared/TetrisConsts.js";
import "./board.css";
import {
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  ArrowBigUp,
  Key,
  Space,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";

/**
 *
 * @param {Object} params
 * @param {CellTypes[][]} params.grid
 * @returns {React.JSX.Element}
 */
function Board({ grid }) {
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
 *
 * @param {Object} props
 * @param {CellTypes} props.tet_color
 * @returns {React.JSX.Element}
 */
function Cell({ tet_color }) {
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
      className="cell"
      style={{ backgroundColor: `var(${getColor(tet_color)})` }}
    ></div>
  );
}

function Keypad() {
  return (
    <div className="keypad-line">
      <Button
        className="up"
        icon={ArrowBigUp}
        shortcutKeyCodes={["ArrowUp", "KeyW"]}
        onClick={() => console.log("up")}
      />
      <Button
        className="down"
        icon={ArrowBigDown}
        shortcutKeyCodes={["ArrowDown", "KeyS"]}
        onClick={() => console.log("down")}
      />
      <Button
        className="left"
        icon={ArrowBigLeft}
        shortcutKeyCodes={["ArrowLeft", "KeyA"]}
        onClick={() => console.log("left")}
      />
      <Button
        className="right"
        icon={ArrowBigRight}
        shortcutKeyCodes={["ArrowRight", "KeyD"]}
        onClick={() => console.log("right")}
      />
      <Button
        className="space"
        icon={Space}
        shortcutKeyCodes={["Space"]}
        onClick={() => console.log("space")}
      />
    </div>
  );
}

/**
 *
 * @param {Object} props
 * @param {import("lucide-react").LucideIcon} props.icon
 * @param {() => void} props.onClick
 * @param {string=} props.className
 * @param {string[]=} props.shortcutKeyCodes
 * @returns {React.JSX.Element}
 */
function Button({ icon, className, shortcutKeyCodes = [], onClick }) {
  const [keyPressed, setKeyPressed] = useState(false);

  const handlePress = useCallback(
    (/** @type {boolean} */ keyPressed) => {
      if (!keyPressed) {
        onClick();
        setKeyPressed(true);
        setTimeout(() => {
          setKeyPressed(false);
        }, 200);
      }
    },
    [onClick],
  );

  useEffect(() => {
    if (!shortcutKeyCodes || shortcutKeyCodes.length <= 0) return;

    const handleKeyDown = (/** @type {KeyboardEvent} */ e) => {
      // TODO : extract this out such that only one callback function
      // is registered, feels betterm but requiers setting up radix/context
      shortcutKeyCodes.map((keyCode) => {
        if (e.code === keyCode) {
          e.preventDefault();
          handlePress(keyPressed);
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // We don't want the keyPressed to be a dep becasuse we don't want to
    //  re-register functions on each keypress
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shortcutKeyCodes, handlePress]);

  const Icon = icon;
  return (
    <button
      type="button"
      aria-label={shortcutKeyCodes[0] || ""}
      className={`btn move-btn ${className || ""} ${keyPressed ? "pressed" : ""}`}
      onClick={() => handlePress(keyPressed)}
    >
      <Icon size={35} strokeWidth={2} />
    </button>
  );
}

export { Board };
