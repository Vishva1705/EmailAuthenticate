const express = require('express');
const mongoose = require('mongoose');
const routes = require('./router/index');
require('dotenv').config();

const app = express();
const PORT = 3500;

// Middleware
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.Db_Connection_string,)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });

// Routes
app.use('/api', routes);  

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
