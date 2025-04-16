import express from "express";
import { existsSync } from "node:fs";
import path from "node:path";
import params from "../params.js";
import { Server } from "socket.io";
import http from "node:http";
import Rooms from "./Rooms.js";

const __dirname = import.meta.dirname;
const react_app = path.join(__dirname, "../dist");

function createApp() {
  const app = express();

  app.use(express.static(react_app));

  app.get("/{*matchAll}", (req, res) => {
    res.sendFile(path.join(react_app, "index.html"));
  });

  const server = http.createServer(app);
  const io = new Server(server);
  const rooms = new Rooms(io);

  io.on("connection", (socket) => {
    const { roomName, playerName } = socket.handshake.query;

    if (
      typeof roomName !== "string" ||
      typeof playerName !== "string" ||
      !rooms.tryAddPlayer(socket, roomName, playerName)
    ) {
      socket.disconnect();
    }
  });

  /** @param {(err?: Error) => void} cb */
  const closeServer = (cb) => io.close(cb);

  return {
    server,
    closeServer,
  };
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
