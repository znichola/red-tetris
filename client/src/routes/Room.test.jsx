import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, cleanup, act } from "@testing-library/react";
import { Provider } from "react-redux";
import { Room } from "./Room.jsx";
import { store } from "../redux/store.js";

import { socket } from "../socket.js";
import { GameState, SocketEvents } from "../../../shared/DTOs.js";

vi.mock("../components/board/Board.jsx", () => ({
  Board: ({ player, room }) => (
    <div data-testid="board">
      Board for {player} in {room}
    </div>
  ),
}));
vi.mock("../components/manager/GameManager.jsx", () => ({
  GameManager: () => <div data-testid="game-manager">GameManager</div>,
}));
vi.mock("../components/spectra/Spectra.jsx", () => ({
  SpectraOverview: () => <div data-testid="spectra">SpectraOverview</div>,
}));
vi.mock("../components/debug/Debug.jsx", () => ({
  Debug: () => <div data-testid="debug">Debug</div>,
}));

// Mock socket module
vi.mock("../socket.js", () => {
  const listeners = {};
  return {
    socket: {
      auth: {},
      on: vi.fn((event, cb) => {
        listeners[event] = cb;
      }),
      off: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
      listeners: listeners,
    },
  };
});

describe("Room component with real Redux store", () => {
  beforeEach(() => {
    cleanup();
    store.dispatch({ type: "RESET_ALL" });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders Room and sets socket auth", async () => {
    const params = { player: "Alice", room: "foobar" };

    await act(async () => {
      render(
        <Provider store={store}>
          <Room params={params} />
        </Provider>,
      );
    });

    expect(screen.getByTestId("board")).toHaveTextContent(
      "Board for Alice in foobar",
    );
    expect(screen.getByTestId("game-manager")).toBeInTheDocument();
    expect(screen.getByTestId("spectra")).toBeInTheDocument();
    expect(screen.getByTestId("debug")).toBeInTheDocument();

    expect(socket.auth).toEqual({ playerName: "Alice", roomName: "foobar" });
    expect(socket.connect).toHaveBeenCalled();
    expect(socket.on).toHaveBeenCalledWith(
      SocketEvents.UpdateRoomData,
      expect.any(Function),
    );
    expect(socket.on).toHaveBeenCalledWith(
      SocketEvents.UpdateGameData,
      expect.any(Function),
    );
  });

  it("updates Redux store when socket emits UpdateRoomData", async () => {
    const params = { player: "Bob", room: "foobar" };

    const mockRoomData = {
      gameState: GameState.Playing,
      ownerName: "Bob",
      playerNames: ["Bob", "Alice"],
    };

    await act(async () => {
      render(
        <Provider store={store}>
          <Room params={params} />
        </Provider>,
      );
    });

    // Simulate server pushing room data via socket
    const listener = socket.listeners[SocketEvents.UpdateRoomData];
    expect(listener).toBeDefined();

    act(() => {
      listener(mockRoomData);
    });

    const state = store.getState();

    expect(state.room.data.ownerName).toBe("Bob");
    expect(state.room.data.gameState).toBe(GameState.Playing);
    expect(state.room.data.playerNames).toEqual(["Bob", "Alice"]);
    expect(state.room.isRoomAdmin).toBe(true);
  });

  it("updates Redux store when socket emits UpdateGameData", async () => {
    const params = { player: "Carol", room: "foobar" };

    const mockGameData = {
      grid: [
        [1, 0, 0],
        [0, 2, 0],
        [0, 0, 3],
      ],
      playerNameToSpectrum: {
        Carol: [0, 1, 0],
        Alice: [2, 2, 2],
      },
    };

    await act(async () => {
      render(
        <Provider store={store}>
          <Room params={params} />
        </Provider>,
      );
    });

    const listener = socket.listeners?.[SocketEvents.UpdateGameData];
    expect(listener).toBeDefined();

    act(() => {
      listener(mockGameData);
    });

    const state = store.getState();

    expect(state.game.grid).toEqual(mockGameData.grid);
    expect(state.game.playerNameToSpectrum).toEqual({
      Carol: [0, 1, 0],
      Alice: [2, 2, 2],
    });
  });
});
