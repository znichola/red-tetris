import { CellType as CT } from "../../../../shared/DTOs.js";

// prettier-ignore
const mockGrid = [
    [CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty],
    [CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty],
    [CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty],
    [CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty],
    [CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.I,     CT.I,     CT.I,     CT.I,     CT.Empty, CT.Empty],
    [CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty],
    [CT.Empty, CT.Empty, CT.O,     CT.O,     CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty],
    [CT.Empty, CT.Empty, CT.O,     CT.O,     CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty],
    [CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.T,     CT.Empty, CT.Empty, CT.Empty],
    [CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.T,     CT.T   ,  CT.T,     CT.Empty, CT.Empty],
    [CT.Empty, CT.Empty, CT.Z,     CT.Z,     CT.Empty, CT.Empty, CT.O,     CT.O,     CT.Empty, CT.Empty],
    [CT.Empty, CT.Empty, CT.Empty, CT.Z,     CT.Z    , CT.Empty, CT.O,     CT.O,     CT.Empty, CT.Empty],
    [CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.J,     CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty],
    [CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.J,     CT.Empty, CT.Empty, CT.Empty, CT.L    , CT.Empty],
    [CT.Empty, CT.Empty, CT.Empty, CT.J    , CT.J    , CT.Empty, CT.Empty, CT.Empty, CT.L    , CT.Empty],
    [CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.L    , CT.L],
    [CT.I    , CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.I],
    [CT.I,     CT.T    , CT.Empty, CT.Empty, CT.Empty, CT.S    , CT.S    , CT.Empty, CT.Empty, CT.I],
    [CT.I,     CT.T    , CT.T    , CT.Empty, CT.S    , CT.S    , CT.Empty, CT.Empty, CT.Empty, CT.I],
    [CT.I,     CT.T    , CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.Empty, CT.I],
  ];

export { mockGrid };
