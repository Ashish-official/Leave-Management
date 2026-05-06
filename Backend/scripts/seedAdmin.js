import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

  if (!ADMIN_NAME || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required');
  }

  await connectDB();

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existingAdmin = await User.findOne({ email });

  if (existingAdmin) {
    existingAdmin.role = 'admin';
    await existingAdmin.save();
    console.log('Existing user promoted to admin');
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  await User.create({
    name: ADMIN_NAME.trim(),
    email,
    password: hashedPassword,
    role: 'admin',
    isActive: true,
  });

  console.log('Admin user created successfully');
};

seedAdmin()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    process.exit();
  });
