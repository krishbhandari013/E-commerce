// index.js
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRoute from './routes/userRoute.js';
import productRoute from './routes/productRout.js';
// import orderModel from './models/order.js';
import orderRoute from './routes/orderRoute.js';
import cartRoute from './routes/cartRoute.js';


const app = express();
const PORT = process.env.PORT   || 5000;

// Middleware to parse JSON
app.use(express.json());
app.use(cors())
app.use(express.urlencoded({ extended: true }))
connectDB()
connectCloudinary()

// Safe data collection endpoint

app.use('/api/user',userRoute)
app.use('/api/product',productRoute)
app.use('/api/order', orderRoute);
app.use('/api/cart', cartRoute);

// Safe ping endpoint
app.get('/', (req, res) => {
  res.send('API Working ');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});