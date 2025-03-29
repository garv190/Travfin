const mongo=require('mongoose')
require('dotenv').config();



const signup=new mongo.Schema({
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

const mongosu=mongo.model("mongosu",signup)
module.exports=mongosu;

