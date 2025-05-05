import { useEffect } from "react";
import { Board } from "../components/board/Board.jsx";
import { Debug } from "../components/debug/Debug.jsx";
import { GameManager } from "../components/manager/GameManager.jsx";
import { SpectraOverview } from "../components/spectra/Spectra.jsx";
import { socket } from "../socket.js";
import { SocketEvents } from "../../../shared/DTOs.js";
import { useDispatch } from "react-redux";
import { replaceRoom, setIsRoomAdmin } from "../redux/roomSlice.js";
import { setIsSocketConnected } from "../redux/socketSlice.js";
import { replaceGameData } from "../redux/gameSlice.js";
import "./room.css";

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
    };

    const onUpdateGameData = (
      /** @type {import("../../../shared/DTOs.js").GameData} */ data,
    ) => {
      dispatch(replaceGameData(data));
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
    };
  }, [params, dispatch]);

  return (
    <div className="layout">
      <Board player={params.player} room={params.room} />
      <GameManager />
      <SpectraOverview />
      {process.env.NODE_ENV === "production" ? <></> : <Debug />}
    </div>
  );
}

export { Room };
