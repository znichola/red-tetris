import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 2000,
    hookTimeout: 2000,
  },
});
