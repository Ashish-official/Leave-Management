import mongoose from 'mongoose';

/**
 * Connect to MongoDB using the URI from environment variables.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export default connectDB;
