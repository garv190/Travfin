require('dotenv').config()

const mongo=require('mongoose')

//if connects "then" print something else leave it 
mongo.connect(process.env.URL).then(()=>{
    console.log("connected to database")
})

.catch((err)=>{
    console.log(err)
    })

