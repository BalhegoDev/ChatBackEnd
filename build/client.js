"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const enquirer_1 = require("enquirer");
//@ts-ignore
const select_js_1 = __importDefault(require("enquirer/lib/prompts/select.js"));
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const socket = (0, socket_io_client_1.default)("http://localhost:3005");
let token = "";
let currentUser;
let friend;
const api = axios_1.default.create({
    baseURL: "http://localhost:3005",
    headers: {
        "Content-Type": "application/json",
    },
});
const setToken = (jwt) => {
    token = jwt;
    api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
};
async function mainMenu() {
    const menu = new select_js_1.default({
        name: "action",
        message: "O que você quer fazer?",
        choices: ["Registrar", "Entrar"],
    });
    const action = await menu.run();
    if (action === "Registrar") {
        await register();
    }
    else {
        await login();
    }
    await chooseFriend();
    await startChat();
}
async function register() {
    const response = await (0, enquirer_1.prompt)([
        { type: "input", name: "name", message: "Nome:" },
        { type: "input", name: "email", message: "Email:" },
        { type: "password", name: "password", message: "Senha:" },
        { type: "input", name: "cpf", message: "CPF:" },
    ]);
    try {
        const res = await api.post("/register", response);
        setToken(res.data.token);
        currentUser = res.data.customer;
        console.log("✅ Registro feito com sucesso!");
    }
    catch (err) {
        console.error("❌ Erro ao registrar:", err?.response?.data?.message || err.message);
        process.exit(1);
    }
}
async function login() {
    const response = await (0, enquirer_1.prompt)([
        { type: "input", name: "email", message: "Email:" },
        { type: "password", name: "password", message: "Senha:" },
    ]);
    try {
        const res = await api.post("/login", response);
        setToken(res.data.token);
        currentUser = res.data.customer;
        console.log("✅ Login realizado com sucesso!");
    }
    catch (err) {
        console.error("❌ Erro ao fazer login:", err?.response?.data?.message || err.message);
        process.exit(1);
    }
}
async function chooseFriend() {
    try {
        const res = await api.get("/users", { params: { id: currentUser.id } });
        const friends = res.data;
        const menu = new select_js_1.default({
            name: "friend",
            message: "Com quem deseja conversar?",
            choices: friends.map((f) => ({
                name: String(f.id),
                message: `${f.name} (${f.email})`,
            })),
        });
        const chosenId = await menu.run();
        friend = friends.find((f) => String(f.id) === chosenId);
        console.log(`🟢 Conversando com ${friend.name}`);
    }
    catch (err) {
        console.error("❌ Erro ao buscar amigos:", err?.response?.data?.message || err.message);
        process.exit(1);
    }
}
async function startChat() {
    // Pega o histórico primeiro
    socket.emit("history", {
        user_id: currentUser.id,
        friend_id: friend.id,
    });
    socket.on("history", (history) => {
        console.clear();
        console.log("📜 Histórico:");
        history.forEach((msg) => {
            const author = msg.senderId === currentUser.id ? "Você" : friend.name;
            console.log(`[${author}] ${msg.content}`);
        });
        promptMessages();
    });
    socket.on("new-message", (msg) => {
        if (msg.senderId !== currentUser.id) {
            console.log(`\n📩 ${friend.name}: ${msg.content}`);
        }
    });
}
async function promptMessages() {
    while (true) {
        const { content } = await (0, enquirer_1.prompt)({
            type: "input",
            name: "content",
            message: "Você:",
        });
        const message = {
            content,
            senderId: currentUser.id,
        };
        socket.emit("sendMessage", {
            user_id: currentUser.id,
            friend_id: friend.id,
        }, message);
    }
}
mainMenu();
