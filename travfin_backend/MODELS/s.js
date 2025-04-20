import { Schema, model } from 'mongoose';
import dotenv from 'dotenv'
dotenv.config()




const signup=new Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
        
    },
    password:{
           type:String,
    },
    refreshtoken:{
        type:String,
    }

})

const mongosu=model("mongosu",signup)
export default mongosu;

