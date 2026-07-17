import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Point to the actual .env file
dotenv.config({ path: 'C:\\Users\\USER\\OneDrive\\Desktop\\projects\\DR-BOOKING-APP\\Doctor-Backend\\.env' });

const mongoURI = process.env.MONGO_URI || '';

mongoose.connect(mongoURI).then(async () => {
  console.log('Connected to DB');
  const db = mongoose.connection.db;
  if (!db) return;
  const users = await db.collection('users').find({}).toArray();
  console.log('Users in DB:');
  console.log(users);
  process.exit(0);
}).catch(console.error);
