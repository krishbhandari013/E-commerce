// index.js
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRoute from './routes/userRoute.js';


const app = express();
const PORT = process.env.PORT   || 5000;

// Middleware to parse JSON
app.use(express.json());
app.use(cors())
connectDB()
connectCloudinary()

// Safe data collection endpoint

app.use('/api/user',userRoute)

// Safe ping endpoint
app.get('/', (req, res) => {
  res.send('API Working ');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});