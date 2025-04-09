// import { coverageConfigDefaults, defineConfig } from 'vite'
import { coverageConfigDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    workspace: ["client", "server"],
    coverage: {
      exclude: [
        "params.js",
        "client/src/main.jsx",
        "client/vitest.setup.js",
        ...coverageConfigDefaults.exclude,
      ],
    },
  },
});
