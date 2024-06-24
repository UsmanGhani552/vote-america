const mongoose = require("mongoose");
require('dotenv').config()

// Connect to MongoDB
mongoose.connect(`mongodb://localhost:27017/${process.env.DB_NAME}`);

mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to mongodb://localhost:27017/${process.env.DB_NAME}`);
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});