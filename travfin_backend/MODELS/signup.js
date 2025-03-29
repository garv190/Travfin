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

const mongos=mongo.model("mongotable",signup)
module.exports=mongos;

