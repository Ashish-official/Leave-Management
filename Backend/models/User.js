import mongoose from 'mongoose';
// User schema stores employee/admin details and leave balance
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['employee', 'admin'],
    default: 'employee',
  },
  leaveBalance: {
    type: Number,
    default: 12,
  },
},{ timestamps: true });

const User = mongoose.model('User', userSchema);
export default User;
