"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalChat = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class PersonalChat {
    async createSession(user_id, friend_id) {
        try {
            const newSession = await prisma.personalChatSession.create({
                data: {
                    createdAt: new Date()
                }
            });
            const me = await prisma.personalChatParticipant.create({
                data: {
                    customerId: user_id,
                    sessionId: newSession.id
                }
            });
            const friend = await prisma.personalChatParticipant.create({
                data: {
                    customerId: friend_id,
                    sessionId: newSession.id
                }
            });
            return {
                "ok": true,
                "session": newSession.id,
                "error": null
            };
        }
        catch (e) {
            throw new Error(e.message);
        }
    }
    async findSession(userSessions, friendSessions) {
        for (let i = 0; i < userSessions.length; i++) {
            if (friendSessions.some(elem => elem.sessionId === userSessions[i].sessionId)) {
                return {
                    "ok": true,
                    "session": userSessions[i].sessionId,
                    "error": null
                };
            }
            else
                continue;
        }
        return {
            "ok": false,
            "session": 0,
            "error": null
        };
    }
    async findOrCreateSession(data) {
        try {
            const mySessions = await prisma.personalChatParticipant.findMany({
                where: {
                    customerId: data.user_id
                }
            });
            const hisSessions = await prisma.personalChatParticipant.findMany({
                where: {
                    customerId: data.friend_id
                },
            });
            if (mySessions.length * hisSessions.length === 0) {
                return this.createSession(data.user_id, data.friend_id);
            }
            if (!(await this.findSession(mySessions, hisSessions)).ok) {
                return await this.createSession(data.user_id, data.friend_id);
            }
            const session = await this.findSession(mySessions, hisSessions);
            return session;
        }
        catch (e) {
            return {
                "ok": false,
                "session": 0,
                "error": e.message
            };
        }
    }
}
exports.PersonalChat = PersonalChat;
