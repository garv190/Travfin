import dotenv from 'dotenv'
dotenv.config()

import { connect } from 'mongoose'

//if connects "then" print something else leave it 
connect(process.env.URL).then(()=>{
    console.log("connected to database")
})

.catch((err)=>{
    console.log(err)
    })

