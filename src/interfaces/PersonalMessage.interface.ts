export interface PersonalMessage{
    sessionId?:number;
    senderId:number;
    content:string;
    timestamp?:Date;
}