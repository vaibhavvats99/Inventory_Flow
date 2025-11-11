import mongoose from 'mongoose';

export default async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error('MONGO_URI is not defined');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 15000,
  });

  console.log('MongoDB connected');
}


