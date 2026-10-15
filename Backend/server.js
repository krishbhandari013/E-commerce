// index.js
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoSanitize from 'mongo-sanitize'
import connectDB from './config/mongodb.js';
import connectCloudinary from './config/cloudinary.js';
import userRoute from './routes/userRoute.js';
import productRoute from './routes/productRout.js';
// import orderModel from './models/order.js';
import orderRoute from './routes/orderRoute.js';
import cartRoute from './routes/cartRoute.js';
import paymentRoute from './routes/paymentRoute.js';
import contactRoute from './routes/contactRoute.js';
import helmet from 'helmet';



const app = express();
const PORT = process.env.PORT   || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve locally stored files (e.g. seeded product images in uploads/products)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware to parse JSON
app.use(express.json());
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  'http://localhost:5173',
  'http://localhost:5174',
].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (curl, mobile apps) which send no Origin
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  }
}))
app.use(helmet());

app.use(express.urlencoded({ extended: true }))
// Strip NoSQL operator injection ($ne, $gt, ...) from body/params.
// (express-mongo-sanitize v2 also rewrites req.query, which is read-only in Express 5,
// so mongo-sanitize is applied surgically here instead.)
app.use((req, _res, next) => {
  if (req.body) mongoSanitize(req.body);
  if (req.params) mongoSanitize(req.params);
  next();
});
connectDB()
connectCloudinary()

// Safe data collection endpoint

app.use('/api/user',userRoute)
app.use('/api/product',productRoute)
app.use('/api/order', orderRoute);
app.use('/api/cart', cartRoute);
app.use('/api/payment', paymentRoute);
app.use('/api', contactRoute);

// Safe ping endpoint
app.get('/', (req, res) => {
  res.send('API Working ');
});

// Central error handler: never leak stacks/messages to clients
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (err && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Origin not allowed' });
  }
  res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});