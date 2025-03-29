const mongo=require('mongoose')
require('dotenv').config();



const signup=new mongo.Schema({
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

const si=mongo.model("signup",signup)
module.exports=si;

