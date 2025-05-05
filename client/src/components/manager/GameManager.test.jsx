import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  render,
  screen,
  fireEvent,
  cleanup,
  act,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../redux/store.js";
import { GameManager } from "./GameManager.jsx";
import { setIsRoomAdmin, replaceRoom } from "../../redux/roomSlice.js";
import { setIsSocketConnected } from "../../redux/socketSlice.js";
import { GameState, SocketEvents } from "../../../../shared/DTOs.js";

vi.mock("../../socket.js", () => {
  return {
    socket: {
      connected: true,
      emit: vi.fn(),
    },
  };
});
import { socket } from "../../socket.js";
import { DefaultGameGridDimensions } from "../../../../shared/Consts.js";
import { initialState } from "../../redux/configSlice.js";

describe("GameManager component", () => {
  beforeEach(() => {
    cleanup();
    store.dispatch({ type: "RESET_ALL" });
    store.dispatch(setIsSocketConnected(true));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithStore = () => {
    return render(
      <Provider store={store}>
        <GameManager />
      </Provider>,
    );
  };

  const mockRoomData = {
    gameState: GameState.Pending,
    playerNames: ["Alice", "Bobby"],
    ownerName: "Alice",
  };

  it("shows 'Game over' when gameState is Ended", () => {
    store.dispatch(
      replaceRoom({ ...mockRoomData, gameState: GameState.Ended }),
    );
    renderWithStore();
    expect(screen.getByText("Game over")).toBeInTheDocument();
  });

  it("shows 'Game in progress' when gameState is Playing", () => {
    store.dispatch(
      replaceRoom({ ...mockRoomData, gameState: GameState.Playing }),
    );
    renderWithStore();
    expect(screen.getByText("Game in progress")).toBeInTheDocument();
  });

  it("shows admin view in Pending state with start button", () => {
    store.dispatch(
      replaceRoom({ ...mockRoomData, gameState: GameState.Pending }),
    );
    store.dispatch(setIsRoomAdmin("Alice"));
    renderWithStore();

    expect(screen.getByText("Launch the game when ready")).toBeInTheDocument();
    const button = screen.getByText("start");
    expect(button).toBeInTheDocument();

    act(() => {
      fireEvent.click(button);
    });
    expect(socket.emit).toHaveBeenCalledWith(
      SocketEvents.StartGame,
      initialState,
    );
  });

  it("shows waiting message in Pending state for non-admin", () => {
    store.dispatch(
      replaceRoom({ ...mockRoomData, gameState: GameState.Pending }),
    );
    store.dispatch(setIsRoomAdmin("Bobby"));
    renderWithStore();

    expect(
      screen.getByText("...waiting for game to start"),
    ).toBeInTheDocument();
  });

  it("shows unknown state message if gameState is wrong", () => {
    store.dispatch(replaceRoom({ ...mockRoomData, gameState: undefined }));
    renderWithStore();
    expect(
      screen.getByText("Room not found, please go back home"),
    ).toBeInTheDocument();
  });

  it("socket connection erroed when connection is not active", () => {
    socket.connected = false;
    store.dispatch(setIsSocketConnected(false));
    store.dispatch(replaceRoom({ ...mockRoomData, gameState: undefined }));
    renderWithStore();
    expect(
      screen.getByText("Room not found, please go back home"),
    ).toBeInTheDocument();
  });
});
