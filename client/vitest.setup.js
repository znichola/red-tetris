import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// adds custom matchers like toBeInTheDocument
import "@testing-library/jest-dom";

afterEach(() => {
  cleanup();
});
