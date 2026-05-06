import LeaveRequest from '../models/LeaveRequest.js';
import User from '../models/User.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const [
      totalEmployees,
      activeEmployees,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      cancelledRequests,
    ] = await Promise.all([
      User.countDocuments({ role: 'employee' }),
      User.countDocuments({ role: 'employee', isActive: true }),
      LeaveRequest.countDocuments({ status: 'PENDING' }),
      LeaveRequest.countDocuments({ status: 'APPROVED' }),
      LeaveRequest.countDocuments({ status: 'REJECTED' }),
      LeaveRequest.countDocuments({ status: 'CANCELLED' }),
    ]);

    return res.json({
      totalEmployees,
      activeEmployees,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      cancelledRequests,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};
