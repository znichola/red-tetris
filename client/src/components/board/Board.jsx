import React from "react";
import { ActionType, CellType, SocketEvents } from "../../../../shared/DTOs.js";
import "./board.css";
import { useEffect, useState } from "react";
import { useKeyPress } from "../../hooks/useKeyPress.js";
import { useSelector } from "react-redux";
import { selectGame } from "../../redux/gameSlice.js";
import { socket } from "../../socket.js";
import ClipText from "../cliptext/ClipText.jsx";

/**
 * @param {Object} props
 * @param {string} props.room
 * @param {string} props.player
 * @returns {React.JSX.Element}
 */
function Board({ room, player }) {
  const grid = useSelector(selectGame).grid;
  return (
    <div className="standard-dialog thing">
      <div className="title-bar">
        <h1 className="title" style={{ display: "flex" }}>
          <ClipText text={room} maxWidth="5em" />
          /<ClipText text={player} maxWidth="5em" />
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
    var color = "tet-error";
    if (cellType == CellType.I) color = "tet-i";
    else if (cellType == CellType.J) color = "tet-j";
    else if (cellType == CellType.L) color = "tet-l";
    else if (cellType == CellType.O) color = "tet-o";
    else if (cellType == CellType.S) color = "tet-s";
    else if (cellType == CellType.T) color = "tet-t";
    else if (cellType == CellType.Z) color = "tet-z";
    else if (cellType == CellType.Empty) color = "tet-empty";
    else if (cellType == CellType.Indestructible) color = "tet-indestructible";
    else if (cellType == CellType.Shadow) color = "tet-shadow";
    else if (cellType == CellType.Attack) color = "tet-attack";
    else if (cellType == CellType.Duplication) color = "tet-duplication";
    else if (cellType == CellType.Bomb) color = "tet-bomb";

    return color;
  };
  return <div className={`cell ${getColor(tet_color)}`}></div>;
}

function Keypad() {
  const emitAction = (/** @type {ActionType} */ actionType) => {
    if (socket.connected) {
      socket.emit(SocketEvents.GameAction, actionType);
    }
  };

  return (
    <div className="keypad-line">
      <Button
        className="space"
        icon="⤵️"
        shortcutKeyCodes={["Space"]}
        onClick={() => emitAction(ActionType.HardDrop)}
      />
      <Button
        className="up"
        icon="⬆️"
        shortcutKeyCodes={["ArrowUp", "KeyW"]}
        onClick={() => emitAction(ActionType.Rotate)}
      />
      <Button
        className="left"
        icon="⬅️"
        shortcutKeyCodes={["ArrowLeft", "KeyA"]}
        onClick={() => emitAction(ActionType.MoveLeft)}
      />
      <Button
        className="down"
        icon="⬇️"
        shortcutKeyCodes={["ArrowDown", "KeyS"]}
        onClick={() => emitAction(ActionType.SoftDrop)}
      />
      <Button
        className="right"
        icon="➡️"
        shortcutKeyCodes={["ArrowRight", "KeyD"]}
        onClick={() => emitAction(ActionType.MoveRight)}
      />
    </div>
  );
}

/**
 * @param {Object} props
 * @param {string} props.icon
 * @param {() => void} props.onClick
 * @param {string=} props.className
 * @param {string[]=} props.shortcutKeyCodes
 * @returns {React.JSX.Element}
 */
function Button({ icon, className, shortcutKeyCodes = [], onClick }) {
  const [keyPressed, setKeyPressed] = useState(false);

  useEffect(() => {
    if (keyPressed == false) return;
    const timer = setTimeout(() => setKeyPressed(false), 20);
    return () => clearTimeout(timer);
  }, [keyPressed]);

  const handleClick = () => {
    if (keyPressed == false) {
      setKeyPressed(true);
      onClick();
    }
  };

  useKeyPress(shortcutKeyCodes, handleClick);

  return (
    <button
      type="button"
      aria-label={shortcutKeyCodes[0] || ""}
      className={`btn move-btn ${className || ""} ${keyPressed ? "pressed" : ""}`}
      onClick={handleClick}
    >
      {icon}
    </button>
  );
}

export { Board, Keypad, Grid, Cell };
