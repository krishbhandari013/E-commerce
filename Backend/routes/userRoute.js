import express from 'express'
import {loginUser,registerUser,adminLogin} from '../controllers/userController.js'

const userRoute = express.Router()

userRoute.post("/register",registerUser)
userRoute.post("/login",loginUser)
userRoute.post("/admin",adminLogin)

export default userRoute;