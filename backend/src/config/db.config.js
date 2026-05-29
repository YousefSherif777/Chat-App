const mongoose=require('mongoose')
const { ENV } = require('./env.config')
mongoose.connect(ENV.MONGO_URL)
export const db = mongoose.connection
db.on("connected",()=>{
    console.log("connected to the database")
})
db.on("err",()=>{
    console.log("Error just happened")
})
