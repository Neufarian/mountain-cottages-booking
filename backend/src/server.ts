import express, { json } from 'express'
import cors from 'cors'
import userRouter from './routers/user.router'
import mongoose from 'mongoose'
import path from 'path'
import cottageRouter from './routers/cottage.router'

const app = express()
app.use(cors())
app.use(express.json())
const uploadFolder = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadFolder));

mongoose.connect('mongodb://localhost:27017/cottage2025')
const conn = mongoose.connection
conn.once('open', () => {
    console.log('DB ok')
})

const router = express.Router()
router.use('/users', userRouter)
router.use('/cottages', cottageRouter)
app.use('/', router)

app.listen(4000, ()=>console.log('Express running on port 4000'))
