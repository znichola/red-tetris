import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { Provider } from "react-redux";
import { store } from "../../redux/store.js";
import { SpectraOverview } from "./Spectra.jsx";
import { replaceGameData } from "../../redux/gameSlice.js";
import { mockAllPlayers } from "./mockAllPlayers.js";
import { DefaultGameGridDimensions } from "../../../../shared/Consts.js";
import { TetrominoType } from "../../../../shared/DTOs.js";

describe("SpectraOverview component", () => {
  beforeEach(() => {
    cleanup();
    store.dispatch({ type: "RESET_ALL" });
  });

  const mockGrid = Array(DefaultGameGridDimensions.y).fill(
    Array(DefaultGameGridDimensions.x).fill(0),
  );

  const setupSpectra = () => {
    store.dispatch(
      replaceGameData({
        grid: mockGrid,
        score: 0,
        playerNameToSpectrum: mockAllPlayers,
        nextTetromino: TetrominoType.I,
      }),
    );
  };

  const renderWithStore = () =>
    render(
      <Provider store={store}>
        <SpectraOverview />
      </Provider>,
    );

  it("renders a PlayerView for each player with their name", () => {
    setupSpectra();
    renderWithStore();

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bobby")).toBeInTheDocument();
    expect(screen.getByText("Celina")).toBeInTheDocument();
  });

  it("renders correct spectra dimentions", () => {
    setupSpectra();
    renderWithStore();

    const playerViews = screen.getAllByText(/Alice|Bobby|Celina/);

    playerViews.forEach((view) => {
      const rows = view
        .closest(".spectra-view")
        ?.getElementsByClassName("line");

      if (!(rows instanceof HTMLCollection)) {
        throw new Error("Expected rows to be an HTMLCollection");
      }

      expect(rows.item(0)?.getElementsByClassName("cell").length).toBe(
        DefaultGameGridDimensions.x,
      );
    });
  });

  it("applies correct cell for height based on spectra height", () => {
    setupSpectra();
    renderWithStore();

    const alice = screen.getByText("Alice");

    let reconstructedSpectra = Array(DefaultGameGridDimensions.x).fill(0);

    const lines = alice
      .closest(".spectra-view")
      ?.getElementsByClassName("line");

    if (!(lines instanceof HTMLCollection)) {
      throw new Error("Expected lines to be an HTMLCollection");
    }

    for (let rowNum = 0; rowNum < lines.length; rowNum++) {
      const cells = lines.item(rowNum)?.getElementsByClassName("cell");

      if (!(cells instanceof HTMLCollection)) {
        throw new Error("Expected cells to be an HTMLCollection");
      }

      for (let colNum = 0; colNum < cells.length; colNum++) {
        const cell = cells.item(colNum);

        if (cell?.classList.contains("spectra-filled")) {
          reconstructedSpectra[colNum] += 1;
        }
      }
    }

    const mockSpectrum = Object.values(mockAllPlayers)[0];
    expect(mockSpectrum).toEqual(reconstructedSpectra);
  });
});
