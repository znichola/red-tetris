import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 1000,
    hookTimeout: 1000,
  },
});
