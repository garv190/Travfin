import { Schema, model } from 'mongoose';
import dotenv from 'dotenv'
dotenv.config()




const signup=new Schema({
    FullName:{
        type:String,
    },
    Email:{
        type:String,
        
    },
    Password:{
           type:String,
    },

})

const si=model("signup",signup)
export default si;

