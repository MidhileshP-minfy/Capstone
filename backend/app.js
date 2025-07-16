import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.js'

dotenv.config()
const app=express()

app.use(helmet())
app.use(cors({origin:process.env.FRONTEND_URL || "http://localhost:3000",credentials:true}))

const limiter=rateLimit({
    windowMs: 15*60*1000,
    max:100,
    message:"Too Many Requests from this IP. Try after Some time"
})

app.use("/auth",limiter)

app.use(express.json({limit:'10mb'}))

app.use("/auth",authRoutes)

app.use((error,req,res,next) => {
  console.error('Global error:', error);
  res.status(500).json({ 
    error:'Internal server error',
    code:'Internal-Error'
  });
});

const port=process.env.PORT ||5000
app.listen(port,()=>{
    console.log(`🚀 Server running on port ${port}`)
    console.log(`🔥 Firebase Project: ${process.env.FIREBASE_PROJECT_ID}`)
})

export default app;