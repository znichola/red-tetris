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
import { replaceGrid, replaceSpectra } from "../redux/gameSlice.js";
import "./room.css";
import { resetAll } from "../redux/hooks.js";

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
        replaceSpectra(
          data.playerNames
            .filter((n) => n != params.player)
            .map((n) => {
              return { player: n, spectra: Array(10).fill(0) };
            }),
        ),
      );
    };

    const onUpdateGameData = (
      /** @type {import("../../../shared/DTOs.js").GameData} */ data,
    ) => {
      dispatch(replaceGrid(data.grid));
      dispatch(
        replaceSpectra(
          Object.entries(data.playerNameToSpectrum).map((e) => {
            return { player: e[0], spectra: e[1] };
          }),
        ),
      );
    };

    socket.on(SocketEvents.UpdateRoomData, onUpdateRoomData);
    socket.on(SocketEvents.UpdateGameData, onUpdateGameData);

    socket.connect();
    dispatch(setIsSocketConnected(socket.connected));
    return () => {
      socket.off(SocketEvents.UpdateRoomData, onUpdateRoomData);
      socket.off(SocketEvents.UpdateGameData, onUpdateGameData);
      socket.disconnect();
      dispatch(resetAll());
    };
  }, [params, dispatch]);

  return (
    <div className="layout">
      <Board player={params.player} room={params.room} />
      <GameManager />
      <SpectraOverview />
      <Debug />
    </div>
  );
}

export { Room };
