import mongoose from 'mongoose';

const leaveBalanceSchema = new mongoose.Schema({
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  sick: {
    type: Number,
    default: 0,
  },
  casual: {
    type: Number,
    default: 0,
  },
  annual: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

leaveBalanceSchema.statics.createDefaultForEmployee = function (employeeId) {
  return this.findOneAndUpdate(
    { employeeId },
    {
      $setOnInsert: {
        employeeId,
        sick: 6,
        casual: 6,
        annual: 12,
      },
    },
    { new: true, upsert: true }
  );
};

const LeaveBalance = mongoose.model('LeaveBalance', leaveBalanceSchema);
export default LeaveBalance;
