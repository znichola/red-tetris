import { useEffect } from "react";
import { Board } from "../components/board/Board.jsx";
import { Debug } from "../components/debug/Debug.jsx";
import { GameManager } from "../components/manager/GameManager.jsx";
import { SpectraOverview } from "../components/spectra/Spectra.jsx";
import { socket } from "../socket.js";
import { CellType, SocketEvents } from "../../../shared/DTOs.js";
import { useDispatch } from "react-redux";
import { replaceRoom, setIsRoomAdmin } from "../redux/roomSlice.js";
import { setIsSocketConnected } from "../redux/socketSlice.js";
import {
  replaceGrid,
  replacePlayerNameToSpectrum,
} from "../redux/gameSlice.js";
import "./room.css";
import { resetAll } from "../redux/hooks.js";
import { GameGridDimensions } from "../../../server/TetrisConsts.js";

/**
 * @param {Object} props
 * @param {Object<string, string>} props.params
 * @returns {React.JSX.Element}
 */
function Room({ params }) {
  const dispatch = useDispatch();
  useEffect(() => {
    socket.auth = {
      roomName: params.room,
      playerName: params.player,
    };

    const onUpdateRoomData = (
      /** @type {import("../../../shared/DTOs.js").RoomData} */ data,
    ) => {
      dispatch(replaceRoom(data));
      dispatch(setIsRoomAdmin(params.player));
      dispatch(
        replacePlayerNameToSpectrum(
          Object.fromEntries(
            data.playerNames
              .filter((n) => n != params.player)
              .map((n) => [
                n,
                Array(GameGridDimensions.x).fill(CellType.Empty),
              ]),
          ),
        ),
      );
    };

    const onUpdateGameData = (
      /** @type {import("../../../shared/DTOs.js").GameData} */ data,
    ) => {
      dispatch(replaceGrid(data.grid));
      dispatch(replacePlayerNameToSpectrum(data.playerNameToSpectrum));
    };

    const onConnectionChange = () => {
      dispatch(setIsSocketConnected(socket.connected));
    };

    socket.on(SocketEvents.UpdateRoomData, onUpdateRoomData);
    socket.on(SocketEvents.UpdateGameData, onUpdateGameData);
    socket.on("connect", onConnectionChange);
    socket.on("disconnect", onConnectionChange);

    socket.connect();

    return () => {
      socket.off(SocketEvents.UpdateRoomData, onUpdateRoomData);
      socket.off(SocketEvents.UpdateGameData, onUpdateGameData);
      socket.off("connect", onConnectionChange);
      socket.off("disconnect", onConnectionChange);
      socket.disconnect();
      dispatch(resetAll());
    };
  }, [params, dispatch]);

  return (
    <div className="layout">
      <Board player={params.player} room={params.room} />
      <GameManager />
      <SpectraOverview />
      {/* TODO : remove */}
      <Debug />
    </div>
  );
}

export { Room };
