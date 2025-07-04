import { Express } from "express"
import express from "express"
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";

const app:Express = express();
app.use(express.json());
app.use(cors());
const server = createServer(app);
const io = new Server(server);

server.listen("3005");

io.on("connection", (socket) => {
    socket.on("message", (message) => {
        
    })
})