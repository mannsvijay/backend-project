import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()


app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials : true , 
}))

app.use(express.json({limit : "16kb"}))
app.use(express.urlencoded({extended : true}))
app.use(express.static("public"))
app.use(cookieParser())


// routes import 
import userRouter from './routes/user.routes.js'
 


//routes declaration 
// app.use("/users",userRouter)   // idhar se user k baad vo user router pr chalagya vaha apan kuch bhi kr sakte after user
//http://localhost:8000/users/register aisa url banra

app.use("/api/v1/users",userRouter)
//http://localhost:8000/api/v1/users/register

export { app }