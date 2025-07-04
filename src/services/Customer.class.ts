import { Customer as customer } from "../interfaces/Customer.interface";
import bcrypt from "bcrypt";

export class Customer {

    private async hashPassword(password:string):Promise<string>{
        const hashedPassword = await bcrypt.hash(password,10);
        return hashedPassword 
    }

    private async isPasswordOk(password:string,BDPassword:string):Promise<Boolean> {
        const response = await bcrypt.compare(password,BDPassword);
        if(!response) return false;
        return true;
    }

    private async verifyEmail(){
        
    }

    public create(data:customer){

    }

    public login(data: {email:string,password:string}){
        
    }


}