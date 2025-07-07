import { Express } from "express"
import express from "express"
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { Request,Response } from "express";


//interfaces
import { PersonalMessage as messageInterface } from "./interfaces/PersonalMessage.interface";
import { Customer } from "./interfaces/Customer.interface"

//classes
import { PersonalMessage } from "./services/PersonalMessage.class";
import { CustomerService } from "./services/Customer.class";

const app:Express = express();
const server = createServer(app);
const io = new Server(server);
const personalMessage = new PersonalMessage();
const customerService = new CustomerService();
const prisma = new PrismaClient();

app.use(express.json());
app.use(cors());

//isso com certeza vai estourar futuramente
app.get("/users", async function(req: Request, res: Response)  {
  const idStr = req.query.id;
  const id = Number(idStr);
 
  try {
    const users = await customerService.listOtherUsers(id);
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/register", async (req: Request, res: Response) => {
  try {
    const result = await customerService.register(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

app.post("/login", async (req: Request, res: Response) => {
  try {
    const result = await customerService.login(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
});

server.listen(3005, () => console.log("Rodando servidor na porta 3005"));

io.on("connection", (socket) => {
  console.log("Novo cliente conectado!");

  socket.on("history", async (data: { user_id: number; friend_id: number }) => {
    try {
      const history = await personalMessage.getHistory(data);
      socket.emit("history", history);
    } catch (err) {
      console.error(err);
      socket.emit("error", { message: "Erro ao buscar histórico" });
    }
  });

  socket.on("sendMessage", async (data: { user_id: number; friend_id: number }, messageData: messageInterface) => {
    try {
      await personalMessage.saveMessage(data, messageData);
      io.emit("new-message", {
        content: messageData.content,
        senderId: messageData.senderId,
      });
    } catch (err) {
      console.error(err);
      socket.emit("error", { message: "Erro ao enviar mensagem" });
    }
  });
});