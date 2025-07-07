import { PersonalChat } from "./PersonalChat.class";
import { PrismaClient } from "@prisma/client";
import { PersonalMessage as messageInterface } from "../interfaces/PersonalMessage.interface";

const prisma = new PrismaClient();
const personalChat = new PersonalChat();

export class PersonalMessage{
    async saveMessage(data: {user_id:number,friend_id:number}, messageData:messageInterface ):Promise<Boolean | undefined >
    {
        try{
            const session = Number((await personalChat.findOrCreateSession(data)).session);
            await prisma.personalMessage.create({
                data:{
                    "sessionId":session,
                    "senderId": messageData.senderId,
                    "content": messageData.content
                }
            })
            return true;
        }catch(e:any){
            throw new Error(e.message)
        }
    }

    async getHistory(data: {user_id:number,friend_id:number}){
        try{
            const session = await Number((await personalChat.findOrCreateSession(data)).session);
            const messages = await prisma.personalMessage.findMany({
                where:{
                    sessionId:session
                },
                orderBy:{
                    timestamp: "asc"
                }
            })

            return messages;
        }catch(e:any){
            throw new Error(e.message)
        }
    }
}