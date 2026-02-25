// index.js
import express from 'express';

const app = express();
const PORT = 5000;

// Middleware to parse JSON
app.use(express.json());

// Safe data collection endpoint


// Safe ping endpoint
app.get('/', (req, res) => {
  res.send('Pong!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});