import { CellTypes as CT } from "../../../../shared/TetrisConsts.js";

// prettier-ignore
const mockGrid = [
    [CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None],
    [CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None],
    [CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None],
    [CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None],
    [CT.None, CT.None, CT.None, CT.None, CT.I,    CT.I,    CT.I,    CT.I,    CT.None, CT.None],
    [CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None],
    [CT.None, CT.None, CT.O,    CT.O,    CT.None, CT.None, CT.None, CT.None, CT.None, CT.None],
    [CT.None, CT.None, CT.O,    CT.O,    CT.None, CT.None, CT.None, CT.None, CT.None, CT.None],
    [CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.T,    CT.None, CT.None, CT.None],
    [CT.None, CT.None, CT.None, CT.None, CT.None, CT.T,    CT.T   , CT.T   , CT.None, CT.None],
    [CT.None, CT.None, CT.Z,    CT.Z,    CT.None, CT.None, CT.O,    CT.O,    CT.None, CT.None],
    [CT.None, CT.None, CT.None, CT.Z,    CT.Z   , CT.None, CT.O,    CT.O,    CT.None, CT.None],
    [CT.None, CT.None, CT.None, CT.None, CT.J,    CT.None, CT.None, CT.None, CT.None, CT.None],
    [CT.None, CT.None, CT.None, CT.None, CT.J,    CT.None, CT.None, CT.None, CT.L   , CT.None],
    [CT.None, CT.None, CT.None, CT.J   , CT.J   , CT.None, CT.None, CT.None, CT.L,    CT.None],
    [CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.L,    CT.L],
    [CT.I   , CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.I],
    [CT.I,    CT.T   , CT.None, CT.None, CT.None, CT.S   , CT.S   , CT.None, CT.None, CT.I],
    [CT.I,    CT.T   , CT.T   , CT.None, CT.S   , CT.S   , CT.None, CT.None, CT.None, CT.I],
    [CT.I,    CT.T   , CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.None, CT.I],
  ];

export { mockGrid };
