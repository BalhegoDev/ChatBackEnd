// Esse arquivo aqui é somente pra testa se as coisas estão tudo funcionando.

import { prompt} from "enquirer";
//@ts-ignore
import Select from "enquirer/lib/prompts/select.js";
import  io  from "socket.io-client";
import axios from "axios";
import dotenv from "dotenv";
import type { Customer } from "./interfaces/Customer.interface";
import type { PersonalMessage } from "./interfaces/PersonalMessage.interface";

dotenv.config();

const socket = io("http://localhost:3005");

let token: string = "";
let currentUser: Customer;
let friend: Customer;

type content = {
  content:string
}

const api = axios.create({
  baseURL: "http://localhost:3005",
  headers: {
    "Content-Type": "application/json",
  },
});

const setToken = (jwt: string) => {
  token = jwt;
  api.defaults.headers.common["Authorization"] = `Bearer ${jwt}`;
};

async function mainMenu() {
  const menu = new Select({
    name: "action",
    message: "O que você quer fazer?",
    choices: ["Registrar", "Entrar"],
  });

  const action = await menu.run();

  if (action === "Registrar") {
    await register();
  } else {
    await login();
  }

  await chooseFriend();
  await startChat();
}

async function register() {
  const response = await prompt([
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
  } catch (err: any) {
    console.error("❌ Erro ao registrar:", err?.response?.data?.message || err.message);
    process.exit(1);
  }
}

async function login() {
  const response = await prompt([
    { type: "input", name: "email", message: "Email:" },
    { type: "password", name: "password", message: "Senha:" },
  ]);

  try {
    const res = await api.post("/login", response);
    setToken(res.data.token);
    currentUser = res.data.customer;
    console.log("✅ Login realizado com sucesso!");
  } catch (err: any) {
    console.error("❌ Erro ao fazer login:", err?.response?.data?.message || err.message);
    process.exit(1);
  }
}

async function chooseFriend() {
  try {
    const res = await api.get("/users", { params: { id: currentUser.id } }); 
    const friends: Customer[] = res.data;

    const menu = new Select({
      name: "friend",
      message: "Com quem deseja conversar?",
      choices: friends.map((f) => ({
        name: String(f.id),
        message: `${f.name} (${f.email})`,
      })),
    });

    const chosenId = await menu.run();
    friend = friends.find((f) => String(f.id) === chosenId)!;

    console.log(`🟢 Conversando com ${friend.name}`);
  } catch (err: any) {
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

  socket.on("history", (history: PersonalMessage[]) => {
    console.clear();
    console.log("📜 Histórico:");
    history.forEach((msg) => {
      const author = msg.senderId === currentUser.id ? "Você" : friend.name;
      console.log(`[${author}] ${msg.content}`);
    });

    promptMessages();
  });

  socket.on("new-message", (msg:any) => {
    if (msg.senderId !== currentUser.id) {
      console.log(`\n📩 ${friend.name}: ${msg.content}`);
    }
  });
}

async function promptMessages() {
  while (true) {
    const { content } = await prompt<content>({
      type: "input",
      name: "content",
      message: "Você:",
    });

    const message: PersonalMessage = {
      content,
      senderId: currentUser.id!,
    };

    socket.emit("sendMessage", {
      user_id: currentUser.id!,
      friend_id: friend.id!,
    }, message);
  }
}

mainMenu();
