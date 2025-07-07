import { PrismaClient } from "@prisma/client";
import { PersonalChatParticipant } from "@prisma/client";

const prisma = new PrismaClient();

interface session {
    ok:Boolean;
    error:any;
    session:number 
}

export class PersonalChat{
    private async createSession(user_id:number,friend_id:number):Promise<session>
    {
        try{

            const newSession = await prisma.personalChatSession.create({
                data:{
                    createdAt: new Date()
                }
            })

            const me = await prisma.personalChatParticipant.create({
                data:{
                    customerId: user_id,
                    sessionId: newSession.id
                }
            })

            const friend = await prisma.personalChatParticipant.create({
                data:{
                    customerId: friend_id,
                    sessionId: newSession.id
                }
            })
            return {
                "ok": true,
                "session": newSession.id,
                "error": null
            }
            
        }catch(e:any){
           throw new Error(e.message);
        }
    }

    private async findSession(userSessions:PersonalChatParticipant[],friendSessions:PersonalChatParticipant[]):Promise<session>
    {
        for(let i = 0; i < userSessions.length; i++){
            if( friendSessions.some( elem => elem.sessionId === userSessions[i].sessionId )){
                return {
                    "ok": true,
                    "session": userSessions[i].sessionId,
                    "error": null
                };
            }
            else continue;
        }
        return {
            "ok": false,
            "session": 0,
            "error": null
        };
    }

    async findOrCreateSession( data:{user_id:number, friend_id:number}):Promise<session>
    {
        try{
            const mySessions = await prisma.personalChatParticipant.findMany({
                where:{
                customerId: data.user_id 
                }
            });

            const hisSessions = await prisma.personalChatParticipant.findMany({
                where:{
                    customerId: data.friend_id
                },
            });

            if(mySessions.length * hisSessions.length === 0){
                return this.createSession(data.user_id,data.friend_id);            
            }

            if( !(await this.findSession(mySessions,hisSessions)).ok){
                return await this.createSession(data.user_id,data.friend_id);
            }

            const session = await this.findSession(mySessions,hisSessions);
            return session;
        }catch(e:any){
            return {
                "ok":false,
                "session": 0,
                "error": e.message
            }
        }
    }
}