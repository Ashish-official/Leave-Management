# Leave Management System

A full-stack Leave Management System built for the IT team selection assignment. The application supports employee leave applications, admin approvals, leave balance tracking, role-based access, employee management, and dashboard summaries.

## Overview

The system has two roles:

- Employee: register/login, view leave balance, apply for leave, view leave history, cancel pending leave.
- Admin: login, view dashboard metrics, review all leave requests, approve/reject requests, create/deactivate employees and admins.

The implementation focuses on practical business rules rather than only basic CRUD. It validates leave dates, prevents overlapping leave requests, checks leave balance, considers pending leave requests before accepting new leave, and records approval/rejection audit details.

## Tech Stack

Frontend:

- React
- Vite
- React Router
- Lucide React icons
- CSS

Backend:

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs
- dotenv
- cors

Database:

- MongoDB Atlas or local MongoDB
- Mongoose models for users, leave requests, and leave balances

## Features

- JWT-based authentication
- Role-based authorization for admin and employee flows
- Employee registration and login
- Admin seeding through script
- Current user API with `/api/auth/me`
- Leave application with validation
- Leave balance tracking
- Pending leave balance consideration
- Overlapping leave prevention
- Admin approval/rejection workflow
- Employee cancellation for pending leave
- Employee/user management APIs
- Admin dashboard summary
- Centralized backend error handling
- Responsive frontend UI

## Architecture

```text
Leave Management/
├─ Backend/
│  ├─ config/             MongoDB connection
│  ├─ controllers/        Request handling and business logic
│  ├─ middleware/         Auth, role guard, error handler
│  ├─ models/             Mongoose schemas
│  ├─ routes/             Express route definitions
│  ├─ scripts/            Admin seed script
│  ├─ utils/              Shared helpers
│  └─ server.js           Backend entry point
└─ Frontend/
   ├─ src/api/            API client
   ├─ src/components/     Shared layout and protected route components
   ├─ src/context/        Auth context
   ├─ src/pages/          Login, register, employee, admin pages
   ├─ src/utils/          Formatting helpers
   └─ src/styles.css      Application styling
```

## Backend Setup

```bash
cd Backend
npm install
```

Create `Backend/.env` using `Backend/.env.example`:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
CLIENT_URL=http://localhost:5173

ADMIN_NAME=Admin User
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

Seed an admin user:

```bash
npm run seed:admin
```

Start backend:

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

## Frontend Setup

```bash
cd Frontend
npm install
```

Create `Frontend/.env` using `Frontend/.env.example`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## API Summary

Auth:

- `POST /api/auth/register` - Register employee
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get logged-in user

Leaves:

- `POST /api/leaves/apply` - Apply for leave
- `GET /api/leaves/my-leaves` - Get employee leave history
- `GET /api/leaves/balance` - Get employee leave balance
- `PUT /api/leaves/:id/cancel` - Cancel own pending leave
- `GET /api/leaves` - Admin: get all leave requests
- `PUT /api/leaves/:id/status` - Admin: approve or reject leave

Users:

- `POST /api/users` - Admin: create user
- `GET /api/users` - Admin: list users
- `GET /api/users/:id` - Admin: get user by ID
- `PUT /api/users/:id` - Admin: update user
- `DELETE /api/users/:id` - Admin: deactivate user

Dashboard:

- `GET /api/admin/dashboard` - Admin dashboard counts

## Business Rules

- Employees can apply only for `sick`, `casual`, or `annual` leave.
- Start date cannot be in the past.
- End date must be greater than or equal to start date.
- Leave duration is calculated inclusively.
- Leave request status can be `PENDING`, `APPROVED`, `REJECTED`, or `CANCELLED`.
- Only pending leave requests can be approved, rejected, or cancelled.
- Approved leave deducts from the employee leave balance.
- Pending leave requests are considered before allowing another request.
- Overlapping pending or approved leave requests are blocked.
- Inactive users cannot log in.

## Assumptions

- Employees can self-register, but they are always created with the `employee` role.
- Admin users are created through the seed script or by an existing admin.
- Default leave balance is sick: 6, casual: 6, annual: 12.
- Leave balance is deducted only when leave is approved.
- Deleting a user means deactivation, not physical deletion, to preserve historical leave records.
- The assignment scope does not require email notifications or password reset.

## AI Usage

AI was used as a development assistant to analyze requirements, identify missing backend workflows, improve validation, add practical business rules, scaffold frontend pages, and review implementation quality. The generated suggestions were reviewed and adapted to the project structure before being used.

AI-assisted areas included:

- Requirement breakdown
- Backend validation and error handling improvements
- Leave workflow edge cases
- Frontend component scaffolding
- Documentation planning

## Challenges

- Designing leave balance logic so pending requests are considered before accepting new requests.
- Preventing overlapping leave requests while keeping the implementation understandable.
- Keeping role-based access clear between admin and employee flows.
- Building enough frontend functionality for a practical demo without overcomplicating the assignment.

## Future Improvements

- Add automated tests for auth, leave workflows, and admin APIs.
- Add pagination and search for admin tables.
- Add email notifications for approval/rejection.
- Add password reset and change password.
- Use MongoDB transactions for approval balance deduction and status update.
- Add deployment-specific CORS configuration.

## Demo Proof

Recommended demo screens:

- Login page
- Employee dashboard
- Apply leave form
- Leave history and balance
- Admin dashboard
- Approve/reject workflow
- Employee management page

## Submission Note

This project demonstrates a practical leave management workflow with authentication, authorization, validation, role-specific UI, and realistic business rules. The current implementation is assignment-ready, with clear future improvements identified for production use.
