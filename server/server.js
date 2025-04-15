import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import params from "../params.js";
import { Server } from "socket.io";
import http from "node:http";

const __dirname = import.meta.dirname;
const react_app = path.join(__dirname, "../dist");

function createApp() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  //NOTE: Routes are matched in topdown order!

  //NOTE: Serve the static website bundle files
  app.use(express.static(react_app));

  app.get("/:room/:player_name", (req) => {
    const { room, player_name } = req.params;
    console.log(`Room: ${room}, Player: ${player_name}`);

    // This should send a message over the socket which contains
    // information about the room, (client will display a loading spinner)
    // we can only send the bundle over http, all else must be sockets.
    //
    // ps feel free to remove & modify as you please

    // no response to conform to the docs, will fallthrough and send index.html
  });

  //NOTE: Catch all routes and make it a SPA
  app.get("/{*matchAll}", (req, res) => {
    res.sendFile(path.join(react_app, "index.html"));
  });

  io.on("connection", (socket) => {
    socket.on("hello", (cb) => {
      cb("world");
    });
  });

  return { server, io };
}

if (process.env.NODE_ENV !== "test") {
  const { server } = createApp();

  server.listen(params.server.port, params.server.host, () => {
    console.log(`App running on: ${params.server.url}`);

    if (!existsSync(react_app + "/index.html")) {
      console.error(`⚠️ React app is empty, run 'npm run build'`);
    }
  });
}

export default createApp;
