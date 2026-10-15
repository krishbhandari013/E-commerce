import express from 'express'
import { 
  loginUser, 
  registerUser, 
  adminLogin, 
  getUserByToken, 
  updateCart, 
  getCart, 
  clearCart 
} from '../controllers/userController.js'
import limiter, { authLimiter } from '../middleware/rateLimit.js'
import { registerSchema, loginSchema, adminLoginSchema } from '../middleware/validate.js'


const userRoute = express.Router()

// Auth routes
userRoute.post("/register", authLimiter, registerSchema, registerUser)
userRoute.post("/login", authLimiter, loginSchema, loginUser)
userRoute.post("/admin", limiter, authLimiter, adminLoginSchema, adminLogin)

// User data routes
userRoute.post("/get-user", getUserByToken)

// Cart routes
userRoute.post("/cart/get", getCart)
userRoute.post("/cart/update", updateCart)
userRoute.post("/cart/clear", clearCart)

export default userRoute;