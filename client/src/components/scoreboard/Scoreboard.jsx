import { useEffect, useState } from "react";
import { socket } from "../../socket.js";
import { SocketEvents } from "../../../../shared/DTOs.js";
import "./scoreboard.css";
import { Trophy, TrophyIcon, XIcon } from "lucide-react";

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
      <table className="scoreboard-table">
        <thead>
          <tr>
            <th>Player</th>
            <th>Score</th>
            <th>Time</th>
            <th style={{ textAlign: "center" }}>Game Mode</th>
          </tr>
        </thead>
        <tbody>
          {scores.map(({ player, score, time, gameMode, winner }, i) => (
            <tr key={i}>
              <td>{player}</td>
              <td className="score">{score}</td>
              <td>{new Date(time).toLocaleString()}</td>
              <td>
                <div className="winner">
                  {winner ? (
                    <Trophy size={16} color="var(--red)" strokeWidth={3} />
                  ) : (
                    <></>
                  )}{" "}
                  {gameMode}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export { Scoreboard };
