"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
//classes
const PersonalMessage_class_1 = require("./services/PersonalMessage.class");
const Customer_class_1 = require("./services/Customer.class");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server);
const personalMessage = new PersonalMessage_class_1.PersonalMessage();
const customerService = new Customer_class_1.CustomerService();
const prisma = new client_1.PrismaClient();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
//isso com certeza vai estourar futuramente
app.get("/users", async function (req, res) {
    const idStr = req.query.id;
    const id = Number(idStr);
    try {
        const users = await customerService.listOtherUsers(id);
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
app.post("/register", async (req, res) => {
    try {
        const result = await customerService.register(req.body);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
app.post("/login", async (req, res) => {
    try {
        const result = await customerService.login(req.body);
        res.json(result);
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
});
server.listen(3005, () => console.log("Rodando servidor na porta 3005"));
io.on("connection", (socket) => {
    console.log("Novo cliente conectado!");
    socket.on("history", async (data) => {
        try {
            const history = await personalMessage.getHistory(data);
            socket.emit("history", history);
        }
        catch (err) {
            console.error(err);
            socket.emit("error", { message: "Erro ao buscar histórico" });
        }
    });
    socket.on("sendMessage", async (data, messageData) => {
        try {
            await personalMessage.saveMessage(data, messageData);
            // Aqui você pode usar io.emit ou gerenciar salas se quiser mandar só para participantes específicos
            io.emit("new-message", {
                content: messageData.content,
                senderId: messageData.senderId,
            });
        }
        catch (err) {
            console.error(err);
            socket.emit("error", { message: "Erro ao enviar mensagem" });
        }
    });
});
