import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import params from "../params.js";
const __dirname = import.meta.dirname;

const react_app = path.join(__dirname, "../dist");

const app = express();

// Routes are match in topdown order!

// serve the static website bundle files
app.use(express.static(react_app));

app.get("/:room/:player_name", (req) => {
  const { room, player_name } = req.params;
  console.log(`Room: ${room}, Player: ${player_name}`);

  // This should start a socket connection and the first message should
  // be information about the room, (client will display a loading spinner)
  // we can only send the bundle over http, all else must be sockets.
  //
  // ps feel free to remove & modify as you please
});

// catch all route, make it a SPA
app.get("/{*matchAll}", (req, res) => {
  res.sendFile(path.join(react_app, "index.html"));
});

app.listen(params.server.port, params.server.host, () => {
  console.log(`App running on: ${params.server.url}`);

  if (!existsSync(react_app + "/index.html")) {
    console.error(`⚠️ React app is empty, run 'npm run build'`);
  }
});
