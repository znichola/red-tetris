import { useEffect, useState } from "react";
import { socket } from "../../socket.js";
import { SocketEvents } from "../../../../shared/DTOs.js";
import "./scoreboard.css";
import { Trophy } from "lucide-react";
import ClipText from "../cliptext/ClipText.jsx";

/**@typedef {import("../../../../shared/DTOs.js").ScoreRecord} ScoreRecord */

const /** @type {ScoreRecord[]} */ initialScores = [];

function Scoreboard() {
  const [scores, setScores] = useState(initialScores);

  useEffect(() => {
    socket.auth = { scoreBoard: "42" };

    /** @param {ScoreRecord[]} data */
    const onUpdateScores = (data) => {
      setScores(data);
    };

    socket.on(SocketEvents.UpdateScores, onUpdateScores);
    socket.connect();

    return () => {
      socket.off(SocketEvents.UpdateScores, onUpdateScores);
      socket.disconnect();
    };
  }, []);

  return (
    <div className="standard-dialog">
      <div className="title-bar">
        <h1 className="title">Hall of Fame</h1>
      </div>
      <div className="scoreboard-table">
        <div className="table-header table-row" id="header">
          <div>Player</div>
          <div>Score</div>
          <div>Date</div>
          <div>Game Mode</div>
        </div>
        {scores.map(({ player, score, time, gameMode, winner }, i) => (
          <div className="table-row" key={i}>
            <ClipText text={player} maxWidth="7em" />
            <div className="score">{score}</div>
            <div>
              {new Intl.DateTimeFormat("en-gb", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }).format(new Date(time))}
            </div>
            <ClipText text={gameMode} className="winner" maxWidth="6em">
              {winner && (
                <Trophy size={16} color="var(--red)" strokeWidth={3} />
              )}
            </ClipText>
          </div>
        ))}
      </div>
    </div>
  );
}

export { Scoreboard };
