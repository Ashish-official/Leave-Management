import mongoose from 'mongoose';

/**
 * Connect to MongoDB using the URI from environment variables.
 */
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

export default connectDB;
