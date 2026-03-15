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
import limiter from '../middleware/rateLimit.js'


const userRoute = express.Router()

// Auth routes
userRoute.post("/register", registerUser)
userRoute.post("/login", loginUser)
userRoute.post("/admin", limiter,adminLogin)

// User data routes
userRoute.post("/get-user", getUserByToken)

// Cart routes
userRoute.post("/cart/get", getCart)
userRoute.post("/cart/update", updateCart)
userRoute.post("/cart/clear", clearCart)

export default userRoute;