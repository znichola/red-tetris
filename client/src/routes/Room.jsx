import { useEffect } from "react";
import { Board } from "../components/board/Board.jsx";
import { Debug } from "../components/debug/Debug.jsx";
import { GameManager } from "../components/manager/GameManager.jsx";
import { mockAllPlayers } from "../components/spectra/mockAllPlayers.js";
import { SpectraOverview } from "../components/spectra/Spectra.jsx";
import "./room.css";
import { socket } from "../socket.js";
import { SocketEvents } from "../../../shared/DTOs.js";
import { useDispatch } from "react-redux";
import { replaceRoom, setIsRoomAdmin } from "../redux/roomSlice.js";
import { setIsSocketConnected } from "../redux/socketSlice.js";
import { replaceGrid } from "../redux/gameSlice.js";

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
      console.log("UPDATE ROOM DATA:", data);
    };

    const onUpdateGameData = (/** @type {{ grid: number[][]; }} */ data) => {
      dispatch(replaceGrid(data.grid))
    };

    socket.on(SocketEvents.UpdateRoomData, onUpdateRoomData);
    socket.on(SocketEvents.UpdateGameData, onUpdateGameData);

    socket.connect();
    dispatch(setIsSocketConnected(true));

    console.log("RUNNING USEEFFECT TO CONNECT");

    return () => {
      console.log("Disconnecting from room");
      socket.off(SocketEvents.UpdateRoomData, onUpdateRoomData);
      socket.disconnect();
      dispatch(setIsSocketConnected(false));
    };
  }, [params, dispatch]);

  return (
    <div className="layout">
      <Board player={params.player} room={params.room} />
      <GameManager />
      <SpectraOverview allPlayers={mockAllPlayers} />
      <Debug />
    </div>
  );
}

export { Room };
