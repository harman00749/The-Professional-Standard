const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn("MONGODB_URI is missing. Add it to .env before testing database routes.");
    return;
  }

  try {
    mongoose.set("strictQuery", true);
    const connection = await mongoose.connect(mongoUri);
    console.log(`MongoDB Atlas connected: ${connection.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
};

module.exports = { connectDB };
