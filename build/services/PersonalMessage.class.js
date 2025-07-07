"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalMessage = void 0;
const PersonalChat_class_1 = require("./PersonalChat.class");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const personalChat = new PersonalChat_class_1.PersonalChat();
class PersonalMessage {
    async saveMessage(data, messageData) {
        try {
            const session = Number((await personalChat.findOrCreateSession(data)).session);
            await prisma.personalMessage.create({
                data: {
                    "sessionId": session,
                    "senderId": messageData.senderId,
                    "content": messageData.content
                }
            });
            return true;
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async getHistory(data) {
        try {
            const session = await Number((await personalChat.findOrCreateSession(data)).session);
            const messages = await prisma.personalMessage.findMany({
                where: {
                    sessionId: session
                },
                orderBy: {
                    timestamp: "asc"
                }
            });
            return messages;
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
}
exports.PersonalMessage = PersonalMessage;
